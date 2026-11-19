import { CompanyProfile } from '../models/CompanyProfile.js';
import { InterviewBlueprint } from '../models/InterviewBlueprint.js';
import { AppError } from '../utils/AppError.js';

const PUBLIC_BLUEPRINT_FIELDS =
  'slug roleName track region summary experienceLevel difficulty durationMinutes totalQuestions categoryDistribution topics questionTypes sources lastVerifiedAt';

export async function listCompanies() {
  const [companies, roleCounts] = await Promise.all([
    CompanyProfile.find({ isActive: true }).sort({ name: 1 }),
    InterviewBlueprint.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$company', roles: { $push: '$roleName' } } },
    ]),
  ]);
  const rolesByCompany = new Map(roleCounts.map(({ _id, roles }) => [_id.toString(), roles]));

  return companies
    .map((company) => ({ ...company.toJSON(), roles: rolesByCompany.get(company.id) ?? [] }))
    .filter((company) => company.roles.length > 0);
}

export async function getCompanyWithRoles(slug) {
  const company = await CompanyProfile.findOne({ slug, isActive: true });
  if (!company) throw new AppError(404, 'Company not found');

  const roles = await InterviewBlueprint.find({ company: company._id, isActive: true })
    .sort({ roleName: 1 })
    .select(PUBLIC_BLUEPRINT_FIELDS);
  return { company, roles };
}

export async function getActiveBlueprint(blueprintId) {
  const blueprint = await InterviewBlueprint.findOne({ _id: blueprintId, isActive: true }).populate('company');
  if (!blueprint || !blueprint.company?.isActive)
    throw new AppError(404, 'This interview track is no longer available');
  return blueprint;
}
