// Creates or updates the admin account from ADMIN_EMAIL / ADMIN_PASSWORD.
// Company and role profiles are added to this script in Phase 4.
import { env } from '../src/config/env.js';
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { hashPassword } from '../src/services/authService.js';

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
} finally {
  await disconnectDatabase();
}
