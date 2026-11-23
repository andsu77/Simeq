const request = require('supertest');
const app = require('../server');

test('não autenticado', async () => {
    const res = await request(app).get('/api/manutencoes');
    expect(res.statusCode).toBe(401);
});