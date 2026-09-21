const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');

const checkAuth = (req, res, next) => {
    if (!req.session.userId) return res.status(401).json({ message: 'Não autorizado.' });
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
    } catch (error) {
        console.error('Erro ao listar manutenções:', error);
        res.status(500).json({ message: 'Erro ao carregar histórico.' });
    }
});

// Registrar nova manutenção
router.post('/', checkAuth, async (req, res) => {
    const { equipamento_id, data_manutencao, responsavel, descricao, observacoes } = req.body;

    if (!equipamento_id || !data_manutencao) {
        return res.status(400).json({ message: 'Equipamento e data são obrigatórios.' });
    }

    try {
        await prisma.$transaction([
            prisma.manutencao.create({
                data: {
                    equipamentoId: Number(equipamento_id),
                    dataManutencao: new Date(data_manutencao),
                    responsavel: responsavel || null,
                    descricao: descricao || null,
                    observacoes: observacoes || null
                }
            }),
            prisma.equipamento.update({
                where: { id: Number(equipamento_id) },
                data: { dataUltimaManutencao: new Date(data_manutencao) }
            })
        ]);

        res.status(201).json({ success: true, message: 'Manutenção registrada com sucesso!' });
    } catch (error) {
        console.error('Erro ao registrar manutenção:', error);
        res.status(500).json({ message: 'Erro interno ao salvar registro.' });
    }
});

module.exports = router;
