import { Router, Request, Response } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { ragService } from '../services/ragService';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/parse-text', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Please provide resume text in request body.' });
    }

    const parsed = ragService.parseResumeText(text);
    return res.json({ success: true, parsed });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to parse resume text.' });
  }
});

router.post('/upload', upload.single('resumePdf'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    const pdfBuffer = req.file.buffer;
    const parsedPdf = await pdfParse(pdfBuffer);
    const resumeText = parsedPdf.text || '';

    const parsed = ragService.parseResumeText(resumeText);
    return res.json({
      success: true,
      filename: req.file.originalname,
      extractedTextLength: resumeText.length,
      parsed,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to parse PDF resume.' });
  }
});

export default router;
