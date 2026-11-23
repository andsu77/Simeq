const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testConnection() {
    try {
        await prisma.$connect();
        console.log('Conexão com o banco de dados (SQLite/Prisma) estabelecida com sucesso!');
    } catch (err) {
        console.error('ERRO CRÍTICO: Não foi possível conectar ao banco de dados.');
        console.error('Detalhes:', err.message);
    }
}

testConnection();

module.exports = prisma;
