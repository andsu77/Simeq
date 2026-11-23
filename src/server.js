const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuração da Sessão
app.use(session({
    secret: process.env.SESSION_SECRET || 'simeq_default_secret_key_123',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // true apenas se usar HTTPS
        maxAge: 1000 * 60 * 60 * 24 // 24 horas
    }
}));

// Servir arquivos estáticos do Frontend
app.use(express.static(path.join(__dirname, '../public')));

// Logs de Requisições (Depuração)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Rotas da API
const authRoutes = require('./routes/auth');
const equipRoutes = require('./routes/equipamentos');
const manutRoutes = require('./routes/manutencoes');
const userRoutes = require('./routes/usuarios');

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/equipamentos', equipRoutes);
app.use('/api/manutencoes', manutRoutes);

// Rota principal para servir o index.html (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Tratamento de Erros Global
app.use((err, req, res, next) => {
    console.error('ERRO NÃO TRATADO NO SERVIDOR:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Erro interno no servidor.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`================================================`);
    console.log(` SERVIDOR SIMEQ RODANDO EM: http://localhost:${PORT}`);
    console.log(`================================================`);
});


module.exports = app;