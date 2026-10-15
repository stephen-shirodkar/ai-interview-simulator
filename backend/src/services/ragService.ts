import { globalVectorStore, VectorDocument } from '../vector/vectorStore';
import { questionSeedData } from '../seedData';
import { codeforcesService } from './codeforcesService';

export interface ParsedResume {
  rawText: string;
  extractedSkills: string[];
  suggestedRoles: string[];
  experienceYearsEstimate: number;
}

export class RAGService {
  private isInitialized = false;

  async initQuestionVectorBank(): Promise<void> {
    if (this.isInitialized) return;

    const docs: VectorDocument[] = questionSeedData.map((q) => {
      const skills = (q.skillsRequired || q.topics || []).join(' ');
      const textContent = q.questionText || q.statement || '';
      return {
        id: q.id,
        text: `${q.title} ${textContent} ${skills} ${q.category}`,
        metadata: {
          id: q.id,
          category: q.category,
          title: q.title,
          questionText: textContent,
          difficulty: q.difficulty,
          skillsRequired: q.skillsRequired || q.topics || [],
          expectedKeywords: q.expectedKeywords || [],
          starCriteria: q.starCriteria,
          codeforcesDetails: q.codeforcesDetails,
          sampleAnswerHint: q.sampleAnswerHint,
        },
      };
    });

    await globalVectorStore.addDocuments(docs);
    this.isInitialized = true;
    console.log(`🤖 Vector Bank initialized with ${docs.length} question documents.`);
  }

  parseResumeText(text: string): ParsedResume {
    const knownSkills = [
      'React',
      'Next.js',
      'TypeScript',
      'JavaScript',
      'Node.js',
      'Express.js',
      'Python',
      'Django',
      'FastAPI',
      'Java',
      'Spring Boot',
      'C++',
      'Go',
      'Rust',
      'MongoDB',
      'PostgreSQL',
      'MySQL',
      'Redis',
      'Docker',
      'Kubernetes',
      'AWS',
      'GCP',
      'GraphQL',
      'REST API',
      'System Design',
      'Microservices',
      'CI/CD',
      'Git',
      'Data Structures',
      'Algorithms',
    ];

    const lower = text.toLowerCase();
    const extractedSkills = knownSkills.filter((skill) => lower.includes(skill.toLowerCase()));

    // Experience estimation based on keywords
    let experienceYearsEstimate = 1;
    if (lower.includes('senior') || lower.includes('lead') || lower.includes('architect')) {
      experienceYearsEstimate = 5;
    } else if (lower.includes('years of experience') || lower.includes('mid-level')) {
      experienceYearsEstimate = 3;
    }

    const suggestedRoles = ['Full Stack Engineer', 'Backend Engineer', 'Frontend Engineer', 'Software Engineer'];

    return {
      rawText: text,
      extractedSkills: extractedSkills.length > 0 ? extractedSkills : ['JavaScript', 'Node.js', 'React', 'Problem Solving'],
      suggestedRoles,
      experienceYearsEstimate,
    };
  }

  async getResumeAwareQuestions(
    resumeText: string,
    targetRole: string,
    codeforcesHandle?: string
  ): Promise<any[]> {
    await this.initQuestionVectorBank();

    const parsedResume = this.parseResumeText(resumeText);
    const query = `${targetRole} ${parsedResume.extractedSkills.join(' ')} System Design Algorithms`;

    // 1. Technical RAG Vector Search
    const techMatches = await globalVectorStore.querySimilar(query, 3, 'Technical');
    // 2. Behavioral RAG Vector Search
    const behMatches = await globalVectorStore.querySimilar(query, 2, 'Behavioral');

    let questions = [...techMatches.map((m) => m.metadata), ...behMatches.map((m) => m.metadata)];

    // 3. Codeforces Coding Round Integration
    if (codeforcesHandle) {
      try {
        const cfUser = await codeforcesService.getUserStats(codeforcesHandle);
        const cfProblems = await codeforcesService.getRecommendedProblems(cfUser.rating || 1300, 1);

        if (cfProblems.length > 0) {
          const problem = cfProblems[0];
          questions.push({
            id: `CF_LIVE_${problem.problemId}`,
            category: 'Coding',
            title: `Codeforces Round: ${problem.name} (${problem.rating})`,
            questionText: problem.questionText,
            difficulty: problem.rating > 1400 ? 'Hard' : problem.rating > 1100 ? 'Medium' : 'Easy',
            skillsRequired: ['Data Structures', 'Algorithms', ...problem.tags],
            expectedKeywords: ['time complexity', 'space complexity', 'array', 'optimization'],
            codeforcesDetails: {
              problemId: problem.problemId,
              rating: problem.rating,
              tags: problem.tags,
              sampleInput: problem.sampleInput,
              sampleOutput: problem.sampleOutput,
              codeTemplate: problem.codeTemplate,
            },
            sampleAnswerHint: 'Focus on time complexity requirements before coding. Identify key data structures like HashMap, Two Pointers, or Dynamic Programming.',
          });
        }
      } catch (err) {
        console.warn('Failed to attach Codeforces live question, using default algorithm question.');
      }
    }

    return questions;
  }
}

export const ragService = new RAGService();
