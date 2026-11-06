import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import Job from '../models/Job.js';
import { optionalProtect, protect, allow } from '../middleware/auth.js';

const r = Router();

r.get('/', optionalProtect, async (req, res, next) => {
	try {
		const q = String(req.query.search || '').trim();
		const filter = { status: 'active', ...(req.user?.role === 'recruiter' ? { recruiterId: req.user._id } : {}) };
		if (q) {
			const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			filter.$or = [
				{ title: new RegExp(escaped, 'i') },
				{ company: new RegExp(escaped, 'i') },
				{ requiredSkills: new RegExp(escaped, 'i') },
				{ location: new RegExp(escaped, 'i') }
			];
		}
		const jobs = await Job.find(filter).sort({ createdAt: -1 }).limit(100);
		res.json({ jobs });
	} catch (e) {
		next(e);
	}
});

r.post('/', protect, allow('recruiter'), [body('title').trim().notEmpty(), body('company').trim().notEmpty(), body('description').trim().notEmpty()], async (req, res, next) => {
	try {
		if (!validationResult(req).isEmpty()) return res.status(400).json({ message: 'Title, company and description are required' });
		const job = await Job.create({ ...req.body, recruiterId: req.user._id });
		res.status(201).json({ job });
	} catch (e) {
		next(e);
	}
});

r.get('/:id', protect, async (req, res, next) => {
	try {
		const job = await Job.findById(req.params.id);
		if (!job) return res.status(404).json({ message: 'Job not found' });
		res.json({ job });
	} catch (e) {
		next(e);
	}
});

r.put('/:id', protect, allow('recruiter'), async (req, res, next) => {
	try {
		const job = await Job.findOneAndUpdate({ _id: req.params.id, recruiterId: req.user._id }, req.body, { new: true, runValidators: true });
		if (!job) return res.status(404).json({ message: 'Job not found' });
		res.json({ job });
	} catch (e) {
		next(e);
	}
});

r.delete('/:id', protect, allow('recruiter'), async (req, res, next) => {
	try {
		const job = await Job.findOneAndDelete({ _id: req.params.id, recruiterId: req.user._id });
		if (!job) return res.status(404).json({ message: 'Job not found' });
		res.json({ message: 'Job deleted' });
	} catch (e) {
		next(e);
	}
});

export default r;