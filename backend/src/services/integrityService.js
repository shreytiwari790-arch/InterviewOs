import { Interview } from '../models/Interview.js';
import { ProctoringEvent } from '../models/ProctoringEvent.js';
import { AppError } from '../utils/AppError.js';

const MAX_EVENTS_PER_INTERVIEW = 500;
const CLOCK_SKEW_MS = 60 * 1000;

// Event types that suggest the candidate left the interview window. Shown as signals only.
const ATTENTION_EVENTS = ['tab_hidden', 'window_blurred', 'fullscreen_exited', 'went_offline'];

export async function recordIntegrityEvents(userId, interviewId, events) {
  const interview = await Interview.findOne({ _id: interviewId, user: userId }).select('status startedAt');
  if (!interview) throw new AppError(404, 'Interview not found');
  if (!['ready', 'in_progress'].includes(interview.status)) return { recorded: 0 };

  const existing = await ProctoringEvent.countDocuments({ interview: interview._id });
  const room = Math.max(0, MAX_EVENTS_PER_INTERVIEW - existing);
  const now = Date.now();

  // Client timestamps are kept for ordering but clamped to a plausible window.
  const documents = events.slice(0, room).map((event) => ({
    interview: interview._id,
    user: userId,
    type: event.type,
    questionNumber: event.questionNumber,
    occurredAt: new Date(Math.min(Math.max(event.occurredAt.getTime(), now - 6 * 60 * 60 * 1000), now + CLOCK_SKEW_MS)),
  }));
  if (documents.length) await ProctoringEvent.insertMany(documents);
  return { recorded: documents.length };
}

export async function getIntegritySummary(interviewId) {
  const [counts, timeline] = await Promise.all([
    ProctoringEvent.aggregate([
      { $match: { interview: interviewId } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]),
    ProctoringEvent.find({ interview: interviewId })
      .sort({ occurredAt: 1 })
      .limit(100)
      .select('type occurredAt questionNumber -_id'),
  ]);
  const byType = Object.fromEntries(counts.map(({ _id, count }) => [_id, count]));
  return {
    byType,
    attentionSignals: ATTENTION_EVENTS.reduce((sum, type) => sum + (byType[type] ?? 0), 0),
    timeline,
  };
}
