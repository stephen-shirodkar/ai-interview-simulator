import express from 'express';
import cors from 'cors';
import { CONFIG } from './config';
import { connectDatabase } from './db/connection';
import { ragService } from './services/ragService';
import resumeRoutes from './routes/resumeRoutes';
import codeforcesRoutes from './routes/codeforcesRoutes';
import interviewRoutes from './routes/interviewRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import gradingRoutes from './routes/gradingRoutes';
import companyRoutes from './routes/companyRoutes';
import learningRoutes from './routes/learningRoutes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'AI Interview Simulator API Server',
    ollamaHost: CONFIG.OLLAMA_HOST,
    chromadbHost: CONFIG.CHROMADB_HOST,
    timestamp: new Date(),
  });
});

// Register API Routes
app.use('/api/resume', resumeRoutes);
app.use('/api/codeforces', codeforcesRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/grading', gradingRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/learning', learningRoutes);


const startServer = async () => {
  await connectDatabase();
  await ragService.initQuestionVectorBank();

  app.listen(CONFIG.PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 AI Interview Simulator Express Server running at http://localhost:${CONFIG.PORT}`);
    console.log(`⚡ Connected APIs: RAG Vector Store, Codeforces, Ollama Engine`);
    console.log(`====================================================`);
  });
};

startServer();
