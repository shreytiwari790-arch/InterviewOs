import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { startTestServer } from './setup.js';

describe('contact form', () => {
  let server;
  before(async () => {
    server = await startTestServer();
  });
  after(() => server.stop());

  it('stores a valid message', async () => {
    await request(server.app)
      .post('/api/contact')
      .send({
        name: 'Priya',
        email: 'Priya@Example.com',
        topic: 'institution',
        message: 'We would like accounts for our batch.',
      })
      .expect(201);

    const { ContactMessage } = await import('../src/models/ContactMessage.js');
    const saved = await ContactMessage.findOne({ email: 'priya@example.com' });
    assert.equal(saved.topic, 'institution');
    assert.equal(saved.status, 'new');
  });

  it('rejects invalid input with field details', async () => {
    const res = await request(server.app)
      .post('/api/contact')
      .send({ name: 'P', email: 'nope', message: 'short' })
      .expect(400);
    assert.deepEqual(res.body.details.map((d) => d.field).sort(), ['email', 'message', 'name']);
  });

  it('silently drops honeypot submissions', async () => {
    await request(server.app)
      .post('/api/contact')
      .send({ name: 'Bot', email: 'bot@example.com', message: 'Buy cheap things now!!!', website: 'http://spam' })
      .expect(201);
    const { ContactMessage } = await import('../src/models/ContactMessage.js');
    assert.equal(await ContactMessage.countDocuments({ email: 'bot@example.com' }), 0);
  });
});
