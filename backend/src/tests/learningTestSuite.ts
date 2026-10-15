import { diagnosisService } from '../services/diagnosisService';
import { retrievalService } from '../services/retrievalService';
import { learningService } from '../services/learningService';
import { practiceService } from '../services/practiceService';
import { masteryService } from '../services/masteryService';

export class LearningTestSuiteRunner {
  async runAllTests(): Promise<{ total: number; passed: number; results: any[] }> {
    const results: any[] = [];
    const testUserId = `test_user_rag_${Date.now()}`;

    // Test 1: Diagnosis Engine — Incorrect answers trigger weakness with evidence
    try {
      const weaknesses = await diagnosisService.diagnoseInterview({
        userId: testUserId,
        interviewId: 'sess_test_001',
        targetRole: 'Software Engineer',
        turns: [
          {
            questionId: 'q_graph_1',
            questionTitle: 'Graph Traversal',
            topic: 'Graph Algorithms',
            category: 'Coding',
            userResponse: 'I used BFS without marking visited nodes.',
            score: 41,
            feedback: 'Failed to handle visited queue set resulting in TLE cycle.',
            evaluationDetails: {
              technicalCorrectnessScore: 1,
              keyConceptsMissing: ['visited queue set', 'O(V+E) bounds'],
              hasCriticalError: true,
              criticalErrors: [{ severity: 'HIGH', description: 'Omitted visited set causing infinite loop' }],
            },
          },
          {
            questionId: 'q_graph_2',
            questionTitle: 'Shortest Path in Graph',
            topic: 'Graph Algorithms',
            category: 'Coding',
            userResponse: 'BFS works for unweighted graphs.',
            score: 48,
            feedback: 'Partial understanding of BFS pathfinding.',
            evaluationDetails: {
              keyConceptsMissing: ['queue initialization'],
            },
          },
        ],
      });

      const hasGraphWeakness = weaknesses.some((w) => w.topic === 'Graph Algorithms' && w.severity === 'CRITICAL');
      results.push({
        name: '1. Diagnosis Engine — Weakness & Severity Identification',
        passed: hasGraphWeakness,
        feedback: hasGraphWeakness ? 'Correctly identified Graph Algorithms as CRITICAL weakness.' : 'Failed to diagnose weakness.',
      });
    } catch (e: any) {
      results.push({ name: '1. Diagnosis Engine — Weakness & Severity Identification', passed: false, feedback: e.message });
    }

    // Test 2: Diagnosis Engine — High-scoring answer does NOT trigger false weakness
    try {
      const weaknesses = await diagnosisService.diagnoseInterview({
        userId: testUserId,
        interviewId: 'sess_test_002',
        turns: [
          {
            questionId: 'q_react_1',
            questionTitle: 'React Fiber Architecture',
            topic: 'React Fiber',
            category: 'Conceptual',
            userResponse: 'React Fiber uses incremental rendering and reconciles virtual DOM trees in O(N).',
            score: 88,
            feedback: 'Excellent explanation.',
          },
        ],
      });

      const noFalseWeakness = !weaknesses.some((w) => w.topic === 'React Fiber');
      results.push({
        name: '2. Diagnosis Engine — Prevents False Diagnoses on High Scores',
        passed: noFalseWeakness,
        feedback: noFalseWeakness ? 'Correctly ignored high-scoring topic from weakness list.' : 'False weakness generated.',
      });
    } catch (e: any) {
      results.push({ name: '2. Diagnosis Engine — Prevents False Diagnoses on High Scores', passed: false, feedback: e.message });
    }

    // Test 3: RAG Retrieval — Concept Document Retrieval with Metadata Filters
    try {
      const docs = await retrievalService.retrieveRelevantDocs('Graph Algorithms', 'DSA', 2);
      const hasGraphDoc = docs.some((d) => d.document.title.includes('BFS') || d.document.topic === 'Graph Algorithms');
      results.push({
        name: '3. RAG Retrieval — Vector Document Retrieval',
        passed: hasGraphDoc,
        feedback: hasGraphDoc ? `Retrieved ${docs.length} relevant grounded RAG vector documents.` : 'Failed vector retrieval.',
      });
    } catch (e: any) {
      results.push({ name: '3. RAG Retrieval — Vector Document Retrieval', passed: false, feedback: e.message });
    }

    // Test 4: Learning Plan Generation — Synthesizes 4-Step Plan
    try {
      const plan = await learningService.generateLearningPlan(testUserId, {
        topic: 'Spring Dependency Injection',
        category: 'SPRING_BOOT',
        score: 54,
        evidence: [{ questionId: 'q_spring_1', reason: 'Field injection used instead of constructor injection.' }],
      });

      const validPlan = plan.steps.length === 4 && plan.topic === 'Spring Dependency Injection';
      results.push({
        name: '4. Learning Plan — 4-Step Plan Synthesis',
        passed: validPlan,
        feedback: validPlan ? 'Synthesized 4-step personalized learning plan.' : 'Failed plan synthesis.',
      });
    } catch (e: any) {
      results.push({ name: '4. Learning Plan — 4-Step Plan Synthesis', passed: false, feedback: e.message });
    }

    // Test 5: Practice & Topic Mastery Updates — Score improvement updates mastery trend
    try {
      // Baseline initial score
      await masteryService.recordTopicScore(testUserId, 'Database Indexing', 'DATABASE', 45, 'INTERVIEW');
      
      // Start practice session
      const session = await practiceService.startPracticeSession(testUserId, 'Database Indexing', 'w_123', 'PRACTICE');
      
      const answersArr = (session.questions || []).map((q: any) => ({
        questionId: q.questionId,
        userAnswer: 'B-Tree indexes reduce search time from O(N) table scan to O(log N) tree traversal.',
      }));
      const submitRes = await practiceService.submitPracticeAnswers(testUserId, String(session._id), answersArr);

      const improved = submitRes.newMastery > 45 && submitRes.improvementDelta > 0;
      results.push({
        name: '5. Practice Session & Cumulative Mastery Update',
        passed: improved,
        feedback: improved ? `Mastery improved from 45% to ${submitRes.newMastery}% (+${submitRes.improvementDelta} points).` : 'Mastery update failed.',
      });
    } catch (e: any) {
      results.push({ name: '5. Practice Session & Cumulative Mastery Update', passed: false, feedback: e.message });
    }

    // Test 6: Multi-Tenant Data Isolation
    try {
      const userAMastery = await masteryService.getUserMasteryList(testUserId);
      const userBMastery = await masteryService.getUserMasteryList('other_user_xyz');
      const isIsolated = userBMastery.length === 0 && userAMastery.length > 0;
      results.push({
        name: '6. Security — User Session & Data Isolation',
        passed: isIsolated,
        feedback: isIsolated ? 'Verified strict multi-tenant candidate data isolation.' : 'Data leak detected.',
      });
    } catch (e: any) {
      results.push({ name: '6. Security — User Session & Data Isolation', passed: false, feedback: e.message });
    }

    const passedCount = results.filter((r) => r.passed).length;
    return {
      total: results.length,
      passed: passedCount,
      results,
    };
  }
}

export const learningTestSuiteRunner = new LearningTestSuiteRunner();
