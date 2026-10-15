import mongoose, { Schema, Document } from 'mongoose';

export type QuestionSourceType =
  | 'INTERNAL'
  | 'CODEFORCES'
  | 'CODECHEF'
  | 'CURATED'
  | 'COMPANY_REPORTED'
  | 'AI_GENERATED';

export interface IQuestionTestCase {
  input: string;
  expectedOutput: string;
  isSample: boolean;
}

export interface IQuestion extends Document {
  id: string;
  source: QuestionSourceType;
  externalId?: string;
  title: string;
  url?: string;
  type: 'Coding' | 'Conceptual' | 'Behavioral' | 'System Design';
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  rating?: number;
  topics: string[];
  companies: string[];
  roleTypes?: string[];
  expectedTime?: number;
  estimatedDuration: number; // in minutes (e.g., 3-5m conceptual, 8-12m medium coding, 15-20m hard coding)
  supportedLanguages?: string[];
  statement: string;
  examples?: { input: string; output: string; explanation?: string }[];
  constraints?: string[];
  solutionMetadata?: any;
  gradingMetadata?: any;
  reportCount?: number;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  interviewStage?: string;
  testCases?: IQuestionTestCase[];
  requiredConcepts?: string[];
  expectedComplexity?: {
    time: string;
    space: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTestCaseSchema = new Schema(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isSample: { type: Boolean, default: true },
  },
  { _id: false }
);

const QuestionSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  source: { type: String, default: 'INTERNAL' },
  externalId: { type: String },
  title: { type: String, required: true },
  url: { type: String },
  type: { type: String, required: true, default: 'Coding' },
  category: { type: String, required: true, default: 'Technical' },
  difficulty: { type: String, default: 'MEDIUM' },
  rating: { type: Number, default: 1200 },
  topics: [{ type: String }],
  companies: [{ type: String }],
  roleTypes: [{ type: String }],
  expectedTime: { type: Number, default: 10 },
  estimatedDuration: { type: Number, default: 10 },
  supportedLanguages: [{ type: String }],
  statement: { type: String, required: true },
  examples: [Schema.Types.Mixed],
  constraints: [{ type: String }],
  solutionMetadata: Schema.Types.Mixed,
  gradingMetadata: Schema.Types.Mixed,
  reportCount: { type: Number, default: 1 },
  confidence: { type: String, default: 'HIGH' },
  interviewStage: { type: String, default: 'Technical Interview' },
  testCases: [QuestionTestCaseSchema],
  requiredConcepts: [{ type: String }],
  expectedComplexity: {
    time: { type: String, default: 'O(N)' },
    space: { type: String, default: 'O(1)' },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const QuestionModel = mongoose.model<IQuestion>('Question', QuestionSchema);
