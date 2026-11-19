import { getCandidateDashboard } from '../services/dashboardService.js';

export async function getDashboard(req, res) {
  res.json(await getCandidateDashboard(req.user.id));
}
