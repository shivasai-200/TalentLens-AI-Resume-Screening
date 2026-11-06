import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';

export const uploadDirectory = path.resolve('uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

export const resumeUpload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (req, file, cb) => cb(null, randomUUID() + path.extname(file.originalname).toLowerCase())
  }),
  limits: { fileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isPdf = ext === '.pdf' && file.mimetype === 'application/pdf';
    const isDocx = ext === '.docx' && file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    cb(isPdf || isDocx ? null : new Error('Only valid PDF and DOCX files are accepted'), isPdf || isDocx);
  }
});