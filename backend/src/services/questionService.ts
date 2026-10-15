import { QuestionModel, IQuestion } from '../models/Question';
import { questionSeedData } from '../seedData';
import { dsaProfileService } from './dsaProfileService';
import { ragService } from './ragService';
import { isMongoConnected, getLocalStore } from '../db/connection';
import { InterviewModel } from '../models/Interview';

export interface InterviewQuestionItem {
  id: string;
  source: string;
  sourceLabel: string;
  externalId?: string;
  title: string;
  questionText: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  category: 'Technical' | 'Behavioral' | 'Coding' | 'System Design';
  estimatedDuration: number; // in minutes
  priority?: 'core' | 'high' | 'optional';
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  companies?: string[];
  reportCount?: number;
  url?: string;
  skillsRequired: string[];
  expectedKeywords: string[];
  requiredConcepts: string[];
  expectedConcepts: string[];
  criticalErrorDefinitions: string[];
  expectedComplexity?: {
    time: string;
    space: string;
  };
  codeforcesDetails?: {
    problemId?: string;
    rating?: number;
    tags?: string[];
    sampleInput?: string;
    sampleOutput?: string;
    codeTemplate?: string;
    sampleTests?: Array<{ input: string; expectedOutput: string; isSample?: boolean }>;
    hiddenTests?: Array<{ input: string; expectedOutput: string; isSample?: boolean }>;
  };
  sampleAnswerHint?: string;
}

export class QuestionService {
  /**
   * Selects a balanced set of questions matching duration time budget, company, role, & DSA topics
   */
  async selectQuestions(params: {
    clerkUserId: string;
    targetRole?: string;
    resumeText?: string;
    mode?: string;
    desiredDifficulty?: string;
    durationMinutes?: number; // 30, 45, or 60 min
    companyId?: string;
    topics?: string[];
    experienceLevel?: string;
  }): Promise<{ questions: InterviewQuestionItem[]; totalEstimatedDuration: number; availableTimeBudget: number }> {
    const {
      clerkUserId,
      targetRole = 'Software Engineer',
      resumeText = '',
      mode = 'Full Mock',
      desiredDifficulty = 'Medium',
      durationMinutes = 45,
      companyId,
      topics = [],
      experienceLevel = 'Mid',
    } = params;

    // Time budget allocation with 10% reserved buffer for AI latency, intro, and transitions
    const availableTimeBudget = durationMinutes === 30 ? 27 : durationMinutes === 60 ? 54 : 40.5;

    // Strict Coding Question Requirement: 30m -> 1 coding, 45m -> 1 coding, 60m -> 2 coding
    const requiredCodingCount = durationMinutes === 60 ? 2 : 1;

    // Fetch user's previous seen question IDs
    const seenQuestionIds = await this.getSeenQuestionIds(clerkUserId);

    // Fetch Candidate DSA Profile
    const dsaProfile = await dsaProfileService.getDsaProfile(clerkUserId);

    // Load All Available Questions (DB or Seed Data fallback)
    let dbQuestions: any[] = [];
    try {
      dbQuestions = await QuestionModel.find({});
    } catch (e) {
      dbQuestions = [];
    }

    let allQuestions = dbQuestions.length > 0 ? dbQuestions : questionSeedData;

    // Separate Pool by Type: Coding, Technical Conceptual, Behavioral, System Design
    const codingPool = this.shuffleArray(allQuestions.filter((q: any) => q.type === 'Coding' || q.category === 'Coding'));
    const techPool = this.shuffleArray(allQuestions.filter((q: any) => (q.type === 'Conceptual' || q.category === 'Technical') && q.type !== 'Coding' && q.category !== 'Coding'));
    const behPool = this.shuffleArray(allQuestions.filter((q: any) => q.type === 'Behavioral' || q.category === 'Behavioral'));
    const sysPool = this.shuffleArray(allQuestions.filter((q: any) => q.type === 'System Design' || q.category === 'System Design'));

    const selectedQuestions: InterviewQuestionItem[] = [];
    let currentDurationSum = 0;

    // 1. Select EXACTLY requiredCodingCount Coding Questions
    const unseenCoding = codingPool.filter((q: any) => !seenQuestionIds.has(q.id));
    const codingCandidates = unseenCoding.length >= requiredCodingCount ? unseenCoding : codingPool;
    for (let i = 0; i < Math.min(requiredCodingCount, codingCandidates.length); i++) {
      const item = this.formatQuestionItem(codingCandidates[i]);
      item.priority = 'core';
      item.estimatedDuration = Math.min(item.estimatedDuration, durationMinutes === 60 ? 10 : 9);
      selectedQuestions.push(item);
      currentDurationSum += item.estimatedDuration;
    }

    // 2. Select Technical Questions (2-3 min per question for high density)
    const unseenTech = techPool.filter((q: any) => !seenQuestionIds.has(q.id));
    const techCandidates = unseenTech.length > 0 ? unseenTech : techPool;
    const targetTechCount = durationMinutes === 30 ? 6 : durationMinutes === 45 ? 8 : 10;

    for (const q of techCandidates) {
      if (selectedQuestions.some((s) => s.id === q.id)) continue;
      if (selectedQuestions.filter((s) => s.category === 'Technical' || s.category === 'Coding').length >= targetTechCount + requiredCodingCount) break;
      if (currentDurationSum + 2.5 > availableTimeBudget) break;

      const item = this.formatQuestionItem(q);
      item.priority = selectedQuestions.length < 5 ? 'core' : 'optional';
      item.estimatedDuration = q.difficulty === 'HARD' ? 4 : 3;
      selectedQuestions.push(item);
      currentDurationSum += item.estimatedDuration;
    }

    // 3. Select Behavioral Questions (3 min per question)
    const unseenBeh = behPool.filter((q: any) => !seenQuestionIds.has(q.id));
    const behCandidates = unseenBeh.length > 0 ? unseenBeh : behPool;
    const targetBehCount = durationMinutes === 30 ? 1 : 2;

    for (const q of behCandidates) {
      if (selectedQuestions.some((s) => s.id === q.id)) continue;
      if (selectedQuestions.filter((s) => s.category === 'Behavioral').length >= targetBehCount) break;
      if (currentDurationSum + 3 > availableTimeBudget) break;

      const item = this.formatQuestionItem(q);
      item.priority = 'high';
      item.estimatedDuration = 3;
      selectedQuestions.push(item);
      currentDurationSum += item.estimatedDuration;
    }

    // 4. Select System Design Question if time remains (45m or 60m)
    if (durationMinutes >= 45 && currentDurationSum + 6 <= availableTimeBudget && sysPool.length > 0) {
      const q = sysPool[0];
      if (!selectedQuestions.some((s) => s.id === q.id)) {
        const item = this.formatQuestionItem(q);
        item.priority = 'high';
        item.estimatedDuration = 6;
        selectedQuestions.push(item);
        currentDurationSum += item.estimatedDuration;
      }
    }

    // 5. Oversized Interview Prevention: Trim optional questions if over budget
    while (currentDurationSum > availableTimeBudget && selectedQuestions.length > 3) {
      const optionalIdx = selectedQuestions.findIndex((s) => s.priority === 'optional');
      if (optionalIdx >= 0) {
        currentDurationSum -= selectedQuestions[optionalIdx].estimatedDuration;
        selectedQuestions.splice(optionalIdx, 1);
      } else {
        break;
      }
    }

    return {
      questions: selectedQuestions,
      totalEstimatedDuration: currentDurationSum,
      availableTimeBudget,
    };
  }

  private async getSeenQuestionIds(clerkUserId: string): Promise<Set<string>> {
    const seen = new Set<string>();
    try {
      let sessions: any[] = [];
      if (isMongoConnected) {
        sessions = await InterviewModel.find({ userId: clerkUserId }).lean();
      } else {
        const list = getLocalStore('interviews');
        sessions = list.filter((i: any) => i.userId === clerkUserId);
      }
      sessions.forEach((session: any) => {
        if (session.turns) {
          session.turns.forEach((turn: any) => {
            if (turn.questionId) seen.add(turn.questionId);
          });
        }
      });
    } catch (e) {}
    return seen;
  }

  private formatQuestionItem(q: any): InterviewQuestionItem {
    const sourceLabel =
      q.source === 'COMPANY_REPORTED'
        ? 'Publicly Reported'
        : q.source === 'CODEFORCES'
        ? 'Codeforces'
        : q.source === 'CODECHEF'
        ? 'CodeChef'
        : q.source === 'CURATED'
        ? 'Curated Practice'
        : 'Internal Bank';

    const testCases = q.testCases || [];
    const sampleTests = testCases.filter((tc: any) => tc.isSample);
    const hiddenTests = testCases.filter((tc: any) => !tc.isSample);

    return {
      id: q.id || `Q_${Date.now()}`,
      source: q.source || 'INTERNAL',
      sourceLabel,
      externalId: q.externalId,
      title: q.title || 'Algorithmic Problem',
      questionText: q.statement || q.questionText || '',
      category: q.type === 'Coding' ? 'Coding' : q.type === 'Behavioral' ? 'Behavioral' : q.type === 'System Design' ? 'System Design' : q.category || 'Technical',
      difficulty: q.difficulty === 'EASY' ? 'Easy' : q.difficulty === 'HARD' ? 'Hard' : 'Medium',
      topic: (q.topics && q.topics[0]) || 'Algorithms',
      estimatedDuration: q.estimatedDuration || 10,
      confidence: q.confidence || 'HIGH',
      companies: q.companies || [],
      reportCount: q.reportCount || 10,
      url: q.url,
      skillsRequired: q.topics || q.skillsRequired || ['Problem Solving'],
      expectedKeywords: q.requiredConcepts || ['O(N)', 'data structure'],
      requiredConcepts: q.requiredConcepts || ['correct algorithm implementation'],
      expectedConcepts: ['optimal time complexity', 'edge case validation'],
      criticalErrorDefinitions: ['Wrong answer output', 'Time Limit Exceeded'],
      expectedComplexity: q.expectedComplexity || { time: 'O(N)', space: 'O(1)' },
      codeforcesDetails: {
        problemId: q.externalId || q.id,
        rating: q.rating || 1200,
        tags: q.topics || [],
        sampleInput: sampleTests[0]?.input || '',
        sampleOutput: sampleTests[0]?.expectedOutput || '',
        codeTemplate: `function solution(input) {\n  // Implement your solution here\n  return input;\n}`,
        sampleTests: sampleTests.length > 0 ? sampleTests : [{ input: 'sample', expectedOutput: 'sample', isSample: true }],
        hiddenTests: hiddenTests.length > 0 ? hiddenTests : [{ input: 'hidden', expectedOutput: 'hidden', isSample: false }],
      },
      sampleAnswerHint: `Think about applying ${(q.topics || ['DSA']).join(' or ')} to optimize time and space complexity.`,
    };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

export const questionService = new QuestionService();
