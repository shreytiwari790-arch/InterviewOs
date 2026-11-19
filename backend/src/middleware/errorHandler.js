import multer from 'multer';
import { AppError } from '../utils/AppError.js';
import { MAX_RESUME_BYTES } from './upload.js';

export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by their 4 arguments
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? `File is larger than ${MAX_RESUME_BYTES / 1024 / 1024} MB`
        : 'Upload a single PDF or DOCX file in the "resume" field';
    return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid identifier' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'A record with this value already exists' });
  }

  console.error(err);
  res.status(500).json({ message: 'Something went wrong on our side. Please try again.' });
}
