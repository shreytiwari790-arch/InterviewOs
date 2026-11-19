import * as adminService from '../services/adminService.js';

export async function getOverview(req, res) {
  res.json(await adminService.getPlatformOverview());
}

export async function listUsers(req, res) {
  res.json(await adminService.listUsers(req.validatedQuery));
}

export async function updateUser(req, res) {
  const user = await adminService.updateUser(req.user, req.params.userId, req.body);
  res.json({ user });
}
