import * as companyService from '../services/companyService.js';

export async function listCompanies(req, res) {
  res.json({ companies: await companyService.listCompanies() });
}

export async function getCompany(req, res) {
  res.json(await companyService.getCompanyWithRoles(req.params.slug));
}
