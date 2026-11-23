// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

const checkAuth = (req, res, next) => {
    if (!req.session.userId) return res.status(401).json({ message: 'Não autorizado.' });
    next();
};

const checkGerente = (req, res, next) => {
    if (req.session.userRole !== 'Gerente') {
        return res.status(403).json({ message: 'Somente um gerente pode administrar usuários e acessos.' });
    }
    next();
};

const SELECT_PUBLICO = { id: true, nome: true, email: true, cargo: true, dataCadastro: true, iotEnabled: true };

// Listar usuários
router.get('/', checkAuth, checkGerente, async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            select: SELECT_PUBLICO,
            orderBy: { nome: 'asc' }
        });
        res.json(usuarios);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ message: 'Erro ao listar usuários.' });
    }
});

// Buscar um usuário por ID
router.get('/:id', checkAuth, checkGerente, async (req, res) => {
    try {
        const usuario = await prisma.usuario.findUnique({
            where: { id: Number(req.params.id) },
            select: SELECT_PUBLICO
        });
        if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' });
        res.json(usuario);
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ message: 'Erro ao buscar usuário.' });
    }
});

// Criar novo usuário
router.post('/', checkAuth, checkGerente, async (req, res) => {
    const { nome, email, senha, cargo } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios.' });
    }

    try {
        const hash = await bcrypt.hash(senha, 10);
        const usuario = await prisma.usuario.create({
            data: { nome, email, senha: hash, cargo: cargo || 'Operador' }
        });
        res.status(201).json({ id: usuario.id, message: 'Usuário criado com sucesso!' });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
        }
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ message: 'Erro ao criar usuário.' });
    }
});

// Atualizar usuário
router.put('/:id', checkAuth, checkGerente, async (req, res) => {
    const { nome, email, cargo, senha } = req.body;

    if (!nome || !email || !cargo) {
        return res.status(400).json({ message: 'Nome, e-mail e cargo são obrigatórios.' });
    }

    try {
        const data = { nome, email, cargo };
        if (senha) {
            data.senha = await bcrypt.hash(senha, 10);
        }
        await prisma.usuario.update({ where: { id: Number(req.params.id) }, data });
        res.json({ success: true, message: 'Usuário atualizado com sucesso!' });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
        }
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.status(500).json({ message: 'Erro ao atualizar usuário.' });
    }
});

// Eliminar usuário
router.delete('/:id', checkAuth, async (req, res) => {
    if (req.session.userRole !== 'Gerente') {
        return res.status(403).json({ message: 'Somente um gerente pode administrar usuários.' });
    }
    if (req.params.id == req.session.userId) {
        return res.status(400).json({ message: 'Você não pode excluir seu próprio usuário.' });
    }
    try {
        await prisma.usuario.delete({ where: { id: Number(req.params.id) } });
        res.json({ success: true, message: 'Usuário removido.' });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.status(500).json({ message: 'Erro ao excluir usuário.' });
    }
});

export = router;
