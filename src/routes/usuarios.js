const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');

const checkAuth = (req, res, next) => {
    if (!req.session.userId) return res.status(401).json({ message: 'Não autorizado.' });
    next();
};

// Listar usuários
router.get('/', checkAuth, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nome, email, cargo, dataCadastro FROM usuarios ORDER BY nome ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar usuários.' });
    }
});

// Criar novo usuário
router.post('/', checkAuth, async (req, res) => {
    const { nome, email, senha, cargo } = req.body;
    
    if (!nome || !email || !senha) {
        return res.status(400).json({ message: 'Nome, e-mail e senha são obriagatórios.' });
    }

    try {
        const hash = await bcrypt.hash(senha, 10);
        const [result] = await db.execute(
            'INSERT INTO usuarios (nome, email, senha, cargo) VALUES (?,?,?,?)',
            [nome, email, hash, cargo || 'Operador']
        );
        res.status(201).json({ id: result.insertId, message: 'Usuário criado com sucesso!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
        }
        res.status(500).json({ message: 'Erro ao criar usuário.' });
    }
});

// Eliminar usuário
router.delete('/:id', checkAuth, async (req, res) => {
    if (req.params.id == req.session.userId) {
        return res.status(400).json({ message: 'Você não pode excluir seu próprio usuário.' });
    }
    try {
        await db.execute('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Usuário removido.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir usuário.' });
    }
});

module.exports = router;
