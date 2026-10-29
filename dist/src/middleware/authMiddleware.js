"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const checkAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: 'Não autorizado. Por favor, faça login para acessar este recurso.'
        });
    }
    return next();
};
exports.checkAuth = checkAuth;
//# sourceMappingURL=authMiddleware.js.map