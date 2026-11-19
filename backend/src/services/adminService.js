import { Interview } from '../models/Interview.js';
import { Resume } from '../models/Resume.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

const DAY_MS = 24 * 60 * 60 * 1000;

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function getPlatformOverview() {
  const sevenDaysAgo = new Date(Date.now() - 7 * DAY_MS);

  const [totalUsers, newUsersThisWeek, admins, resumesAnalyzed, interviewsByStatus, [scores], recentUsers] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.countDocuments({ role: 'admin' }),
      Resume.countDocuments({ status: 'analyzed' }),
      Interview.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Interview.aggregate([
        { $match: { status: 'completed', overallScore: { $type: 'number' } } },
        { $group: { _id: null, average: { $avg: '$overallScore' } } },
      ]),
      User.find().sort({ createdAt: -1 }).limit(5),
    ]);

  const statusCounts = Object.fromEntries(interviewsByStatus.map(({ _id, count }) => [_id, count]));

  return {
    users: { total: totalUsers, newThisWeek: newUsersThisWeek, admins, candidates: totalUsers - admins },
    resumesAnalyzed,
    interviews: {
      total: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
      completed: statusCounts.completed ?? 0,
      inProgress: statusCounts.in_progress ?? 0,
    },
    averageScore: scores ? Math.round(scores.average) : null,
    recentUsers,
  };
}

export async function listUsers({ search, role, status, page, limit }) {
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.isActive = status === 'active';
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: pattern }, { email: pattern }];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return { users, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}

export async function updateUser(adminUser, userId, changes) {
  if (adminUser.id === userId) {
    throw new AppError(400, 'You cannot change your own role or status');
  }

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'User not found');

  if (changes.role !== undefined) user.role = changes.role;
  if (changes.isActive !== undefined) {
    if (user.isActive && !changes.isActive) user.sessionVersion += 1; // Sign the user out immediately.
    user.isActive = changes.isActive;
  }

  await user.save();
  return user;
}
