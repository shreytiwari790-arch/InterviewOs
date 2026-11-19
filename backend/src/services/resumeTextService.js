import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { RESUME_OCR_INSTRUCTION, RESUME_OCR_SYSTEM } from '../prompts/resumeOcrPrompt.js';
import { AppError } from '../utils/AppError.js';
import { aiClient } from './aiClient.js';

const MIN_TEXT_LENGTH = 150;
const MAX_OCR_PAGES = 3;
const OCR_IMAGE_WIDTH = 1400; // Wide enough for small resume fonts, small enough to keep requests light.
const MAX_TEXT_LENGTH = 20_000; // Enough for long resumes while keeping AI cost bounded.

function hasExpectedSignature(buffer, kind) {
  if (kind === 'pdf') return buffer.subarray(0, 5).toString('latin1') === '%PDF-';
  return buffer[0] === 0x50 && buffer[1] === 0x4b; // DOCX files are ZIP archives ("PK")
}

function normalise(text) {
  return text
    .replace(/[^\S\n]+/g, ' ')
    .replace(/[\u0000-\u0008\u000B-\u001F]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_TEXT_LENGTH);
}

async function renderPdfPages(buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    const { pages } = await parser.getScreenshot({
      first: MAX_OCR_PAGES,
      desiredWidth: OCR_IMAGE_WIDTH,
      imageDataUrl: true,
      imageBuffer: false,
    });
    return pages.map((page) => page.dataUrl);
  } finally {
    await parser.destroy();
  }
}

/** Image-only PDFs (scans, screenshots saved as PDF) have no text layer, so their pages are read by a vision model. */
async function readScannedPdf(buffer) {
  const imageDataUrls = await renderPdfPages(buffer);
  const text = await aiClient.transcribeImages({
    system: RESUME_OCR_SYSTEM,
    instruction: RESUME_OCR_INSTRUCTION,
    imageDataUrls,
  });
  if (text.includes('NO_READABLE_TEXT')) return '';
  return text;
}

/**
 * Extracts plain text from a PDF or DOCX buffer and rejects files that are not what they claim to be.
 * PDFs without a text layer fall back to OCR.
 */
export async function extractResumeText(buffer, kind) {
  if (!hasExpectedSignature(buffer, kind)) {
    throw new AppError(415, 'This file does not look like a valid PDF or DOCX document');
  }

  let text;
  try {
    if (kind === 'pdf') {
      const parser = new PDFParse({ data: buffer });
      try {
        text = (await parser.getText()).text.replace(/-- \d+ of \d+ --/g, '');
      } finally {
        await parser.destroy();
      }
    } else {
      text = (await mammoth.extractRawText({ buffer })).value;
    }
  } catch {
    throw new AppError(422, 'We could not read this file. It may be password-protected or damaged.');
  }

  let cleaned = normalise(text ?? '');
  if (cleaned.length < MIN_TEXT_LENGTH && kind === 'pdf') {
    cleaned = normalise(await readScannedPdf(buffer));
  }
  if (cleaned.length < MIN_TEXT_LENGTH) {
    throw new AppError(
      422,
      'We could not find readable text in this file. Try a clearer PDF or a DOCX version of your resume.',
    );
  }
  return cleaned;
}
