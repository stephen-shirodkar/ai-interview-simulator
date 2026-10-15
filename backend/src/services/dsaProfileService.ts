import { UserModel, IDsaTopicPerformance } from '../models/User';
import { isMongoConnected, getLocalStore, saveLocalStore } from '../db/connection';

export const DEFAULT_DSA_TOPICS = [
  'arrays',
  'strings',
  'binarySearch',
  'greedy',
  'graphs',
  'trees',
  'dynamicProgramming',
  'math',
  'dataStructures',
];

export class DsaProfileService {
  /**
   * Retrieves or initializes candidate's DSA Skill Profile
   */
  async getDsaProfile(clerkUserId: string): Promise<{
    rating: number;
    rank: string;
    topics: Record<string, IDsaTopicPerformance>;
    weakTopics: string[];
    strongTopics: string[];
  }> {
    let userDoc: any = null;
    if (isMongoConnected) {
      userDoc = await UserModel.findOne({ clerkUserId }).lean();
    } else {
      const list = getLocalStore('users');
      userDoc = list.find((u: any) => u.clerkUserId === clerkUserId);
    }

    const rating = userDoc?.codeforces?.rating || userDoc?.dsaProfile?.rating || 1200;
    const rank = userDoc?.codeforces?.rank || userDoc?.dsaProfile?.rank || 'Specialist';

    // Parse topics map/record
    const storedTopics = userDoc?.dsaProfile?.topics || {};
    const topics: Record<string, IDsaTopicPerformance> = {};

    DEFAULT_DSA_TOPICS.forEach((topic) => {
      const existing = storedTopics instanceof Map ? storedTopics.get(topic) : storedTopics[topic];
      topics[topic] = existing || {
        attempts: topic === 'arrays' ? 12 : topic === 'graphs' ? 6 : topic === 'dynamicProgramming' ? 5 : 8,
        successful: topic === 'arrays' ? 11 : topic === 'graphs' ? 3 : topic === 'dynamicProgramming' ? 2 : 6,
        failed: topic === 'arrays' ? 1 : topic === 'graphs' ? 3 : topic === 'dynamicProgramming' ? 3 : 2,
        accuracy: topic === 'arrays' ? 92 : topic === 'graphs' ? 50 : topic === 'dynamicProgramming' ? 40 : 75,
        avgScore: topic === 'arrays' ? 88 : topic === 'graphs' ? 62 : topic === 'dynamicProgramming' ? 55 : 78,
        difficultyAttempted: rating,
        difficultySolved: rating,
      };
    });

    // Identify weak vs strong topics
    const weakTopics = Object.keys(topics).filter((t) => topics[t].accuracy < 60);
    const strongTopics = Object.keys(topics).filter((t) => topics[t].accuracy >= 75);

    return {
      rating,
      rank,
      topics,
      weakTopics: weakTopics.length > 0 ? weakTopics : ['graphs', 'dynamicProgramming'],
      strongTopics: strongTopics.length > 0 ? strongTopics : ['arrays', 'strings'],
    };
  }

  /**
   * Updates topic stats after an interview question is completed
   */
  async updateTopicPerformance(
    clerkUserId: string,
    topicName: string,
    score: number,
    passed: boolean,
    questionRating: number = 1200
  ): Promise<void> {
    const key = this.normalizeTopicKey(topicName);

    if (isMongoConnected) {
      const user = await UserModel.findOne({ clerkUserId });
      if (user) {
        user.dsaProfile = user.dsaProfile || { rating: 1200, rank: 'Specialist', topics: new Map() };
        const topicsMap = user.dsaProfile.topics as Map<string, IDsaTopicPerformance>;
        const current = topicsMap.get(key) || {
          attempts: 0,
          successful: 0,
          failed: 0,
          accuracy: 0,
          avgScore: 0,
          difficultyAttempted: questionRating,
          difficultySolved: questionRating,
        };

        const newAttempts = current.attempts + 1;
        const newSuccess = current.successful + (passed ? 1 : 0);
        const newFailed = current.failed + (passed ? 0 : 1);
        const newAccuracy = Math.round((newSuccess / newAttempts) * 100);
        const newAvgScore = Math.round((current.avgScore * current.attempts + score) / newAttempts);

        topicsMap.set(key, {
          attempts: newAttempts,
          successful: newSuccess,
          failed: newFailed,
          accuracy: newAccuracy,
          avgScore: newAvgScore,
          difficultyAttempted: Math.max(current.difficultyAttempted, questionRating),
          difficultySolved: passed ? Math.max(current.difficultySolved, questionRating) : current.difficultySolved,
        });

        await user.save();
      }
    } else {
      const list = getLocalStore('users');
      let user = list.find((u: any) => u.clerkUserId === clerkUserId);
      if (!user) {
        user = { clerkUserId, dsaProfile: { rating: 1200, rank: 'Specialist', topics: {} } };
        list.push(user);
      }
      user.dsaProfile = user.dsaProfile || { rating: 1200, rank: 'Specialist', topics: {} };
      const current = user.dsaProfile.topics[key] || {
        attempts: 0,
        successful: 0,
        failed: 0,
        accuracy: 0,
        avgScore: 0,
        difficultyAttempted: questionRating,
        difficultySolved: questionRating,
      };
      const newAttempts = current.attempts + 1;
      const newSuccess = current.successful + (passed ? 1 : 0);
      user.dsaProfile.topics[key] = {
        attempts: newAttempts,
        successful: newSuccess,
        failed: current.failed + (passed ? 0 : 1),
        accuracy: Math.round((newSuccess / newAttempts) * 100),
        avgScore: Math.round((current.avgScore * current.attempts + score) / newAttempts),
        difficultyAttempted: Math.max(current.difficultyAttempted, questionRating),
        difficultySolved: passed ? Math.max(current.difficultySolved, questionRating) : current.difficultySolved,
      };
      saveLocalStore('users', list);
    }
  }

  private normalizeTopicKey(raw: string): string {
    const lower = (raw || '').toLowerCase();
    if (lower.includes('graph') || lower.includes('tree') || lower.includes('bfs') || lower.includes('dfs')) return 'graphs';
    if (lower.includes('dp') || lower.includes('dynamic')) return 'dynamicProgramming';
    if (lower.includes('binary') || lower.includes('search')) return 'binarySearch';
    if (lower.includes('greedy')) return 'greedy';
    if (lower.includes('string')) return 'strings';
    if (lower.includes('math')) return 'math';
    return 'arrays';
  }
}

export const dsaProfileService = new DsaProfileService();
