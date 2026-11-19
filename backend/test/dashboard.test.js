import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { signedInAgent, startTestServer } from './setup.js';

describe('candidate dashboard and profile', () => {
  let server;
  before(async () => {
    server = await startTestServer();
  });
  after(() => server.stop());

  it('returns an honest empty state for a new candidate', async () => {
    const { agent } = await signedInAgent(server.app, { email: 'new@example.com' });
    const { body } = await agent.get('/api/dashboard').expect(200);

    assert.equal(body.resume, null);
    assert.deepEqual(body.stats, { completedInterviews: 0, averageScore: null, bestScore: null });
    assert.deepEqual(body.recentInterviews, []);
    assert.deepEqual(body.scoreTrend, []);
    assert.deepEqual(
      body.nextSteps.map((step) => step.action),
      ['upload_resume', 'start_interview'],
    );
  });

  it('aggregates only the signed-in candidate’s interviews and reports', async () => {
    const { agent, user } = await signedInAgent(server.app, { email: 'busy@example.com' });
    const { user: otherUser } = await signedInAgent(server.app, { email: 'other@example.com' });
    const { Interview } = await import('../src/models/Interview.js');
    const { InterviewReport } = await import('../src/models/InterviewReport.js');
    const { Resume } = await import('../src/models/Resume.js');

    await Resume.create({
      user: user.id,
      fileName: 'cv.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1000,
      status: 'analyzed',
    });
    const scored = [
      {
        score: 60,
        topics: [
          { topic: 'DBMS', score: 40 },
          { topic: 'OOP', score: 90 },
        ],
      },
      {
        score: 80,
        topics: [
          { topic: 'DBMS', score: 50 },
          { topic: 'OOP', score: 80 },
        ],
      },
    ];
    for (const [index, { score, topics }] of scored.entries()) {
      const interview = await Interview.create({
        user: user.id,
        company: { name: 'TCS' },
        role: { name: 'Digital' },
        status: 'completed',
        overallScore: score,
        completedAt: new Date(Date.now() - (2 - index) * 60_000),
      });
      await InterviewReport.create({
        interview: interview.id,
        user: user.id,
        overallScore: score,
        topicScores: topics,
      });
    }
    await Interview.create({
      user: otherUser.id,
      company: { name: 'X' },
      role: { name: 'Y' },
      status: 'completed',
      overallScore: 5,
    });

    const { body } = await agent.get('/api/dashboard').expect(200);
    assert.equal(body.resume.status, 'analyzed');
    assert.deepEqual(body.stats, { completedInterviews: 2, averageScore: 70, bestScore: 80 });
    assert.deepEqual(
      body.scoreTrend.map((point) => point.score),
      [60, 80],
      'trend is chronological',
    );
    assert.equal(body.recentInterviews[0].score, 80, 'recent list is newest first');
    assert.deepEqual(body.topics.strong, [{ topic: 'OOP', score: 85, attempts: 2 }]);
    assert.deepEqual(body.topics.weak, [{ topic: 'DBMS', score: 45, attempts: 2 }]);
    assert.ok(body.nextSteps.some((step) => step.action === 'review_topic' && step.topic === 'DBMS'));
  });

  it('requires authentication', async () => {
    const request = (await import('supertest')).default;
    await request(server.app).get('/api/dashboard').expect(401);
  });

  it('updates the profile name', async () => {
    const { agent } = await signedInAgent(server.app, { email: 'rename@example.com' });
    const { body } = await agent
      .patch('/api/users/me')
      .send({ name: '  Priya Nair ', email: 'hijack@example.com' })
      .expect(200);
    assert.equal(body.user.name, 'Priya Nair');
    assert.equal(body.user.email, 'rename@example.com', 'email cannot be changed through profile update');
  });

  it('changes the password, keeps this session and signs out others', async () => {
    const request = (await import('supertest')).default;
    const { agent } = await signedInAgent(server.app, { email: 'pw@example.com' });
    const otherDevice = request.agent(server.app);
    await otherDevice.post('/api/auth/login').send({ email: 'pw@example.com', password: 'secure123' }).expect(200);

    await agent
      .patch('/api/users/me/password')
      .send({ currentPassword: 'wrong999', newPassword: 'fresh1234' })
      .expect(400);
    await agent
      .patch('/api/users/me/password')
      .send({ currentPassword: 'secure123', newPassword: 'fresh1234' })
      .expect(200);

    await agent.get('/api/auth/me').expect(200);
    await otherDevice.get('/api/auth/me').expect(401);
    await request(server.app)
      .post('/api/auth/login')
      .send({ email: 'pw@example.com', password: 'fresh1234' })
      .expect(200);
  });
});
