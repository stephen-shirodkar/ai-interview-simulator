import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { gradingService } from '../services/gradingService';
import { gradingRegressionService } from '../services/gradingRegressionService';

const router = Router();

// 1. Standalone Structured Evaluation Endpoint
router.post('/evaluate', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      questionText,
      category,
      candidateAnswer,
      codeSubmitted,
      codeExecution,
      requiredConcepts,
      expectedConcepts,
      criticalErrorDefinitions,
      expectedComplexity,
    } = req.body;

    const evaluation = await gradingService.evaluateCandidateResponse({
      questionText,
      category,
      candidateAnswer,
      codeSubmitted,
      codeExecution,
      requiredConcepts,
      expectedConcepts,
      criticalErrorDefinitions,
      expectedComplexity,
    });

    return res.json({ success: true, evaluation });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to evaluate response.' });
  }
});

// 2. Grading Regression Testing Endpoint
router.get('/regression-test', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const summary = await gradingRegressionService.runRegressionSuite();
    return res.json({ success: true, summary });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to execute grading regression tests.' });
  }
});

export default router;
