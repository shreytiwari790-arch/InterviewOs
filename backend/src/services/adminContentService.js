import { BankQuestion } from '../models/BankQuestion.js';
import { CompanyProfile } from '../models/CompanyProfile.js';
import { Interview } from '../models/Interview.js';
import { InterviewBlueprint } from '../models/InterviewBlueprint.js';
import { AppError } from '../utils/AppError.js';
import { slugify } from '../utils/slugify.js';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const OPTION_LETTERS = 'abcdef';

async function findCompany(companyId) {
  const company = await CompanyProfile.findById(companyId);
  if (!company) throw new AppError(404, 'Company not found');
  return company;
}

async function findBlueprint(blueprintId) {
  const blueprint = await InterviewBlueprint.findById(blueprintId);
  if (!blueprint) throw new AppError(404, 'Role track not found');
  return blueprint;
}

async function assertSlugAvailable(Model, slug, ignoreId) {
  const existing = await Model.findOne({ slug }).select('_id');
  if (existing && existing.id !== ignoreId) {
    throw new AppError(409, 'This slug is already in use', [{ field: 'slug', message: 'Choose a different slug' }]);
  }
}

// ---- Companies ---------------------------------------------------------------

export async function listCompaniesForAdmin() {
  const [companies, counts] = await Promise.all([
    CompanyProfile.find().sort({ name: 1 }),
    InterviewBlueprint.aggregate([
      { $group: { _id: '$company', total: { $sum: 1 }, active: { $sum: { $cond: ['$isActive', 1, 0] } } } },
    ]),
  ]);
  const countByCompany = new Map(counts.map(({ _id, total, active }) => [_id.toString(), { total, active }]));
  return companies.map((company) => ({
    ...company.toJSON(),
    roleCount: countByCompany.get(company.id) ?? { total: 0, active: 0 },
  }));
}

export async function createCompany(input) {
  const slug = input.slug ?? slugify(input.name);
  await assertSlugAvailable(CompanyProfile, slug);
  return CompanyProfile.create({ ...input, slug });
}

export async function updateCompany(companyId, changes) {
  const company = await findCompany(companyId);
  if (changes.slug && changes.slug !== company.slug)
    await assertSlugAvailable(CompanyProfile, changes.slug, company.id);
  Object.assign(company, changes);
  await company.save();
  return company;
}

export async function deleteCompany(companyId) {
  const company = await findCompany(companyId);
  if (await InterviewBlueprint.exists({ company: company._id })) {
    throw new AppError(
      409,
      'Remove or deactivate this company’s role tracks first, or deactivate the company instead.',
    );
  }
  await company.deleteOne();
}

// ---- Role tracks (interview blueprints) --------------------------------------

export async function listBlueprintsForCompany(companyId) {
  const company = await findCompany(companyId);
  const blueprints = await InterviewBlueprint.find({ company: company._id }).sort({ roleName: 1 });
  const questionCounts = await BankQuestion.aggregate([
    { $match: { blueprint: { $in: blueprints.map((b) => b._id) } } },
    { $group: { _id: '$blueprint', count: { $sum: 1 } } },
  ]);
  const countById = new Map(questionCounts.map(({ _id, count }) => [_id.toString(), count]));
  return {
    company,
    blueprints: blueprints.map((blueprint) => ({
      ...blueprint.toJSON(),
      bankQuestionCount: countById.get(blueprint.id) ?? 0,
    })),
  };
}

export async function listAllBlueprints() {
  const [blueprints, questionCounts] = await Promise.all([
    InterviewBlueprint.find().populate('company', 'name slug accentColor isActive').sort({ updatedAt: -1 }),
    BankQuestion.aggregate([{ $group: { _id: '$blueprint', count: { $sum: 1 } } }]),
  ]);
  const countById = new Map(questionCounts.map(({ _id, count }) => [_id.toString(), count]));
  return blueprints
    .filter((blueprint) => blueprint.company)
    .map((blueprint) => ({ ...blueprint.toJSON(), bankQuestionCount: countById.get(blueprint.id) ?? 0 }))
    .sort((a, b) => a.company.name.localeCompare(b.company.name) || a.roleName.localeCompare(b.roleName));
}

export async function createBlueprint(input) {
  const company = await findCompany(input.company);
  const slug = input.slug ?? slugify(`${company.slug}-${input.roleName}`);
  await assertSlugAvailable(InterviewBlueprint, slug);
  return InterviewBlueprint.create({ ...input, slug, company: company._id });
}

export async function updateBlueprint(blueprintId, changes) {
  const blueprint = await findBlueprint(blueprintId);
  if (changes.slug && changes.slug !== blueprint.slug)
    await assertSlugAvailable(InterviewBlueprint, changes.slug, blueprint.id);
  Object.assign(blueprint, changes);
  await blueprint.save();
  return blueprint;
}

export async function deleteBlueprint(blueprintId) {
  const blueprint = await findBlueprint(blueprintId);
  if (await Interview.exists({ blueprint: blueprint._id })) {
    throw new AppError(
      409,
      'Candidates have taken interviews on this track. Deactivate it instead so their reports stay intact.',
    );
  }
  await BankQuestion.deleteMany({ blueprint: blueprint._id });
  await blueprint.deleteOne();
}

// ---- Question bank -----------------------------------------------------------

function toBankDocument({ options, correctOptionIndexes, ...question }, adminId) {
  const isChoice = question.type === 'single_choice' || question.type === 'multi_select';
  return {
    ...question,
    options: isChoice ? options.map((option, index) => ({ id: OPTION_LETTERS[index], text: option.text })) : [],
    correctOptionIds: isChoice ? [...new Set(correctOptionIndexes)].map((index) => OPTION_LETTERS[index]) : [],
    ...(adminId && { createdBy: adminId }),
  };
}

export async function listBankQuestions({ blueprint, category, search, page, limit }) {
  const filter = {};
  if (blueprint) filter.blueprint = blueprint;
  if (category) filter.category = category;
  if (search)
    filter.$or = [{ prompt: new RegExp(escapeRegex(search), 'i') }, { topic: new RegExp(escapeRegex(search), 'i') }];

  const [questions, total] = await Promise.all([
    BankQuestion.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: 'blueprint', select: 'roleName company', populate: { path: 'company', select: 'name' } }),
    BankQuestion.countDocuments(filter),
  ]);
  return { questions, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}

export async function createBankQuestion(input, adminId) {
  await findBlueprint(input.blueprint);
  return BankQuestion.create(toBankDocument(input, adminId));
}

export async function updateBankQuestion(questionId, input) {
  await findBlueprint(input.blueprint);
  const question = await BankQuestion.findByIdAndUpdate(questionId, toBankDocument(input), {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!question) throw new AppError(404, 'Question not found');
  return question;
}

export async function deleteBankQuestion(questionId) {
  const result = await BankQuestion.deleteOne({ _id: questionId });
  if (result.deletedCount === 0) throw new AppError(404, 'Question not found');
}
