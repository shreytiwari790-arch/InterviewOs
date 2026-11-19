import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { createApp } from './app.js';

async function start() {
  try {
    await connectDatabase(env.MONGODB_URI);
  } catch (error) {
    console.error('Could not connect to MongoDB. Check MONGODB_URI and your Atlas network access list.');
    console.error(error.message);
    process.exit(1);
  }

  if (!env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY is not set. AI features will return an error until it is configured.');
  }

  const server = createApp().listen(env.PORT, () => {
    console.log(`InterviewOS API running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start();
