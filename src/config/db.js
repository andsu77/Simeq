const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Configuração da Conexão com o Banco de Dados
 * Usando Pool para gerenciar múltiplas conexões de forma eficiente.
 */
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'simeq',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

const pool = mysql.createPool(dbConfig);

// Teste de conexão inicial para evitar erros silenciosos
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Conexão com o banco de dados MySQL estabelecida com sucesso!');
        connection.release();
    } catch (err) {
        console.error('ERRO CRÍTICO: Não foi possível conectar ao banco de dados MySQL.');
        console.error('Verifique se o MySQL está rodando e se as credenciais no .env estão corretas.');
        console.error('Detalhes:', err.message);
    }
}

testConnection();

module.exports = pool;
