// src/models/equipamentoModel.js
const prisma = require('../config/prisma');

const EquipamentoModel = {
    // Listar todos ordenados por nome
    getAll: async () => {
        return prisma.equipamento.findMany({ orderBy: { nome: 'asc' } });
    },

    // Buscar um equipamento por ID
    findById: async (id) => {
        return prisma.equipamento.findUnique({ where: { id: Number(id) } });
    },

    // Inserir novo equipamento no banco
    create: async (dados) => {
        const { nome, tipo, setor, localizacao, responsavel, dataUltimaManutencao, frequenciaDias, criticidade, observacoes } = dados;
        const equipamento = await prisma.equipamento.create({
            data: {
                nome,
                tipo: tipo || null,
                setor: setor || null,
                localizacao: localizacao || null,
                responsavel: responsavel || null,
                dataUltimaManutencao: dataUltimaManutencao ? new Date(dataUltimaManutencao) : null,
                frequenciaDias: frequenciaDias ? Number(frequenciaDias) : 30,
                criticidade: criticidade || 'Média',
                observacoes: observacoes || null
            }
        });
        return equipamento.id;
    },

    // Atualizar/Editar um equipamento existente
    update: async (id, dados) => {
        const { nome, tipo, setor, localizacao, responsavel, dataUltimaManutencao, frequenciaDias, criticidade, observacoes } = dados;
        const result = await prisma.equipamento.updateMany({
            where: { id: Number(id) },
            data: {
                nome,
                tipo,
                setor,
                localizacao,
                responsavel,
                dataUltimaManutencao: dataUltimaManutencao ? new Date(dataUltimaManutencao) : null,
                frequenciaDias: frequenciaDias !== undefined ? Number(frequenciaDias) : undefined,
                criticidade,
                observacoes
            }
        });
        return result.count > 0;
    },

    // Deletar equipamento por ID
    delete: async (id) => {
        const result = await prisma.equipamento.deleteMany({ where: { id: Number(id) } });
        return result.count > 0;
    }
};

module.exports = EquipamentoModel;
