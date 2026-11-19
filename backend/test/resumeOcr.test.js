import { after, before, describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { createCanvas } from '@napi-rs/canvas';
import PDFDocument from 'pdfkit';
import { fakeAiResponse } from './fakeAi.js';
import { signedInAgent, startTestServer } from './setup.js';

// A PDF containing only a picture (like a screenshot saved as PDF): no text layer at all.
function buildImageOnlyPdf() {
  const canvas = createCanvas(600, 800);
  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, 600, 800);
  context.fillStyle = '#1f2330';
  context.fillRect(40, 40, 300, 30);
  const png = canvas.toBuffer('image/png');

  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.image(png, 0, 0, { width: 595 });
    doc.end();
  });
}

const TRANSCRIBED =
  'ALEKS LUDKEE\nFull-Stack Developer\nWORK EXPERIENCE\nFull-Stack Developer, Deloitte, August 2020 - current\n- Designed, developed and modified 25+ software systems\nSKILLS\n- JavaScript\n- React.js\n- Node.js\nEDUCATION\nB.S. Computer Science, University of Tennessee';

async function waitFor(check, timeout = 5000) {
  const deadline = Date.now() + timeout;
  for (;;) {
    const value = await check();
    if (value) return value;
    if (Date.now() > deadline) throw new Error('waitFor timed out');
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

describe('scanned / image-only PDF resumes', () => {
  let server, candidate, transcribe;

  before(async () => {
    server = await startTestServer();
    process.env.OPENAI_API_KEY = 'test-key';
    const { aiClient } = await import('../src/services/aiClient.js');
    mock.method(aiClient, 'generateStructured', async ({ schemaName, user }) => fakeAiResponse(schemaName, user));
    transcribe = mock.method(aiClient, 'transcribeImages', async () => TRANSCRIBED);
    candidate = await signedInAgent(server.app, { email: 'scan@example.com' });
  });
  after(() => server.stop());

  it('reads image-only PDFs with OCR and analyses them', async () => {
    const pdf = await buildImageOnlyPdf();
    const { body } = await candidate.agent
      .post('/api/resumes')
      .attach('resume', pdf, { filename: 'scanned.pdf', contentType: 'application/pdf' })
      .expect(201);

    const call = transcribe.mock.calls[0].arguments[0];
    assert.equal(call.imageDataUrls.length, 1, 'one page rendered');
    assert.match(call.imageDataUrls[0], /^data:image\/png;base64,/);

    await waitFor(
      async () => (await candidate.agent.get(`/api/resumes/${body.resume.id}`)).body.resume.status === 'analyzed',
    );
    const { Resume } = await import('../src/models/Resume.js');
    const stored = await Resume.findById(body.resume.id).select('+extractedText');
    assert.match(stored.extractedText, /Deloitte/, 'transcribed text is what gets analysed');
  });

  it('explains clearly when an image has no readable text', async () => {
    transcribe.mock.mockImplementation(async () => 'NO_READABLE_TEXT');
    const pdf = await buildImageOnlyPdf();
    const res = await candidate.agent
      .post('/api/resumes')
      .attach('resume', pdf, { filename: 'blank.pdf', contentType: 'application/pdf' })
      .expect(422);
    assert.match(res.body.message, /readable text/);
  });
});
