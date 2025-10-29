const request = require('supertest');
const app = require('../server'); // express app

describe('Admin flows', () => {
  let token;
  test('Admin login returns token', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({ email: 'admin@example.com', password: 'Secret123!' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test('Create institution', async () => {
    const res = await request(app)
      .post('/api/admin/institutions')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test University' });
    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
  });
});
