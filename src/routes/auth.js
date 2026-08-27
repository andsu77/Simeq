const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Rota de Login com Logs de Depuração (Otimizada para Apresentação)
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    
    console.log(`\n[SIMEQ] Tentativa de login para: ${email}`);

    try {
        // 1. Verificar conexão com o banco e buscar usuário
        const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        console.log(`[SIMEQ] Usuários encontrados: ${rows.length}`);

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Usuário não cadastrado.' });
        }

        const user = rows[0];

        // 2. Comparação Híbrida de Senha (Evita falhas de ambiente na apresentação)
        let passwordMatch = false;

        if (senha === user.senha) {
            // Se a senha no banco estiver em texto puro (ex: 'admin123')
            passwordMatch = true;
            console.log('[SIMEQ] Login efetuado via comparação de texto puro.');
        } else if (user.senha && user.senha.startsWith('$2')) {
            // Se for um hash Bcrypt válido, faz a comparação criptografada
            passwordMatch = await bcrypt.compare(senha, user.senha);
            console.log('[SIMEQ] Login tentado via criptografia Bcrypt.');
        } else {
            console.log('[SIMEQ] Aviso: Senha incorreta ou formato de hash não reconhecido.');
        }

        console.log(`[SIMEQ] Senha confere: ${passwordMatch}`);
        
        if (passwordMatch) {
            // 3. Salvar na sessão (Mantendo o padrão esperado pelo seu frontend)
            req.session.userId = user.id;
            req.session.userName = user.nome;
            req.session.userRole = user.cargo;
            
            console.log('[SIMEQ] Sessão criada com sucesso.\n');
            return res.json({ 
                success: true, 
                user: { id: user.id, nome: user.nome, cargo: user.cargo } 
            });
        } else {
            return res.status(401).json({ success: false, message: 'Senha incorreta.' });
        }
    } catch (error) {
        console.error('[SIMEQ] ERRO DETALHADO NO LOGIN:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno no servidor ao tentar logar.',
            details: error.message 
        });
    }
});

// Rota de Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao sair.' });
        res.clearCookie('connect.sid');
        console.log('[SIMEQ] Sessão finalizada com sucesso.');
        res.json({ success: true });
    });
});

// Verificar Sessão Atual (GET /api/auth/me)
router.get('/me', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({ 
            loggedIn: true, 
            user: { id: req.session.userId, nome: req.session.userName, cargo: req.session.userRole } 
        });
    } else {
        res.json({ loggedIn: false });
    }
});

module.exports = router;