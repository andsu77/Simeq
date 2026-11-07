"use strict";
// @ts-nocheck
const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const checkAuth = (req, res, next) => {
    if (!req.session.userId)
        return res.status(401).json({ message: 'Não autorizado.' });
    next();
};
// Listar histórico de manutenções
router.get('/', checkAuth, async (req, res) => {
    try {
        const manutencoes = await prisma.manutencao.findMany({
            include: { equipamento: { select: { nome: true } } },
            orderBy: { dataManutencao: 'desc' }
        });
        const rows = manutencoes.map((m) => ({
            id: m.id,
            equipamento_id: m.equipamentoId,
            data_manutencao: m.dataManutencao,
            responsavel: m.responsavel,
            descricao: m.descricao,
            observacoes: m.observacoes,
            equipamento_nome: m.equipamento.nome
        }));
        res.json(rows);
    }
    catch (error) {
        console.error('Erro ao listar manutenções:', error);
        res.status(500).json({ message: 'Erro ao carregar histórico.' });
    }
});
// Registrar nova manutenção
router.post('/', checkAuth, async (req, res) => {
    const { equipamento_id, data_manutencao, responsavel, descricao, observacoes } = req.body;
    const equipamentoId = Number(equipamento_id);
    const dataManutencao = new Date(data_manutencao);
    if (!Number.isInteger(equipamentoId) || equipamentoId <= 0 || !data_manutencao || Number.isNaN(dataManutencao.getTime())) {
        return res.status(400).json({ message: 'Equipamento e data são obrigatórios.' });
    }
    try {
        await prisma.$transaction(async (transaction) => {
            await transaction.manutencao.create({
                data: {
                    equipamentoId,
                    dataManutencao,
                    responsavel: responsavel || null,
                    descricao: descricao || null,
                    observacoes: observacoes || null
                }
            });
            const latest = await transaction.manutencao.findFirst({
                where: { equipamentoId },
                orderBy: { dataManutencao: 'desc' },
                select: { dataManutencao: true }
            });
            await transaction.equipamento.update({
                where: { id: equipamentoId },
                data: { dataUltimaManutencao: latest.dataManutencao }
            });
        });
        res.status(201).json({ success: true, message: 'Manutenção registrada com sucesso!' });
    }
    catch (error) {
        console.error('Erro ao registrar manutenção:', error);
        res.status(error.code === 'P2025' ? 404 : 500).json({ message: error.code === 'P2025' ? 'Equipamento não encontrado.' : 'Erro interno ao salvar registro.' });
    }
});
router.put('/:id', checkAuth, async (req, res) => {
    const id = Number(req.params.id);
    const { equipamento_id, data_manutencao, responsavel, descricao, observacoes } = req.body;
    const equipamentoId = Number(equipamento_id);
    const dataManutencao = new Date(data_manutencao);
    if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(equipamentoId) || equipamentoId <= 0 || !data_manutencao || Number.isNaN(dataManutencao.getTime())) {
        return res.status(400).json({ message: 'Identificador, equipamento e data válidos são obrigatórios.' });
    }
    try {
        await prisma.$transaction(async (transaction) => {
            const existing = await transaction.manutencao.findUnique({ where: { id }, select: { equipamentoId: true } });
            if (!existing)
                throw Object.assign(new Error('Manutenção não encontrada.'), { code: 'P2025' });
            const maintenance = await transaction.manutencao.update({
                where: { id },
                data: {
                    equipamentoId,
                    dataManutencao,
                    responsavel: responsavel || null,
                    descricao: descricao || null,
                    observacoes: observacoes || null
                }
            });
            for (const affectedEquipmentId of new Set([existing.equipamentoId, maintenance.equipamentoId])) {
                const latest = await transaction.manutencao.findFirst({
                    where: { equipamentoId: affectedEquipmentId },
                    orderBy: { dataManutencao: 'desc' },
                    select: { dataManutencao: true }
                });
                await transaction.equipamento.update({
                    where: { id: affectedEquipmentId },
                    data: { dataUltimaManutencao: latest?.dataManutencao ?? null }
                });
            }
        });
        res.json({ success: true, message: 'Manutenção atualizada com sucesso.' });
    }
    catch (error) {
        console.error('Erro ao atualizar manutenção:', error);
        res.status(error.code === 'P2025' ? 404 : 500).json({ message: error.code === 'P2025' ? 'Manutenção não encontrada.' : 'Erro ao atualizar manutenção.' });
    }
});
router.delete('/:id', checkAuth, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0)
        return res.status(400).json({ message: 'Identificador inválido.' });
    try {
        await prisma.$transaction(async (transaction) => {
            const maintenance = await transaction.manutencao.delete({ where: { id } });
            const latest = await transaction.manutencao.findFirst({
                where: { equipamentoId: maintenance.equipamentoId },
                orderBy: { dataManutencao: 'desc' },
                select: { dataManutencao: true }
            });
            await transaction.equipamento.update({
                where: { id: maintenance.equipamentoId },
                data: { dataUltimaManutencao: latest?.dataManutencao ?? null }
            });
        });
        res.json({ success: true, message: 'Manutenção removida com sucesso.' });
    }
    catch (error) {
        console.error('Erro ao excluir manutenção:', error);
        res.status(error.code === 'P2025' ? 404 : 500).json({ message: error.code === 'P2025' ? 'Manutenção não encontrada.' : 'Erro ao excluir manutenção.' });
    }
});
module.exports = router;
//# sourceMappingURL=manutencoes.js.map