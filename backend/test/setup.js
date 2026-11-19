import { MongoMemoryServer } from 'mongodb-memory-server-core';

/** Starts an in-memory MongoDB and returns the app plus a cleanup function. */
export async function startTestServer() {
  const mongo = await MongoMemoryServer.create();

  Object.assign(process.env, {
    NODE_ENV: 'test',
    MONGODB_URI: mongo.getUri(),
    JWT_SECRET: 'test-secret-that-is-definitely-longer-than-32-chars',
    CLIENT_URL: 'http://localhost:5173',
  });

  const { connectDatabase, disconnectDatabase } = await import('../src/config/db.js');
  const { createApp } = await import('../src/app.js');
  await connectDatabase(process.env.MONGODB_URI);

  return {
    app: createApp(),
    async stop() {
      await disconnectDatabase();
      await mongo.stop();
    },
  };
}

/** Registers (or creates with a role) a user and returns a supertest agent holding their session. */
export async function signedInAgent(app, { name = 'Test User', email, password = 'secure123', role = 'candidate' }) {
  const request = (await import('supertest')).default;
  const agent = request.agent(app);

  if (role === 'candidate') {
    const res = await agent.post('/api/auth/register').send({ name, email, password }).expect(201);
    return { agent, user: res.body.user };
  }

  const { User } = await import('../src/models/User.js');
  const { hashPassword } = await import('../src/services/authService.js');
  await User.create({ name, email, role, passwordHash: await hashPassword(password) });
  const res = await agent.post('/api/auth/login').send({ email, password }).expect(200);
  return { agent, user: res.body.user };
}
