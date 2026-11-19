import { after, before, describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { startTestServer } from './setup.js';

const candidate = { name: 'Asha Verma', email: 'Asha@Example.com', password: 'secure123' };

describe('authentication', () => {
  let server;
  before(async () => {
    server = await startTestServer();
  });
  after(() => server.stop());

  it('registers a user, starts a session and never returns the password hash', async () => {
    const agent = request.agent(server.app);
    const res = await agent.post('/api/auth/register').send(candidate).expect(201);

    assert.equal(res.body.user.email, 'asha@example.com');
    assert.equal(res.body.user.role, 'candidate');
    assert.equal(res.body.user.passwordHash, undefined);
    assert.match(res.headers['set-cookie'][0], /interviewos_session=.+HttpOnly/);

    const me = await agent.get('/api/auth/me').expect(200);
    assert.equal(me.body.user.email, 'asha@example.com');
  });

  it('rejects duplicate emails and weak passwords with field details', async () => {
    const duplicate = await request(server.app).post('/api/auth/register').send(candidate).expect(409);
    assert.equal(duplicate.body.details[0].field, 'email');

    const weak = await request(server.app)
      .post('/api/auth/register')
      .send({ ...candidate, email: 'new@example.com', password: 'short' })
      .expect(400);
    assert.ok(weak.body.details.some((detail) => detail.field === 'password'));
  });

  it('ignores role escalation attempts during registration', async () => {
    const res = await request(server.app)
      .post('/api/auth/register')
      .send({ name: 'Mallory', email: 'mallory@example.com', password: 'secure123', role: 'admin' })
      .expect(201);
    assert.equal(res.body.user.role, 'candidate');
  });

  it('rejects wrong credentials and NoSQL operator payloads', async () => {
    await request(server.app)
      .post('/api/auth/login')
      .send({ ...candidate, password: 'wrong1234' })
      .expect(401);
    await request(server.app)
      .post('/api/auth/login')
      .send({ email: { $gt: '' }, password: { $gt: '' } })
      .expect(400);
  });

  it('logs in, protects /me and logs out', async () => {
    await request(server.app).get('/api/auth/me').expect(401);

    const agent = request.agent(server.app);
    await agent.post('/api/auth/login').send(candidate).expect(200);
    await agent.get('/api/auth/me').expect(200);

    await agent.post('/api/auth/logout').expect(204);
    await agent.get('/api/auth/me').expect(401);
  });

  it('resets a password, invalidates old sessions and rejects reused links', async () => {
    const oldSession = request.agent(server.app);
    await oldSession.post('/api/auth/login').send(candidate).expect(200);

    const logged = [];
    const infoSpy = mock.method(console, 'info', (line) => logged.push(line));
    const forgot = await request(server.app)
      .post('/api/auth/forgot-password')
      .send({ email: candidate.email })
      .expect(200);
    infoSpy.mock.restore();

    const unknown = await request(server.app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nobody@example.com' })
      .expect(200);
    assert.equal(unknown.body.message, forgot.body.message, 'response must not reveal whether an email exists');

    const token = logged.join('\n').match(/token=([a-f0-9]{64})/)?.[1];
    assert.ok(token, 'reset link should be logged while email is not configured');

    await request(server.app).post('/api/auth/reset-password').send({ token, password: 'newpass456' }).expect(200);
    await request(server.app).post('/api/auth/reset-password').send({ token, password: 'another789' }).expect(400);

    await oldSession.get('/api/auth/me').expect(401);
    await request(server.app).post('/api/auth/login').send(candidate).expect(401);
    await request(server.app)
      .post('/api/auth/login')
      .send({ ...candidate, password: 'newpass456' })
      .expect(200);
  });

  it('reports health and returns JSON for unknown routes', async () => {
    const health = await request(server.app).get('/api/health').expect(200);
    assert.equal(health.body.databaseConnected, true);
    await request(server.app).get('/api/does-not-exist').expect(404);
  });
});
