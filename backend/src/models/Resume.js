import mongoose from 'mongoose';

export const RESUME_STATUSES = ['uploaded', 'analyzing', 'analyzed', 'failed'];

// Only extracted text is stored; the original file is not kept (Render disks are ephemeral).
const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true, trim: true, maxlength: 255 },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    extractedText: { type: String, select: false },
    status: { type: String, enum: RESUME_STATUSES, default: 'uploaded' },
    failureReason: String,
    analyzedAt: Date,
  },
  { timestamps: true },
);

resumeSchema.index({ user: 1, createdAt: -1 });

export const Resume = mongoose.model('Resume', resumeSchema);
