import mongoose from 'mongoose';
import { Interview } from '../models/Interview.js';
import { InterviewReport } from '../models/InterviewReport.js';
import { Resume } from '../models/Resume.js';
import { User } from '../models/User.js';
import { getLatestProfile } from './resumeService.js';

const RECENT_LIMIT = 5;
const TREND_LIMIT = 10;
const TOPIC_REPORT_LIMIT = 10; // Topic strengths are based on the most recent reports only.
const STRONG_TOPIC_THRESHOLD = 70;
const WEAK_TOPIC_THRESHOLD = 60;
const COMPANY_LIMIT = 6;
const ACTIVITY_DAYS = 35; // Enough for a four-week calendar in any time zone.
const DAY_MS = 24 * 60 * 60 * 1000;

function summarizeTopics(reports) {
  const totals = new Map();
  for (const { topicScores } of reports) {
    for (const { topic, score } of topicScores) {
      const entry = totals.get(topic) ?? { sum: 0, count: 0 };
      totals.set(topic, { sum: entry.sum + score, count: entry.count + 1 });
    }
  }

  const averages = [...totals].map(([topic, { sum, count }]) => ({
    topic,
    score: Math.round(sum / count),
    attempts: count,
  }));

  return {
    strong: averages
      .filter((t) => t.score >= STRONG_TOPIC_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5),
    weak: averages
      .filter((t) => t.score < WEAK_TOPIC_THRESHOLD)
      .sort((a, b) => a.score - b.score)
      .slice(0, 5),
  };
}

/** Average score per question category (MCQ, Core CS, HR…), weakest first. */
function summarizeCategories(reports) {
  const totals = new Map();
  for (const { categoryScores } of reports) {
    for (const { category, score } of categoryScores) {
      const entry = totals.get(category) ?? { sum: 0, count: 0 };
      totals.set(category, { sum: entry.sum + score, count: entry.count + 1 });
    }
  }
  return [...totals]
    .map(([category, { sum, count }]) => ({ category, score: Math.round(sum / count), attempts: count }))
    .sort((a, b) => a.score - b.score);
}

function buildNextSteps({ resume, activeInterview, completedCount, weakTopics }) {
  const steps = [];

  if (activeInterview) {
    steps.push({
      action: 'resume_interview',
      title: 'Finish your interview in progress',
      interviewId: activeInterview.id,
    });
  }
  if (!resume) {
    steps.push({ action: 'upload_resume', title: 'Upload your resume so questions match your experience' });
  } else if (resume.status === 'failed') {
    steps.push({ action: 'upload_resume', title: 'Your last resume could not be analysed. Try uploading it again' });
  }
  if (completedCount === 0 && !activeInterview) {
    steps.push({ action: 'start_interview', title: 'Take your first mock interview' });
  }
  for (const { topic } of weakTopics.slice(0, 2)) {
    steps.push({ action: 'review_topic', title: `Revise ${topic}`, topic });
  }
  if (completedCount > 0 && !activeInterview) {
    steps.push({ action: 'start_interview', title: 'Practise again to track your progress' });
  }

  return steps.slice(0, 4);
}

export async function getCandidateDashboard(userId) {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [resume, activeInterview, recentCompleted, [scoreSummary], recentReports, profile] = await Promise.all([
    Resume.findOne({ user: userId }).sort({ createdAt: -1 }).select('fileName status updatedAt'),
    Interview.findOne({ user: userId, status: { $in: ['ready', 'in_progress'] } })
      .sort({ createdAt: -1 })
      .select('company role status startedAt expiresAt'),
    Interview.find({ user: userId, status: 'completed' })
      .sort({ completedAt: -1 })
      .limit(TREND_LIMIT)
      .select('company role config overallScore completedAt'),
    Interview.aggregate([
      { $match: { user: userObjectId, status: 'completed', overallScore: { $type: 'number' } } },
      {
        $group: { _id: null, count: { $sum: 1 }, average: { $avg: '$overallScore' }, best: { $max: '$overallScore' } },
      },
    ]),
    InterviewReport.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(TOPIC_REPORT_LIMIT)
      .select('interview topicScores categoryScores weakTopics recommendations createdAt'),
    getLatestProfile(userId),
  ]);

  const [companyPerformance, recentActivity, waitlistUser] = await Promise.all([
    Interview.aggregate([
      { $match: { user: userObjectId, status: 'completed', overallScore: { $type: 'number' } } },
      {
        $group: {
          _id: '$company.name',
          attempts: { $sum: 1 },
          average: { $avg: '$overallScore' },
          best: { $max: '$overallScore' },
          lastCompletedAt: { $max: '$completedAt' },
        },
      },
      { $sort: { lastCompletedAt: -1 } },
      { $limit: COMPANY_LIMIT },
    ]),
    Interview.find({
      user: userId,
      status: 'completed',
      completedAt: { $gte: new Date(Date.now() - ACTIVITY_DAYS * DAY_MS) },
    }).select('completedAt'),
    User.findById(userId).select('proWaitlistJoinedAt'),
  ]);

  const completedCount = scoreSummary?.count ?? 0;
  const topics = summarizeTopics(recentReports);
  const latestReport = recentReports[0];
  const latestReportInterview = latestReport
    ? recentCompleted.find((interview) => interview.id === latestReport.interview.toString())
    : null;

  return {
    resume: resume && { id: resume.id, fileName: resume.fileName, status: resume.status, updatedAt: resume.updatedAt },
    profile: profile && {
      summary: profile.summary,
      experienceLevel: profile.estimatedExperienceLevel,
      topSkills: [...profile.programmingLanguages, ...profile.frameworks, ...profile.tools].slice(0, 10),
      focusAreas: profile.suggestedFocusAreas.slice(0, 3).map(({ topic }) => topic),
    },
    stats: {
      completedInterviews: completedCount,
      averageScore: scoreSummary ? Math.round(scoreSummary.average) : null,
      bestScore: scoreSummary ? Math.round(scoreSummary.best) : null,
    },
    activeInterview: activeInterview && {
      id: activeInterview.id,
      company: activeInterview.company.name,
      role: activeInterview.role.name,
      status: activeInterview.status,
      startedAt: activeInterview.startedAt,
      expiresAt: activeInterview.expiresAt,
    },
    recentInterviews: recentCompleted.slice(0, RECENT_LIMIT).map((interview) => ({
      id: interview.id,
      company: interview.company.name,
      role: interview.role.name,
      difficulty: interview.config?.difficulty,
      score: interview.overallScore,
      completedAt: interview.completedAt,
    })),
    scoreTrend: recentCompleted
      .filter((interview) => typeof interview.overallScore === 'number')
      .reverse()
      .map((interview) => ({
        completedAt: interview.completedAt,
        score: interview.overallScore,
        company: interview.company.name,
      })),
    topics,
    categories: summarizeCategories(recentReports),
    companies: companyPerformance.map(({ _id, attempts, average, best, lastCompletedAt }) => ({
      company: _id,
      attempts,
      averageScore: Math.round(average),
      bestScore: Math.round(best),
      lastCompletedAt,
    })),
    latestAdvice: latestReport
      ? {
          interviewId: latestReport.interview.toString(),
          company: latestReportInterview?.company.name ?? null,
          role: latestReportInterview?.role.name ?? null,
          createdAt: latestReport.createdAt,
          weakTopics: latestReport.weakTopics.slice(0, 5),
          recommendations: latestReport.recommendations.slice(0, 4),
        }
      : null,
    // Raw timestamps: the browser groups them into days in the candidate's own time zone.
    activity: recentActivity.map(({ completedAt }) => completedAt),
    proWaitlist: {
      joined: Boolean(waitlistUser?.proWaitlistJoinedAt),
      joinedAt: waitlistUser?.proWaitlistJoinedAt ?? null,
    },
    nextSteps: buildNextSteps({ resume, activeInterview, completedCount, weakTopics: topics.weak }),
  };
}
