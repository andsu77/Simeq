-- CreateTable
CREATE TABLE "usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "cargo" TEXT,
    "dataCadastro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "equipamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT,
    "setor" TEXT,
    "localizacao" TEXT,
    "responsavel" TEXT,
    "dataUltimaManutencao" DATETIME,
    "frequenciaDias" INTEGER NOT NULL DEFAULT 30,
    "criticidade" TEXT NOT NULL DEFAULT 'Média',
    "observacoes" TEXT
);

-- CreateTable
CREATE TABLE "manutencoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "equipamento_id" INTEGER NOT NULL,
    "data_manutencao" DATETIME NOT NULL,
    "responsavel" TEXT,
    "descricao" TEXT,
    "observacoes" TEXT,
    CONSTRAINT "manutencoes_equipamento_id_fkey" FOREIGN KEY ("equipamento_id") REFERENCES "equipamentos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
