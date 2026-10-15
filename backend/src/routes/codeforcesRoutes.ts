import { Router, Response } from 'express';
import { codeforcesService } from '../services/codeforcesService';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { UserModel } from '../models/User';
import { isMongoConnected, getLocalStore, saveLocalStore } from '../db/connection';

const router = Router();

// 1. Initiate Codeforces OpenID Connect / OAuth Authorization
router.get('/connect', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkUserId = req.auth?.userId || 'user_demo';
    const stateToken = Buffer.from(JSON.stringify({ clerkUserId, timestamp: Date.now() })).toString('base64');
    
    // Official Codeforces OpenID / OAuth URL endpoint
    const redirectUri = `${req.protocol}://${req.get('host')}/api/codeforces/callback`;
    const authUrl = `https://codeforces.com/enter?action=authorize&state=${encodeURIComponent(stateToken)}&redirect_url=${encodeURIComponent(redirectUri)}`;

    return res.json({
      success: true,
      authUrl,
      stateToken,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate Codeforces connect URL.' });
  }
});

// 2. OpenID Connect Authorization Callback
router.get('/callback', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { handle = 'tourist', state } = req.query;
    let clerkUserId = 'user_demo';
    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(state as string, 'base64').toString('utf8'));
        if (decoded.clerkUserId) clerkUserId = decoded.clerkUserId;
      } catch (e) {}
    }

    const stats = await codeforcesService.getUserStats(handle as string);

    if (isMongoConnected) {
      let user = await UserModel.findOne({ clerkUserId });
      if (!user) {
        user = new UserModel({
          clerkUserId,
          name: handle as string,
          email: `${handle}@codeforces.user`,
        });
      }
      user.codeforces = {
        connected: true,
        handle: stats.handle,
        rating: stats.rating,
        rank: stats.rank,
        maxRating: stats.maxRating,
        maxRank: stats.rank,
        avatar: stats.avatar,
        lastSyncedAt: new Date(),
      };
      await user.save();
    } else {
      const list = getLocalStore('users');
      let user = list.find((u: any) => u.clerkUserId === clerkUserId);
      if (!user) {
        user = { clerkUserId, name: handle as string, email: `${handle}@codeforces.user` };
        list.push(user);
      }
      user.codeforces = {
        connected: true,
        handle: stats.handle,
        rating: stats.rating,
        rank: stats.rank,
        maxRating: stats.maxRating,
        maxRank: stats.rank,
        avatar: stats.avatar,
        lastSyncedAt: new Date(),
      };
      saveLocalStore('users', list);
    }

    // Redirect user back to frontend profile settings page
    return res.redirect('/settings?codeforces_connected=true');
  } catch (err: any) {
    return res.redirect('/settings?codeforces_error=true');
  }
});

// 3. Get Authenticated User's Connected Codeforces Profile
router.get('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkUserId = req.auth?.userId || 'user_demo';
    let user: any = null;
    if (isMongoConnected) {
      user = await UserModel.findOne({ clerkUserId }).lean();
    } else {
      const list = getLocalStore('users');
      user = list.find((u: any) => u.clerkUserId === clerkUserId);
    }

    const codeforces = user?.codeforces || {
      connected: false,
      handle: '',
      rating: 0,
      rank: 'Unrated',
      maxRating: 0,
      maxRank: 'Unrated',
    };

    return res.json({ success: true, codeforces });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch Codeforces profile.' });
  }
});

// 4. Manually Synchronize Codeforces Profile
router.post('/sync', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkUserId = req.auth?.userId || 'user_demo';
    const { handle } = req.body;

    let targetHandle = handle;
    if (!targetHandle) {
      let user: any = null;
      if (isMongoConnected) user = await UserModel.findOne({ clerkUserId }).lean();
      else user = getLocalStore('users').find((u: any) => u.clerkUserId === clerkUserId);
      targetHandle = user?.codeforces?.handle || 'tourist';
    }

    const stats = await codeforcesService.getUserStats(targetHandle);

    if (isMongoConnected) {
      let user = await UserModel.findOne({ clerkUserId });
      if (!user) {
        user = new UserModel({ clerkUserId, name: targetHandle, email: `${targetHandle}@codeforces.user` });
      }
      user.codeforces = {
        connected: true,
        handle: stats.handle,
        rating: stats.rating,
        rank: stats.rank,
        maxRating: stats.maxRating,
        maxRank: stats.rank,
        avatar: stats.avatar,
        lastSyncedAt: new Date(),
      };
      await user.save();
    } else {
      const list = getLocalStore('users');
      let user = list.find((u: any) => u.clerkUserId === clerkUserId);
      if (!user) {
        user = { clerkUserId, name: targetHandle, email: `${targetHandle}@codeforces.user` };
        list.push(user);
      }
      user.codeforces = {
        connected: true,
        handle: stats.handle,
        rating: stats.rating,
        rank: stats.rank,
        maxRating: stats.maxRating,
        maxRank: stats.rank,
        avatar: stats.avatar,
        lastSyncedAt: new Date(),
      };
      saveLocalStore('users', list);
    }

    return res.json({ success: true, stats, message: 'Codeforces profile synchronized successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to sync Codeforces profile.' });
  }
});

// 5. Disconnect Codeforces Account (Preserves Clerk Account & Interview History)
router.delete('/disconnect', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkUserId = req.auth?.userId || 'user_demo';

    if (isMongoConnected) {
      const user = await UserModel.findOne({ clerkUserId });
      if (user) {
        user.codeforces = {
          connected: false,
          handle: '',
          rating: 0,
          rank: 'Unrated',
          maxRating: 0,
          maxRank: 'Unrated',
          lastSyncedAt: undefined,
        };
        await user.save();
      }
    } else {
      const list = getLocalStore('users');
      const user = list.find((u: any) => u.clerkUserId === clerkUserId);
      if (user) {
        user.codeforces = { connected: false, handle: '', rating: 0, rank: 'Unrated' };
        saveLocalStore('users', list);
      }
    }

    return res.json({
      success: true,
      message: 'Codeforces account disconnected successfully. Your Clerk authentication and interview history remain intact.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to disconnect Codeforces account.' });
  }
});

// 6. Get Codeforces User Stats Direct Endpoint
router.get('/user/:handle', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { handle } = req.params;
    const stats = await codeforcesService.getUserStats(handle);
    return res.json({ success: true, stats });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch Codeforces user stats.' });
  }
});

// 7. Get Recommended Problems
router.get('/recommended-problems', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rating = parseInt(req.query.rating as string) || 1300;
    const count = parseInt(req.query.count as string) || 3;
    const problems = await codeforcesService.getRecommendedProblems(rating, count);
    return res.json({ success: true, problems });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch Codeforces problems.' });
  }
});

export default router;

