// src/middleware/authMiddleware.js

/**
 * Middleware para verificar se o usuário está autenticado no sistema.
 * Olha para a sessão do Express (express-session) criada no login.
 */
const checkAuth = (req, res, next) => {
    // Verifica se a sessão existe e se o ID do usuário está salvo nela
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ 
            success: false, 
            message: 'Não autorizado. Por favor, faça login para acessar este recurso.' 
        });
    }
    
    // Se estiver tudo certo, permite que a requisição continue para o Controller/Rota
    next();
};

module.exports = { checkAuth };