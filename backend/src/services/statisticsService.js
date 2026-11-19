import { Interview } from '../models/Interview.js';
import { InterviewReport } from '../models/InterviewReport.js';
import { ProctoringEvent } from '../models/ProctoringEvent.js';
import { Resume } from '../models/Resume.js';
import { User } from '../models/User.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const TREND_DAYS = 30;
const SCORE_BUCKETS = [0, 40, 60, 75, 90, 101];
const BUCKET_LABELS = ['0–39', '40–59', '60–74', '75–89', '90–100'];
const ATTENTION_EVENTS = ['tab_hidden', 'window_blurred', 'fullscreen_exited', 'went_offline'];

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

export async function getPlatformStatistics() {
  const since = new Date(Date.now() - (TREND_DAYS - 1) * DAY_MS);
  since.setUTCHours(0, 0, 0, 0);

  const [
    users,
    resumesAnalyzed,
    statusCounts,
    perDay,
    scoreBuckets,
    topTracks,
    categoryAverages,
    eventCounts,
    flagged,
    [scoreAverage],
  ] = await Promise.all([
    User.countDocuments({ role: 'candidate' }),
    Resume.countDocuments({ status: 'analyzed' }),
    Interview.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Interview.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          started: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        },
      },
    ]),
    Interview.aggregate([
      { $match: { status: 'completed', overallScore: { $type: 'number' } } },
      {
        $bucket: {
          groupBy: '$overallScore',
          boundaries: SCORE_BUCKETS,
          default: 'other',
          output: { count: { $sum: 1 } },
        },
      },
    ]),
    Interview.aggregate([
      {
        $group: {
          _id: { company: '$company.name', role: '$role.name' },
          interviews: { $sum: 1 },
          averageScore: { $avg: '$overallScore' },
        },
      },
      { $sort: { interviews: -1 } },
      { $limit: 8 },
    ]),
    InterviewReport.aggregate([
      { $unwind: '$categoryScores' },
      { $group: { _id: '$categoryScores.category', average: { $avg: '$categoryScores.score' }, reports: { $sum: 1 } } },
      { $sort: { average: 1 } },
    ]),
    ProctoringEvent.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    ProctoringEvent.aggregate([
      { $match: { type: { $in: ATTENTION_EVENTS } } },
      { $group: { _id: '$interview', signals: { $sum: 1 }, lastAt: { $max: '$occurredAt' } } },
      { $sort: { lastAt: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'interviews', localField: '_id', foreignField: '_id', as: 'interview' } },
      { $unwind: '$interview' },
      { $lookup: { from: 'users', localField: 'interview.user', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
    ]),
    Interview.aggregate([
      { $match: { status: 'completed', overallScore: { $type: 'number' } } },
      { $group: { _id: null, average: { $avg: '$overallScore' } } },
    ]),
  ]);

  const byStatus = Object.fromEntries(statusCounts.map(({ _id, count }) => [_id, count]));
  const totalInterviews = Object.values(byStatus).reduce((sum, count) => sum + count, 0);
  const completed = byStatus.completed ?? 0;
  const startedOrMore = totalInterviews - (byStatus.generating ?? 0) - (byStatus.ready ?? 0) - (byStatus.failed ?? 0);

  const perDayByKey = new Map(perDay.map((day) => [day._id, day]));
  const activity = Array.from({ length: TREND_DAYS }, (_, index) => {
    const key = dayKey(new Date(since.getTime() + index * DAY_MS));
    const day = perDayByKey.get(key);
    return { date: key, started: day?.started ?? 0, completed: day?.completed ?? 0 };
  });

  return {
    totals: {
      candidates: users,
      resumesAnalyzed,
      interviews: totalInterviews,
      completed,
      completionRate: startedOrMore > 0 ? Math.round((completed / startedOrMore) * 100) : null,
      averageScore: scoreAverage ? Math.round(scoreAverage.average) : null,
    },
    activity,
    scoreDistribution: BUCKET_LABELS.map((label, index) => ({
      label,
      count: scoreBuckets.find((bucket) => bucket._id === SCORE_BUCKETS[index])?.count ?? 0,
    })),
    topTracks: topTracks.map(({ _id, interviews, averageScore: avg }) => ({
      company: _id.company,
      role: _id.role,
      interviews,
      averageScore: avg == null ? null : Math.round(avg),
    })),
    categoryAverages: categoryAverages.map(({ _id, average, reports }) => ({
      category: _id,
      average: Math.round(average),
      reports,
    })),
    integrity: {
      eventsByType: eventCounts.map(({ _id, count }) => ({ type: _id, count })),
      recentSignals: flagged.map(({ interview, user, signals, lastAt }) => ({
        interviewId: interview._id.toString(),
        candidate: user.name,
        company: interview.company.name,
        role: interview.role.name,
        status: interview.status,
        overallScore: interview.overallScore ?? null,
        signals,
        lastAt,
      })),
    },
  };
}
