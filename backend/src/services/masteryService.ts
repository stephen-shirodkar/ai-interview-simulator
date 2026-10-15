import { TopicMasteryModel, ITopicMastery } from '../models/Learning';
import { isMongoConnected, getLocalStore, saveLocalStore } from '../db/connection';

export class MasteryService {
  /**
   * Records a new score for a topic and updates cumulative estimated mastery and trend
   */
  async recordTopicScore(
    userId: string,
    topic: string,
    category: string = 'Technical',
    score: number,
    source: 'INTERVIEW' | 'PRACTICE' | 'REASSESSMENT' = 'INTERVIEW'
  ): Promise<ITopicMastery> {
    const assessedAt = new Date();

    if (isMongoConnected) {
      try {
        let doc = await TopicMasteryModel.findOne({ userId, topic });
        if (!doc) {
          doc = new TopicMasteryModel({
            userId,
            topic,
            category,
            estimatedScore: score,
            confidence: source === 'REASSESSMENT' ? 85 : source === 'PRACTICE' ? 70 : 60,
            evidenceCount: 1,
            trend: 'INSUFFICIENT_DATA',
            history: [{ assessedAt, score, source }],
            lastAssessedAt: assessedAt,
          });
        } else {
          const oldScore = doc.estimatedScore;
          // Weighted moving average: 60% new score, 40% previous estimated score
          const newEstimatedScore = Math.round(score * 0.6 + oldScore * 0.4);

          // Calculate Trend
          let trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'INSUFFICIENT_DATA' = 'STABLE';
          if (doc.evidenceCount < 1) {
            trend = 'INSUFFICIENT_DATA';
          } else if (score > oldScore + 5) {
            trend = 'IMPROVING';
          } else if (score < oldScore - 5) {
            trend = 'DECLINING';
          }

          doc.estimatedScore = newEstimatedScore;
          doc.confidence = Math.min(98, doc.confidence + 10);
          doc.evidenceCount += 1;
          doc.trend = trend;
          doc.history.push({ assessedAt, score, source });
          doc.lastAssessedAt = assessedAt;
        }

        await doc.save();
        return doc.toObject();
      } catch (e) {
        // Fallback to local store if DB write fails
      }
    }

    // Local JSON Store Fallback
    const list = getLocalStore('topicMastery');
    let item = list.find((m: any) => m.userId === userId && m.topic === topic);

    if (!item) {
      item = {
        _id: `MST_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        topic,
        category,
        estimatedScore: score,
        confidence: source === 'REASSESSMENT' ? 85 : 70,
        evidenceCount: 1,
        trend: 'INSUFFICIENT_DATA',
        history: [{ assessedAt, score, source }],
        lastAssessedAt: assessedAt,
        createdAt: assessedAt,
        updatedAt: assessedAt,
      };
      list.push(item);
    } else {
      const oldScore = item.estimatedScore;
      const newEstimatedScore = Math.round(score * 0.6 + oldScore * 0.4);

      let trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'INSUFFICIENT_DATA' = 'STABLE';
      if (item.evidenceCount < 1) {
        trend = 'INSUFFICIENT_DATA';
      } else if (score > oldScore + 5) {
        trend = 'IMPROVING';
      } else if (score < oldScore - 5) {
        trend = 'DECLINING';
      }

      item.estimatedScore = newEstimatedScore;
      item.confidence = Math.min(98, item.confidence + 10);
      item.evidenceCount += 1;
      item.trend = trend;
      item.history.push({ assessedAt, score, source });
      item.lastAssessedAt = assessedAt;
      item.updatedAt = assessedAt;
    }

    saveLocalStore('topicMastery', list);
    return item;
  }

  /**
   * Retrieves all topic mastery records for a candidate
   */
  async getUserMasteryList(userId: string): Promise<ITopicMastery[]> {
    if (isMongoConnected) {
      try {
        const docs = await TopicMasteryModel.find({ userId }).sort({ lastAssessedAt: -1 }).lean();
        if (docs && docs.length > 0) return docs as any[];
      } catch (e) {}
    }

    const list = getLocalStore('topicMastery');
    return list.filter((m: any) => m.userId === userId);
  }
}

export const masteryService = new MasteryService();
