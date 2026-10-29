// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
jest.mock('../config/prisma', () => ({
  equipamento: { create: jest.fn() },
  $transaction: jest.fn()
}));

const prisma = require('../config/prisma');
const equipamentoModel = require('../models/equipamentoModel');

test('deve cadastrar um equipamento usando os valores padrão', async () => {
  prisma.equipamento.create.mockResolvedValue({ id: 1 });
  const idGerado = await equipamentoModel.create({ nome: 'Empilhadeira elétrica' });
  expect(idGerado).toBe(1);

  expect(prisma.equipamento.create).toHaveBeenCalledWith({
    data: {
      nome: 'Empilhadeira elétrica',
      tipo: null,
      setor: null,
      localizacao: null,
      responsavel: null,
      dataUltimaManutencao: null,
      frequenciaDias: 30,
      criticidade: 'Média',
      observacoes: null
    }
  });
});

test('exclui o equipamento e os registros dependentes em uma transação', async () => {
  const transaction = {
    equipamento: {
      findUnique: jest.fn().mockResolvedValue({ id: 8, nome: 'Compressor' }),
      delete: jest.fn().mockResolvedValue({})
    },
    ordemServico: {
      findMany: jest.fn().mockResolvedValue([{ id: 21 }]),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 })
    },
    alerta: { deleteMany: jest.fn().mockResolvedValue({ count: 2 }) },
    falha: { deleteMany: jest.fn().mockResolvedValue({ count: 3 }) },
    planoManutencao: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
    manutencao: { deleteMany: jest.fn().mockResolvedValue({ count: 4 }) }
  };
  prisma.$transaction.mockImplementation(callback => callback(transaction));

  const resultado = await equipamentoModel.delete(8);

  expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  expect(transaction.alerta.deleteMany).toHaveBeenCalledWith({
    where: { OR: [{ equipamentoId: 8 }, { ordemId: { in: [21] } }] }
  });
  expect(transaction.equipamento.delete).toHaveBeenCalledWith({ where: { id: 8 } });
  expect(resultado).toEqual({
    equipamento: { id: 8, nome: 'Compressor' },
    removidos: { ordens: 1, falhas: 3, planos: 1, manutencoes: 4, alertas: 2 }
  });
});
// @ts-nocheck
export {};
