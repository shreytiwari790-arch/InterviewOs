// Creates or updates the admin account and inserts any missing company preparation profiles.
import { env } from '../src/config/env.js';
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { CompanyProfile } from '../src/models/CompanyProfile.js';
import { InterviewBlueprint } from '../src/models/InterviewBlueprint.js';
import { User } from '../src/models/User.js';
import { hashPassword } from '../src/services/authService.js';
import { seedCompanyProfiles } from '../src/utils/seedData.js';

async function seedAdmin() {
  const email = env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = env.ADMIN_PASSWORD;

  if (!email || !password || password.length < 8) {
    console.warn('Skipping admin: set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 characters) in backend/.env');
    return;
  }

  const passwordHash = await hashPassword(password);
  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = 'admin';
    existing.isActive = true;
    existing.passwordHash = passwordHash;
    existing.sessionVersion += 1;
    await existing.save();
    console.log(`Admin updated: ${email}`);
  } else {
    await User.create({ name: 'Administrator', email, passwordHash, role: 'admin' });
    console.log(`Admin created: ${email}`);
  }
}

await connectDatabase(env.MONGODB_URI);
try {
  await seedAdmin();
  const created = await seedCompanyProfiles({ CompanyProfile, InterviewBlueprint });
  console.log(`Company profiles: ${created} new role track(s) added`);
} finally {
  await disconnectDatabase();
}
