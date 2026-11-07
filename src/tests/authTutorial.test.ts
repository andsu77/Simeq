// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
jest.mock('../config/prisma', () => ({
  usuario: {
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn()
  }
}));

const express = require('express');
const request = require('supertest');
const prisma = require('../config/prisma');
const authRouter = require('../routes/auth').default;
const usersRouter = require('../routes/usuarios');

let sessionUserId = 7;
let sessionUserRole = 'Operador';
const app = express();
app.use(express.json());
app.use((req, _res, next) => {
  req.session = { userId: sessionUserId, userRole: sessionUserRole };
  next();
});
app.use('/api/auth', authRouter);
app.use('/api/usuarios', usersRouter);

beforeEach(() => {
  jest.clearAllMocks();
  sessionUserId = 7;
  sessionUserRole = 'Operador';
});

test('exibe boas-vindas apenas quando o estado PENDING é iniciado, sem reiniciar após atualização', async () => {
  prisma.usuario.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
  prisma.usuario.findUnique.mockResolvedValue({ tutorialStatus: 'STARTED', tutorialCompletedAt: null });

  const first = await request(app).post('/api/auth/tutorial/start');
  sessionUserId = 12;
  const second = await request(app).post('/api/auth/tutorial/start');

  expect(first.statusCode).toBe(200);
  expect(first.body).toMatchObject({ status: 'STARTED', showWelcome: true });
  expect(second.body).toMatchObject({ status: 'STARTED', showWelcome: false });
  expect(prisma.usuario.updateMany.mock.calls[0][0].where.id).toBe(7);
  expect(prisma.usuario.updateMany.mock.calls[1][0].where.id).toBe(12);
});

test('persiste conclusão por usuário e não permite estado inválido', async () => {
  prisma.usuario.updateMany.mockResolvedValue({ count: 1 });

  const invalid = await request(app).post('/api/auth/tutorial/state').send({ status: 'PENDING' });
  const completed = await request(app).post('/api/auth/tutorial/state').send({ status: 'COMPLETED' });

  expect(invalid.statusCode).toBe(400);
  expect(completed.statusCode).toBe(200);
  expect(prisma.usuario.updateMany).toHaveBeenCalledWith(expect.objectContaining({
    where: { id: 7, tutorialStatus: { in: ['PENDING', 'STARTED'] } },
    data: expect.objectContaining({ tutorialStatus: 'COMPLETED', tutorialCompletedAt: expect.any(Date) })
  }));
});

test('persiste quando o usuário pula o tutorial', async () => {
  prisma.usuario.updateMany.mockResolvedValue({ count: 1 });

  const response = await request(app)
    .post('/api/auth/tutorial/state')
    .send({ status: 'SKIPPED' });

  expect(response.statusCode).toBe(200);
  expect(prisma.usuario.updateMany).toHaveBeenCalledWith(expect.objectContaining({
    where: { id: 7, tutorialStatus: { in: ['PENDING', 'STARTED'] } },
    data: { tutorialStatus: 'SKIPPED', tutorialCompletedAt: null }
  }));
});

test('salva tema claro junto das preferências individuais do usuário', async () => {
  prisma.usuario.update.mockResolvedValue({});

  const response = await request(app)
    .patch('/api/auth/preferences')
    .send({
      theme: 'light',
      compactDashboard: true,
      showDashboardOrders: false,
      showDashboardAlerts: true
    });

  expect(response.statusCode).toBe(200);
  expect(prisma.usuario.update).toHaveBeenCalledWith({
    where: { id: 7 },
    data: {
      preferencesJson: JSON.stringify({
        theme: 'light',
        compactDashboard: true,
        showDashboardOrders: false,
        showDashboardAlerts: true
      })
    }
  });
});

test('recusa valor de tema inválido nas preferências', async () => {
  const response = await request(app)
    .patch('/api/auth/preferences')
    .send({
      theme: 'blue',
      compactDashboard: false,
      showDashboardOrders: true,
      showDashboardAlerts: true
    });

  expect(response.statusCode).toBe(400);
  expect(prisma.usuario.update).not.toHaveBeenCalled();
});

test('recusa ativação do módulo Arduino por quem não é gerente', async () => {
  const response = await request(app)
    .patch('/api/auth/users/12/iot-access')
    .send({ enabled: true });

  expect(response.statusCode).toBe(403);
  expect(prisma.usuario.update).not.toHaveBeenCalled();
});

test('impede usuário comum de alterar cargos ou liberar acessos via gestão de usuários', async () => {
  const response = await request(app)
    .put('/api/usuarios/7')
    .send({ nome: 'Operador', email: 'operador@simeq.com', cargo: 'Gerente' });

  expect(response.statusCode).toBe(403);
  expect(prisma.usuario.update).not.toHaveBeenCalled();
});

test('gerente pode liberar o módulo Arduino para um usuário', async () => {
  sessionUserRole = 'Gerente';
  prisma.usuario.update.mockResolvedValue({ id: 12, iotEnabled: true });

  const response = await request(app)
    .patch('/api/auth/users/12/iot-access')
    .send({ enabled: true });

  expect(response.statusCode).toBe(200);
  expect(response.body.iotEnabled).toBe(true);
  expect(prisma.usuario.update).toHaveBeenCalledWith({
    where: { id: 12 },
    data: { iotEnabled: true },
    select: { id: true, iotEnabled: true }
  });
});
