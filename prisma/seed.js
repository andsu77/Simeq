const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.usuario.upsert({
        where: { email: 'admin@simeq.com' },
        update: {},
        create: {
            nome: 'Administrador',
            email: 'admin@simeq.com',
            senha: 'admin123',
            cargo: 'Gerente'
        }
    });

    const equipamentos = [
        { nome: 'Torno CNC 01', tipo: 'Industrial', setor: 'Produção', localizacao: 'Galpão A', responsavel: 'João Silva', dataUltimaManutencao: new Date('2026-06-15'), frequenciaDias: 30, criticidade: 'Alta' },
        { nome: 'Compressor de Ar', tipo: 'Apoio', setor: 'Manutenção', localizacao: 'Área Externa', responsavel: 'Carlos Souza', dataUltimaManutencao: new Date('2026-05-20'), frequenciaDias: 60, criticidade: 'Média' },
        { nome: 'Empilhadeira Elétrica', tipo: 'Logística', setor: 'Expedição', localizacao: 'Almoxarifado', responsavel: 'Ana Oliveira', dataUltimaManutencao: new Date('2026-06-25'), frequenciaDias: 15, criticidade: 'Baixa' }
    ];

    const ids = [];
    for (const dados of equipamentos) {
        const existente = await prisma.equipamento.findFirst({ where: { nome: dados.nome } });
        if (existente) {
            ids.push(existente.id);
        } else {
            const criado = await prisma.equipamento.create({ data: dados });
            ids.push(criado.id);
        }
    }

    const manutencoesExistentes = await prisma.manutencao.count();
    if (manutencoesExistentes === 0) {
        await prisma.manutencao.create({
            data: {
                equipamentoId: ids[0],
                dataManutencao: new Date('2026-06-15'),
                responsavel: 'Técnico Externo',
                descricao: 'Troca de óleo e limpeza de filtros.'
            }
        });
        await prisma.manutencao.create({
            data: {
                equipamentoId: ids[1],
                dataManutencao: new Date('2026-05-20'),
                responsavel: 'Equipe Interna',
                descricao: 'Verificação de vazamentos e pressão.'
            }
        });
    }

    console.log('Seed concluído.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
