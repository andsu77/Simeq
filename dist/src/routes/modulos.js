"use strict";
// @ts-nocheck
const express = require('express');
const { z } = require('zod');
const prisma = require('../config/prisma');
const { checkAuth } = require('../middleware/authMiddleware');
const router = express.Router();
router.use(checkAuth);
const idSchema = z.coerce.number().int().positive();
const text = z.string().trim().min(1);
function parseBody(schema, req, res) {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, message: 'Dados inválidos.', issues: parsed.error.issues });
        return null;
    }
    return parsed.data;
}
async function audit(req, acao, entidade, entidadeId, detalhes) {
    await prisma.auditoria.create({
        data: { usuarioId: req.session.userId, acao, entidade, entidadeId, detalhes: detalhes ? JSON.stringify(detalhes) : null }
    });
}
// Dashboard real com indicadores calculados a partir do banco.
router.get('/dashboard/summary', async (_req, res, next) => {
    try {
        const [equipamentos, ordens, alertas, falhas, planos] = await Promise.all([
            prisma.equipamento.findMany({ select: { id: true, nome: true, criticidade: true, dataUltimaManutencao: true, frequenciaDias: true } }),
            prisma.ordemServico.findMany({ where: { status: { notIn: ['CONCLUIDA', 'CANCELADA'] } }, orderBy: { criadoEm: 'desc' }, take: 8, include: { equipamento: { select: { nome: true } } } }),
            prisma.alerta.findMany({ where: { resolvidoEm: null }, orderBy: { criadoEm: 'desc' }, take: 8, include: { equipamento: { select: { nome: true } } } }),
            prisma.falha.findMany({ orderBy: { dataOcorrencia: 'desc' }, take: 8, include: { equipamento: { select: { nome: true } } } }),
            prisma.planoManutencao.findMany({ where: { ativo: true }, orderBy: { proximaData: 'asc' }, take: 8, include: { equipamento: { select: { nome: true } } } })
        ]);
        const now = Date.now();
        const status = equipamentos.map((e) => {
            const due = e.dataUltimaManutencao ? new Date(e.dataUltimaManutencao).getTime() + e.frequenciaDias * 86400000 : 0;
            const days = due ? Math.ceil((due - now) / 86400000) : -999;
            return { ...e, diasRestantes: days, status: days < 0 ? 'ATRASADA' : days <= 7 ? 'ATENCAO' : 'NORMAL' };
        });
        res.json({
            success: true,
            data: {
                indicadores: {
                    totalEquipamentos: equipamentos.length,
                    normais: status.filter((e) => e.status === 'NORMAL').length,
                    atencao: status.filter((e) => e.status === 'ATENCAO').length,
                    atrasadas: status.filter((e) => e.status === 'ATRASADA').length,
                    ordensAbertas: ordens.length,
                    alertasAtivos: alertas.length,
                    falhasRecentes: falhas.length
                },
                prioridades: status.sort((a, b) => (a.diasRestantes - b.diasRestantes)).slice(0, 5),
                ordens, alertas, falhas, planos
            }
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/setores', async (_req, res, next) => {
    try {
        res.json(await prisma.setor.findMany({ orderBy: { nome: 'asc' }, include: { _count: { select: { equipamentos: true } } } }));
    }
    catch (e) {
        next(e);
    }
});
router.post('/setores', async (req, res, next) => {
    const data = parseBody(z.object({ nome: text, descricao: z.string().optional(), localizacao: z.string().optional() }), req, res);
    if (!data)
        return;
    try {
        const setor = await prisma.setor.create({ data });
        await audit(req, 'CRIAR', 'SETOR', setor.id);
        res.status(201).json(setor);
    }
    catch (e) {
        next(e);
    }
});
router.put('/setores/:id', async (req, res, next) => {
    const parsedId = idSchema.safeParse(req.params.id);
    const data = parseBody(z.object({ nome: text, descricao: z.string().optional(), localizacao: z.string().optional() }), req, res);
    if (!parsedId.success || !data)
        return res.status(400).json({ success: false, message: 'Identificador ou dados inválidos.' });
    try {
        const setor = await prisma.setor.update({ where: { id: parsedId.data }, data });
        await audit(req, 'ATUALIZAR', 'SETOR', setor.id);
        res.json(setor);
    }
    catch (e) {
        next(e);
    }
});
router.delete('/setores/:id', async (req, res, next) => {
    const parsedId = idSchema.safeParse(req.params.id);
    if (!parsedId.success)
        return res.status(400).json({ success: false, message: 'Identificador inválido.' });
    try {
        const setor = await prisma.setor.findUnique({ where: { id: parsedId.data }, include: { _count: { select: { equipamentos: true } } } });
        if (!setor)
            return res.status(404).json({ success: false, message: 'Setor não encontrado.' });
        if (setor._count.equipamentos)
            return res.status(409).json({ success: false, message: 'Remova ou transfira os equipamentos vinculados antes de excluir este setor.' });
        await prisma.setor.delete({ where: { id: parsedId.data } });
        await audit(req, 'EXCLUIR', 'SETOR', parsedId.data);
        res.json({ success: true });
    }
    catch (e) {
        next(e);
    }
});
router.get('/categorias', async (_req, res, next) => {
    try {
        res.json(await prisma.categoriaEquipamento.findMany({ orderBy: { nome: 'asc' }, include: { _count: { select: { equipamentos: true } } } }));
    }
    catch (e) {
        next(e);
    }
});
router.post('/categorias', async (req, res, next) => {
    const data = parseBody(z.object({ nome: text, descricao: z.string().optional() }), req, res);
    if (!data)
        return;
    try {
        const categoria = await prisma.categoriaEquipamento.create({ data });
        await audit(req, 'CRIAR', 'CATEGORIA', categoria.id);
        res.status(201).json(categoria);
    }
    catch (e) {
        next(e);
    }
});
router.put('/categorias/:id', async (req, res, next) => {
    const parsedId = idSchema.safeParse(req.params.id);
    const data = parseBody(z.object({ nome: text, descricao: z.string().optional() }), req, res);
    if (!parsedId.success || !data)
        return res.status(400).json({ success: false, message: 'Identificador ou dados inválidos.' });
    try {
        const categoria = await prisma.categoriaEquipamento.update({ where: { id: parsedId.data }, data });
        await audit(req, 'ATUALIZAR', 'CATEGORIA', categoria.id);
        res.json(categoria);
    }
    catch (e) {
        next(e);
    }
});
router.delete('/categorias/:id', async (req, res, next) => {
    const parsedId = idSchema.safeParse(req.params.id);
    if (!parsedId.success)
        return res.status(400).json({ success: false, message: 'Identificador inválido.' });
    try {
        const categoria = await prisma.categoriaEquipamento.findUnique({ where: { id: parsedId.data }, include: { _count: { select: { equipamentos: true } } } });
        if (!categoria)
            return res.status(404).json({ success: false, message: 'Categoria não encontrada.' });
        if (categoria._count.equipamentos)
            return res.status(409).json({ success: false, message: 'Remova ou transfira os equipamentos vinculados antes de excluir esta categoria.' });
        await prisma.categoriaEquipamento.delete({ where: { id: parsedId.data } });
        await audit(req, 'EXCLUIR', 'CATEGORIA', parsedId.data);
        res.json({ success: true });
    }
    catch (e) {
        next(e);
    }
});
router.get('/planos', async (_req, res, next) => {
    try {
        res.json(await prisma.planoManutencao.findMany({ orderBy: { proximaData: 'asc' }, include: { equipamento: true } }));
    }
    catch (e) {
        next(e);
    }
});
router.post('/planos', async (req, res, next) => {
    const data = parseBody(z.object({ equipamentoId: idSchema, tipo: text.optional(), periodicidade: z.coerce.number().int().positive(), unidade: z.enum(['DIAS', 'SEMANAS', 'MESES']).default('DIAS'), proximaData: z.coerce.date(), antecedencia: z.coerce.number().int().nonnegative().default(7), instrucoes: z.string().optional(), responsavel: z.string().optional() }), req, res);
    if (!data)
        return;
    try {
        const plano = await prisma.planoManutencao.create({ data });
        await audit(req, 'CRIAR', 'PLANO_MANUTENCAO', plano.id);
        res.status(201).json(plano);
    }
    catch (e) {
        next(e);
    }
});
router.put('/planos/:id', async (req, res, next) => {
    const parsedId = idSchema.safeParse(req.params.id);
    const data = parseBody(z.object({ equipamentoId: idSchema, tipo: text, periodicidade: z.coerce.number().int().positive(), unidade: z.enum(['DIAS', 'SEMANAS', 'MESES']), proximaData: z.coerce.date(), antecedencia: z.coerce.number().int().nonnegative(), instrucoes: z.string().optional(), responsavel: z.string().optional(), ativo: z.boolean() }), req, res);
    if (!parsedId.success || !data)
        return res.status(400).json({ success: false, message: 'Identificador ou dados inválidos.' });
    try {
        const plano = await prisma.planoManutencao.update({ where: { id: parsedId.data }, data });
        await audit(req, 'ATUALIZAR', 'PLANO_MANUTENCAO', plano.id);
        res.json(plano);
    }
    catch (e) {
        next(e);
    }
});
router.delete('/planos/:id', async (req, res, next) => {
    const parsedId = idSchema.safeParse(req.params.id);
    if (!parsedId.success)
        return res.status(400).json({ success: false, message: 'Identificador inválido.' });
    try {
        await prisma.planoManutencao.delete({ where: { id: parsedId.data } });
        await audit(req, 'EXCLUIR', 'PLANO_MANUTENCAO', parsedId.data);
        res.json({ success: true });
    }
    catch (e) {
        next(e);
    }
});
router.get('/ordens', async (_req, res, next) => {
    try {
        res.json(await prisma.ordemServico.findMany({ orderBy: { criadoEm: 'desc' }, include: { equipamento: true, plano: true } }));
    }
    catch (e) {
        next(e);
    }
});
router.post('/ordens', async (req, res, next) => {
    const data = parseBody(z.object({ equipamentoId: idSchema, planoId: idSchema.optional(), titulo: text, descricao: text, tipo: text.optional(), prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'CRITICA']).default('MEDIA'), responsavel: z.string().optional(), prazo: z.coerce.date().optional(), observacoes: z.string().optional() }), req, res);
    if (!data)
        return;
    try {
        const numero = `OS-${Date.now()}`;
        const ordem = await prisma.ordemServico.create({ data: { ...data, numero } });
        await audit(req, 'CRIAR', 'ORDEM_SERVICO', ordem.id, { numero });
        res.status(201).json(ordem);
    }
    catch (e) {
        next(e);
    }
});
router.put('/ordens/:id', async (req, res, next) => {
    const parsedId = idSchema.safeParse(req.params.id);
    const data = parseBody(z.object({ equipamentoId: idSchema, titulo: text, descricao: text, tipo: text, prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'CRITICA']), status: z.enum(['ABERTA', 'EM_ANDAMENTO', 'AGUARDANDO_PECA', 'CONCLUIDA', 'CANCELADA']), responsavel: z.string().optional(), prazo: z.coerce.date().nullable().optional(), observacoes: z.string().optional() }), req, res);
    if (!parsedId.success || !data)
        return res.status(400).json({ success: false, message: 'Identificador ou dados inválidos.' });
    try {
        const ordem = await prisma.ordemServico.update({ where: { id: parsedId.data }, data: { ...data, concluidaEm: data.status === 'CONCLUIDA' ? new Date() : null } });
        await audit(req, 'ATUALIZAR', 'ORDEM_SERVICO', ordem.id);
        res.json(ordem);
    }
    catch (e) {
        next(e);
    }
});
router.delete('/ordens/:id', async (req, res, next) => {
    const parsedId = idSchema.safeParse(req.params.id);
    if (!parsedId.success)
        return res.status(400).json({ success: false, message: 'Identificador inválido.' });
    try {
        await prisma.ordemServico.delete({ where: { id: parsedId.data } });
        await audit(req, 'EXCLUIR', 'ORDEM_SERVICO', parsedId.data);
        res.json({ success: true });
    }
    catch (e) {
        next(e);
    }
});
router.patch('/ordens/:id/status', async (req, res, next) => {
    const id = idSchema.safeParse(req.params.id);
    const data = parseBody(z.object({ status: z.enum(['ABERTA', 'EM_ANDAMENTO', 'AGUARDANDO_PECA', 'CONCLUIDA', 'CANCELADA']), observacoes: z.string().optional() }), req, res);
    if (!id.success || !data)
        return res.status(400).json({ success: false, message: 'Identificador ou status inválido.' });
    try {
        const ordem = await prisma.ordemServico.update({ where: { id: id.data }, data: { status: data.status, observacoes: data.observacoes, concluidaEm: data.status === 'CONCLUIDA' ? new Date() : undefined } });
        await audit(req, 'ALTERAR_STATUS', 'ORDEM_SERVICO', ordem.id, { status: data.status });
        res.json(ordem);
    }
    catch (e) {
        next(e);
    }
});
router.get('/falhas', async (_req, res, next) => {
    try {
        res.json(await prisma.falha.findMany({ orderBy: { dataOcorrencia: 'desc' }, include: { equipamento: true, ordem: true } }));
    }
    catch (e) {
        next(e);
    }
});
router.post('/falhas', async (req, res, next) => {
    const data = parseBody(z.object({ equipamentoId: idSchema, ordemId: idSchema.optional(), dataOcorrencia: z.coerce.date().optional(), categoria: z.string().optional(), descricao: text, impacto: z.string().optional(), causa: z.string().optional(), causaConfirmada: z.boolean().default(false), acaoCorretiva: z.string().optional(), tempoParadaMin: z.coerce.number().int().nonnegative().optional() }), req, res);
    if (!data)
        return;
    try {
        const falha = await prisma.falha.create({ data });
        await audit(req, 'CRIAR', 'FALHA', falha.id);
        res.status(201).json(falha);
    }
    catch (e) {
        next(e);
    }
});
router.put('/falhas/:id', async (req, res, next) => {
    const parsedId = idSchema.safeParse(req.params.id);
    const data = parseBody(z.object({ equipamentoId: idSchema, ordemId: idSchema.nullable().optional(), dataOcorrencia: z.coerce.date(), categoria: z.string().optional(), descricao: text, impacto: z.string().optional(), causa: z.string().optional(), causaConfirmada: z.boolean(), acaoCorretiva: z.string().optional(), tempoParadaMin: z.coerce.number().int().nonnegative().nullable().optional() }), req, res);
    if (!parsedId.success || !data)
        return res.status(400).json({ success: false, message: 'Identificador ou dados inválidos.' });
    try {
        const falha = await prisma.falha.update({ where: { id: parsedId.data }, data });
        await audit(req, 'ATUALIZAR', 'FALHA', falha.id);
        res.json(falha);
    }
    catch (e) {
        next(e);
    }
});
router.delete('/falhas/:id', async (req, res, next) => {
    const parsedId = idSchema.safeParse(req.params.id);
    if (!parsedId.success)
        return res.status(400).json({ success: false, message: 'Identificador inválido.' });
    try {
        await prisma.falha.delete({ where: { id: parsedId.data } });
        await audit(req, 'EXCLUIR', 'FALHA', parsedId.data);
        res.json({ success: true });
    }
    catch (e) {
        next(e);
    }
});
router.get('/alertas', async (_req, res, next) => {
    try {
        res.json(await prisma.alerta.findMany({ orderBy: { criadoEm: 'desc' }, include: { equipamento: true, ordem: true } }));
    }
    catch (e) {
        next(e);
    }
});
router.post('/alertas', async (req, res, next) => {
    const data = parseBody(z.object({ equipamentoId: idSchema.nullable().optional(), ordemId: idSchema.nullable().optional(), tipo: text, severidade: z.enum(['INFO', 'ATENCAO', 'CRITICO']).default('ATENCAO'), titulo: text, mensagem: text }), req, res);
    if (!data)
        return;
    try {
        const alerta = await prisma.alerta.create({ data: { ...data, chaveDedup: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` } });
        await audit(req, 'CRIAR', 'ALERTA', alerta.id);
        res.status(201).json(alerta);
    }
    catch (e) {
        next(e);
    }
});
router.put('/alertas/:id', async (req, res, next) => {
    const parsedId = idSchema.safeParse(req.params.id);
    const data = parseBody(z.object({ tipo: text, severidade: z.enum(['INFO', 'ATENCAO', 'CRITICO']), titulo: text, mensagem: text }), req, res);
    if (!parsedId.success || !data)
        return res.status(400).json({ success: false, message: 'Identificador ou dados inválidos.' });
    try {
        const alerta = await prisma.alerta.update({ where: { id: parsedId.data }, data });
        await audit(req, 'ATUALIZAR', 'ALERTA', alerta.id);
        res.json(alerta);
    }
    catch (e) {
        next(e);
    }
});
router.patch('/alertas/:id/resolver', async (req, res, next) => {
    const parsedId = idSchema.safeParse(req.params.id);
    if (!parsedId.success)
        return res.status(400).json({ success: false, message: 'Identificador inválido.' });
    try {
        const alerta = await prisma.alerta.update({ where: { id: parsedId.data }, data: { resolvidoEm: new Date() } });
        await audit(req, 'RESOLVER', 'ALERTA', alerta.id);
        res.json(alerta);
    }
    catch (e) {
        next(e);
    }
});
router.delete('/alertas/:id', async (req, res, next) => {
    const parsedId = idSchema.safeParse(req.params.id);
    if (!parsedId.success)
        return res.status(400).json({ success: false, message: 'Identificador inválido.' });
    try {
        await prisma.alerta.delete({ where: { id: parsedId.data } });
        await audit(req, 'EXCLUIR', 'ALERTA', parsedId.data);
        res.json({ success: true });
    }
    catch (e) {
        next(e);
    }
});
router.patch('/alertas/:id/reconhecer', async (req, res, next) => {
    const parsed = idSchema.safeParse(req.params.id);
    if (!parsed.success)
        return res.status(400).json({ success: false, message: 'ID inválido.' });
    try {
        const alerta = await prisma.alerta.update({ where: { id: parsed.data }, data: { reconhecidoEm: new Date() } });
        await audit(req, 'RECONHECER', 'ALERTA', alerta.id);
        res.json(alerta);
    }
    catch (e) {
        next(e);
    }
});
router.get('/auditoria', async (_req, res, next) => {
    try {
        res.json(await prisma.auditoria.findMany({ orderBy: { criadoEm: 'desc' }, take: 100 }));
    }
    catch (e) {
        next(e);
    }
});
module.exports = router;
//# sourceMappingURL=modulos.js.map