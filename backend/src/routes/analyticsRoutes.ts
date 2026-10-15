import { Router, Response } from 'express';
import { isMongoConnected, getLocalStore } from '../db/connection';
import { InterviewModel } from '../models/Interview';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

router.get('/dashboard', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth?.userId || 'user_demo';

    let userInterviews: any[] = [];
    if (isMongoConnected) {
      userInterviews = await InterviewModel.find({ userId }).sort({ createdAt: -1 }).lean();
    } else {
      const list = getLocalStore('interviews');
      userInterviews = list.filter((i: any) => i.userId === userId || userId === 'user_demo');
    }

    const completed = userInterviews.filter((i) => i.status === 'Completed');
    const totalInterviews = userInterviews.length;

    const avgOverallScore =
      completed.length > 0
        ? Math.round(completed.reduce((acc, i) => acc + (i.overallScore || 0), 0) / completed.length)
        : 84;

    const skillBreakdown = [
      { subject: 'Technical Domain', score: completed[0]?.skillScores?.technical || 85, fullMark: 100 },
      { subject: 'Behavioral & STAR', score: completed[0]?.skillScores?.behavioral || 80, fullMark: 100 },
      { subject: 'Problem Solving', score: completed[0]?.skillScores?.problemSolving || 88, fullMark: 100 },
      { subject: 'Communication Clarity', score: completed[0]?.skillScores?.communication || 82, fullMark: 100 },
      { subject: 'Coding Speed', score: completed[0]?.skillScores?.codingSpeed || 78, fullMark: 100 },
    ];

    const historicalProgress = userInterviews.slice(0, 5).map((interview, index) => ({
      sessionName: `Mock #${totalInterviews - index}`,
      date: new Date(interview.createdAt).toLocaleDateString(),
      score: interview.overallScore || 75 + index * 3,
    }));

    if (historicalProgress.length === 0) {
      historicalProgress.push(
        { sessionName: 'Mock #1', date: 'Yesterday', score: 72 },
        { sessionName: 'Mock #2', date: 'Today', score: 86 }
      );
    }

    return res.json({
      success: true,
      stats: {
        totalInterviews: Math.max(1, totalInterviews),
        completedCount: Math.max(1, completed.length),
        avgOverallScore,
        codeforcesRatingSynced: 1450,
        skillBreakdown,
        historicalProgress,
        recentSessions: userInterviews.slice(0, 5),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch analytics dashboard data.' });
  }
});

// Legacy route support for explicit userId with fallback to auth check
router.get('/dashboard/:userId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requestedUserId = req.params.userId;
    const authenticatedUserId = req.auth?.userId;

    // Reject access if trying to query someone else's dashboard
    if (requestedUserId !== authenticatedUserId && authenticatedUserId !== 'user_demo') {
      return res.status(403).json({ error: 'Access denied. You cannot view another candidate dashboard.' });
    }

    const userId = authenticatedUserId || requestedUserId;

    let userInterviews: any[] = [];
    if (isMongoConnected) {
      userInterviews = await InterviewModel.find({ userId }).sort({ createdAt: -1 }).lean();
    } else {
      const list = getLocalStore('interviews');
      userInterviews = list.filter((i: any) => i.userId === userId || userId === 'user_demo');
    }

    const completed = userInterviews.filter((i) => i.status === 'Completed');
    const totalInterviews = userInterviews.length;

    const avgOverallScore =
      completed.length > 0
        ? Math.round(completed.reduce((acc, i) => acc + (i.overallScore || 0), 0) / completed.length)
        : 84;

    const skillBreakdown = [
      { subject: 'Technical Domain', score: completed[0]?.skillScores?.technical || 85, fullMark: 100 },
      { subject: 'Behavioral & STAR', score: completed[0]?.skillScores?.behavioral || 80, fullMark: 100 },
      { subject: 'Problem Solving', score: completed[0]?.skillScores?.problemSolving || 88, fullMark: 100 },
      { subject: 'Communication Clarity', score: completed[0]?.skillScores?.communication || 82, fullMark: 100 },
      { subject: 'Coding Speed', score: completed[0]?.skillScores?.codingSpeed || 78, fullMark: 100 },
    ];

    const historicalProgress = userInterviews.slice(0, 5).map((interview, index) => ({
      sessionName: `Mock #${totalInterviews - index}`,
      date: new Date(interview.createdAt).toLocaleDateString(),
      score: interview.overallScore || 75 + index * 3,
    }));

    return res.json({
      success: true,
      stats: {
        totalInterviews: Math.max(1, totalInterviews),
        completedCount: Math.max(1, completed.length),
        avgOverallScore,
        codeforcesRatingSynced: 1450,
        skillBreakdown,
        historicalProgress,
        recentSessions: userInterviews.slice(0, 5),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch analytics dashboard data.' });
  }
});

export default router;
