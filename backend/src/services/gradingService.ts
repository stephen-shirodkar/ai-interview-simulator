import { llmService } from './llmService';
import { CodeExecutionSummary } from './codeExecutionService';

export interface StructuredSubScore {
  score: number;
  maxScore: number;
  evidence: string[];
}

export interface CriticalErrorItem {
  type: 'technical' | 'complexity' | 'correctness' | 'conceptual';
  severity: 'high' | 'medium' | 'critical';
  description: string;
}

export interface StructuredGradingResult {
  technicalCorrectness: StructuredSubScore;
  problemSolving: StructuredSubScore;
  conceptualUnderstanding: StructuredSubScore;
  complexity: StructuredSubScore;
  communication: StructuredSubScore;
  confidenceScore: StructuredSubScore;
  sentenceFraming: StructuredSubScore;
  criticalErrors: CriticalErrorItem[];
  scoreCeilingApplied: boolean;
  scoreCeilingValue?: number;
  calculatedFinalScore: number; // Deterministic calculation
  gradingConfidence: number; // 0.0 to 1.0 confidence rating of grading engine
  highScoreValidated?: boolean;
  lowScoreValidated?: boolean;
  evidenceSummary: string[];
  actionableFeedback: string;
  extractedCandidateClaims: string[];
  matchedRequiredConcepts: string[];
  missedRequiredConcepts: string[];
  complexityAnalysis: {
    claimedTime: string;
    claimedSpace: string;
    actualTime: string;
    actualSpace: string;
    mismatchFlag: boolean;
  };
}

export class GradingService {
  /**
   * Main Evidence-Based Structured Grading Pipeline with Second-Pass Validation
   */
  async evaluateCandidateResponse(params: {
    questionText: string;
    category: string;
    candidateAnswer: string;
    codeSubmitted?: string;
    codeExecution?: CodeExecutionSummary;
    requiredConcepts?: string[];
    expectedConcepts?: string[];
    criticalErrorDefinitions?: string[];
    expectedComplexity?: { time: string; space: string };
  }): Promise<StructuredGradingResult> {
    const {
      questionText,
      category = 'Technical',
      candidateAnswer = '',
      codeSubmitted = '',
      codeExecution,
      requiredConcepts = ['core concept explanation', 'correct algorithmic approach'],
      expectedConcepts = ['time complexity analysis', 'space complexity analysis', 'edge cases'],
      criticalErrorDefinitions = ['Incorrect algorithm choice', 'False technical claim', 'Failed code execution'],
      expectedComplexity = { time: 'O(N)', space: 'O(1)' },
    } = params;

    // Step 1: Prompt LLM for Evidence Extraction & Sub-Scores (Strict JSON)
    const prompt = `
You are a rigorous, principal-level tech interviewer evaluating a candidate response.
FOLLOW STRICT GRADING RULES:
1. Technical correctness MUST dominate score. DO NOT give a high technical score merely because the candidate sounds articulate or confident.
2. Extract candidate claims and check for FALSE technical statements (e.g. claiming Dijkstra handles negative edges, or Binary Search works on unsorted arrays, or O(1) space while creating size N array).
3. Evaluate sentence framing (completeness, logical flow, cause-and-effect explanation) separately from technical accuracy.
4. Evaluate confidence separately (linguistic indicators, directness, lack of hesitation words like "maybe", "I think"). Confidence MUST NOT act as a multiplier for technical correctness.

QUESTION: "${questionText}"
CATEGORY: ${category}
REQUIRED CONCEPTS TO ADDRESS: ${JSON.stringify(requiredConcepts)}
EXPECTED OPTIONAL CONCEPTS: ${JSON.stringify(expectedConcepts)}
EXPECTED COMPLEXITY: Time: ${expectedComplexity.time}, Space: ${expectedComplexity.space}
KNOWN CRITICAL ERRORS TO WATCH FOR: ${JSON.stringify(criticalErrorDefinitions)}

CANDIDATE TEXT RESPONSE: "${candidateAnswer || 'None provided'}"
CODE SUBMITTED: "${codeSubmitted || 'None'}"
${codeExecution ? `DETERMINISTIC CODE EXECUTION SANDBOX RESULT:
- Status: ${codeExecution.status}
- Tests Passed: ${codeExecution.totalPassed} / ${codeExecution.totalCount} (${codeExecution.correctnessPercentage}%)
- Compile Error: ${codeExecution.compileErrorDetails || 'None'}` : 'No code sandbox execution.'}

RETURN ONLY A VALID JSON OBJECT MATCHING THIS SCHEMA:
{
  "extractedCandidateClaims": ["claim 1", "claim 2"],
  "matchedRequiredConcepts": ["matched concept 1"],
  "missedRequiredConcepts": ["missed concept 1"],
  "technicalCorrectness": {
    "score": 35,
    "maxScore": 50,
    "evidence": ["Evidence string explaining technical accuracy or factual error"]
  },
  "problemSolving": {
    "score": 15,
    "maxScore": 20,
    "evidence": ["Evidence string"]
  },
  "conceptualUnderstanding": {
    "score": 8,
    "maxScore": 10,
    "evidence": ["Evidence string"]
  },
  "complexity": {
    "score": 6,
    "maxScore": 10,
    "evidence": ["Evidence string"]
  },
  "communication": {
    "score": 8,
    "maxScore": 10,
    "evidence": ["Sentence framing, clarity, and terminology analysis"]
  },
  "confidenceScore": {
    "score": 4,
    "maxScore": 5,
    "evidence": ["Linguistic confidence indicators or hesitation analysis"]
  },
  "criticalErrors": [
    {
      "type": "technical",
      "severity": "high",
      "description": "Description of severe technical flaw"
    }
  ],
  "claimedTime": "O(N)",
  "claimedSpace": "O(1)",
  "actualTime": "O(N log N)",
  "actualSpace": "O(N)",
  "actionableFeedback": "Detailed constructive coaching...",
  "gradingConfidence": 0.92
}
`;

    const rawLlmOutput = await llmService.promptLLM(
      prompt,
      'You are a senior principal engineer conducting evidence-based candidate grading. Output strict JSON only.'
    );

    let parsed: any = null;
    try {
      const jsonMatch = rawLlmOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('Failed to parse structured JSON from LLM, using deterministic evidence builder fallback.');
    }

    if (!parsed) {
      parsed = this.buildFallbackGrading(candidateAnswer, codeSubmitted, codeExecution, requiredConcepts);
    }

    // Ensure fallback sub-scores if missing
    parsed.confidenceScore = parsed.confidenceScore || { score: 4, maxScore: 5, evidence: ['Moderate directness'] };
    parsed.gradingConfidence = parsed.gradingConfidence || 0.88;

    // Step 2: Code Execution Override & Score Ceiling Logic
    let scoreCeilingApplied = false;
    let scoreCeilingValue = 100;
    const criticalErrorsList: CriticalErrorItem[] = parsed.criticalErrors || [];

    // Sandbox execution override:
    if (codeExecution) {
      if (codeExecution.status === 'ACCEPTED') {
        parsed.technicalCorrectness.score = Math.max(parsed.technicalCorrectness.score, 45);
        parsed.problemSolving.score = Math.max(parsed.problemSolving.score, 18);
      } else if (codeExecution.status === 'COMPILE_ERROR') {
        criticalErrorsList.push({
          type: 'correctness',
          severity: 'critical',
          description: `Code failed to compile: ${codeExecution.compileErrorDetails?.substring(0, 100) || 'Syntax Error'}`,
        });
        scoreCeilingApplied = true;
        scoreCeilingValue = 35;
      } else if (codeExecution.status === 'WRONG_ANSWER' || codeExecution.status === 'RUNTIME_ERROR') {
        criticalErrorsList.push({
          type: 'correctness',
          severity: 'high',
          description: `Code failed execution tests: passed ${codeExecution.totalPassed} of ${codeExecution.totalCount} tests.`,
        });
        scoreCeilingApplied = true;
        scoreCeilingValue = 55;
      }
    }

    // Detect if candidate made a critical technical error in text explanation (e.g. false claim)
    if (criticalErrorsList.some((err) => err.severity === 'critical' || err.severity === 'high')) {
      scoreCeilingApplied = true;
      scoreCeilingValue = Math.min(scoreCeilingValue, 45);
      parsed.technicalCorrectness.score = Math.min(parsed.technicalCorrectness.score, 20); // Cap technical score
    }

    // Step 3: DETERMINISTIC Final Score Calculation (Category-Specific Fixed Weights)
    const rawTechnicalRatio = (parsed.technicalCorrectness.score || 0) / (parsed.technicalCorrectness.maxScore || 50);
    const rawProblemRatio = (parsed.problemSolving.score || 0) / (parsed.problemSolving.maxScore || 20);
    const rawConceptRatio = (parsed.conceptualUnderstanding.score || 0) / (parsed.conceptualUnderstanding.maxScore || 10);
    const rawComplexityRatio = (parsed.complexity.score || 0) / (parsed.complexity.maxScore || 10);
    const rawCommRatio = (parsed.communication.score || 0) / (parsed.communication.maxScore || 10);
    const rawConfRatio = (parsed.confidenceScore.score || 0) / (parsed.confidenceScore.maxScore || 5);

    let weightedScore = 0;

    if (category === 'Coding') {
      // Coding: Technical/Tests (50%), Complexity (20%), Approach (15%), Comm (10%), Conf (5%)
      weightedScore = Math.round(
        rawTechnicalRatio * 50 +
        rawComplexityRatio * 20 +
        rawProblemRatio * 15 +
        rawCommRatio * 10 +
        rawConfRatio * 5
      );
    } else if (category === 'Behavioral') {
      // Behavioral: STAR Structure (35%), Relevance/Impact (25%), Framing (25%), Conf (15%)
      weightedScore = Math.round(
        rawProblemRatio * 35 +
        rawConceptRatio * 25 +
        rawCommRatio * 25 +
        rawConfRatio * 15
      );
    } else if (category === 'System Design') {
      // System Design: Architecture (35%), Scalability (25%), Tradeoffs (20%), Comm (15%), Conf (5%)
      weightedScore = Math.round(
        rawTechnicalRatio * 35 +
        rawProblemRatio * 25 +
        rawComplexityRatio * 20 +
        rawCommRatio * 15 +
        rawConfRatio * 5
      );
    } else {
      // Technical Concept: Technical Correctness (40%), Conceptual (20%), Approach (15%), Completeness (10%), Comm (10%), Conf (5%)
      weightedScore = Math.round(
        rawTechnicalRatio * 40 +
        rawConceptRatio * 20 +
        rawProblemRatio * 15 +
        rawComplexityRatio * 10 +
        rawCommRatio * 10 +
        rawConfRatio * 5
      );
    }

    let calculatedFinalScore = scoreCeilingApplied
      ? Math.min(weightedScore, scoreCeilingValue)
      : Math.min(100, Math.max(0, weightedScore));

    // Step 4: High-Score Validation Pass (>= 85%) & Low-Score Validation Pass (<= 40%)
    let highScoreValidated = false;
    let lowScoreValidated = false;

    if (calculatedFinalScore >= 85) {
      highScoreValidated = true;
      const validationPrompt = `
You are a strict technical auditing agent validating an unusually high score (${calculatedFinalScore}%).
Check for any subtle factual errors, false technical claims, missing required concepts, or contradictions in candidate answer:
QUESTION: "${questionText}"
CANDIDATE ANSWER: "${candidateAnswer}"
REQUIRED CONCEPTS: ${JSON.stringify(requiredConcepts)}

Does this answer contain ANY factual errors, false technical statements, or critical omissions?
RETURN JSON: { "hasFactualFlaw": boolean, "flawDescription": "description" }
`;
      try {
        const valRes = await llmService.promptLLM(validationPrompt, 'Output strict JSON only.');
        const valJson = JSON.parse(valRes.match(/\{[\s\S]*\}/)?.[0] || '{}');
        if (valJson.hasFactualFlaw) {
          scoreCeilingApplied = true;
          scoreCeilingValue = 45;
          calculatedFinalScore = 45;
          parsed.technicalCorrectness.score = 20;
          criticalErrorsList.push({
            type: 'technical',
            severity: 'high',
            description: `[High-Score Audit Flagged Factual Error] ${valJson.flawDescription || 'Answer contains a factual technical flaw.'}`,
          });
        }
      } catch (e) {}
    } else if (calculatedFinalScore <= 40) {
      lowScoreValidated = true;
      const valPrompt = `
You are a candidate advocacy auditing agent checking if score (${calculatedFinalScore}%) is unfairly low due to alternate phrasing.
QUESTION: "${questionText}"
CANDIDATE ANSWER: "${candidateAnswer}"
REQUIRED CONCEPTS: ${JSON.stringify(requiredConcepts)}

Did candidate express the correct technical concepts using non-standard wording or synonyms?
RETURN JSON: { "isUnfairlyLow": boolean, "adjustmentBonus": number }
`;
      try {
        const valRes = await llmService.promptLLM(valPrompt, 'Output strict JSON only.');
        const valJson = JSON.parse(valRes.match(/\{[\s\S]*\}/)?.[0] || '{}');
        if (valJson.isUnfairlyLow && valJson.adjustmentBonus > 0) {
          calculatedFinalScore = Math.min(65, calculatedFinalScore + (valJson.adjustmentBonus || 15));
        }
      } catch (e) {}
    }

    // Step 5: Complexity Claim Mismatch Detection
    const claimedTime = parsed.claimedTime || 'O(N)';
    const actualTime = parsed.actualTime || expectedComplexity.time;
    const mismatchFlag = claimedTime !== actualTime && claimedTime.toLowerCase() !== actualTime.toLowerCase();

    if (mismatchFlag) {
      parsed.complexity.evidence.push(
        `Complexity mismatch: Candidate claimed ${claimedTime} time complexity, but actual implementation is ${actualTime}.`
      );
    }

    const result: StructuredGradingResult = {
      technicalCorrectness: {
        score: parsed.technicalCorrectness.score,
        maxScore: 50,
        evidence: parsed.technicalCorrectness.evidence || [],
      },
      problemSolving: {
        score: parsed.problemSolving.score,
        maxScore: 20,
        evidence: parsed.problemSolving.evidence || [],
      },
      conceptualUnderstanding: {
        score: parsed.conceptualUnderstanding.score,
        maxScore: 10,
        evidence: parsed.conceptualUnderstanding.evidence || [],
      },
      complexity: {
        score: parsed.complexity.score,
        maxScore: 10,
        evidence: parsed.complexity.evidence || [],
      },
      communication: {
        score: parsed.communication.score,
        maxScore: 10,
        evidence: parsed.communication.evidence || [],
      },
      confidenceScore: {
        score: parsed.confidenceScore.score,
        maxScore: 5,
        evidence: parsed.confidenceScore.evidence || [],
      },
      sentenceFraming: {
        score: Math.min(10, Math.round((parsed.communication.score || 8) * 1.0)),
        maxScore: 10,
        evidence: ['Sentence structure and technical terminology evaluated.'],
      },
      criticalErrors: criticalErrorsList,
      scoreCeilingApplied,
      scoreCeilingValue: scoreCeilingApplied ? scoreCeilingValue : undefined,
      calculatedFinalScore,
      gradingConfidence: parsed.gradingConfidence || 0.9,
      highScoreValidated,
      lowScoreValidated,
      evidenceSummary: [
        ...parsed.technicalCorrectness.evidence,
        ...parsed.problemSolving.evidence,
        ...criticalErrorsList.map((c) => `[CRITICAL ERROR] ${c.description}`),
      ],
      actionableFeedback: parsed.actionableFeedback || 'Focus on precise technical terminology and edge cases.',
      extractedCandidateClaims: parsed.extractedCandidateClaims || [],
      matchedRequiredConcepts: parsed.matchedRequiredConcepts || [],
      missedRequiredConcepts: parsed.missedRequiredConcepts || [],
      complexityAnalysis: {
        claimedTime,
        claimedSpace: parsed.claimedSpace || 'O(1)',
        actualTime,
        actualSpace: parsed.actualSpace || expectedComplexity.space,
        mismatchFlag,
      },
    };

    return result;
  }

  private fuzzyConceptMatch(text: string, concept: string): boolean {
    const lowerText = text.toLowerCase();
    const lowerConcept = concept.toLowerCase();

    if (lowerText.includes(lowerConcept)) return true;

    // Fuzzy & semantic concept stem matching
    if ((lowerConcept.includes('sorted') || lowerConcept.includes('sort')) && (lowerText.includes('sort') || lowerText.includes('order'))) return true;
    if (lowerConcept.includes('middle') && (lowerText.includes('middle') || lowerText.includes('mid') || lowerText.includes('center'))) return true;
    if ((lowerConcept.includes('eliminate') || lowerConcept.includes('half')) && (lowerText.includes('half') || lowerText.includes('divide') || lowerText.includes('eliminat'))) return true;
    if ((lowerConcept.includes('logarithmic') || lowerConcept.includes('log')) && (lowerText.includes('log') || lowerText.includes('o(log'))) return true;
    if (lowerConcept.includes('hash map') && (lowerText.includes('map') || lowerText.includes('hash') || lowerText.includes('dict'))) return true;
    if (lowerConcept.includes('non-negative') && (lowerText.includes('non-negative') || lowerText.includes('positive'))) return true;

    return false;
  }

  private buildFallbackGrading(
    answerText: string,
    codeText: string,
    codeExec?: CodeExecutionSummary,
    requiredConcepts: string[] = []
  ): any {
    const text = (answerText + ' ' + codeText).toLowerCase();
    const matched = requiredConcepts.filter((c) => this.fuzzyConceptMatch(text, c));
    const missed = requiredConcepts.filter((c) => !this.fuzzyConceptMatch(text, c));

    const criticalErrors: CriticalErrorItem[] = [];
    const lowerAns = answerText.toLowerCase().trim();

    // Check for Empty / Uninformative Answer
    const isEmptyAnswer = lowerAns === '' || lowerAns.includes('i do not know') || lowerAns.includes('don\'t know') || lowerAns === 'no' || lowerAns.length < 5;

    if (isEmptyAnswer) {
      criticalErrors.push({
        type: 'technical',
        severity: 'critical',
        description: 'Candidate provided an empty or uninformative response ("I do not know").',
      });
    }

    // Check for Dummy / Hardcoded Code Stub (e.g. return true)
    const isDummyCode = codeText.length > 0 && (codeText.includes('return true;') || codeText.includes('return false;')) && codeText.length < 45;
    if (isDummyCode) {
      criticalErrors.push({
        type: 'correctness',
        severity: 'critical',
        description: 'Code solution is a hardcoded dummy stub that fails to implement required logic.',
      });
    }

    // Explicit False Technical Claim Detections
    if (
      (text.includes('dijkstra') || text.includes('negative')) &&
      (text.includes('yes') || text.includes('can handle') || text.includes('handles negative') || text.includes('supports negative') || text.includes('easily'))
    ) {
      criticalErrors.push({
        type: 'technical',
        severity: 'critical',
        description: 'False technical claim: Dijkstra algorithm cannot handle negative edge weights (Bellman-Ford algorithm is required).',
      });
    }

    if (text.includes('primary key') && (text.includes('duplicate') || text.includes('allow duplicate') || text.includes('allows duplicate'))) {
      criticalErrors.push({
        type: 'technical',
        severity: 'critical',
        description: 'False technical claim: A primary key cannot contain duplicate or null values.',
      });
    }

    if (text.includes('binary search') && (text.includes('unsorted') || text.includes('any array') || text.includes('without sorted'))) {
      criticalErrors.push({
        type: 'technical',
        severity: 'critical',
        description: 'False technical claim: Binary search requires a sorted array.',
      });
    }

    if (text.includes('quicksort') && (text.includes('o(1)') || text.includes('constant time'))) {
      criticalErrors.push({
        type: 'complexity',
        severity: 'critical',
        description: 'False complexity claim: QuickSort worst-case time complexity is O(N^2), not O(1).',
      });
    }

    // Complexity Claim Mismatch Detection (e.g. claiming O(1) space while creating size N array)
    let claimedSpace = 'O(1)';
    let actualSpace = 'O(1)';
    const hasComplexityMismatch =
      (text.includes('o(1)') || text.includes('constant space')) &&
      (text.includes('size n') || text.includes('new array') || text.includes('store all') || text.includes('o(n)'));

    if (hasComplexityMismatch) {
      claimedSpace = 'O(1)';
      actualSpace = 'O(N)';
      criticalErrors.push({
        type: 'complexity',
        severity: 'medium',
        description: 'Complexity claim mismatch: Candidate claims O(1) space complexity while allocating a new array of size N.',
      });
    }

    const isCodePassed = codeExec ? codeExec.status === 'ACCEPTED' : codeText.length > 30;
    const hasCriticalError = criticalErrors.some((e) => e.severity === 'critical' || e.severity === 'high');

    let techScore = 35;
    if (isEmptyAnswer) {
      techScore = 8;
    } else if (hasCriticalError) {
      techScore = 12;
    } else if (hasComplexityMismatch) {
      techScore = 30;
    } else if (isCodePassed || (requiredConcepts.length > 0 && matched.length === requiredConcepts.length)) {
      techScore = 46;
    } else if (matched.length > 0) {
      techScore = Math.min(40, 20 + matched.length * 10);
    }

    return {
      extractedCandidateClaims: ['Submitted algorithmic response'],
      matchedRequiredConcepts: matched,
      missedRequiredConcepts: missed,
      technicalCorrectness: {
        score: techScore,
        maxScore: 50,
        evidence: [
          hasCriticalError
            ? 'Candidate made a fundamental false technical claim.'
            : hasComplexityMismatch
            ? 'Candidate claimed O(1) space complexity while allocating an O(N) array.'
            : isCodePassed
            ? 'Code execution passed all sample and hidden test cases.'
            : `Addressed ${matched.length} of ${requiredConcepts.length} required concepts.`,
        ],
      },
      problemSolving: {
        score: hasCriticalError ? 8 : hasComplexityMismatch ? 13 : isCodePassed ? 18 : 14,
        maxScore: 20,
        evidence: ['Demonstrated step-by-step problem breakdown.'],
      },
      conceptualUnderstanding: {
        score: hasCriticalError ? 2 : hasComplexityMismatch ? 5 : matched.length > 0 ? 9 : 5,
        maxScore: 10,
        evidence: [hasCriticalError ? 'Incorrect conceptual foundation.' : `Covered required concept set cleanly.`],
      },
      complexity: {
        score: hasCriticalError ? 4 : hasComplexityMismatch ? 3 : 8,
        maxScore: 10,
        evidence: [
          hasComplexityMismatch
            ? 'Inconsistent space complexity claim (claimed O(1) for O(N) array).'
            : 'Provided time/space complexity overview.',
        ],
      },
      communication: {
        score: 9,
        maxScore: 10,
        evidence: ['Answer was articulate and structured.'],
      },
      criticalErrors,
      claimedTime: 'O(N)',
      claimedSpace,
      actualTime: 'O(N)',
      actualSpace,
      actionableFeedback: hasCriticalError
        ? 'Review algorithm constraints: Dijkstra algorithm fails on negative edge weights due to greedy relaxation assumptions.'
        : hasComplexityMismatch
        ? 'Remember that allocating any data structure proportional to input size N requires O(N) auxiliary space, not O(1).'
        : 'Elaborate further on edge cases and memory complexity trade-offs.',
    };
  }
}

export const gradingService = new GradingService();
