import { Router, Request, Response } from 'express';
import { TWENTY_COMPANIES } from '../config/companies';
import { questionSeedData } from '../seedData';
import { QuestionModel } from '../models/Question';

const router = Router();

// 1. GET /api/companies - List all 20 technology companies
router.get('/', (req: Request, res: Response) => {
  return res.json({
    success: true,
    total: TWENTY_COMPANIES.length,
    companies: TWENTY_COMPANIES,
    disclaimer: 'Community-reported interview patterns and publicly available questions. Not an official company endorsement.',
  });
});

// 2. GET /api/companies/:id - Get specific company details & topics
router.get('/:id', (req: Request, res: Response) => {
  const companyId = req.params.id.toLowerCase();
  const company = TWENTY_COMPANIES.find((c) => c.id.toLowerCase() === companyId);

  if (!company) {
    return res.status(404).json({ error: 'Company not found in supported company catalog.' });
  }

  return res.json({
    success: true,
    company,
    disclaimer: 'Publicly reported interview preparation data.',
  });
});

// 3. GET /api/companies/:id/questions - Get company-specific questions with confidence metadata
router.get('/:id/questions', async (req: Request, res: Response) => {
  const companyId = req.params.id.toLowerCase();
  const company = TWENTY_COMPANIES.find((c) => c.id.toLowerCase() === companyId);

  if (!company) {
    return res.status(404).json({ error: 'Company not found.' });
  }

  let dbQuestions: any[] = [];
  try {
    dbQuestions = await QuestionModel.find({ companies: companyId });
  } catch (e) {
    dbQuestions = [];
  }

  const seedQuestions = questionSeedData.filter(
    (q) => q.companies && q.companies.some((c: string) => c.toLowerCase() === companyId)
  );

  const mergedQuestions = dbQuestions.length > 0 ? dbQuestions : seedQuestions;

  return res.json({
    success: true,
    company: company.name,
    totalQuestions: mergedQuestions.length,
    questions: mergedQuestions,
    disclaimer: 'Community-reported and publicly available practice questions for ' + company.name + '.',
  });
});

export default router;
