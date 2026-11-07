"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const node_path_1 = __importDefault(require("node:path"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
require("dotenv/config");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT ?? 3000);
const isProduction = process.env.NODE_ENV === 'production';
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
app.use((0, cookie_parser_1.default)());
app.use((0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET ?? 'dev-only-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
        maxAge: 1000 * 60 * 60 * 24
    }
}));
app.use((req, _res, next) => {
    if (process.env.NODE_ENV !== 'test') {
        console.info(JSON.stringify({ timestamp: new Date().toISOString(), method: req.method, path: req.path }));
    }
    next();
});
const publicDirectory = node_path_1.default.join(process.cwd(), 'public');
app.use(express_1.default.static(publicDirectory, { maxAge: isProduction ? '1d' : 0 }));
const auth_1 = __importDefault(require("./routes/auth"));
const equipRoutes = require("./routes/equipamentos");
const manutRoutes = require("./routes/manutencoes");
const userRoutes = require("./routes/usuarios");
const moduloRoutes = require("./routes/modulos");
app.use('/api/auth', auth_1.default);
app.use('/api/usuarios', userRoutes);
app.use('/api/equipamentos', equipRoutes);
app.use('/api/manutencoes', manutRoutes);
app.use('/api/modulos', moduloRoutes);
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'simeq', timestamp: new Date().toISOString() }));
app.get('*', (_req, res) => res.sendFile(node_path_1.default.join(publicDirectory, 'index.html')));
app.use((error, _req, res, _next) => {
    console.error('[SIMEQ] erro não tratado', error);
    const prismaCode = error.code;
    if (prismaCode === 'P2025') {
        return res.status(404).json({ success: false, message: 'Registro não encontrado.' });
    }
    if (prismaCode === 'P2002') {
        return res.status(409).json({ success: false, message: 'Já existe um registro com esses dados.' });
    }
    if (prismaCode === 'P2003' || prismaCode === 'P2014') {
        return res.status(409).json({ success: false, message: 'Não é possível concluir a operação porque há registros vinculados.' });
    }
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
});
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`SIMEQ rodando em http://localhost:${PORT}`);
    });
}
exports.default = app;
module.exports = app;
//# sourceMappingURL=server.js.map