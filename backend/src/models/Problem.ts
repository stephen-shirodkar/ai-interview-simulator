import mongoose, { Schema, Document } from 'mongoose';

export interface ITestCase {
  input: string;
  expectedOutput: string;
  isSample: boolean;
}

export interface IProblem extends Document {
  problemId: string; // e.g. "CF-158A"
  contestId: number;
  problemIndex: string;
  name: string;
  rating: number;
  tags: string[];
  url: string;
  questionText: string;
  sampleInput: string;
  sampleOutput: string;
  codeTemplate: string;
  testCases: ITestCase[];
  expectedTopics: string[];
  expectedComplexity?: {
    time: string;
    space: string;
  };
  lastSyncedAt: Date;
}

const TestCaseSchema = new Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isSample: { type: Boolean, default: true },
}, { _id: false });

const ProblemSchema: Schema = new Schema({
  problemId: { type: String, required: true, unique: true },
  contestId: { type: Number, required: true },
  problemIndex: { type: String, required: true },
  name: { type: String, required: true },
  rating: { type: Number, default: 1200 },
  tags: [{ type: String }],
  url: { type: String, required: true },
  questionText: { type: String, required: true },
  sampleInput: { type: String },
  sampleOutput: { type: String },
  codeTemplate: { type: String },
  testCases: [TestCaseSchema],
  expectedTopics: [{ type: String }],
  expectedComplexity: {
    time: { type: String, default: 'O(N)' },
    space: { type: String, default: 'O(1)' },
  },
  lastSyncedAt: { type: Date, default: Date.now },
});

export const ProblemModel = mongoose.model<IProblem>('Problem', ProblemSchema);
