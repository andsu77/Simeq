"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// src/models/equipamentoModel.ts
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
        const equipamentoId = Number(id);
        if (!Number.isInteger(equipamentoId) || equipamentoId <= 0)
            return null;
        return prisma.$transaction(async (transaction) => {
            const equipamento = await transaction.equipamento.findUnique({
                where: { id: equipamentoId },
                select: { id: true, nome: true }
            });
            if (!equipamento)
                return null;
            const ordens = await transaction.ordemServico.findMany({
                where: { equipamentoId },
                select: { id: true }
            });
            const ordemIds = ordens.map((ordem) => ordem.id);
            const alertas = await transaction.alerta.deleteMany({
                where: {
                    OR: [
                        { equipamentoId },
                        ...(ordemIds.length ? [{ ordemId: { in: ordemIds } }] : [])
                    ]
                }
            });
            const falhas = await transaction.falha.deleteMany({ where: { equipamentoId } });
            const ordensRemovidas = await transaction.ordemServico.deleteMany({ where: { equipamentoId } });
            const planos = await transaction.planoManutencao.deleteMany({ where: { equipamentoId } });
            const manutencoes = await transaction.manutencao.deleteMany({ where: { equipamentoId } });
            await transaction.equipamento.delete({ where: { id: equipamentoId } });
            return {
                equipamento,
                removidos: {
                    ordens: ordensRemovidas.count,
                    falhas: falhas.count,
                    planos: planos.count,
                    manutencoes: manutencoes.count,
                    alertas: alertas.count
                }
            };
        });
    }
};
module.exports = EquipamentoModel;
//# sourceMappingURL=equipamentoModel.js.map