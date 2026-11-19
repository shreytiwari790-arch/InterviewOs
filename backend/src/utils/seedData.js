// Starting preparation profiles. They are reasonable practice setups based on commonly reported
// interview structures, NOT official patterns, so every source is marked "unverified" until an
// admin adds real references. Seeding never overwrites profiles an admin has already edited.

const weights = (resume_project, mcq, programming, core_cs, scenario, hr) =>
  Object.entries({ resume_project, mcq, programming, core_cs, scenario, hr })
    .filter(([, weight]) => weight > 0)
    .map(([category, weight]) => ({ category, weight }));

const ALL_TYPES = ['single_choice', 'multi_select', 'short_answer', 'long_answer'];
const unverified = [{ label: 'Preparation profile – not yet verified', url: '', reliability: 'unverified' }];

export const seedCompanies = [
  {
    name: 'TCS',
    slug: 'tcs',
    industry: 'IT services',
    accentColor: '#1d4ed8',
    description:
      'Tata Consultancy Services hires freshers through the National Qualifier Test with Ninja, Digital and Prime tracks.',
    roles: [
      {
        slug: 'tcs-ninja',
        roleName: 'Ninja',
        track: 'Campus / NQT',
        summary: 'Entry-level track focused on fundamentals, aptitude-style MCQs and basic programming.',
        difficulty: 'easy',
        durationMinutes: 45,
        totalQuestions: 15,
        categoryDistribution: weights(15, 35, 20, 15, 5, 10),
        topics: [
          'C / Java / Python basics',
          'OOP',
          'DBMS basics',
          'Operating system basics',
          'Computer networks basics',
        ],
      },
      {
        slug: 'tcs-digital',
        roleName: 'Digital',
        track: 'Campus / NQT',
        summary: 'Higher package track with stronger coding concepts, data structures and core CS.',
        difficulty: 'medium',
        durationMinutes: 60,
        totalQuestions: 20,
        categoryDistribution: weights(15, 25, 25, 20, 5, 10),
        topics: [
          'Data structures',
          'Algorithms & complexity',
          'OOP',
          'DBMS & SQL',
          'Operating systems',
          'Cloud basics',
        ],
      },
      {
        slug: 'tcs-prime',
        roleName: 'Prime',
        track: 'Campus / NQT',
        summary: 'Top track emphasising advanced problem solving, system thinking and deep project discussion.',
        difficulty: 'hard',
        durationMinutes: 75,
        totalQuestions: 20,
        categoryDistribution: weights(20, 15, 30, 20, 10, 5),
        topics: [
          'Advanced data structures',
          'Dynamic programming',
          'System design basics',
          'DBMS internals',
          'Concurrency',
        ],
      },
    ],
  },
  {
    name: 'Infosys',
    slug: 'infosys',
    industry: 'IT services',
    accentColor: '#007cc3',
    description: 'Infosys campus hiring covers Systems Engineer and the higher Specialist Programmer track.',
    roles: [
      {
        slug: 'infosys-systems-engineer',
        roleName: 'Systems Engineer',
        track: 'Campus',
        summary: 'Fundamentals of programming, databases and communication skills.',
        difficulty: 'easy',
        durationMinutes: 45,
        totalQuestions: 15,
        categoryDistribution: weights(15, 35, 20, 15, 5, 10),
        topics: ['Programming fundamentals', 'OOP', 'SQL queries', 'Software engineering basics'],
      },
      {
        slug: 'infosys-specialist-programmer',
        roleName: 'Specialist Programmer',
        track: 'Campus / HackWithInfy',
        summary: 'Strong problem solving, data structures and algorithmic thinking.',
        difficulty: 'hard',
        durationMinutes: 75,
        totalQuestions: 20,
        categoryDistribution: weights(15, 15, 35, 20, 10, 5),
        topics: ['Graphs', 'Dynamic programming', 'Greedy algorithms', 'Complexity analysis', 'DBMS'],
      },
    ],
  },
  {
    name: 'Amazon',
    slug: 'amazon',
    industry: 'Technology',
    accentColor: '#ff9900',
    description: 'Amazon interviews combine technical depth with its Leadership Principles in behavioural questions.',
    roles: [
      {
        slug: 'amazon-sde',
        roleName: 'SDE',
        track: 'SDE I',
        experienceLevel: 'junior',
        summary: 'Data structures, algorithms, low-level design and Leadership Principle stories.',
        difficulty: 'hard',
        durationMinutes: 60,
        totalQuestions: 15,
        categoryDistribution: weights(15, 10, 30, 15, 10, 20),
        topics: ['Arrays & strings', 'Trees & graphs', 'Hashing', 'Object-oriented design', 'Leadership Principles'],
        focusNotes: 'Behavioural questions should map to Amazon Leadership Principles and expect STAR-format answers.',
      },
      {
        slug: 'amazon-frontend-engineer',
        roleName: 'Frontend Engineer',
        track: 'FEE I',
        experienceLevel: 'junior',
        summary: 'JavaScript depth, browser fundamentals, UI architecture and Leadership Principles.',
        difficulty: 'hard',
        durationMinutes: 60,
        totalQuestions: 15,
        categoryDistribution: weights(20, 15, 30, 10, 10, 15),
        topics: [
          'JavaScript internals',
          'DOM & browser rendering',
          'React patterns',
          'Web performance',
          'Accessibility',
        ],
      },
      {
        slug: 'amazon-backend-engineer',
        roleName: 'Backend Engineer',
        track: 'SDE I – backend',
        experienceLevel: 'junior',
        summary: 'APIs, databases, scalability and distributed-systems basics.',
        difficulty: 'hard',
        durationMinutes: 60,
        totalQuestions: 15,
        categoryDistribution: weights(20, 10, 25, 15, 15, 15),
        topics: ['API design', 'Databases & indexing', 'Caching', 'Concurrency', 'Distributed systems basics'],
      },
    ],
  },
  {
    name: 'Google',
    slug: 'google',
    industry: 'Technology',
    accentColor: '#4285f4',
    description: 'Google software engineering interviews focus on algorithms, problem solving and clear communication.',
    roles: [
      {
        slug: 'google-software-engineer',
        roleName: 'Software Engineer',
        track: 'L3 / new grad',
        experienceLevel: 'junior',
        summary: 'Algorithmic problem solving, complexity analysis and "Googleyness" behavioural questions.',
        difficulty: 'hard',
        durationMinutes: 60,
        totalQuestions: 15,
        categoryDistribution: weights(10, 10, 40, 20, 10, 10),
        topics: ['Graphs', 'Dynamic programming', 'Recursion', 'Complexity analysis', 'System design basics'],
      },
    ],
  },
  {
    name: 'Microsoft',
    slug: 'microsoft',
    industry: 'Technology',
    accentColor: '#00a4ef',
    description: 'Microsoft interviews mix coding fundamentals, design thinking and collaboration-focused questions.',
    roles: [
      {
        slug: 'microsoft-software-engineer',
        roleName: 'Software Engineer',
        track: 'SWE / new grad',
        experienceLevel: 'junior',
        summary: 'Problem solving, object-oriented design and growth-mindset behavioural questions.',
        difficulty: 'hard',
        durationMinutes: 60,
        totalQuestions: 15,
        categoryDistribution: weights(15, 10, 35, 20, 10, 10),
        topics: ['Linked lists & trees', 'OOP design', 'Operating systems', 'Debugging', 'Testing'],
      },
    ],
  },
  {
    name: 'Deloitte',
    slug: 'deloitte',
    industry: 'Consulting',
    accentColor: '#86bc25',
    description: 'Deloitte technology roles blend technical fundamentals with consulting and client scenarios.',
    roles: [
      {
        slug: 'deloitte-analyst',
        roleName: 'Analyst',
        track: 'Campus',
        summary: 'Technical basics, analytical reasoning and communication.',
        difficulty: 'medium',
        durationMinutes: 45,
        totalQuestions: 15,
        categoryDistribution: weights(20, 30, 15, 10, 10, 15),
        topics: ['SQL', 'Programming fundamentals', 'Software development lifecycle', 'Cloud basics'],
      },
      {
        slug: 'deloitte-technology-consultant',
        roleName: 'Technology Consultant',
        track: 'Experienced / campus',
        experienceLevel: 'junior',
        summary: 'Solution thinking, client scenarios and technical breadth.',
        difficulty: 'medium',
        durationMinutes: 60,
        totalQuestions: 15,
        categoryDistribution: weights(20, 15, 15, 10, 25, 15),
        topics: ['Requirement analysis', 'Cloud & integration', 'Agile delivery', 'Stakeholder communication'],
      },
    ],
  },
  {
    name: 'Accenture',
    slug: 'accenture',
    industry: 'IT services',
    accentColor: '#a100ff',
    description:
      'Accenture hires freshers as Associate Software Engineers, with an Advanced ASE track for stronger profiles.',
    roles: [
      {
        slug: 'accenture-ase',
        roleName: 'Associate Software Engineer',
        track: 'Campus',
        summary: 'Fundamentals, cognitive-style MCQs and communication.',
        difficulty: 'easy',
        durationMinutes: 45,
        totalQuestions: 15,
        categoryDistribution: weights(15, 40, 15, 15, 5, 10),
        topics: ['Programming fundamentals', 'MS Office & networking basics', 'Pseudo-code', 'OOP'],
      },
      {
        slug: 'accenture-advanced-ase',
        roleName: 'Advanced ASE',
        track: 'Campus',
        summary: 'Stronger coding concepts and data structures for the higher package track.',
        difficulty: 'medium',
        durationMinutes: 60,
        totalQuestions: 20,
        categoryDistribution: weights(15, 25, 25, 20, 5, 10),
        topics: ['Data structures', 'Algorithms', 'DBMS', 'Operating systems', 'Cloud basics'],
      },
    ],
  },
].map((company) => ({
  ...company,
  roles: company.roles.map((role) => ({
    experienceLevel: 'fresher',
    region: 'India',
    questionTypes: ALL_TYPES,
    sources: unverified,
    lastVerifiedAt: null,
    ...role,
  })),
}));

/** Inserts missing companies and roles. Existing documents (possibly edited by admins) are left untouched. */
export async function seedCompanyProfiles({ CompanyProfile, InterviewBlueprint }) {
  let created = 0;
  for (const { roles, ...companyFields } of seedCompanies) {
    const company = await CompanyProfile.findOneAndUpdate(
      { slug: companyFields.slug },
      { $setOnInsert: companyFields },
      { upsert: true, returnDocument: 'after' },
    );
    for (const role of roles) {
      const result = await InterviewBlueprint.updateOne(
        { slug: role.slug },
        { $setOnInsert: { ...role, company: company._id } },
        { upsert: true },
      );
      created += result.upsertedCount;
    }
  }
  return created;
}
