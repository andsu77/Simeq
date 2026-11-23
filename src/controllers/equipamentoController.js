// src/controllers/equipamentoController.js
const EquipamentoModel = require('../models/equipamentoModel');

const equipamentoController = {
    // Listar todos os equipamentos
    list: async (req, res) => {
        try {
            const equipamentos = await EquipamentoModel.getAll();
            return res.json(equipamentos);
        } catch (error) {
            console.error('Erro ao listar equipamentos:', error);
            return res.status(500).json({ message: 'Erro ao carregar equipamentos.' });
        }
    },

    // Buscar equipamento por ID
    getById: async (req, res) => {
        try {
            const equipamento = await EquipamentoModel.findById(req.params.id);
            if (!equipamento) return res.status(404).json({ message: 'Equipamento não encontrado.' });
            return res.json(equipamento);
        } catch (error) {
            console.error('Erro ao buscar equipamento:', error);
            return res.status(500).json({ message: 'Erro ao buscar equipamento.' });
        }
    },

    // Criar novo equipamento
    create: async (req, res) => {
        const { nome } = req.body;
        if (!nome) return res.status(400).json({ message: 'O nome do equipamento é obrigatório.' });

        try {
            const insertId = await EquipamentoModel.create(req.body);
            return res.status(201).json({ id: insertId, message: 'Equipamento cadastrado com sucesso!' });
        } catch (error) {
            console.error('Erro ao criar equipamento:', error);
            return res.status(500).json({ message: 'Erro ao salvar equipamento.' });
        }
    },

    // Editar / Atualizar equipamento completo ou parcial
    update: async (req, res) => {
        const { id } = req.params;
        try {
            // Verifica se o equipamento existe antes de editar
            const equipamentoAtual = await EquipamentoModel.findById(id);
            if (!equipamentoAtual) return res.status(404).json({ message: 'Equipamento não encontrado.' });

            // Mescla os dados recebidos com os dados atuais do banco (evita sobrescrever campos com undefined)
            const dadosAtualizados = {
                nome: req.body.nome !== undefined ? req.body.nome : equipamentoAtual.nome,
                tipo: req.body.tipo !== undefined ? req.body.tipo : equipamentoAtual.tipo,
                setor: req.body.setor !== undefined ? req.body.setor : equipamentoAtual.setor,
                localizacao: req.body.localizacao !== undefined ? req.body.localizacao : equipamentoAtual.localizacao,
                responsavel: req.body.responsavel !== undefined ? req.body.responsavel : equipamentoAtual.responsavel,
                dataUltimaManutencao: req.body.dataUltimaManutencao !== undefined ? req.body.dataUltimaManutencao : equipamentoAtual.dataUltimaManutencao,
                frequenciaDias: req.body.frequenciaDias !== undefined ? req.body.frequenciaDias : equipamentoAtual.frequenciaDias,
                criticidade: req.body.criticidade !== undefined ? req.body.criticidade : equipamentoAtual.criticidade,
                observacoes: req.body.observacoes !== undefined ? req.body.observacoes : equipamentoAtual.observacoes
            };

            if (!dadosAtualizados.nome) return res.status(400).json({ message: 'O nome do equipamento não pode ser vazio.' });

            await EquipamentoModel.update(id, dadosAtualizados);
            return res.json({ message: 'Equipamento atualizado com sucesso!' });
        } catch (error) {
            console.error('Erro ao atualizar equipamento:', error);
            return res.status(500).json({ message: 'Erro ao atualizar equipamento.' });
        }
    },

    // Eliminar equipamento
    delete: async (req, res) => {
        try {
            const deletado = await EquipamentoModel.delete(req.params.id);
            if (!deletado) return res.status(404).json({ message: 'Equipamento não encontrado.' });
            return res.json({ success: true, message: 'Equipamento removido.' });
        } catch (error) {
            console.error('Erro ao excluir equipamento:', error);
            return res.status(500).json({ message: 'Erro ao excluir equipamento.' });
        }
    }
};

module.exports = equipamentoController;