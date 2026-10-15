import { LearningPlanModel, ILearningPlan, CandidateWeaknessModel } from '../models/Learning';
import { isMongoConnected, getLocalStore, saveLocalStore } from '../db/connection';
import { retrievalService } from './retrievalService';
import { llmService } from './llmService';

export class LearningService {
  /**
   * Generates a RAG-grounded personalized learning plan for a diagnosed weakness
   */
  async generateLearningPlan(userId: string, weakness: any): Promise<ILearningPlan> {
    const topic = weakness.topic || 'Technical Fundamentals';
    const category = weakness.category || 'DSA';
    const score = weakness.score || 50;

    // 1. Retrieve RAG Vector Documents
    const ragResults = await retrievalService.retrieveRelevantDocs(topic, category, 3);
    const ragSources = ragResults.map((r) => ({
      title: r.document.title,
      contentType: r.document.contentType,
      url: r.document.sourceUrl || '',
    }));

    const groundedContext = ragResults
      .map((r) => `--- SOURCE: ${r.document.title} ---\n${r.document.content}`)
      .join('\n\n');

    // 2. Synthesize Evidence Explanation ("Why text")
    let whyText = `During your recent interview, you demonstrated an estimated ${score}% mastery in ${topic}.`;
    if (weakness.evidence && weakness.evidence.length > 0) {
      whyText += ` Specific areas flagged: ${weakness.evidence.map((e: any) => e.reason).join(' ')}`;
    }

    // 3. Generate Structured 4-Step Learning Plan
    const steps = [
      {
        stepNumber: 1,
        title: 'Step 1 — Learn',
        type: 'LEARN' as const,
        description: `Review fundamental concepts, definitions, and key mechanics of ${topic}. Focus on foundational rules and runtime guarantees.`,
        actionLabel: 'Read Concept Guide',
        isCompleted: false,
      },
      {
        stepNumber: 2,
        title: 'Step 2 — Understand',
        type: 'UNDERSTAND' as const,
        description: `Practice articulating cause-and-effect explanations out loud: "Why is ${topic} structured this way?" and "What trade-offs exist?"`,
        actionLabel: 'Review Common Interview Questions',
        isCompleted: false,
      },
      {
        stepNumber: 3,
        title: 'Step 3 — Practice',
        type: 'PRACTICE' as const,
        description: `Solve targeted questions specifically focused on ${topic} to reinforce active recall and algorithm execution.`,
        actionLabel: 'Start Practice Session',
        isCompleted: false,
      },
      {
        stepNumber: 4,
        title: 'Step 4 — Reassess',
        type: 'REASSESS' as const,
        description: `Take a short 3-question targeted assessment to measure score improvement and verify concept mastery.`,
        actionLabel: 'Take Topic Assessment',
        isCompleted: false,
      },
    ];

    // 4. Save Learning Plan (MongoDB or Local Store)
    const weaknessId = weakness._id || `WEAK_${Date.now()}`;

    if (isMongoConnected) {
      try {
        const plan = await LearningPlanModel.create({
          userId,
          weaknessId,
          topic,
          category,
          whyText,
          estimatedMastery: score,
          steps,
          ragSourcesUsed: ragSources,
        });
        return plan.toObject();
      } catch (e) {
        // Fallback to local store
      }
    }

    const localPlan = {
      _id: `PLAN_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      weaknessId,
      topic,
      category,
      whyText,
      estimatedMastery: score,
      steps,
      ragSourcesUsed: ragSources,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const plans = getLocalStore('learningPlans');
    plans.push(localPlan);
    saveLocalStore('learningPlans', plans);

    return localPlan as any;
  }

  /**
   * Retrieves an existing learning plan or generates a new one if missing
   */
  async getOrCreateLearningPlan(userId: string, topic: string): Promise<{ plan: ILearningPlan; explanationContent: string }> {
    // 1. Check for existing saved plan
    let existingPlan: any = null;
    if (isMongoConnected) {
      try {
        existingPlan = await LearningPlanModel.findOne({ userId, topic }).sort({ createdAt: -1 }).lean();
      } catch (e) {}
    }

    if (!existingPlan) {
      const plans = getLocalStore('learningPlans');
      existingPlan = plans.find((p: any) => p.userId === userId && p.topic.toLowerCase() === topic.toLowerCase());
    }

    if (!existingPlan) {
      // Find associated weakness or build default
      const weaknessObj = {
        _id: `WEAK_${Date.now()}`,
        topic,
        category: 'DSA',
        score: 50,
        evidence: [{ questionId: 'q_default', reason: `In your recent assessment, performance in ${topic} needed reinforcement.` }],
      };
      existingPlan = await this.generateLearningPlan(userId, weaknessObj);
    }

    // 2. Generate RAG-Grounded Explanation Guide
    const ragResults = await retrievalService.retrieveRelevantDocs(topic, existingPlan.category, 2);
    const primaryDoc = ragResults[0]?.document;

    let explanationContent = '';
    if (primaryDoc) {
      explanationContent = primaryDoc.content;
    } else {
      // LLM fallback grounding
      explanationContent = await llmService.promptLLM(
        `Explain technical interview concepts for ${topic}. Include Concept, Explanation, Code/System Example, Common Candidate Mistakes, and Interview Tips.`,
        'Candidates often confuse implementation details and asymptotic bounds.'
      );
    }

    return {
      plan: existingPlan,
      explanationContent,
    };
  }
}

export const learningService = new LearningService();
