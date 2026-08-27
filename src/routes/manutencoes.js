const express = require('express');
const router = express.Router();
const db = require('../config/db');

const checkAuth = (req, res, next) => {
    if (!req.session.userId) return res.status(401).json({ message: 'Não autorizado.' });
    next();
};

// Listar histórico de manutenções
router.get('/', checkAuth, async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT m.*, e.nome as equipamento_nome 
            FROM manutencoes m 
            JOIN equipamentos e ON m.equipamento_id = e.id 
            ORDER BY m.data_manutencao DESC
        `);
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
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Insere o registro de manutenção
            await connection.execute(
                'INSERT INTO manutencoes (equipamento_id, data_manutencao, responsavel, descricao, observacoes) VALUES (?,?,?,?,?)',
                [equipamento_id, data_manutencao, responsavel || null, descricao || null, observacoes || null]
            );

            // 2. Atualiza a data da última manutenção no equipamento
            await connection.execute(
                'UPDATE equipamentos SET dataUltimaManutencao = ? WHERE id = ?',
                [data_manutencao, equipamento_id]
            );

            await connection.commit();
            res.status(201).json({ success: true, message: 'Manutenção registrada com sucesso!' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Erro ao registrar manutenção:', error);
        res.status(500).json({ message: 'Erro interno ao salvar registro.' });
    }
});

module.exports = router;
