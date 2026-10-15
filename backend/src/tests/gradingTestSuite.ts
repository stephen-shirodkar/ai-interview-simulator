import { gradingService } from '../services/gradingService';

export interface GradingTestCase {
  name: string;
  questionText: string;
  category: string;
  candidateAnswer: string;
  codeSubmitted?: string;
  requiredConcepts: string[];
  expectedMaxScore?: number;
  expectedMinScore?: number;
  expectCriticalError?: boolean;
}

export const gradingTestCases: GradingTestCase[] = [
  {
    name: '1. Completely Correct Answer',
    questionText: 'Explain how Binary Search works and its time complexity.',
    category: 'Technical',
    candidateAnswer: 'Binary search works on a sorted array by repeatedly dividing the search space in half. It compares the target value to the middle element of the array. If they are equal, it returns the index. If target is smaller, it eliminates the right half; if larger, it eliminates the left half. Time complexity is O(log N).',
    requiredConcepts: ['sorted array requirement', 'middle element comparison', 'halving search space', 'O(log N) time complexity'],
    expectedMinScore: 75,
    expectCriticalError: false,
  },
  {
    name: '2. Completely Incorrect Answer',
    questionText: 'What is a primary key in a SQL database?',
    category: 'Technical',
    candidateAnswer: 'A primary key is an optional column that allows duplicate values and null values across rows.',
    requiredConcepts: ['unique identifier', 'non-null constraint'],
    expectedMaxScore: 45,
    expectCriticalError: true,
  },
  {
    name: '3. Correct Answer with Poor Communication',
    questionText: 'What is polymorphism in Object-Oriented Programming?',
    category: 'Technical',
    candidateAnswer: 'Umm basically like polymorphism means one thing having many forms, so like a parent class reference can hold a child object and call overridden methods at runtime, you know like method overriding.',
    requiredConcepts: ['parent reference to child object', 'method overriding', 'runtime dispatch'],
    expectedMinScore: 65,
    expectCriticalError: false,
  },
  {
    name: '4. Incorrect Answer with Excellent Communication (Confident False Claim)',
    questionText: 'Does Dijkstra algorithm support negative edge weights?',
    category: 'Technical',
    candidateAnswer: 'Dijkstra algorithm easily handles negative edge weights with high efficiency because it always selects the shortest path node first, guaranteeing optimal path traversal across negative cycles.',
    requiredConcepts: ['Dijkstra fails on negative edge weights', 'Bellman-Ford needed'],
    expectedMaxScore: 45,
    expectCriticalError: true,
  },
  {
    name: '5. Partially Correct Answer',
    questionText: 'Explain REST API principles.',
    category: 'Technical',
    candidateAnswer: 'REST APIs use standard HTTP methods like GET, POST, PUT, DELETE to communicate over endpoints with JSON payloads.',
    requiredConcepts: ['statelessness', 'client-server separation', 'standard HTTP methods', 'resource representations'],
    expectedMinScore: 50,
    expectedMaxScore: 80,
    expectCriticalError: false,
  },
  {
    name: '6. Correct Answer Using Alternate Terminology',
    questionText: 'How does a Hash Map achieve constant time lookup?',
    category: 'Technical',
    candidateAnswer: 'A key is transformed into an integer offset by a hashing function, pointing directly to a bucket slot in memory where the value is stored.',
    requiredConcepts: ['hash function computation', 'array index mapping', 'O(1) average lookup'],
    expectedMinScore: 65,
    expectCriticalError: false,
  },
  {
    name: '7. Answer with Keywords but Incorrect Reasoning',
    questionText: 'Explain Binary Search time complexity.',
    category: 'Technical',
    candidateAnswer: 'Binary search works on any unsorted array because it checks every element linearly using O(N) log N space.',
    requiredConcepts: ['sorted input requirement', 'O(log N) time complexity'],
    expectedMaxScore: 45,
    expectCriticalError: true,
  },
  {
    name: '8. Confident But Incorrect Answer',
    questionText: 'What is the time complexity of QuickSort in the worst case?',
    category: 'Technical',
    candidateAnswer: 'QuickSort is strictly O(1) constant time in all worst-case scenarios because partition always splits elements instantly.',
    requiredConcepts: ['O(N^2) worst case', 'bad pivot selection'],
    expectedMaxScore: 45,
    expectCriticalError: true,
  },
  {
    name: '9. Hesitant But Technically Correct Answer',
    questionText: 'How do JavaScript Promises work?',
    category: 'Technical',
    candidateAnswer: 'I think... well, a Promise represents an asynchronous operation that can be in Pending, Fulfilled, or Rejected state. You attach .then() and .catch() handlers to process async resolution without blocking the main event loop.',
    requiredConcepts: ['Pending/Fulfilled/Rejected states', 'async event loop non-blocking', '.then/.catch handlers'],
    expectedMinScore: 65,
    expectCriticalError: false,
  },
  {
    name: '10. Correct Code with Poor Explanation',
    questionText: 'Reverse a Linked List.',
    category: 'Coding',
    candidateAnswer: 'I just switched pointers using prev and next.',
    codeSubmitted: 'function reverseList(head) { let prev = null, curr = head; while(curr) { let next = curr.next; curr.next = prev; prev = curr; curr = next; } return prev; }',
    requiredConcepts: ['pointer reversal', 'prev/curr tracking'],
    expectedMinScore: 70,
    expectCriticalError: false,
  },
  {
    name: '11. Incorrect Code with Excellent Explanation',
    questionText: 'Check if String is Valid Parentheses.',
    category: 'Coding',
    candidateAnswer: 'I am using a LIFO Stack to push opening brackets and pop matching closing brackets in O(N) time.',
    codeSubmitted: 'function isValid(s) { return true; }',
    requiredConcepts: ['stack operations', 'matching bracket validation'],
    expectedMaxScore: 55,
    expectCriticalError: true,
  },
  {
    name: '12. Correct But Inefficient Solution',
    questionText: 'Find Two Numbers that Sum to Target in Array.',
    category: 'Coding',
    candidateAnswer: 'I used a nested loop checking every pair.',
    codeSubmitted: 'function twoSum(nums, target) { for(let i=0; i<nums.length; i++) { for(let j=i+1; j<nums.length; j++) { if(nums[i]+nums[j]===target) return [i,j]; } } }',
    requiredConcepts: ['hash map O(N)', 'nested loop O(N^2) inefficient'],
    expectedMinScore: 50,
    expectedMaxScore: 90,
    expectCriticalError: false,
  },
  {
    name: '13. Ambiguous Answer',
    questionText: 'Explain ACID properties in relational databases.',
    category: 'Technical',
    candidateAnswer: 'ACID means Atomicity, Consistency, Isolation, Durability which makes databases work properly.',
    requiredConcepts: ['Atomicity all-or-nothing', 'Consistency state transitions', 'Isolation transaction concurrency', 'Durability persistence'],
    expectedMinScore: 45,
    expectedMaxScore: 80,
    expectCriticalError: false,
  },
  {
    name: '14. Empty Answer',
    questionText: 'Describe how Garbage Collection works in V8.',
    category: 'Technical',
    candidateAnswer: 'I do not know.',
    requiredConcepts: ['mark-and-sweep algorithm', 'generational garbage collection'],
    expectedMaxScore: 40,
    expectCriticalError: true,
  }
];

export class GradingTestSuiteRunner {
  async runAllTests(): Promise<{ total: number; passed: number; results: any[] }> {
    console.log('🧪 Running Evidence-Based Grading Regression Test Suite...');
    const results = [];
    let passedCount = 0;

    for (const testCase of gradingTestCases) {
      try {
        const evalResult = await gradingService.evaluateCandidateResponse({
          questionText: testCase.questionText,
          category: testCase.category,
          candidateAnswer: testCase.candidateAnswer,
          codeSubmitted: testCase.codeSubmitted,
          requiredConcepts: testCase.requiredConcepts,
        });

        const score = evalResult.calculatedFinalScore;
        const hasCriticalError = evalResult.criticalErrors.length > 0;

        let passed = true;
        if (testCase.expectedMaxScore !== undefined && score > testCase.expectedMaxScore) passed = false;
        if (testCase.expectedMinScore !== undefined && score < testCase.expectedMinScore) passed = false;
        if (testCase.expectCriticalError !== undefined && hasCriticalError !== testCase.expectCriticalError) passed = false;

        if (passed) passedCount++;

        results.push({
          name: testCase.name,
          score,
          hasCriticalError,
          passed,
          feedback: evalResult.actionableFeedback,
        });
      } catch (err: any) {
        results.push({
          name: testCase.name,
          passed: false,
          error: err.message,
        });
      }
    }

    console.log(`✅ Test Suite Complete: ${passedCount}/${gradingTestCases.length} tests passed.`);
    return { total: gradingTestCases.length, passed: passedCount, results };
  }
}

export const gradingTestSuiteRunner = new GradingTestSuiteRunner();
