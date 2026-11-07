import type { RequestHandler } from 'express';

export const checkAuth: RequestHandler = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: 'Não autorizado. Por favor, faça login para acessar este recurso.'
        });
    }

    return next();
};
