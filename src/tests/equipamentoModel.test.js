jest.mock('../config/db', () => ({
  execute: jest.fn()
}));

const db = require('../config/db');
const equipamentoModel = require('../models/equipamentoModel');

test('deve cadastrar um equipamento usando os valores padrão', async () => {
  db.execute.mockResolvedValue([{ insertId: 1 }]);
  const idGerado = await equipamentoModel.create({ nome: 'Notebook' });
  expect(idGerado).toBe(1);
  
  expect(db.execute).toHaveBeenCalledWith(
    expect.any(String),
    ['Notebook', null, null, null, null, null, 30, 'Média', null]
  );
});
