import mongoose from 'mongoose';

export const INTEGRITY_EVENT_TYPES = [
  'fullscreen_entered',
  'fullscreen_exited',
  'tab_hidden',
  'tab_visible',
  'window_blurred',
  'window_focused',
  'went_offline',
  'came_online',
  'camera_permission_granted',
  'camera_permission_denied',
  'microphone_permission_granted',
  'microphone_permission_denied',
];

// Integrity signals only. They are never used in the knowledge score and are not proof of cheating.
const proctoringEventSchema = new mongoose.Schema(
  {
    interview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: INTEGRITY_EVENT_TYPES, required: true },
    occurredAt: { type: Date, required: true },
    questionNumber: Number,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

proctoringEventSchema.index({ interview: 1, occurredAt: 1 });
proctoringEventSchema.index({ type: 1, createdAt: -1 });

export const ProctoringEvent = mongoose.model('ProctoringEvent', proctoringEventSchema);
