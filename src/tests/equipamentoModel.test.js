// O Jest usa este objeto direto e nem abre o arquivo db.js real!
jest.mock('../config/db', () => ({
  execute: jest.fn()
}));

const db = require('../config/db');
const equipamentoModel = require('../models/equipamentoModel');

test('deve cadastrar um equipamento usando os valores padrão', async () => {
  // 1. Configuração do Mock
  db.execute.mockResolvedValue([{ insertId: 1 }]);

  // 2. Ação
  const idGerado = await equipamentoModel.create({ nome: 'Notebook' });

  // 3. Verificação do resultado
  expect(idGerado).toBe(1);

  // 4. Verificação dos argumentos passados para o banco
  expect(db.execute).toHaveBeenCalledWith(
    expect.any(String), // Aceita qualquer string SQL
    ['Notebook', null, null, null, null, null, 30, 'Média', null] // Parâmetros esperados
  );
});