"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt = require('bcryptjs');
const prisma = require("../config/prisma");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
    }
    try {
        const user = await prisma.usuario.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Usuário não cadastrado.' });
        }
        const passwordMatch = user.senha.startsWith('$2')
            ? await bcrypt.compare(senha, user.senha)
            : senha === user.senha;
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: 'Senha incorreta.' });
        }
        req.session.userId = user.id;
        req.session.userName = user.nome;
        req.session.userRole = user.cargo;
        return res.json({
            success: true,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                cargo: user.cargo,
                iotEnabled: user.iotEnabled,
                preferences: JSON.parse(user.preferencesJson)
            }
        });
    }
    catch (error) {
        console.error('[SIMEQ] Erro no login:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno no servidor ao tentar logar.',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});
router.post('/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({ success: false, message: 'Erro ao sair.' });
        }
        res.clearCookie('connect.sid');
        return res.json({ success: true });
    });
});
router.get('/me', async (req, res) => {
    if (!req.session.userId) {
        return res.json({ loggedIn: false });
    }
    try {
        const user = await prisma.usuario.findUnique({
            where: { id: req.session.userId },
            select: {
                id: true,
                nome: true,
                email: true,
                cargo: true,
                tutorialStatus: true,
                iotEnabled: true,
                preferencesJson: true
            }
        });
        if (!user) {
            return res.json({ loggedIn: false });
        }
        return res.json({
            loggedIn: true,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                cargo: user.cargo,
                tutorialStatus: user.tutorialStatus,
                iotEnabled: user.iotEnabled,
                preferences: JSON.parse(user.preferencesJson)
            }
        });
    }
    catch (error) {
        console.error('[SIMEQ] Erro ao consultar sessão:', error);
        return res.status(500).json({ loggedIn: false, message: 'Não foi possível carregar a sessão.' });
    }
});
router.post('/tutorial/start', authMiddleware_1.checkAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const result = await prisma.usuario.updateMany({
            where: { id: userId, tutorialStatus: 'PENDING' },
            data: { tutorialStatus: 'STARTED', tutorialStartedAt: new Date() }
        });
        const user = await prisma.usuario.findUnique({
            where: { id: userId },
            select: { tutorialStatus: true, tutorialCompletedAt: true }
        });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        return res.json({
            status: user.tutorialStatus,
            completedAt: user.tutorialCompletedAt,
            showWelcome: result.count === 1
        });
    }
    catch (error) {
        console.error('[SIMEQ] Erro ao consultar estado do tutorial:', error);
        return res.status(500).json({ message: 'Não foi possível carregar o estado do tutorial.' });
    }
});
router.patch('/profile', authMiddleware_1.checkAuth, async (req, res) => {
    const body = req.body;
    const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const senha = typeof body.senha === 'string' ? body.senha : '';
    if (!nome || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Informe um nome e um e-mail válidos.' });
    }
    if (senha && senha.length < 8) {
        return res.status(400).json({ message: 'A senha deve ter pelo menos 8 caracteres.' });
    }
    try {
        const data = { nome, email };
        if (senha) {
            data.senha = await bcrypt.hash(senha, 10);
        }
        const user = await prisma.usuario.update({
            where: { id: req.session.userId },
            data,
            select: { id: true, nome: true, email: true, cargo: true, iotEnabled: true }
        });
        req.session.userName = user.nome;
        return res.json({ success: true, user });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
        }
        console.error('[SIMEQ] Erro ao atualizar perfil:', error);
        return res.status(500).json({ message: 'Não foi possível atualizar o perfil.' });
    }
});
router.patch('/preferences', authMiddleware_1.checkAuth, async (req, res) => {
    const preferences = req.body;
    if ((preferences.theme !== 'dark' && preferences.theme !== 'light')
        ||
            typeof preferences.compactDashboard !== 'boolean'
        || typeof preferences.showDashboardOrders !== 'boolean'
        || typeof preferences.showDashboardAlerts !== 'boolean') {
        return res.status(400).json({ message: 'Preferências inválidas.' });
    }
    try {
        await prisma.usuario.update({
            where: { id: req.session.userId },
            data: { preferencesJson: JSON.stringify(preferences) }
        });
        return res.json({ success: true, preferences });
    }
    catch (error) {
        console.error('[SIMEQ] Erro ao salvar preferências:', error);
        return res.status(500).json({ message: 'Não foi possível salvar as preferências.' });
    }
});
router.patch('/users/:id/iot-access', authMiddleware_1.checkAuth, async (req, res) => {
    if (req.session.userRole !== 'Gerente') {
        return res.status(403).json({ message: 'Somente um gerente pode liberar o módulo Arduino.' });
    }
    if (typeof req.body?.enabled !== 'boolean') {
        return res.status(400).json({ message: 'Informe se o acesso ao módulo Arduino deve ser habilitado.' });
    }
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: 'Usuário inválido.' });
    }
    try {
        const user = await prisma.usuario.update({
            where: { id },
            data: { iotEnabled: req.body.enabled },
            select: { id: true, iotEnabled: true }
        });
        return res.json({ success: true, ...user });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        console.error('[SIMEQ] Erro ao alterar acesso ao módulo Arduino:', error);
        return res.status(500).json({ message: 'Não foi possível alterar o acesso ao módulo Arduino.' });
    }
});
router.post('/tutorial/state', authMiddleware_1.checkAuth, async (req, res) => {
    const { status } = req.body;
    if (status !== 'COMPLETED' && status !== 'SKIPPED') {
        return res.status(400).json({ message: 'Estado do tutorial inválido.' });
    }
    try {
        const userId = req.session.userId;
        const result = await prisma.usuario.updateMany({
            where: { id: userId, tutorialStatus: { in: ['PENDING', 'STARTED'] } },
            data: {
                tutorialStatus: status,
                tutorialCompletedAt: status === 'COMPLETED' ? new Date() : null
            }
        });
        if (!result.count) {
            const user = await prisma.usuario.findUnique({ where: { id: userId }, select: { id: true } });
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado.' });
            }
        }
        return res.json({ success: true, status });
    }
    catch (error) {
        console.error('[SIMEQ] Erro ao salvar estado do tutorial:', error);
        return res.status(500).json({ message: 'Não foi possível salvar o estado do tutorial.' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map