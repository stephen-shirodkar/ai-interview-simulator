import { gradingService, StructuredGradingResult } from './gradingService';
import { CodeExecutionSummary } from './codeExecutionService';

export interface RegressionTestCase {
  id: string;
  name: string;
  questionText: string;
  category: string;
  candidateAnswer: string;
  codeSubmitted?: string;
  codeExecution?: CodeExecutionSummary;
  requiredConcepts: string[];
  expectedScoreMin: number;
  expectedScoreMax: number;
  shouldHaveCriticalError: boolean;
  shouldHaveScoreCeiling: boolean;
}

export class GradingRegressionService {
  private knownTestCases: RegressionTestCase[] = [
    {
      id: 'REG-01',
      name: 'Clearly Correct Binary Search Answer',
      questionText: 'Explain how binary search works and state its time complexity.',
      category: 'Technical',
      candidateAnswer:
        'Binary search requires the input array to be sorted. It works by checking the middle element and eliminating half of the search space in each iteration, giving O(log N) time complexity and O(1) space complexity for an iterative implementation.',
      requiredConcepts: ['sorted array', 'middle element', 'eliminate half', 'logarithmic time'],
      expectedScoreMin: 85,
      expectedScoreMax: 100,
      shouldHaveCriticalError: false,
      shouldHaveScoreCeiling: false,
    },
    {
      id: 'REG-02',
      name: 'Incorrect Answer with Confident Tone (Negative Edges Dijkstra)',
      questionText: 'Can Dijkstra algorithm handle negative edge weights?',
      category: 'Technical',
      candidateAnswer:
        'Yes absolutely! Dijkstra algorithm handles negative edge weights easily because it always greedy picks the shortest node and updates all neighbors efficiently.',
      requiredConcepts: ['Dijkstra requires non-negative edge weights'],
      expectedScoreMin: 0,
      expectedScoreMax: 45, // Score ceiling MUST be enforced!
      shouldHaveCriticalError: true,
      shouldHaveScoreCeiling: true,
    },
    {
      id: 'REG-03',
      name: 'Correct Code with Poor Text Explanation',
      questionText: 'Write a solution for Two Sum and explain it.',
      category: 'Coding',
      candidateAnswer: 'I just wrote the code below, it works.',
      codeSubmitted: `function solution(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) return [map.get(diff), i];
    map.set(nums[i], i);
  }
  return [];
}`,
      codeExecution: {
        status: 'ACCEPTED',
        totalPassed: 4,
        totalCount: 4,
        samplePassed: 2,
        sampleTotal: 2,
        hiddenPassed: 2,
        hiddenTotal: 2,
        correctnessPercentage: 100,
        testResults: [],
        executionTimeMs: 15,
        memoryMb: 12,
      },
      requiredConcepts: ['hash map lookup', 'O(N) time complexity'],
      expectedScoreMin: 70,
      expectedScoreMax: 92,
      shouldHaveCriticalError: false,
      shouldHaveScoreCeiling: false,
    },
    {
      id: 'REG-04',
      name: 'Critical Compile Error in Code Submission',
      questionText: 'Implement Watermelon split function.',
      category: 'Coding',
      candidateAnswer: 'Here is my function',
      codeSubmitted: `function solution(w) { return w % 2 == 0 /// SYNTAX ERROR`,
      codeExecution: {
        status: 'COMPILE_ERROR',
        totalPassed: 0,
        totalCount: 3,
        samplePassed: 0,
        sampleTotal: 1,
        hiddenPassed: 0,
        hiddenTotal: 2,
        correctnessPercentage: 0,
        compileErrorDetails: 'SyntaxError: Unexpected token',
        testResults: [],
        executionTimeMs: 0,
        memoryMb: 0,
      },
      requiredConcepts: ['w > 2 and even number check'],
      expectedScoreMin: 0,
      expectedScoreMax: 35,
      shouldHaveCriticalError: true,
      shouldHaveScoreCeiling: true,
    },
    {
      id: 'REG-05',
      name: 'Complexity Mismatch Claim (Claimed O(1) space for O(N) array allocation)',
      questionText: 'What is the space complexity of your array duplication algorithm?',
      category: 'Technical',
      candidateAnswer: 'My algorithm runs in O(1) auxiliary space because I create a new array of size N to store all copy elements.',
      requiredConcepts: ['auxiliary space'],
      expectedScoreMin: 30,
      expectedScoreMax: 65,
      shouldHaveCriticalError: false,
      shouldHaveScoreCeiling: false,
    },
  ];

  async runRegressionSuite(): Promise<{
    passed: boolean;
    totalSuites: number;
    passedSuites: number;
    results: Array<{
      testId: string;
      name: string;
      passed: boolean;
      score: number;
      expectedMin: number;
      expectedMax: number;
      criticalErrorDetected: boolean;
      scoreCeilingEnforced: boolean;
      details: string;
    }>;
  }> {
    let passedSuites = 0;
    const testResults: any[] = [];

    for (const testCase of this.knownTestCases) {
      const evalResult: StructuredGradingResult = await gradingService.evaluateCandidateResponse({
        questionText: testCase.questionText,
        category: testCase.category,
        candidateAnswer: testCase.candidateAnswer,
        codeSubmitted: testCase.codeSubmitted,
        codeExecution: testCase.codeExecution,
        requiredConcepts: testCase.requiredConcepts,
      });

      const score = evalResult.calculatedFinalScore;
      const scoreOk = score >= testCase.expectedScoreMin && score <= testCase.expectedScoreMax;
      const criticalOk = !testCase.shouldHaveCriticalError || evalResult.criticalErrors.length > 0;
      const ceilingOk = !testCase.shouldHaveScoreCeiling || evalResult.scoreCeilingApplied;

      const passed = scoreOk && criticalOk && ceilingOk;
      if (passed) passedSuites++;

      testResults.push({
        testId: testCase.id,
        name: testCase.name,
        passed,
        score,
        expectedMin: testCase.expectedScoreMin,
        expectedMax: testCase.expectedScoreMax,
        criticalErrorDetected: evalResult.criticalErrors.length > 0,
        scoreCeilingEnforced: evalResult.scoreCeilingApplied,
        details: passed
          ? `Score ${score}/100 within expected bounds [${testCase.expectedScoreMin}, ${testCase.expectedScoreMax}].`
          : `Failed criteria: score=${score}, expectedRange=[${testCase.expectedScoreMin}-${testCase.expectedScoreMax}], criticalErrors=${evalResult.criticalErrors.length}, scoreCeiling=${evalResult.scoreCeilingApplied}`,
      });
    }

    return {
      passed: passedSuites === this.knownTestCases.length,
      totalSuites: this.knownTestCases.length,
      passedSuites,
      results: testResults,
    };
  }
}

export const gradingRegressionService = new GradingRegressionService();
