import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config';

export let isMongoConnected = false;

// Local JSON persistent storage fallback directory
const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const connectDatabase = async (): Promise<boolean> => {
  try {
    // Attempt Mongoose Connection with 3s timeout
    await mongoose.connect(CONFIG.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB at:', CONFIG.MONGODB_URI);
    return true;
  } catch (err: any) {
    isMongoConnected = false;
    console.warn(
      '⚠️ MongoDB connection failed or timed out. Falling back to built-in JSON file storage in backend/data.'
    );
    return false;
  }
};

// Helper for reading local JSON store fallback
export const getLocalStore = (collectionName: string): any[] => {
  const filePath = path.join(DATA_DIR, `${collectionName}.json`);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

// Helper for writing local JSON store fallback
export const saveLocalStore = (collectionName: string, items: any[]): void => {
  const filePath = path.join(DATA_DIR, `${collectionName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf-8');
};
