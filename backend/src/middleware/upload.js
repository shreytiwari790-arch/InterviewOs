import multer from 'multer';
import { AppError } from '../utils/AppError.js';

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export const RESUME_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

// Files are kept in memory only long enough to extract their text; nothing is written to disk.
export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_BYTES, files: 1 },
  fileFilter(req, file, callback) {
    const extension = file.originalname.toLowerCase().split('.').pop();
    const kind = RESUME_TYPES[file.mimetype];
    if (!kind || kind !== extension) {
      return callback(new AppError(415, 'Upload a PDF or DOCX file'));
    }
    callback(null, true);
  },
}).single('resume');
