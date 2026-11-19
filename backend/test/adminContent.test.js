import { after, before, describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { fakeAiResponse } from './fakeAi.js';
import { signedInAgent, startTestServer } from './setup.js';

async function waitFor(check, timeout = 5000) {
  const deadline = Date.now() + timeout;
  for (;;) {
    const value = await check();
    if (value) return value;
    if (Date.now() > deadline) throw new Error('waitFor timed out');
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

const roleInput = (companyId) => ({
  company: companyId,
  roleName: 'Graduate Engineer',
  track: 'Campus',
  experienceLevel: 'fresher',
  difficulty: 'medium',
  durationMinutes: 30,
  totalQuestions: 10,
  categoryDistribution: [
    { category: 'mcq', weight: 50 },
    { category: 'core_cs', weight: 50 },
  ],
  topics: ['OOP', 'DBMS', 'OOP'],
  questionTypes: ['single_choice', 'short_answer'],
  sources: [{ label: 'Careers page', url: 'https://example.com/careers', reliability: 'official' }],
  lastVerifiedAt: '2026-11-01',
});

describe('admin content, question bank, integrity, statistics and PDF', () => {
  let server, admin, candidate, aiMock, companyId, blueprintId;

  before(async () => {
    server = await startTestServer();
    process.env.OPENAI_API_KEY = 'test-key';
    const { aiClient } = await import('../src/services/aiClient.js');
    aiMock = mock.method(aiClient, 'generateStructured', async ({ schemaName, user }) =>
      fakeAiResponse(schemaName, user),
    );
    admin = await signedInAgent(server.app, { name: 'Admin', email: 'admin@example.com', role: 'admin' });
    candidate = await signedInAgent(server.app, { name: 'Ravi Kumar', email: 'ravi@example.com' });
  });
  after(() => server.stop());

  it('keeps admin content routes admin-only', async () => {
    await candidate.agent.get('/api/admin/companies').expect(403);
    await candidate.agent.post('/api/admin/question-bank').send({}).expect(403);
    await candidate.agent.get('/api/admin/statistics').expect(403);
  });

  it('creates and edits companies with validation and unique slugs', async () => {
    await admin.agent.post('/api/admin/companies').send({ name: 'X', accentColor: 'teal' }).expect(400);
    const { body } = await admin.agent
      .post('/api/admin/companies')
      .send({ name: 'Wipro Technologies', industry: 'IT services', accentColor: '#341c53' })
      .expect(201);
    companyId = body.company.id;
    assert.equal(body.company.slug, 'wipro-technologies');
    await admin.agent.post('/api/admin/companies').send({ name: 'Wipro Technologies' }).expect(409);

    const updated = await admin.agent
      .patch(`/api/admin/companies/${companyId}`)
      .send({ description: 'Elite NTH and Turbo tracks.' })
      .expect(200);
    assert.equal(updated.body.company.description, 'Elite NTH and Turbo tracks.');
  });

  it('creates role tracks with validated distributions', async () => {
    await admin.agent
      .post('/api/admin/blueprints')
      .send({ ...roleInput(companyId), categoryDistribution: [{ category: 'mcq', weight: 0 }] })
      .expect(400);
    await admin.agent
      .post('/api/admin/blueprints')
      .send({ ...roleInput(companyId), questionTypes: ['short_answer'] })
      .expect(400);

    const { body } = await admin.agent.post('/api/admin/blueprints').send(roleInput(companyId)).expect(201);
    blueprintId = body.blueprint.id;
    assert.equal(body.blueprint.slug, 'wipro-technologies-graduate-engineer');
    assert.deepEqual(body.blueprint.topics, ['OOP', 'DBMS'], 'duplicate topics removed');

    const list = await admin.agent.get(`/api/admin/companies/${companyId}/blueprints`).expect(200);
    assert.equal(list.body.blueprints.length, 1);
    const all = await admin.agent.get('/api/admin/blueprints').expect(200);
    assert.equal(all.body.blueprints[0].company.name, 'Wipro Technologies');

    const candidateView = await candidate.agent.get('/api/companies/wipro-technologies').expect(200);
    assert.equal(candidateView.body.roles[0].roleName, 'Graduate Engineer');
  });

  it('validates bank questions and mixes them into generated interviews', async () => {
    await admin.agent
      .post('/api/admin/question-bank')
      .send({
        blueprint: blueprintId,
        category: 'mcq',
        topic: 'OOP',
        type: 'short_answer',
        prompt: 'What is polymorphism in OOP?',
      })
      .expect(400);
    await admin.agent
      .post('/api/admin/question-bank')
      .send({
        blueprint: blueprintId,
        category: 'mcq',
        topic: 'OOP',
        type: 'single_choice',
        prompt: 'Which principle hides internal state?',
        options: [{ text: 'Encapsulation' }, { text: 'Inheritance' }],
        correctOptionIndexes: [0, 1],
      })
      .expect(400);

    for (const prompt of [
      'Which principle hides internal state behind methods?',
      'Which keyword creates an object in Java?',
    ]) {
      await admin.agent
        .post('/api/admin/question-bank')
        .send({
          blueprint: blueprintId,
          category: 'mcq',
          topic: 'OOP',
          type: 'single_choice',
          prompt,
          options: [{ text: 'Encapsulation' }, { text: 'new' }, { text: 'Polymorphism' }],
          correctOptionIndexes: [0],
          explanation: 'Encapsulation bundles data with methods.',
        })
        .expect(201);
    }
    const bank = await admin.agent.get(`/api/admin/question-bank?blueprint=${blueprintId}`).expect(200);
    assert.equal(bank.body.pagination.total, 2);
    assert.deepEqual(bank.body.questions[0].correctOptionIds, ['a']);

    const { body } = await candidate.agent
      .post('/api/interviews')
      .send({ blueprintId, totalQuestions: 10 })
      .expect(202);
    const session = await waitFor(async () => {
      const res = await candidate.agent.get(`/api/interviews/${body.interview.id}`);
      return res.body.interview.status === 'ready' && res.body;
    });
    assert.equal(session.questions.length, 10);
    const bankPrompts = session.questions.filter((q) => /hides internal state|creates an object/.test(q.prompt));
    assert.equal(bankPrompts.length, 1, '30% of 5 MCQs = 1 bank question');

    const generationCall = aiMock.mock.calls.findLast((call) => call.arguments[0].schemaName === 'mock_interview');
    assert.match(
      generationCall.arguments[0].user,
      /"category": "mcq",\n\s+"count": 4/,
      'AI is asked only for the remaining MCQs',
    );
  });

  it('records integrity events separately from the score and builds a PDF', async () => {
    const { body: list } = await candidate.agent.get('/api/interviews').expect(200);
    const interviewId = list.interviews[0].id;
    await candidate.agent.post(`/api/interviews/${interviewId}/start`).expect(200);

    await candidate.agent
      .post(`/api/interviews/${interviewId}/integrity-events`)
      .send({ events: [{ type: 'teleported', occurredAt: new Date() }] })
      .expect(400);
    const now = Date.now();
    await candidate.agent
      .post(`/api/interviews/${interviewId}/integrity-events`)
      .send({
        events: [
          { type: 'tab_hidden', occurredAt: new Date(now), questionNumber: 2 },
          { type: 'tab_visible', occurredAt: new Date(now + 3000), questionNumber: 2 },
          { type: 'fullscreen_exited', occurredAt: new Date(now + 4000) },
        ],
      })
      .expect(201);

    const stranger = await signedInAgent(server.app, { email: 'stranger@example.com' });
    await stranger.agent
      .post(`/api/interviews/${interviewId}/integrity-events`)
      .send({ events: [{ type: 'tab_hidden', occurredAt: new Date() }] })
      .expect(404);

    await candidate.agent.post(`/api/interviews/${interviewId}/finish`).expect(202);
    await waitFor(
      async () => (await candidate.agent.get(`/api/interviews/${interviewId}`)).body.interview.status === 'completed',
    );

    const report = await candidate.agent.get(`/api/interviews/${interviewId}/report`).expect(200);
    assert.equal(report.body.integrity.attentionSignals, 2);
    assert.equal(
      report.body.report.overallScore,
      0,
      'unanswered interview scores zero regardless of integrity signals',
    );

    const pdf = await candidate.agent
      .get(`/api/interviews/${interviewId}/report/pdf`)
      .buffer(true)
      .parse((res, callback) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => callback(null, Buffer.concat(chunks)));
      });
    assert.equal(pdf.status, 200);
    assert.equal(pdf.headers['content-type'], 'application/pdf');
    assert.match(pdf.headers['content-disposition'], /interviewos-wipro-technologies-graduate-engineer-report\.pdf/);
    assert.equal(pdf.body.subarray(0, 5).toString(), '%PDF-');
    await stranger.agent.get(`/api/interviews/${interviewId}/report/pdf`).expect(404);

    const stats = await admin.agent.get('/api/admin/statistics').expect(200);
    assert.equal(stats.body.totals.completed, 1);
    assert.equal(stats.body.activity.length, 30);
    assert.equal(stats.body.scoreDistribution[0].count, 1);
    assert.equal(stats.body.integrity.recentSignals[0].signals, 2);
    assert.equal(stats.body.integrity.recentSignals[0].candidate, 'Ravi Kumar');

    const detail = await admin.agent.get(`/api/admin/interviews/${interviewId}/integrity`).expect(200);
    assert.equal(detail.body.integrity.timeline.length, 3);
  });

  it('protects data on delete', async () => {
    await admin.agent.delete(`/api/admin/companies/${companyId}`).expect(409);
    await admin.agent.delete(`/api/admin/blueprints/${blueprintId}`).expect(409);
    await admin.agent.patch(`/api/admin/blueprints/${blueprintId}`).send({ isActive: false }).expect(200);
    const candidateView = await candidate.agent.get('/api/companies').expect(200);
    assert.ok(
      !candidateView.body.companies.some((c) => c.slug === 'wipro-technologies'),
      'inactive tracks are hidden from candidates',
    );

    const empty = await admin.agent.post('/api/admin/companies').send({ name: 'Empty Co' }).expect(201);
    await admin.agent.delete(`/api/admin/companies/${empty.body.company.id}`).expect(204);
  });
});
