-- SIMEQ SQL - VERSÃO FINAL AJUSTADA PARA APRESENTAÇÃO
CREATE DATABASE IF NOT EXISTS simeq;
USE simeq;

-- Limpar tabelas se existirem para garantir integridade absoluta
DROP TABLE IF EXISTS manutencoes;
DROP TABLE IF EXISTS equipamentos;
DROP TABLE IF EXISTS usuarios;

-- Tabela de Usuários
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    cargo VARCHAR(50),
    dataCadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Equipamentos
CREATE TABLE equipamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50),
    setor VARCHAR(50),
    localizacao VARCHAR(100),
    responsavel VARCHAR(100),
    dataUltimaManutencao DATE,
    frequenciaDias INT DEFAULT 30,
    criticidade ENUM('Baixa', 'Média', 'Alta') DEFAULT 'Média',
    observacoes TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Manutenções
CREATE TABLE manutencoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipamento_id INT NOT NULL,
    data_manutencao DATE NOT NULL,
    responsavel VARCHAR(100),
    descricao TEXT,
    observacoes TEXT,
    FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
-- USUÁRIO PADRÃO CONFIGURADO EM TEXTO PURO PARA EVITAR CONFLITOS DE BCRYPT
-- E-mail: admin@simeq.com | Senha: admin123
-- =========================================================================
INSERT INTO usuarios (nome, email, senha, cargo) VALUES 
('Administrador', 'admin@simeq.com', 'admin123', 'Gerente');

-- Dados de Exemplo para Apresentação (Alinhados com o ano de 2026)
INSERT INTO equipamentos (nome, tipo, sector, localizacao, responsavel, dataUltimaManutencao, frequenciaDias, criticidade) VALUES 
('Torno CNC 01', 'Industrial', 'Produção', 'Galpão A', 'João Silva', '2026-06-15', 30, 'Alta'),
('Compressor de Ar', 'Apoio', 'Manutenção', 'Área Externa', 'Carlos Souza', '2026-05-20', 60, 'Média'),
('Empilhadeira Elétrica', 'Logística', 'Expedição', 'Almoxarifado', 'Ana Oliveira', '2026-06-25', 15, 'Baixa');

INSERT INTO manutencoes (equipamento_id, data_manutencao, responsavel, descricao) VALUES 
(1, '2026-06-15', 'Técnico Externo', 'Troca de óleo e limpeza de filtros.'),
(2, '2026-05-20', 'Equipe Interna', 'Verificação de vazamentos e pressão.');