// src/models/equipamentoModel.js
const db = require('../config/db');

const EquipamentoModel = {
    // Listar todos ordenados por nome
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM equipamentos ORDER BY nome ASC');
        return rows;
    },

    // Buscar um equipamento por ID
    findById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM equipamentos WHERE id = ?', [id]);
        return rows[0] || null;
    },

    // Inserir novo equipamento no banco
    create: async (dados) => {
        const { nome, tipo, setor, localizacao, responsavel, dataUltimaManutencao, frequenciaDias, criticidade, observacoes } = dados;
        const [result] = await db.execute(
            'INSERT INTO equipamentos (nome, tipo, setor, localizacao, responsavel, dataUltimaManutencao, frequenciaDias, criticidade, observacoes) VALUES (?,?,?,?,?,?,?,?,?)',
            [nome, tipo || null, setor || null, localizacao || null, responsavel || null, dataUltimaManutencao || null, frequenciaDias || 30, criticidade || 'Média', observacoes || null]
        );
        return result.insertId;
    },

    // Atualizar/Editar um equipamento existente
    update: async (id, dados) => {
        const { nome, tipo, setor, localizacao, responsavel, dataUltimaManutencao, frequenciaDias, criticidade, observacoes } = dados;
        const [result] = await db.execute(
            'UPDATE equipamentos SET nome=?, tipo=?, setor=?, localizacao=?, responsavel=?, dataUltimaManutencao=?, frequenciaDias=?, criticidade=?, observacoes=? WHERE id=?',
            [nome, tipo, setor, localizacao, responsavel, dataUltimaManutencao, frequenciaDias, criticidade, observacoes, id]
        );
        return result.affectedRows > 0;
    },

    // Deletar equipamento por ID
    delete: async (id) => {
        const [result] = await db.execute('DELETE FROM equipamentos WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = EquipamentoModel;