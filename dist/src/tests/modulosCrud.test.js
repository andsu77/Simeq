"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
jest.mock('../config/prisma', () => ({
    setor: {
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
    },
    ordemServico: {
        update: jest.fn()
    },
    auditoria: {
        create: jest.fn()
    }
}));
const express = require('express');
const request = require('supertest');
const prisma = require('../config/prisma');
const modulosRouter = require('../routes/modulos');
const app = express();
app.use(express.json());
app.use((req, _res, next) => {
    req.session = { userId: 1 };
    next();
});
app.use('/api/modulos', modulosRouter);
beforeEach(() => {
    jest.clearAllMocks();
    prisma.auditoria.create.mockResolvedValue({});
});
test('atualiza setor e registra a ação na auditoria', async () => {
    prisma.setor.update.mockResolvedValue({ id: 7, nome: 'Usinagem' });
    const response = await request(app)
        .put('/api/modulos/setores/7')
        .send({ nome: 'Usinagem', descricao: 'Linha principal', localizacao: 'Galpão B' });
    expect(response.statusCode).toBe(200);
    expect(response.body.nome).toBe('Usinagem');
    expect(prisma.setor.update).toHaveBeenCalledWith({
        where: { id: 7 },
        data: { nome: 'Usinagem', descricao: 'Linha principal', localizacao: 'Galpão B' }
    });
    expect(prisma.auditoria.create).toHaveBeenCalled();
});
test('impede excluir setor com equipamentos vinculados', async () => {
    prisma.setor.findUnique.mockResolvedValue({ id: 7, _count: { equipamentos: 2 } });
    const response = await request(app).delete('/api/modulos/setores/7');
    expect(response.statusCode).toBe(409);
    expect(response.body.message).toMatch(/equipamentos vinculados/i);
    expect(prisma.setor.delete).not.toHaveBeenCalled();
});
test('atualiza ordem e limpa data de conclusão quando reaberta', async () => {
    prisma.ordemServico.update.mockResolvedValue({ id: 11, status: 'EM_ANDAMENTO' });
    const response = await request(app)
        .put('/api/modulos/ordens/11')
        .send({
        equipamentoId: 4,
        titulo: 'Verificar bomba',
        descricao: 'Ruído na partida',
        tipo: 'CORRETIVA',
        prioridade: 'ALTA',
        status: 'EM_ANDAMENTO',
        responsavel: 'Equipe A',
        prazo: null
    });
    expect(response.statusCode).toBe(200);
    expect(prisma.ordemServico.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 11 },
        data: expect.objectContaining({ concluidaEm: null, status: 'EM_ANDAMENTO' })
    }));
});
//# sourceMappingURL=modulosCrud.test.js.map