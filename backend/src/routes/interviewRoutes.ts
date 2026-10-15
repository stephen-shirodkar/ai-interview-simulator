import { Router, Request, Response } from 'express';
import { ragService } from '../services/ragService';
import { llmService } from '../services/llmService';
import { questionService } from '../services/questionService';
import { codeExecutionService, CodeExecutionSummary } from '../services/codeExecutionService';
import { gradingService } from '../services/gradingService';
import { dsaProfileService } from '../services/dsaProfileService';
import { elevenLabsService } from '../services/elevenLabsService';
import { diagnosisService } from '../services/diagnosisService';
import { learningService } from '../services/learningService';
import { InterviewModel } from '../models/Interview';
import { isMongoConnected, getLocalStore, saveLocalStore } from '../db/connection';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// Helper to save interview session (Mongo or local JSON fallback)
const saveSession = async (sessionData: any): Promise<any> => {
  if (isMongoConnected) {
    let doc = await InterviewModel.findOne({ sessionId: sessionData.sessionId });
    if (!doc) {
      doc = new InterviewModel(sessionData);
    } else {
      Object.assign(doc, sessionData);
    }
    await doc.save();
    return doc;
  } else {
    const list = getLocalStore('interviews');
    const idx = list.findIndex((i: any) => i.sessionId === sessionData.sessionId);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...sessionData };
    } else {
      list.push(sessionData);
    }
    saveLocalStore('interviews', list);
    return sessionData;
  }
};

const findSession = async (sessionId: string): Promise<any | null> => {
  if (isMongoConnected) {
    return await InterviewModel.findOne({ sessionId }).lean();
  } else {
    const list = getLocalStore('interviews');
    return list.find((i: any) => i.sessionId === sessionId) || null;
  }
};

// 1. Initialize Personalized Interview Session (Protected by requireAuth)
router.post('/start', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkUserId = req.auth?.userId || 'user_demo'; // Enforce authenticated Clerk userId
    const {
      targetRole = 'Software Engineer',
      resumeText = '',
      mode = 'Full Mock',
      difficulty = 'Medium',
      durationMinutes = 45,
      companyId = '',
      topics = [],
      experienceLevel = 'Mid',
    } = req.body;

    const sessionId = `SESSION_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Dynamic Question Selection based on Duration Budget, Company & DSA Skills
    const selection = await questionService.selectQuestions({
      clerkUserId,
      targetRole,
      resumeText,
      mode,
      desiredDifficulty: difficulty,
      durationMinutes: Number(durationMinutes) || 45,
      companyId,
      topics: Array.isArray(topics) ? topics : [],
      experienceLevel,
    });

    const selectedQuestions = selection.questions;

    const sessionData = {
      sessionId,
      userId: clerkUserId, // Associated strictly with verified Clerk user ID
      targetRole,
      mode,
      status: 'In Progress',
      durationMinutes: Number(durationMinutes) || 45,
      companyId,
      topics,
      resumeSummary: resumeText ? resumeText.substring(0, 300) + '...' : 'General Candidate Profile',
      turns: [],
      questionsList: selectedQuestions,
      totalEstimatedDuration: selection.totalEstimatedDuration,
      availableTimeBudget: selection.availableTimeBudget,
      createdAt: new Date(),
    };

    await saveSession(sessionData);

    return res.json({
      success: true,
      sessionId,
      totalQuestions: selectedQuestions.length,
      firstQuestion: selectedQuestions[0],
      questionsList: selectedQuestions,
      totalEstimatedDuration: selection.totalEstimatedDuration,
      availableTimeBudget: selection.availableTimeBudget,
      durationMinutes: Number(durationMinutes) || 45,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to start interview session.' });
  }
});

// 2. Deterministic Code Execution Endpoint (Sandbox Test Execution)
router.post('/:sessionId/code/execute', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { code, language = 'javascript', testCases = [] } = req.body;

    const session = await findSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Interview session not found.' });
    }

    // Execute code in deterministic sandbox environment
    const executionSummary: CodeExecutionSummary = await codeExecutionService.executeCode(code, language, testCases);

    return res.json({
      success: true,
      execution: executionSummary,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to execute code solution in sandbox.' });
  }
});

// 3. Submit Turn Answer with Evidence-Based Grading & Sandbox Execution
router.post('/:sessionId/turn', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const authenticatedUserId = req.auth?.userId || 'user_demo';
    const {
      questionId,
      questionText,
      candidateAnswer,
      category = 'Technical',
      topic = 'arrays',
      codeSubmitted = '',
      language = 'javascript',
      testCases = [],
      requiredConcepts = [],
      expectedComplexity = { time: 'O(N)', space: 'O(1)' },
      hintsUsed = 0,
    } = req.body;

    const session = await findSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Interview session not found.' });
    }

    // Verify session ownership
    if (session.userId && session.userId !== authenticatedUserId && authenticatedUserId !== 'user_demo') {
      return res.status(403).json({ error: 'Access denied. You do not own this interview session.' });
    }

    // Step A: Run deterministic sandbox execution if code was submitted
    let codeExecutionResult: CodeExecutionSummary | undefined = undefined;
    if (codeSubmitted && codeSubmitted.trim().length > 0) {
      codeExecutionResult = await codeExecutionService.executeCode(codeSubmitted, language, testCases);
    }

    // Step B: Evidence-Based AI Grading Engine
    const grading = await gradingService.evaluateCandidateResponse({
      questionText,
      category,
      candidateAnswer: candidateAnswer || (codeSubmitted ? 'Submitted code implementation.' : 'No text response.'),
      codeSubmitted,
      codeExecution: codeExecutionResult,
      requiredConcepts,
      expectedComplexity,
    });

    // Step C: Update Candidate DSA Skill Profile topic performance
    const isPassed = grading.calculatedFinalScore >= 70;
    await dsaProfileService.updateTopicPerformance(authenticatedUserId, topic, grading.calculatedFinalScore, isPassed);

    // Step D: Detect Incorrect/Flawed Answers & Formulate AI Correction Prompt
    const isIncorrectAnswer = grading.criticalErrors.length > 0 || grading.calculatedFinalScore < 70 || (codeExecutionResult && codeExecutionResult.status !== 'ACCEPTED');
    let correctionPrompt = '';
    
    if (codeExecutionResult && codeExecutionResult.status !== 'ACCEPTED') {
      if (codeExecutionResult.status === 'COMPILE_ERROR') {
        correctionPrompt = `Your code failed to compile with error: "${codeExecutionResult.compileErrorDetails?.substring(0, 100) || 'Syntax Error'}". Please fix the syntax error and re-run your solution.`;
      } else {
        correctionPrompt = `Your code passed ${codeExecutionResult.totalPassed} of ${codeExecutionResult.totalCount} test cases. It failed on hidden edge cases. Would you like to review your logic for boundary conditions?`;
      }
    } else if (grading.criticalErrors.length > 0) {
      const topError = grading.criticalErrors[0].description;
      correctionPrompt = `Wait a moment — your answer contains a technical flaw: ${topError}. How would you revise your solution to address this?`;
    } else if (grading.missedRequiredConcepts.length > 0) {
      correctionPrompt = `Your explanation is missing key technical concepts: ${grading.missedRequiredConcepts.slice(0, 2).join(', ')}. Can you elaborate on these concepts?`;
    }

    const aiInterviewerText = correctionPrompt || grading.actionableFeedback || 'Good job explaining your approach. Let us proceed to the next question.';

    // Step E: Generate ElevenLabs Audio Speech Stream using custom Voice ID Gfpl8Yo74Is0W6cPUWWT
    const ttsResult = await elevenLabsService.generateSpeech(aiInterviewerText);

    const turnData = {
      questionId,
      questionText,
      category,
      candidateAnswer: candidateAnswer || '',
      audioDurationSeconds: Math.round((candidateAnswer?.length || 50) / 12),
      score: grading.calculatedFinalScore,
      clarityScore: grading.communication.score * 10,
      technicalScore: Math.round((grading.technicalCorrectness.score / 50) * 100),
      behavioralScore: category === 'Behavioral' ? 85 : 75,
      aiFeedback: grading.actionableFeedback,
      hintsUsed,
      keywordsMatched: grading.matchedRequiredConcepts,
      keywordsMissed: grading.missedRequiredConcepts,
      codeSubmitted,
      codeExecutionPassed: codeExecutionResult ? codeExecutionResult.status === 'ACCEPTED' : false,
      codeExecutionSummary: codeExecutionResult,
      structuredGrading: grading,
      isIncorrectAnswer,
      correctionPrompt,
      aiInterviewerText,
      audioBase64: ttsResult.audioBase64,
    };

    session.turns = session.turns || [];
    session.turns.push(turnData);

    await saveSession(session);

    const questionsList = session.questionsList || [];
    const nextQuestionIndex = session.turns.length;
    const nextQuestion = nextQuestionIndex < questionsList.length ? questionsList[nextQuestionIndex] : null;

    return res.json({
      success: true,
      evaluatedTurn: turnData,
      isIncorrectAnswer,
      correctionPrompt,
      aiInterviewerText,
      audioBase64: ttsResult.audioBase64,
      isCompleted: !nextQuestion,
      nextQuestion,
      followUpQuestion: correctionPrompt || 'How would you optimize space complexity further if RAM was constrained?',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to process answer turn.' });
  }
});

// 4. ElevenLabs Text-to-Speech Audio Stream Endpoint
router.post('/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceId } = req.body;
    if (!text) return res.status(400).json({ error: 'Text prompt is required.' });

    const result = await elevenLabsService.generateSpeech(text, voiceId);
    return res.json({ success: true, audioBase64: result.audioBase64 });
  } catch (err: any) {
    return res.status(500).json({ error: 'TTS audio synthesis failed.' });
  }
});

// 4. Request Live AI Hint
router.post('/:sessionId/hint', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { questionText, candidateAnswerSoFar } = req.body;
    const hint = await llmService.generateHint(questionText, candidateAnswerSoFar);
    return res.json({ success: true, hint });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate hint.' });
  }
});

// 5. Complete Interview & Generate Final Analytics Report
router.post('/:sessionId/complete', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const authenticatedUserId = req.auth?.userId;

    const session = await findSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Interview session not found.' });
    }

    if (session.userId && session.userId !== authenticatedUserId && authenticatedUserId !== 'user_demo') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const report = await llmService.generateFinalReport(session);

    // Run Personalized Learning Diagnosis Engine
    try {
      const diagnosedWeaknesses = await diagnosisService.diagnoseInterview({
        userId: authenticatedUserId || 'user_demo',
        interviewId: sessionId,
        targetRole: session.targetRole || 'Software Engineer',
        turns: (session.turns || []).map((t: any) => ({
          questionId: t.questionId || `Q_${Math.random()}`,
          questionTitle: t.questionText?.substring(0, 60) || 'Interview Question',
          topic: t.category === 'Coding' ? 'Algorithms & Data Structures' : t.category || 'General Fundamentals',
          category: t.category,
          userResponse: t.candidateAnswer || '',
          score: t.score || 50,
          feedback: t.aiFeedback,
          evaluationDetails: t.structuredGrading
            ? {
                technicalCorrectnessScore: t.structuredGrading.technicalCorrectness?.score,
                keyConceptsPresent: t.structuredGrading.matchedRequiredConcepts,
                keyConceptsMissing: t.structuredGrading.missedRequiredConcepts,
                evaluatedClaims: t.structuredGrading.evaluatedClaims,
                criticalErrors: t.structuredGrading.criticalErrors,
                hasCriticalError: t.structuredGrading.hasCriticalError,
              }
            : undefined,
        })),
      });

      // Generate Learning Plans for diagnosed weaknesses
      for (const weakness of diagnosedWeaknesses) {
        await learningService.generateLearningPlan(authenticatedUserId || 'user_demo', weakness);
      }

      session.diagnosedWeaknesses = diagnosedWeaknesses;
    } catch (diagError) {
      console.warn('⚠️ Non-fatal: Interview weakness diagnosis error:', diagError);
    }

    session.status = 'Completed';
    session.overallScore = report.overallScore;
    session.skillScores = report.skillScores;
    session.aiReportSummary = report.aiReportSummary;
    session.strengths = report.strengths;
    session.areasToImprove = report.areasToImprove;
    session.completedAt = new Date();

    await saveSession(session);

    return res.json({
      success: true,
      report,
      session,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate final report.' });
  }
});

// 6. Get User Past Interview History (Protected, filtered by authenticated userId)
router.get('/history', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth?.userId || 'user_demo';

    let history: any[] = [];
    if (isMongoConnected) {
      history = await InterviewModel.find({ userId }).sort({ createdAt: -1 }).lean();
    } else {
      const list = getLocalStore('interviews');
      history = list.filter((i: any) => i.userId === userId || userId === 'user_demo');
    }

    return res.json({ success: true, history });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch interview history.' });
  }
});

// 7. Run Automated Grading Test Suite
router.get('/test-grading', async (req: Request, res: Response) => {
  try {
    const { gradingTestSuiteRunner } = await import('../tests/gradingTestSuite');
    const suiteResults = await gradingTestSuiteRunner.runAllTests();
    return res.json({ success: true, suiteResults });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to run grading test suite.' });
  }
});

// 8. Get Interview Session Details (Protected by ownership check)
router.get('/:sessionId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const authenticatedUserId = req.auth?.userId;

    const session = await findSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    if (session.userId && session.userId !== authenticatedUserId && authenticatedUserId !== 'user_demo') {
      return res.status(403).json({ error: 'Access denied. You do not own this session.' });
    }

    return res.json({ success: true, session });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch session.' });
  }
});

export default router;

