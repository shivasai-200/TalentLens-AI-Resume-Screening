import { Router } from 'express';
import fs from 'node:fs';
import Resume from '../models/Resume.js';
import { protect, allow } from '../middleware/auth.js';
import { resumeUpload } from '../middleware/resumeUpload.js';
import { extractText, extractInformation } from '../services/resumeParser.js';

const r = Router();

r.post('/upload', protect, allow('candidate'), (req, res, next) => resumeUpload.single('resume')(req, res, async err => {
	if (err) return res.status(400).json({ message: err.message });
	if (!req.file) return res.status(400).json({ message: 'Please select a resume file' });
	try {
		const text = await extractText(req.file);
		if (text.trim().length < 30) throw new Error('No readable text found. Please upload a text-based PDF or DOCX.');
		const info = extractInformation(text);
		const resume = await Resume.create({
			candidateId: req.user._id,
			originalFilename: req.file.originalname,
			storedFilename: req.file.filename,
			fileType: req.file.mimetype,
			fileSize: req.file.size,
			extractedText: text,
			extractedInformation: info,
			processingStatus: 'processed'
		});
		res.status(201).json({ resume: { ...resume.toObject(), extractedText: undefined } });
	} catch (e) {
		fs.promises.unlink(req.file.path).catch(() => {});
		next(e);
	}
}));

r.get('/my', protect, allow('candidate'), async (req, res, next) => {
	try {
		const resumes = await Resume.find({ candidateId: req.user._id }).sort({ createdAt: -1 });
		res.json({ resumes });
	} catch (e) {
		next(e);
	}
});

export default r;