import { CandidateWeaknessModel, ICandidateWeakness, ICandidateWeaknessEvidence } from '../models/Learning';
import { isMongoConnected, getLocalStore, saveLocalStore } from '../db/connection';
import { masteryService } from './masteryService';

export interface DiagnoseRequest {
  userId: string;
  interviewId: string;
  targetRole?: string;
  turns: Array<{
    questionId: string;
    questionTitle?: string;
    topic?: string;
    category?: string;
    userResponse: string;
    score: number;
    feedback?: string;
    evaluationDetails?: {
      technicalCorrectnessScore?: number;
      keyConceptsPresent?: string[];
      keyConceptsMissing?: string[];
      evaluatedClaims?: Array<{ claim: string; isCorrect: boolean; reason: string }>;
      criticalErrors?: Array<{ severity: string; description: string }>;
      hasCriticalError?: boolean;
    };
  }>;
}

export class DiagnosisService {
  /**
   * Analyzes an entire interview transcript to diagnose candidate weaknesses with multi-question evidence
   */
  async diagnoseInterview(req: DiagnoseRequest): Promise<ICandidateWeakness[]> {
    const { userId, interviewId, targetRole = 'Software Engineer', turns } = req;
    if (!turns || turns.length === 0) return [];

    // 1. Group performance by Topic & Category
    const topicMap = new Map<
      string,
      {
        topic: string;
        category: 'DSA' | 'JAVA' | 'SPRING_BOOT' | 'DATABASE' | 'SYSTEM_DESIGN' | 'JAVASCRIPT' | 'REACT' | 'BEHAVIORAL' | 'OTHER';
        scores: number[];
        evidenceList: ICandidateWeaknessEvidence[];
        missingConcepts: Set<string>;
        incorrectConcepts: Set<string>;
        criticalErrorCount: number;
        questionIds: Set<string>;
      }
    >();

    turns.forEach((turn) => {
      const topicName = turn.topic || turn.questionTitle || 'General Fundamentals';
      const category = this.mapCategory(turn.category, topicName);

      if (!topicMap.has(topicName)) {
        topicMap.set(topicName, {
          topic: topicName,
          category,
          scores: [],
          evidenceList: [],
          missingConcepts: new Set(),
          incorrectConcepts: new Set(),
          criticalErrorCount: 0,
          questionIds: new Set(),
        });
      }

      const item = topicMap.get(topicName)!;
      item.scores.push(turn.score);
      item.questionIds.add(turn.questionId);

      const details = turn.evaluationDetails;
      const missingArr: string[] = details?.keyConceptsMissing || [];
      const incorrectArr: string[] = [];

      if (details?.evaluatedClaims) {
        details.evaluatedClaims.forEach((c) => {
          if (!c.isCorrect) {
            incorrectArr.push(c.claim);
            item.incorrectConcepts.add(c.claim);
          }
        });
      }

      if (details?.hasCriticalError || (details?.criticalErrors && details.criticalErrors.length > 0)) {
        item.criticalErrorCount += 1;
        if (details.criticalErrors) {
          details.criticalErrors.forEach((ce) => incorrectArr.push(ce.description));
        }
      }

      missingArr.forEach((m) => item.missingConcepts.add(m));

      // Build specific evidence statement for this question turn
      if (turn.score < 75 || missingArr.length > 0 || incorrectArr.length > 0) {
        let reason = `Candidate scored ${turn.score}% on '${turn.questionTitle || topicName}'.`;
        if (turn.feedback) reason += ` ${turn.feedback}`;

        item.evidenceList.push({
          questionId: turn.questionId,
          reason,
          missingConcepts: missingArr,
          incorrectConcepts: incorrectArr,
        });
      }
    });

    // 2. Filter & Evaluate Weaknesses
    const rawWeaknesses: Array<{
      topic: string;
      category: 'DSA' | 'JAVA' | 'SPRING_BOOT' | 'DATABASE' | 'SYSTEM_DESIGN' | 'JAVASCRIPT' | 'REACT' | 'BEHAVIORAL' | 'OTHER';
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      score: number;
      confidence: number;
      evidence: ICandidateWeaknessEvidence[];
      recommendedAction: 'REVIEW' | 'PRACTICE' | 'REVIEW_AND_PRACTICE';
    }> = [];

    topicMap.forEach((val, topicName) => {
      const avgScore = Math.round(val.scores.reduce((a, b) => a + b, 0) / val.scores.length);

      // Rule: Do NOT diagnose a weakness if average score is solid (>= 75%) and no critical error exists
      if (avgScore >= 75 && val.criticalErrorCount === 0) {
        // Still update TopicMastery for strong topics
        masteryService.recordTopicScore(userId, topicName, val.category, avgScore, 'INTERVIEW').catch(() => {});
        return;
      }

      // Calculate Diagnostic Confidence: Higher if multiple questions attempted or critical error present
      const attemptCount = val.questionIds.size;
      let confidence = attemptCount >= 3 ? 95 : attemptCount === 2 ? 85 : 70;
      if (val.criticalErrorCount > 0) confidence = Math.min(99, confidence + 10);

      // Calculate Severity
      let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
      if (val.criticalErrorCount > 0 || avgScore < 45) {
        severity = 'CRITICAL';
      } else if (avgScore < 58) {
        severity = 'HIGH';
      } else if (avgScore < 70) {
        severity = 'MEDIUM';
      } else {
        severity = 'LOW';
      }

      const recommendedAction: 'REVIEW' | 'PRACTICE' | 'REVIEW_AND_PRACTICE' =
        severity === 'CRITICAL' || severity === 'HIGH' ? 'REVIEW_AND_PRACTICE' : 'PRACTICE';

      rawWeaknesses.push({
        topic: topicName,
        category: val.category,
        severity,
        score: avgScore,
        confidence,
        evidence: val.evidenceList,
        recommendedAction,
      });

      // Also record mastery score inTopicMastery system
      masteryService.recordTopicScore(userId, topicName, val.category, avgScore, 'INTERVIEW').catch(() => {});
    });

    // 3. Prioritize Top 3 - 5 Weaknesses by Severity Weight + Low Score + Target Role Relevance
    const severityWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    rawWeaknesses.sort((a, b) => {
      const scoreA = severityWeight[a.severity] * 100 + (100 - a.score) + a.confidence * 0.5;
      const scoreB = severityWeight[b.severity] * 100 + (100 - b.score) + b.confidence * 0.5;
      return scoreB - scoreA;
    });

    const topWeaknesses = rawWeaknesses.slice(0, 5);

    // 4. Dual Persistence (MongoDB or localStore)
    const savedWeaknesses: ICandidateWeakness[] = [];
    for (const w of topWeaknesses) {
      if (isMongoConnected) {
        try {
          const doc = await CandidateWeaknessModel.create({
            userId,
            interviewId,
            topic: w.topic,
            category: w.category,
            severity: w.severity,
            score: w.score,
            confidence: w.confidence,
            evidence: w.evidence,
            recommendedAction: w.recommendedAction,
            status: 'ACTIVE',
          });
          savedWeaknesses.push(doc.toObject());
        } catch (e) {
          const fallbackObj = this.buildLocalWeaknessObj(userId, interviewId, w);
          savedWeaknesses.push(fallbackObj);
        }
      } else {
        const fallbackObj = this.buildLocalWeaknessObj(userId, interviewId, w);
        const list = getLocalStore('weaknesses');
        list.push(fallbackObj);
        saveLocalStore('weaknesses', list);
        savedWeaknesses.push(fallbackObj);
      }
    }

    return savedWeaknesses;
  }

  private buildLocalWeaknessObj(userId: string, interviewId: string, w: any): any {
    return {
      _id: `WEAK_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      interviewId,
      topic: w.topic,
      category: w.category,
      severity: w.severity,
      score: w.score,
      confidence: w.confidence,
      evidence: w.evidence,
      recommendedAction: w.recommendedAction,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private mapCategory(rawCat?: string, topicName: string = ''): any {
    const t = (topicName + ' ' + (rawCat || '')).toUpperCase();
    if (t.includes('SPRING') || t.includes('DEPENDENCY INJECTION')) return 'SPRING_BOOT';
    if (t.includes('JAVA')) return 'JAVA';
    if (t.includes('SQL') || t.includes('INDEX') || t.includes('DATABASE')) return 'DATABASE';
    if (t.includes('REACT') || t.includes('HOOK') || t.includes('DOM')) return 'REACT';
    if (t.includes('NODE') || t.includes('JAVASCRIPT') || t.includes('EVENT LOOP')) return 'JAVASCRIPT';
    if (t.includes('SYSTEM') || t.includes('DISTRIBUTED') || t.includes('CACHE')) return 'SYSTEM_DESIGN';
    if (t.includes('BEHAVIORAL') || t.includes('SITUATIONAL')) return 'BEHAVIORAL';
    return 'DSA';
  }
}

export const diagnosisService = new DiagnosisService();
