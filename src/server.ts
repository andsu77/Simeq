import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

const app = express();
const PORT = Number(process.env.PORT ?? 3000);
const isProduction = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));

app.use(session({
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

app.use((req: Request, _res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'test') {
    console.info(JSON.stringify({ timestamp: new Date().toISOString(), method: req.method, path: req.path }));
  }
  next();
});

const publicDirectory = path.join(process.cwd(), 'public');
app.use(express.static(publicDirectory, { maxAge: isProduction ? '1d' : 0 }));

import authRoutes from './routes/auth';
import equipRoutes = require('./routes/equipamentos');
import manutRoutes = require('./routes/manutencoes');
import userRoutes = require('./routes/usuarios');
import moduloRoutes = require('./routes/modulos');

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/equipamentos', equipRoutes);
app.use('/api/manutencoes', manutRoutes);
app.use('/api/modulos', moduloRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'simeq', timestamp: new Date().toISOString() }));
app.get('*', (_req, res) => res.sendFile(path.join(publicDirectory, 'index.html')));

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[SIMEQ] erro não tratado', error);
  const prismaCode = (error as Error & { code?: string }).code;
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

export default app;
module.exports = app;
