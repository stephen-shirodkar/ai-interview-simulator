import { PracticeSessionModel, IPracticeSession } from '../models/Learning';
import { isMongoConnected, getLocalStore, saveLocalStore } from '../db/connection';
import { questionSeedData } from '../seedData';
import { gradingService } from './gradingService';
import { masteryService } from './masteryService';

export class PracticeService {
  /**
   * Starts a targeted practice or reassessment session for a specific weakness topic
   */
  async startPracticeSession(
    userId: string,
    topic: string,
    weaknessId?: string,
    type: 'PRACTICE' | 'REASSESSMENT' = 'PRACTICE'
  ): Promise<IPracticeSession> {
    const topicLower = topic.toLowerCase();

    // 1. Select matching curated questions from Seed Data
    const matched = questionSeedData.filter(
      (q) =>
        (q.topics && q.topics.some((t: string) => t.toLowerCase().includes(topicLower))) ||
        q.title.toLowerCase().includes(topicLower) ||
        (q.category && q.category.toLowerCase().includes(topicLower))
    );

    const questionPool = matched.length > 0 ? matched : questionSeedData;

    // Pick 3 targeted questions (1 conceptual, 1 easy/medium, 1 medium/hard)
    const selected = questionPool.slice(0, 3).map((q) => ({
      questionId: q.id,
      title: q.title,
      questionText: q.questionText || q.statement || '',
      category: q.category || q.type || 'Technical',
      difficulty: q.difficulty === 'EASY' ? 'Easy' : q.difficulty === 'HARD' ? 'Hard' : 'Medium',
      requiredConcepts: q.requiredConcepts || ['correct reasoning'],
    }));

    // Get current mastery baseline
    const masteryList = await masteryService.getUserMasteryList(userId);
    const existingMastery = masteryList.find((m: any) => m.topic.toLowerCase() === topicLower);
    const previousMastery = existingMastery ? existingMastery.estimatedScore : 50;

    if (isMongoConnected) {
      try {
        const doc = await PracticeSessionModel.create({
          userId,
          topic,
          weaknessId,
          type,
          questions: selected,
          previousMastery,
          status: 'PENDING',
        });
        return doc.toObject();
      } catch (e) {
        // Fallback
      }
    }

    const localSession = {
      _id: `PRAC_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      topic,
      weaknessId,
      type,
      questions: selected,
      previousMastery,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const sessions = getLocalStore('practiceSessions');
    sessions.push(localSession);
    saveLocalStore('practiceSessions', sessions);

    return localSession as any;
  }

  /**
   * Submits answers for a practice session, evaluates performance, and updates topic mastery
   */
  async submitPracticeAnswers(
    userId: string,
    sessionId: string,
    answers: Array<{ questionId: string; userAnswer: string }>
  ): Promise<{ session: IPracticeSession; previousMastery: number; newMastery: number; improvementDelta: number }> {
    let session: any = null;

    if (isMongoConnected) {
      try {
        session = await PracticeSessionModel.findOne({ _id: sessionId, userId });
      } catch (e) {}
    }

    if (!session) {
      const list = getLocalStore('practiceSessions');
      session = list.find((s: any) => s._id === sessionId && s.userId === userId);
    }

    if (!session) {
      throw new Error('Practice session not found');
    }

    // Evaluate each answer using GradingService
    let totalScore = 0;
    const evaluatedQuestions = await Promise.all(
      session.questions.map(async (q: any) => {
        const userAns = answers.find((a) => a.questionId === q.questionId)?.userAnswer || 'No response provided';
        const evaluation = await gradingService.evaluateCandidateResponse({
          questionText: q.questionText,
          category: q.category as any,
          candidateAnswer: userAns,
          requiredConcepts: q.requiredConcepts,
        });

        totalScore += evaluation.calculatedFinalScore;

        return {
          ...q,
          userAnswer: userAns,
          score: evaluation.calculatedFinalScore,
          feedback: evaluation.actionableFeedback,
          evaluatedAt: new Date(),
        };
      })
    );

    const overallScore = Math.round(totalScore / session.questions.length);
    const previousMastery = session.previousMastery || 50;

    // Update cumulative Topic Mastery
    const updatedMastery = await masteryService.recordTopicScore(
      userId,
      session.topic,
      session.questions[0]?.category || 'Technical',
      overallScore,
      session.type || 'PRACTICE'
    );

    const newMastery = updatedMastery.estimatedScore;
    const improvementDelta = newMastery - previousMastery;

    session.questions = evaluatedQuestions;
    session.overallScore = overallScore;
    session.newMastery = newMastery;
    session.improvementDelta = improvementDelta;
    session.status = 'COMPLETED';
    session.updatedAt = new Date();

    if (isMongoConnected && typeof session.save === 'function') {
      await session.save();
    } else {
      const list = getLocalStore('practiceSessions');
      const idx = list.findIndex((s: any) => s._id === sessionId);
      if (idx >= 0) {
        list[idx] = session;
        saveLocalStore('practiceSessions', list);
      }
    }

    return {
      session,
      previousMastery,
      newMastery,
      improvementDelta,
    };
  }
}

export const practiceService = new PracticeService();
