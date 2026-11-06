import { Router } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Resume from '../models/Resume.js';
import User from '../models/User.js';
import { protect, allow } from '../middleware/auth.js';
import { resumeUpload, uploadDirectory } from '../middleware/resumeUpload.js';
import { extractText, extractInformation } from '../services/resumeParser.js';
import { screenResume } from '../services/matchingEngine.js';

const r = Router();
const removeUploadedFile = file => file ? fs.unlink(file.path).catch(() => {}) : Promise.resolve();

r.post('/submit', (req, res, next) => resumeUpload.single('resume')(req, res, async err => {
	if (err) return res.status(400).json({ message: err.message });
	if (!req.file) return res.status(400).json({ message: 'Please select a PDF resume' });
	const rejectUpload = async (status, message) => {
		await removeUploadedFile(req.file);
		return res.status(status).json({ message });
	};
	let resume;
	try {
		const { name, email, phone, experienceYears: rawExperience, jobId } = req.body;
		const candidateName = String(name || '').trim();
		const candidateEmail = String(email || '').trim().toLowerCase();
		const candidatePhone = String(phone || '').trim();
		const phoneDigits = candidatePhone.replace(/\D/g, '');
		const experienceYears = Number(rawExperience);
		if (path.extname(req.file.originalname).toLowerCase() !== '.pdf' || req.file.mimetype !== 'application/pdf') {
			return rejectUpload(400, 'Only PDF resumes are accepted for applications');
		}
		const pdfBytes = await fs.readFile(req.file.path);
		if (pdfBytes.subarray(0, 1024).indexOf(Buffer.from('%PDF-')) < 0) {
			return rejectUpload(400, 'The uploaded file is not a valid PDF');
		}
		if (candidateName.length < 2 || candidateName.length > 100) return rejectUpload(400, 'Enter a name between 2 and 100 characters');
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidateEmail) || candidateEmail.length > 254) return rejectUpload(400, 'Enter a valid email address');
		if (phoneDigits.length < 7 || phoneDigits.length > 15 || candidatePhone.length > 30) return rejectUpload(400, 'Enter a valid phone number');
		if (String(rawExperience ?? '').trim() === '' || !Number.isFinite(experienceYears) || experienceYears < 0 || experienceYears > 60) return rejectUpload(400, 'Experience must be between 0 and 60 years');
		if (!mongoose.Types.ObjectId.isValid(jobId)) return rejectUpload(400, 'Select a valid job opening');

		const job = await Job.findOne({ _id: jobId, status: 'active' });
		if (!job) return rejectUpload(404, 'Active job not found');
		const account = await User.findOne({ email: candidateEmail });
		if (account && account.role !== 'candidate') return rejectUpload(409, 'This email is associated with a recruiter account');
		const duplicateConditions = [{ candidateEmail }];
		if (account) duplicateConditions.push({ candidateId: account._id });
		if (await Application.exists({ jobId: job._id, $or: duplicateConditions })) {
			return rejectUpload(409, 'You have already applied to this job with this email');
		}

		const extractedText = await extractText(req.file);
		if (extractedText.trim().length < 30) {
			const error = new Error('No readable text found. Please upload a text-based PDF.');
			error.status = 400;
			throw error;
		}
		const extractedInformation = extractInformation(extractedText);
		extractedInformation.name = candidateName;
		extractedInformation.email = candidateEmail;
		extractedInformation.phone = candidatePhone;
		extractedInformation.experienceYears = experienceYears;
		const result = screenResume({ resumeText: extractedText, job, resumeSkills: extractedInformation.skills || [], experienceYears });

		resume = await Resume.create({
			candidateId: account?._id,
			originalFilename: req.file.originalname,
			storedFilename: req.file.filename,
			fileType: req.file.mimetype,
			fileSize: req.file.size,
			extractedText,
			extractedInformation,
			processingStatus: 'processed'
		});
		const application = await Application.create({
			candidateId: account?._id,
			candidateName,
			candidateEmail,
			candidatePhone,
			experienceYears,
			recruiterId: job.recruiterId,
			jobId: job._id,
			resumeId: resume._id,
			...result
		});
		res.status(201).json({ application, extractedInformation });
	} catch (e) {
		if (resume) await Resume.deleteOne({ _id: resume._id });
		await removeUploadedFile(req.file);
		if (e.code === 11000) return res.status(409).json({ message: 'You have already applied to this job with this email' });
		next(e);
	}
}));

r.post('/', protect, allow('candidate'), async (req, res, next) => {
	try {
		const job = await Job.findOne({ _id: req.body.jobId, status: 'active' });
		if (!job) return res.status(404).json({ message: 'Active job not found' });
		const resume = await Resume.findOne({ candidateId: req.user._id }).select('+extractedText').sort({ createdAt: -1 });
		if (!resume) return res.status(400).json({ message: 'Upload a resume before applying' });
		const result = screenResume({ resumeText: resume.extractedText, job, resumeSkills: resume.extractedInformation.skills || [], experienceYears: resume.extractedInformation.experienceYears });
		const application = await Application.create({
			candidateId: req.user._id,
			candidateName: req.user.name,
			candidateEmail: req.user.email,
			candidatePhone: req.user.phone || resume.extractedInformation.phone || '',
			experienceYears: resume.extractedInformation.experienceYears,
			recruiterId: job.recruiterId,
			jobId: job._id,
			resumeId: resume._id,
			...result
		});
		res.status(201).json({ application });
	} catch (e) {
		if (e.code === 11000) return res.status(409).json({ message: 'You have already applied to this job' });
		next(e);
	}
});

r.get('/my', protect, allow('candidate'), async (req, res, next) => {
	try {
		const applications = await Application.find({ candidateId: req.user._id }).populate('jobId', 'title company location').sort({ createdAt: -1 });
		res.json({ applications });
	} catch (e) {
		next(e);
	}
});

r.get('/recruiter', protect, allow('recruiter'), async (req, res, next) => {
	try {
		const applications = await Application.find({ recruiterId: req.user._id })
			.populate('candidateId', 'name email')
			.populate('jobId', 'title')
			.populate('resumeId', 'originalFilename fileType extractedInformation')
			.sort({ matchingScore: -1, createdAt: -1 }).limit(300);
		res.json({ applications });
	} catch (e) {
		next(e);
	}
});

r.get('/recent', protect, allow('recruiter'), async (req, res, next) => {
	try {
		const applications = await Application.find({ recruiterId: req.user._id }).populate('candidateId', 'name email').populate('jobId', 'title').sort({ createdAt: -1 }).limit(8);
		res.json({ applications });
	} catch (e) {
		next(e);
	}
});

r.get('/job/:jobId/rankings', protect, allow('recruiter'), async (req, res, next) => {
	try {
		const job = await Job.findOne({ _id: req.params.jobId, recruiterId: req.user._id });
		if (!job) return res.status(404).json({ message: 'Job not found' });
		const applications = await Application.find({ jobId: job._id }).populate('candidateId', 'name email').populate('resumeId', 'originalFilename extractedInformation').sort({ matchingScore: -1 });
		res.json({ applications });
	} catch (e) {
		next(e);
	}
});

r.get('/:id/resume', protect, allow('recruiter'), async (req, res, next) => {
	try {
		const application = await Application.findOne({ _id: req.params.id, recruiterId: req.user._id });
		if (!application) return res.status(404).json({ message: 'Application not found' });
		const resume = await Resume.findById(application.resumeId);
		if (!resume?.storedFilename) return res.status(404).json({ message: 'Resume file not found' });
		const filePath = path.resolve(uploadDirectory, path.basename(resume.storedFilename));
		res.download(filePath, path.basename(resume.originalFilename || 'resume.pdf'), error => {
			if (error && !res.headersSent) next(error);
		});
	} catch (e) {
		next(e);
	}
});

r.patch('/:id/status', protect, allow('recruiter'), async (req, res, next) => {
	try {
		const allowed = ['applied', 'under review', 'shortlisted', 'interview', 'selected', 'rejected'];
		if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid application status' });
		const application = await Application.findOneAndUpdate({ _id: req.params.id, recruiterId: req.user._id }, { status: req.body.status }, { new: true });
		if (!application) return res.status(404).json({ message: 'Application not found' });
		res.json({ application });
	} catch (e) {
		next(e);
	}
});

export default r;