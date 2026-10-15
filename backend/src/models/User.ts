import mongoose, { Schema, Document } from 'mongoose';

export interface IDsaTopicPerformance {
  attempts: number;
  successful: number;
  failed: number;
  accuracy: number; // 0 to 100%
  avgScore: number;
  difficultyAttempted: number;
  difficultySolved: number;
}

export interface ICodeforcesConnection {
  connected: boolean;
  handle?: string;
  rating?: number;
  rank?: string;
  maxRating?: number;
  maxRank?: string;
  avatar?: string;
  lastSyncedAt?: Date;
}

export interface IUser extends Document {
  clerkUserId: string;
  name: string;
  email: string;
  codeforces: ICodeforcesConnection;
  dsaProfile: {
    rating: number;
    rank: string;
    topics: Map<string, IDsaTopicPerformance>;
  };
  skills: string[];
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  targetRole: string;
  createdAt: Date;
}

const DsaTopicSchema = new Schema({
  attempts: { type: Number, default: 0 },
  successful: { type: Number, default: 0 },
  failed: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  avgScore: { type: Number, default: 0 },
  difficultyAttempted: { type: Number, default: 800 },
  difficultySolved: { type: Number, default: 800 },
}, { _id: false });

const UserSchema: Schema = new Schema({
  clerkUserId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  codeforces: {
    connected: { type: Boolean, default: false },
    handle: { type: String },
    rating: { type: Number, default: 0 },
    rank: { type: String, default: 'Unrated' },
    maxRating: { type: Number, default: 0 },
    maxRank: { type: String, default: 'Unrated' },
    avatar: { type: String },
    lastSyncedAt: { type: Date },
  },
  dsaProfile: {
    rating: { type: Number, default: 1200 },
    rank: { type: String, default: 'Specialist' },
    topics: {
      type: Map,
      of: DsaTopicSchema,
      default: {},
    },
  },
  skills: [{ type: String }],
  experienceLevel: { type: String, default: 'Mid' },
  targetRole: { type: String, default: 'Full Stack Engineer' },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);

