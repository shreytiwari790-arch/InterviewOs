import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { signedInAgent, startTestServer } from './setup.js';

describe('admin API', () => {
  let server, admin, candidate;
  before(async () => {
    server = await startTestServer();
    admin = await signedInAgent(server.app, { name: 'Admin', email: 'admin@example.com', role: 'admin' });
    candidate = await signedInAgent(server.app, { name: 'Rahul Sharma', email: 'rahul@example.com' });
    await signedInAgent(server.app, { name: 'Meera Iyer', email: 'meera@example.com' });
  });
  after(() => server.stop());

  it('blocks candidates from every admin route', async () => {
    await candidate.agent.get('/api/admin/overview').expect(403);
    await candidate.agent.get('/api/admin/users').expect(403);
    await candidate.agent.patch(`/api/admin/users/${admin.user.id}`).send({ role: 'candidate' }).expect(403);
  });

  it('returns platform overview counts', async () => {
    const { body } = await admin.agent.get('/api/admin/overview').expect(200);
    assert.deepEqual(body.users, { total: 3, newThisWeek: 3, admins: 1, candidates: 2 });
    assert.deepEqual(body.interviews, { total: 0, completed: 0, inProgress: 0 });
    assert.equal(body.averageScore, null);
    assert.equal(body.recentUsers[0].passwordHash, undefined);
  });

  it('lists, searches and filters users with pagination', async () => {
    const all = await admin.agent.get('/api/admin/users?limit=2').expect(200);
    assert.equal(all.body.users.length, 2);
    assert.deepEqual(all.body.pagination, { page: 1, limit: 2, total: 3, totalPages: 2 });

    const search = await admin.agent.get('/api/admin/users?search=MEERA').expect(200);
    assert.deepEqual(
      search.body.users.map((user) => user.email),
      ['meera@example.com'],
    );

    const regexInjection = await admin.agent.get('/api/admin/users?search=.*').expect(200);
    assert.equal(regexInjection.body.users.length, 0, 'search text is matched literally');

    await admin.agent.get('/api/admin/users?role=superuser').expect(400);
  });

  it('deactivates a user, which ends their session, and prevents self-changes', async () => {
    await admin.agent.patch(`/api/admin/users/${candidate.user.id}`).send({ isActive: false }).expect(200);
    await candidate.agent.get('/api/auth/me').expect(401);

    await admin.agent.patch(`/api/admin/users/${admin.user.id}`).send({ role: 'candidate' }).expect(400);
    await admin.agent.patch(`/api/admin/users/${candidate.user.id}`).send({}).expect(400);
    await admin.agent.patch('/api/admin/users/not-an-id').send({ isActive: true }).expect(400);
    await admin.agent.patch('/api/admin/users/64b7f0c2a1b2c3d4e5f60718').send({ isActive: true }).expect(404);
  });
});
