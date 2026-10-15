import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidateWeaknessEvidence {
  questionId: string;
  reason: string;
  missingConcepts?: string[];
  incorrectConcepts?: string[];
}

export interface ICandidateWeakness extends Document {
  userId: string;
  interviewId?: string;
  topic: string;
  subtopic?: string;
  category: 'DSA' | 'JAVA' | 'SPRING_BOOT' | 'DATABASE' | 'SYSTEM_DESIGN' | 'JAVASCRIPT' | 'REACT' | 'BEHAVIORAL' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number;
  confidence: number; // 0 to 100
  evidence: ICandidateWeaknessEvidence[];
  recommendedAction: 'REVIEW' | 'PRACTICE' | 'REVIEW_AND_PRACTICE';
  status: 'ACTIVE' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: Date;
  updatedAt: Date;
}

const CandidateWeaknessSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    interviewId: { type: String, index: true },
    topic: { type: String, required: true },
    subtopic: { type: String },
    category: {
      type: String,
      enum: ['DSA', 'JAVA', 'SPRING_BOOT', 'DATABASE', 'SYSTEM_DESIGN', 'JAVASCRIPT', 'REACT', 'BEHAVIORAL', 'OTHER'],
      default: 'DSA',
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    score: { type: Number, required: true },
    confidence: { type: Number, default: 80 },
    evidence: [
      {
        questionId: String,
        reason: String,
        missingConcepts: [String],
        incorrectConcepts: [String],
      },
    ],
    recommendedAction: {
      type: String,
      enum: ['REVIEW', 'PRACTICE', 'REVIEW_AND_PRACTICE'],
      default: 'REVIEW_AND_PRACTICE',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'IN_PROGRESS', 'RESOLVED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

export const CandidateWeaknessModel =
  mongoose.models.CandidateWeakness || mongoose.model<ICandidateWeakness>('CandidateWeakness', CandidateWeaknessSchema);

export interface ITopicMasteryHistory {
  assessedAt: Date;
  score: number;
  source: 'INTERVIEW' | 'PRACTICE' | 'REASSESSMENT';
}

export interface ITopicMastery extends Document {
  userId: string;
  topic: string;
  category: string;
  estimatedScore: number;
  confidence: number;
  evidenceCount: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'INSUFFICIENT_DATA';
  history: ITopicMasteryHistory[];
  lastAssessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TopicMasterySchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    topic: { type: String, required: true, index: true },
    category: { type: String, default: 'Technical' },
    estimatedScore: { type: Number, required: true },
    confidence: { type: Number, default: 50 },
    evidenceCount: { type: Number, default: 1 },
    trend: {
      type: String,
      enum: ['IMPROVING', 'STABLE', 'DECLINING', 'INSUFFICIENT_DATA'],
      default: 'INSUFFICIENT_DATA',
    },
    history: [
      {
        assessedAt: { type: Date, default: Date.now },
        score: { type: Number, required: true },
        source: { type: String, enum: ['INTERVIEW', 'PRACTICE', 'REASSESSMENT'], default: 'INTERVIEW' },
      },
    ],
    lastAssessedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const TopicMasteryModel =
  mongoose.models.TopicMastery || mongoose.model<ITopicMastery>('TopicMastery', TopicMasterySchema);

export interface ILearningPlanStep {
  stepNumber: number;
  title: string;
  type: 'LEARN' | 'UNDERSTAND' | 'PRACTICE' | 'REASSESS';
  description: string;
  resourceIds?: string[];
  actionLabel: string;
  isCompleted?: boolean;
}

export interface ILearningPlan extends Document {
  userId: string;
  weaknessId: string;
  topic: string;
  category: string;
  whyText: string;
  estimatedMastery: number;
  steps: ILearningPlanStep[];
  ragSourcesUsed: Array<{ title: string; contentType: string; url?: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const LearningPlanSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    weaknessId: { type: String, required: true, index: true },
    topic: { type: String, required: true },
    category: { type: String, default: 'Technical' },
    whyText: { type: String, required: true },
    estimatedMastery: { type: Number, required: true },
    steps: [
      {
        stepNumber: Number,
        title: String,
        type: { type: String, enum: ['LEARN', 'UNDERSTAND', 'PRACTICE', 'REASSESS'] },
        description: String,
        resourceIds: [String],
        actionLabel: String,
        isCompleted: { type: Boolean, default: false },
      },
    ],
    ragSourcesUsed: [
      {
        title: String,
        contentType: String,
        url: String,
      },
    ],
  },
  { timestamps: true }
);

export const LearningPlanModel =
  mongoose.models.LearningPlan || mongoose.model<ILearningPlan>('LearningPlan', LearningPlanSchema);

export interface IPracticeSession extends Document {
  userId: string;
  topic: string;
  weaknessId?: string;
  type: 'PRACTICE' | 'REASSESSMENT';
  questions: Array<{
    questionId: string;
    title: string;
    questionText: string;
    category: string;
    difficulty: string;
    requiredConcepts: string[];
    userAnswer?: string;
    score?: number;
    feedback?: string;
    evaluatedAt?: Date;
  }>;
  overallScore?: number;
  previousMastery?: number;
  newMastery?: number;
  improvementDelta?: number;
  status: 'PENDING' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}

const PracticeSessionSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    topic: { type: String, required: true },
    weaknessId: { type: String },
    type: { type: String, enum: ['PRACTICE', 'REASSESSMENT'], default: 'PRACTICE' },
    questions: [
      {
        questionId: String,
        title: String,
        questionText: String,
        category: String,
        difficulty: String,
        requiredConcepts: [String],
        userAnswer: String,
        score: Number,
        feedback: String,
        evaluatedAt: Date,
      },
    ],
    overallScore: Number,
    previousMastery: Number,
    newMastery: Number,
    improvementDelta: Number,
    status: { type: String, enum: ['PENDING', 'COMPLETED'], default: 'PENDING' },
  },
  { timestamps: true }
);

export const PracticeSessionModel =
  mongoose.models.PracticeSession || mongoose.model<IPracticeSession>('PracticeSession', PracticeSessionSchema);
