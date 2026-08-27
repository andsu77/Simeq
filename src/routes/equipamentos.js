// src/routes/equipamentos.js
const express = require('express');
const router = express.Router();
const equipamentoController = require('../controllers/equipamentoController');
const { checkAuth } = require('../middleware/authMiddleware');

// Rotas limpas e mapeadas diretamente para o Controller
router.get('/', checkAuth, equipamentoController.list);
router.get('/:id', checkAuth, equipamentoController.getById);
router.post('/', checkAuth, equipamentoController.create);
router.put('/:id', checkAuth, equipamentoController.update); // Rota de Edição
router.delete('/:id', checkAuth, equipamentoController.delete);

module.exports = router;