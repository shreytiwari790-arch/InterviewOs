import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

let openai;

function getOpenAI() {
  if (!env.OPENAI_API_KEY) {
    throw new AppError(
      503,
      'AI features are not configured yet. Add OPENAI_API_KEY to backend/.env and restart the server.',
    );
  }
  openai ??= new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: env.OPENAI_BASE_URL || undefined,
    timeout: 120_000,
    maxRetries: 2,
  });
  return openai;
}

/**
 * Sends a prompt and returns the model output parsed and validated against a Zod schema.
 * Exposed through `aiClient` so tests can replace it without calling OpenAI.
 */
async function generateStructured({ schema, schemaName, system, user }) {
  let completion;
  try {
    completion = await getOpenAI().chat.completions.parse({
      model: env.OPENAI_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: zodResponseFormat(schema, schemaName),
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error(`[ai] ${schemaName} request failed:`, error.message);
    throw new AppError(502, 'The AI service could not complete this request. Please try again in a moment.');
  }

  const message = completion.choices[0]?.message;
  if (message?.refusal) throw new AppError(502, 'The AI declined to process this request.');
  if (!message?.parsed) throw new AppError(502, 'The AI returned an incomplete response. Please try again.');
  return message.parsed;
}

/** Reads text from images (e.g. a scanned resume) with a vision-capable model. Returns plain text. */
async function transcribeImages({ system, instruction, imageDataUrls }) {
  let completion;
  try {
    completion = await getOpenAI().chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [
        { role: 'system', content: system },
        {
          role: 'user',
          content: [
            { type: 'text', text: instruction },
            ...imageDataUrls.map((url) => ({ type: 'image_url', image_url: { url, detail: 'high' } })),
          ],
        },
      ],
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('[ai] image transcription failed:', error.message);
    throw new AppError(502, 'We could not read the text in this file. Please try again in a moment.');
  }
  return completion.choices[0]?.message?.content?.trim() ?? '';
}

export const aiClient = { generateStructured, transcribeImages };
