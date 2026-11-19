import { after, before, describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { fakeAiResponse } from './fakeAi.js';
import { signedInAgent, startTestServer } from './setup.js';

// Smallest valid PDF containing a text line long enough to pass the extraction threshold.
function buildPdf(text) {
  const lines = text.split('. ').map((line) => `(${line}) Tj 0 -14 Td`);
  const stream = `BT /F1 10 Tf 40 700 Td ${lines.join(' ')} ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let body = '%PDF-1.4\n';
  const offsets = objects.map((object, index) => {
    const offset = body.length;
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
    return offset;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(body, 'latin1');
}

const RESUME_TEXT =
  'Asha Verma - Computer Science student at ABC Institute of Technology. Skills JavaScript Java React Express MongoDB Git. Project ShopKart MERN e-commerce store with JWT authentication and payment integration. Intern at Startup Labs.';

async function waitFor(check, { timeout = 5000, interval = 50 } = {}) {
  const deadline = Date.now() + timeout;
  for (;;) {
    const value = await check();
    if (value) return value;
    if (Date.now() > deadline) throw new Error('waitFor timed out');
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

describe('resume → interview → report journey', () => {
  let server, candidate, stranger, aiMock;

  before(async () => {
    server = await startTestServer();
    process.env.OPENAI_API_KEY = 'test-key';
    const { aiClient } = await import('../src/services/aiClient.js');
    aiMock = mock.method(aiClient, 'generateStructured', async ({ schemaName, user }) =>
      fakeAiResponse(schemaName, user),
    );

    const { CompanyProfile } = await import('../src/models/CompanyProfile.js');
    const { InterviewBlueprint } = await import('../src/models/InterviewBlueprint.js');
    const { seedCompanyProfiles } = await import('../src/utils/seedData.js');
    await seedCompanyProfiles({ CompanyProfile, InterviewBlueprint });

    candidate = await signedInAgent(server.app, { name: 'Asha Verma', email: 'asha@example.com' });
    stranger = await signedInAgent(server.app, { name: 'Other', email: 'other@example.com' });
  });
  after(() => server.stop());

  it('lists seeded companies and their role tracks', async () => {
    const { body } = await candidate.agent.get('/api/companies').expect(200);
    assert.equal(body.companies.length, 7);
    const tcs = await candidate.agent.get('/api/companies/tcs').expect(200);
    assert.deepEqual(tcs.body.roles.map((role) => role.roleName).sort(), ['Digital', 'Ninja', 'Prime']);
    assert.equal(tcs.body.roles[0].sources[0].reliability, 'unverified');
  });

  it('rejects wrong file types and disguised files', async () => {
    await candidate.agent.post('/api/resumes').attach('resume', Buffer.from('hello'), 'cv.txt').expect(415);
    await candidate.agent
      .post('/api/resumes')
      .attach('resume', Buffer.from('not really a pdf'), { filename: 'cv.pdf', contentType: 'application/pdf' })
      .expect(415);
  });

  let resumeId;
  it('uploads a PDF, extracts text and stores the AI profile', async () => {
    const { body } = await candidate.agent
      .post('/api/resumes')
      .attach('resume', buildPdf(RESUME_TEXT), { filename: 'asha-cv.pdf', contentType: 'application/pdf' })
      .expect(201);
    resumeId = body.resume.id;
    assert.equal(body.resume.status, 'analyzing');
    assert.equal(body.resume.extractedText, undefined, 'raw text is never returned');

    const analysed = await waitFor(async () => {
      const res = await candidate.agent.get(`/api/resumes/${resumeId}`).expect(200);
      return res.body.resume.status === 'analyzed' && res.body;
    });
    assert.deepEqual(analysed.profile.programmingLanguages, ['JavaScript', 'Java']);
    assert.equal(analysed.profile.projects[0].name, 'ShopKart');

    const analysisCall = aiMock.mock.calls.find((call) => call.arguments[0].schemaName === 'resume_analysis');
    assert.match(
      analysisCall.arguments[0].user,
      /<resume>[\s\S]*ShopKart[\s\S]*<\/resume>/,
      'resume text is delimited as data',
    );

    await stranger.agent.get(`/api/resumes/${resumeId}`).expect(404);
  });

  let interviewId;
  it('generates an interview without exposing answer keys', async () => {
    const tcs = await candidate.agent.get('/api/companies/tcs').expect(200);
    const digital = tcs.body.roles.find((role) => role.roleName === 'Digital');

    await candidate.agent.post('/api/interviews').send({ blueprintId: digital.id, totalQuestions: 3 }).expect(400);
    const { body } = await candidate.agent
      .post('/api/interviews')
      .send({ blueprintId: digital.id, totalQuestions: 10, durationMinutes: 30, difficulty: 'medium' })
      .expect(202);
    interviewId = body.interview.id;
    assert.equal(body.interview.status, 'generating');
    assert.equal(
      body.interview.categoryPlan.reduce((sum, c) => sum + c.count, 0),
      10,
    );

    const session = await waitFor(async () => {
      const res = await candidate.agent.get(`/api/interviews/${interviewId}`).expect(200);
      return res.body.interview.status === 'ready' && res.body;
    });
    assert.equal(session.questions.length, 10);
    const serialised = JSON.stringify(session);
    for (const secret of ['correctOptionIds', 'modelAnswer', 'explanation', 'rubric', 'expectedKeyConcepts']) {
      assert.ok(!serialised.includes(secret), `${secret} must not be sent during the interview`);
    }
    await stranger.agent.get(`/api/interviews/${interviewId}`).expect(404);
  });

  it('runs the interview: start, autosave, submit, lock, finish', async () => {
    await candidate.agent.put(`/api/interviews/${interviewId}/answers/000000000000000000000000`).send({}).expect(409);
    const before = await candidate.agent.get('/api/dashboard').expect(200);
    assert.equal(before.body.activeInterview.status, 'ready', 'dashboard reports a prepared interview');

    const { body: started } = await candidate.agent.post(`/api/interviews/${interviewId}/start`).expect(200);
    assert.equal(started.interview.status, 'in_progress');
    assert.ok(new Date(started.interview.expiresAt) > new Date());

    const { body: session } = await candidate.agent.get(`/api/interviews/${interviewId}`).expect(200);
    for (const question of session.questions) {
      const answer =
        question.type === 'single_choice'
          ? { selectedOptionIds: ['b'] }
          : question.type === 'multi_select'
            ? { selectedOptionIds: ['a', 'b'] }
            : { answerText: 'Draft' };
      await candidate.agent.put(`/api/interviews/${interviewId}/answers/${question.id}`).send(answer).expect(200);
      const final = question.type.endsWith('answer') ? { answerText: 'My full explanation of the idea.' } : answer;
      await candidate.agent
        .put(`/api/interviews/${interviewId}/answers/${question.id}`)
        .send({ ...final, submit: true })
        .expect(200);
    }

    const first = session.questions[0];
    await candidate.agent
      .put(`/api/interviews/${interviewId}/answers/${first.id}`)
      .send({ answerText: 'change', submit: true })
      .expect(409);

    const resumed = await candidate.agent.get(`/api/interviews/${interviewId}`).expect(200);
    assert.equal(resumed.body.responses.length, session.questions.length, 'answers survive a reload');

    await candidate.agent.get(`/api/interviews/${interviewId}/report`).expect(409);
    await candidate.agent.post(`/api/interviews/${interviewId}/finish`).expect(202);
  });

  it('scores deterministically and returns a full report', async () => {
    await waitFor(async () => {
      const res = await candidate.agent.get(`/api/interviews/${interviewId}`).expect(200);
      return res.body.interview.status === 'completed';
    });
    const { body } = await candidate.agent.get(`/api/interviews/${interviewId}/report`).expect(200);

    const mcq = body.answers.find((a) => a.type === 'single_choice');
    assert.equal(mcq.score, mcq.maxScore, 'correct single choice gets full marks');
    const multi = body.answers.find((a) => a.type === 'multi_select');
    assert.equal(multi.score, 0, 'one right and one wrong pick cancels out');
    const written = body.answers.find((a) => a.type === 'short_answer');
    // (8*0.4 + 9*0.2 + 6*0.25 + 8*0.15) / 10 * 5 marks = 3.85 -> 4 (rounded to the nearest half mark)
    assert.equal(written.score, 4);
    assert.ok(written.modelAnswer && mcq.correctOptionIds.length, 'answer keys are visible after completion');

    const expected = Math.round(
      (body.answers.reduce((s, a) => s + a.score, 0) / body.answers.reduce((s, a) => s + a.maxScore, 0)) * 100,
    );
    assert.equal(body.report.overallScore, expected);
    assert.ok(body.report.categoryScores.length >= 3);
    assert.equal(body.report.recommendations.length, 2);

    const dashboard = await candidate.agent.get('/api/dashboard').expect(200);
    assert.equal(dashboard.body.stats.completedInterviews, 1);
    assert.equal(dashboard.body.profile.topSkills[0], 'JavaScript');

    const history = await candidate.agent.get('/api/interviews').expect(200);
    assert.equal(history.body.interviews[0].overallScore, expected);
  });

  it('auto-submits when time runs out', async () => {
    const tcs = await candidate.agent.get('/api/companies/tcs').expect(200);
    const { body } = await candidate.agent
      .post('/api/interviews')
      .send({ blueprintId: tcs.body.roles[0].id, totalQuestions: 5 })
      .expect(202);
    await waitFor(
      async () => (await candidate.agent.get(`/api/interviews/${body.interview.id}`)).body.interview.status === 'ready',
    );
    await candidate.agent.post(`/api/interviews/${body.interview.id}/start`).expect(200);

    const { Interview } = await import('../src/models/Interview.js');
    await Interview.updateOne({ _id: body.interview.id }, { expiresAt: new Date(Date.now() - 60_000) });

    const session = await candidate.agent.get(`/api/interviews/${body.interview.id}`).expect(200);
    assert.equal(session.body.interview.status, 'evaluating');
  });

  it('marks AI failures clearly and allows retry', async () => {
    aiMock.mock.mockImplementation(async () => {
      const { AppError } = await import('../src/utils/AppError.js');
      throw new AppError(503, 'AI features are not configured yet.');
    });
    const tcs = await candidate.agent.get('/api/companies/tcs').expect(200);
    const { body } = await candidate.agent
      .post('/api/interviews')
      .send({ blueprintId: tcs.body.roles[1].id })
      .expect(202);
    const failed = await waitFor(async () => {
      const res = await candidate.agent.get(`/api/interviews/${body.interview.id}`);
      return res.body.interview.status === 'failed' && res.body.interview;
    });
    assert.equal(failed.failedStage, 'generation');
    assert.match(failed.failureReason, /not configured/);

    aiMock.mock.mockImplementation(async ({ schemaName, user }) => fakeAiResponse(schemaName, user));
    await candidate.agent.post(`/api/interviews/${body.interview.id}/retry`).expect(202);
    await waitFor(
      async () => (await candidate.agent.get(`/api/interviews/${body.interview.id}`)).body.interview.status === 'ready',
    );
  });
});

describe('MCQ scoring rules', () => {
  it('gives partial credit for multi-select and none for wrong single choice', async () => {
    process.env.MONGODB_URI ??= 'mongodb://unused';
    process.env.JWT_SECRET ??= 'x'.repeat(40);
    process.env.CLIENT_URL ??= 'http://localhost:5173';
    const { scoreChoiceAnswer } = await import('../src/services/evaluationService.js');
    const multi = { type: 'multi_select', marks: 3, correctOptionIds: ['a', 'c'] };
    assert.deepEqual(scoreChoiceAnswer(multi, ['a', 'c']), { score: 3, isCorrect: true });
    assert.deepEqual(scoreChoiceAnswer(multi, ['a']), { score: 1.5, isCorrect: false });
    assert.deepEqual(scoreChoiceAnswer(multi, ['a', 'b', 'c', 'd']), { score: 0, isCorrect: false });
    const single = { type: 'single_choice', marks: 2, correctOptionIds: ['b'] };
    assert.deepEqual(scoreChoiceAnswer(single, ['a']), { score: 0, isCorrect: false });
  });
});
