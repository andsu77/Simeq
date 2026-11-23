jest.mock('../config/prisma', () => ({
  equipamento: { create: jest.fn() }
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
