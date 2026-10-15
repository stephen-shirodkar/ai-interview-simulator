import { Router, Request, Response } from 'express';
import { isMongoConnected, getLocalStore } from '../db/connection';
import { CandidateWeaknessModel } from '../models/Learning';
import { masteryService } from '../services/masteryService';
import { learningService } from '../services/learningService';
import { practiceService } from '../services/practiceService';

const router = Router();

// Helper to extract authenticated user ID from Clerk headers
const getUserId = (req: Request): string => {
  const clerkId = (req.headers['x-clerk-user-id'] || req.headers['x-user-id']) as string;
  return clerkId || 'user_default_candidate';
};

/**
 * GET /api/learning/dashboard
 * Retrieves candidate weaknesses, topic mastery list, and streak metrics
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    // 1. Fetch Weaknesses
    let weaknesses: any[] = [];
    if (isMongoConnected) {
      try {
        weaknesses = await CandidateWeaknessModel.find({ userId, status: { $ne: 'RESOLVED' } })
          .sort({ score: 1 })
          .lean();
      } catch (e) {}
    }

    if (!weaknesses || weaknesses.length === 0) {
      const list = getLocalStore('weaknesses');
      weaknesses = list.filter((w: any) => w.userId === userId && w.status !== 'RESOLVED');
    }

    // 2. Fetch Topic Mastery List
    const masteryList = await masteryService.getUserMasteryList(userId);

    // 3. Compute Metrics
    const topicsImproved = masteryList.filter((m: any) => m.trend === 'IMPROVING').length;
    const practiceSessions = getLocalStore('practiceSessions').filter((s: any) => s.userId === userId && s.status === 'COMPLETED');

    return res.json({
      success: true,
      weaknesses: weaknesses.slice(0, 5),
      masteryList,
      metrics: {
        activeWeaknessesCount: weaknesses.length,
        topicsImproved,
        practiceQuestionsCompleted: practiceSessions.length * 3,
        learningStreakDays: 3,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/learning/topic/:topic
 * Retrieves evidence, RAG-grounded concept guide, and plan for a specific topic
 */
router.get('/topic/:topic', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const topic = decodeURIComponent(req.params.topic);

    const { plan, explanationContent } = await learningService.getOrCreateLearningPlan(userId, topic);

    // Get specific evidence if available
    let evidenceList: any[] = [];
    if (isMongoConnected) {
      try {
        const weaknessDoc: any = await CandidateWeaknessModel.findOne({ userId, topic }).lean();
        if (weaknessDoc) evidenceList = weaknessDoc.evidence || [];
      } catch (e) {}
    }

    if (evidenceList.length === 0) {
      const list = getLocalStore('weaknesses');
      const w = list.find((item: any) => item.userId === userId && item.topic.toLowerCase() === topic.toLowerCase());
      if (w) evidenceList = w.evidence || [];
    }

    // Baseline fallback evidence if empty
    if (evidenceList.length === 0) {
      evidenceList = [
        {
          questionId: 'q_eval',
          reason: `Performance evaluation identified ${topic} as an area to reinforce.`,
          missingConcepts: ['Core execution rules', 'Asymptotic trade-offs'],
        },
      ];
    }

    return res.json({
      success: true,
      topic,
      plan,
      explanationContent,
      evidenceList,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/learning/practice/start
 * Starts a targeted practice or reassessment session
 */
router.post('/practice/start', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { topic, weaknessId, type = 'PRACTICE' } = req.body;

    if (!topic) {
      return res.status(400).json({ success: false, error: 'Topic is required' });
    }

    const session = await practiceService.startPracticeSession(userId, topic, weaknessId, type);

    return res.json({
      success: true,
      session,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/learning/practice/submit
 * Submits practice answers, evaluates, and updates mastery
 */
router.post('/practice/submit', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { sessionId, answers } = req.body;

    if (!sessionId || !answers) {
      return res.status(400).json({ success: false, error: 'sessionId and answers are required' });
    }

    const result = await practiceService.submitPracticeAnswers(userId, sessionId, answers);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/learning/test-suite
 * Runs automated integration test suite for diagnosis, RAG retrieval, practice, & mastery tracking
 */
router.get('/test-suite', async (req: Request, res: Response) => {
  try {
    const { learningTestSuiteRunner } = await import('../tests/learningTestSuite');
    const suiteResults = await learningTestSuiteRunner.runAllTests();
    return res.json({ success: true, suiteResults });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to run learning test suite.' });
  }
});

export default router;
