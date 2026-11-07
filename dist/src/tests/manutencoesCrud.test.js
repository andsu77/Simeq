"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const mockMaintenance = {
    findUnique: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn()
};
const mockEquipment = { update: jest.fn() };
const mockTransaction = { manutencao: mockMaintenance, equipamento: mockEquipment };
jest.mock('../config/prisma', () => ({
    $transaction: jest.fn(),
    manutencao: mockMaintenance,
    equipamento: mockEquipment
}));
const express = require('express');
const request = require('supertest');
const prisma = require('../config/prisma');
const manutencoesRouter = require('../routes/manutencoes');
const app = express();
app.use(express.json());
app.use((req, _res, next) => {
    req.session = { userId: 1 };
    next();
});
app.use('/api/manutencoes', manutencoesRouter);
beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(callback => callback(mockTransaction));
});
test('recalcula a última manutenção dos equipamentos ao mover um registro', async () => {
    mockMaintenance.findUnique.mockResolvedValue({ equipamentoId: 2 });
    mockMaintenance.update.mockResolvedValue({ equipamentoId: 3 });
    mockMaintenance.findFirst.mockResolvedValue({ dataManutencao: new Date('2026-10-01') });
    const response = await request(app)
        .put('/api/manutencoes/9')
        .send({ equipamento_id: 3, data_manutencao: '2026-10-15', responsavel: 'Equipe A', descricao: 'Inspeção' });
    expect(response.statusCode).toBe(200);
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(mockEquipment.update).toHaveBeenCalledTimes(2);
    expect(mockEquipment.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { dataUltimaManutencao: new Date('2026-10-01') }
    });
    expect(mockEquipment.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: { dataUltimaManutencao: new Date('2026-10-01') }
    });
});
test('rejeita manutenção com equipamento inválido sem alterar o banco', async () => {
    const response = await request(app)
        .put('/api/manutencoes/9')
        .send({ equipamento_id: 'inválido', data_manutencao: '2026-10-15' });
    expect(response.statusCode).toBe(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
});
//# sourceMappingURL=manutencoesCrud.test.js.map