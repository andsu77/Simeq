-- CreateTable
CREATE TABLE "setores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "localizacao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "categorias_equipamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "planos_manutencao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "equipamentoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'PREVENTIVA',
    "periodicidade" INTEGER NOT NULL DEFAULT 30,
    "unidade" TEXT NOT NULL DEFAULT 'DIAS',
    "proximaData" DATETIME NOT NULL,
    "antecedencia" INTEGER NOT NULL DEFAULT 7,
    "instrucoes" TEXT,
    "responsavel" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "planos_manutencao_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "equipamentos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ordens_servico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "equipamentoId" INTEGER NOT NULL,
    "planoId" INTEGER,
    "numero" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'CORRETIVA',
    "prioridade" TEXT NOT NULL DEFAULT 'MEDIA',
    "status" TEXT NOT NULL DEFAULT 'ABERTA',
    "responsavel" TEXT,
    "prazo" DATETIME,
    "concluidaEm" DATETIME,
    "observacoes" TEXT,
    "custoEstimado" REAL,
    "custoReal" REAL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "ordens_servico_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "equipamentos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ordens_servico_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "planos_manutencao" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "falhas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "equipamentoId" INTEGER NOT NULL,
    "ordemId" INTEGER,
    "dataOcorrencia" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoria" TEXT,
    "descricao" TEXT NOT NULL,
    "impacto" TEXT,
    "causa" TEXT,
    "causaConfirmada" BOOLEAN NOT NULL DEFAULT false,
    "acaoCorretiva" TEXT,
    "tempoParadaMin" INTEGER,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "falhas_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "equipamentos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "falhas_ordemId_fkey" FOREIGN KEY ("ordemId") REFERENCES "ordens_servico" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "alertas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "equipamentoId" INTEGER,
    "ordemId" INTEGER,
    "tipo" TEXT NOT NULL,
    "severidade" TEXT NOT NULL DEFAULT 'ATENCAO',
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "chaveDedup" TEXT NOT NULL,
    "reconhecidoEm" DATETIME,
    "resolvidoEm" DATETIME,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "alertas_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "equipamentos" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "alertas_ordemId_fkey" FOREIGN KEY ("ordemId") REFERENCES "ordens_servico" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" INTEGER,
    "detalhes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_equipamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT,
    "setor" TEXT,
    "localizacao" TEXT,
    "responsavel" TEXT,
    "dataUltimaManutencao" DATETIME,
    "frequenciaDias" INTEGER NOT NULL DEFAULT 30,
    "criticidade" TEXT NOT NULL DEFAULT 'Média',
    "observacoes" TEXT,
    "setorId" INTEGER,
    "categoriaId" INTEGER,
    CONSTRAINT "equipamentos_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "setores" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "equipamentos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias_equipamento" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_equipamentos" ("criticidade", "dataUltimaManutencao", "frequenciaDias", "id", "localizacao", "nome", "observacoes", "responsavel", "setor", "tipo") SELECT "criticidade", "dataUltimaManutencao", "frequenciaDias", "id", "localizacao", "nome", "observacoes", "responsavel", "setor", "tipo" FROM "equipamentos";
DROP TABLE "equipamentos";
ALTER TABLE "new_equipamentos" RENAME TO "equipamentos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "setores_nome_key" ON "setores"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_equipamento_nome_key" ON "categorias_equipamento"("nome");

-- CreateIndex
CREATE INDEX "planos_manutencao_equipamentoId_proximaData_idx" ON "planos_manutencao"("equipamentoId", "proximaData");

-- CreateIndex
CREATE UNIQUE INDEX "ordens_servico_numero_key" ON "ordens_servico"("numero");

-- CreateIndex
CREATE INDEX "ordens_servico_status_prioridade_prazo_idx" ON "ordens_servico"("status", "prioridade", "prazo");

-- CreateIndex
CREATE INDEX "falhas_equipamentoId_dataOcorrencia_idx" ON "falhas"("equipamentoId", "dataOcorrencia");

-- CreateIndex
CREATE UNIQUE INDEX "alertas_chaveDedup_key" ON "alertas"("chaveDedup");

-- CreateIndex
CREATE INDEX "alertas_severidade_resolvidoEm_criadoEm_idx" ON "alertas"("severidade", "resolvidoEm", "criadoEm");

-- CreateIndex
CREATE INDEX "auditoria_entidade_entidadeId_criadoEm_idx" ON "auditoria"("entidade", "entidadeId", "criadoEm");
