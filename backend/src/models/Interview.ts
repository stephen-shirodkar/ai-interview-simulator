import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewTurn {
  questionId: string;
  questionText: string;
  category: string;
  candidateAnswer: string;
  audioDurationSeconds?: number;
  score: number; // 0 to 100
  clarityScore: number;
  technicalScore: number;
  behavioralScore: number;
  aiFeedback: string;
  hintsUsed: number;
  keywordsMatched: string[];
  keywordsMissed: string[];
  codeSubmitted?: string;
  codeExecutionPassed?: boolean;
}

export interface IInterview extends Document {
  sessionId: string;
  userId: string;
  targetRole: string;
  mode: 'Full Mock' | 'Technical Only' | 'Behavioral Only' | 'Codeforces Coding';
  status: 'In Progress' | 'Completed' | 'Abandoned';
  resumeSummary?: string;
  codeforcesHandleSynced?: string;
  turns: IInterviewTurn[];
  overallScore?: number;
  skillScores?: {
    technical: number;
    behavioral: number;
    problemSolving: number;
    communication: number;
    codingSpeed: number;
  };
  aiReportSummary?: string;
  strengths?: string[];
  areasToImprove?: string[];
  createdAt: Date;
  completedAt?: Date;
}

const TurnSchema = new Schema({
  questionId: String,
  questionText: String,
  category: String,
  candidateAnswer: String,
  audioDurationSeconds: Number,
  score: { type: Number, default: 0 },
  clarityScore: { type: Number, default: 0 },
  technicalScore: { type: Number, default: 0 },
  behavioralScore: { type: Number, default: 0 },
  aiFeedback: String,
  hintsUsed: { type: Number, default: 0 },
  keywordsMatched: [String],
  keywordsMissed: [String],
  codeSubmitted: String,
  codeExecutionPassed: Boolean,
});

const InterviewSchema: Schema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  targetRole: { type: String, required: true },
  mode: { type: String, default: 'Full Mock' },
  status: { type: String, default: 'In Progress' },
  resumeSummary: String,
  codeforcesHandleSynced: String,
  turns: [TurnSchema],
  overallScore: Number,
  skillScores: {
    technical: Number,
    behavioral: Number,
    problemSolving: Number,
    communication: Number,
    codingSpeed: Number,
  },
  aiReportSummary: String,
  strengths: [String],
  areasToImprove: [String],
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
});

export const InterviewModel = mongoose.model<IInterview>('Interview', InterviewSchema);
