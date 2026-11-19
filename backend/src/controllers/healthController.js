import mongoose from 'mongoose';
import { env } from '../config/env.js';

const startedAt = new Date();

/**
 * Health check for Render and uptime monitors (UptimeRobot, Better Stack, etc.).
 * Returns 200 when the API and database are working and 503 otherwise, so monitors can alert on the status code.
 * Never calls OpenAI and never reveals secrets.
 */
export function getHealth(req, res) {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.set('Cache-Control', 'no-store');
  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'ok' : 'degraded',
    databaseConnected,
    aiConfigured: Boolean(env.OPENAI_API_KEY),
    uptimeSeconds: Math.round(process.uptime()),
    startedAt: startedAt.toISOString(),
    timestamp: new Date().toISOString(),
  });
}
