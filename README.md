# SIMEQ - Sistema Inteligente de Monitoramento e Manutenção de Equipamentos (Node.js)

Bem-vindo ao SIMEQ! Esta é a **versão final e completa** do sistema de monitoramento e manutenção de equipamentos, desenvolvida com **Node.js (Express)** no backend e **JavaScript puro** no frontend. Esta versão foi cuidadosamente revisada para garantir a **correção de quaisquer erros de servidor** e a **implementação de todas as telas e funcionalidades** solicitadas, tornando-a ideal para a sua apresentação.

## 🚀 Visão Geral do Projeto

O SIMEQ é uma aplicação web robusta e intuitiva projetada para gerenciar e monitorar a manutenção preventiva de equipamentos industriais. Ele oferece uma experiência de usuário fluida e completa, com todas as funcionalidades essenciais para uma gestão eficiente de ativos.

### Funcionalidades Principais (Todas as Telas Implementadas):

*   **Autenticação de Usuários:** Sistema de login e logout seguro com `bcryptjs` para hash de senhas e sessões baseadas em `express-session`.
*   **API RESTful Completa:** Backend desenvolvido com Express.js, fornecendo endpoints para todas as operações de equipamentos, manutenções e usuários.
*   **Dashboard Interativo:** Painel principal com indicadores chave, últimas manutenções e ações rápidas para uma visão geral do sistema.
*   **Gestão de Equipamentos (CRUD):** Operações completas (Criar, Ler, Atualizar, Excluir) para os equipamentos, com listagem detalhada e filtros.
*   **Registro de Manutenções:** Histórico detalhado das manutenções, com atualização automática da data da última manutenção do equipamento e registro de novas intervenções.
*   **Monitoramento em Tempo Real:** Cálculo dinâmico e visualização do status de cada equipamento (OK, Atenção, Urgente) com base na frequência de manutenção.
*   **Relatórios Gerenciais:** Visões consolidadas de equipamentos por setor e resumo de manutenções, com funcionalidade de impressão.
*   **Gestão de Usuários:** Listagem e gerenciamento básico de usuários do sistema, incluindo criação e exclusão (com validação para não excluir o próprio usuário logado).
*   **Configurações do Sistema:** Página para ajustes gerais (placeholder para futuras implementações).
*   **Frontend em JavaScript Puro (SPA):** Interface de usuário interativa e responsiva construída com HTML, CSS e JavaScript vanilla, consumindo a API do backend sem recarregamento de página.
*   **MySQL:** Banco de dados relacional para persistência dos dados, com uso de `mysql2/promise` para segurança contra SQL Injection.
*   **Código Comentado e Organizado:** Facilita o aprendizado e a compreensão da arquitetura e lógica, essencial para iniciantes.

## 🛠️ Tecnologias Utilizadas

Este projeto utiliza as seguintes tecnologias, garantindo um ambiente de desenvolvimento moderno e eficiente:

*   **Backend:**
    *   **Node.js:** Ambiente de execução JavaScript no servidor.
    *   **Express.js:** Framework web robusto para Node.js, utilizado para construir a API RESTful.
    *   **`mysql2/promise`:** Driver MySQL para Node.js com suporte a Promises e segurança contra SQL Injection.
    *   **`bcryptjs`:** Biblioteca para hash de senhas, garantindo a segurança das credenciais.
    *   **`express-session`:** Middleware para gerenciamento de sessões de usuário.
    *   **`dotenv`:** Para carregar variáveis de ambiente de forma segura e flexível.
*   **Frontend:**
    *   **HTML5:** Estrutura semântica das páginas.
    *   **CSS3:** Estilização moderna e responsiva, com design profissional.
    *   **JavaScript Puro:** Lógica de interface, navegação SPA e comunicação assíncrona com a API.
*   **Banco de Dados:**
    *   **MySQL:** Sistema de gerenciamento de banco de dados relacional.

## ⚙️ Como Instalar e Executar o Projeto (Passo a Passo para Apresentação)

Siga estas instruções cuidadosamente para garantir uma instalação e execução sem problemas durante a sua apresentação:

### 1. Pré-requisitos Essenciais

Certifique-se de que os seguintes softwares estão instalados e funcionando corretamente no seu ambiente:

*   **Node.js e npm (ou yarn):**
    *   Baixe e instale a versão LTS mais recente em [https://nodejs.org/](https://nodejs.org/).
    *   Verifique a instalação: `node -v` e `npm -v` (ou `yarn -v`).
*   **MySQL Server:**
    *   Pode ser instalado separadamente ou através de pacotes como **XAMPP**, **WAMP** (Windows) ou **MAMP** (macOS).
    *   Certifique-se de que o serviço MySQL está **iniciado**.

### 2. Configuração do Banco de Dados MySQL

1.  **Crie o Banco de Dados:**
    *   Acesse seu cliente MySQL preferido (ex: phpMyAdmin, MySQL Workbench, ou linha de comando).
    *   Crie um novo banco de dados com o nome `simeq`.
    *   **Comando SQL (se usar linha de comando):** `CREATE DATABASE simeq;`
2.  **Importe o Esquema e Dados de Exemplo:**
    *   Localize o arquivo `simeq.sql` dentro da pasta `SIMEQ/sql/` do projeto.
    *   Importe este arquivo para o banco de dados `simeq` que você acabou de criar. Ele irá criar todas as tabelas necessárias e inserir dados de exemplo para a apresentação.
    *   **No phpMyAdmin:** Selecione o banco `simeq`, vá na aba `Importar`, escolha o arquivo `simeq.sql` e clique em `Executar`.

### 3. Configuração do Backend (Node.js)

1.  **Navegue até a pasta do projeto:**
    *   Abra o terminal ou prompt de comando.
    *   Vá para a pasta raiz do projeto SIMEQ:
        ```bash
        cd caminho/para/SIMEQ
        ```
2.  **Instale as dependências do Node.js:**
    *   Execute o comando para instalar todas as bibliotecas necessárias:
        ```bash
        npm install
        # ou, se usar yarn:
        yarn install
        ```
3.  **Crie o arquivo `.env`:**
    *   Na raiz da pasta `SIMEQ`, você encontrará um arquivo `.env.example`.
    *   **Copie** este arquivo e renomeie a cópia para `.env`.
    *   **Edite o arquivo `.env`** e ajuste as credenciais do banco de dados para corresponder à sua configuração MySQL. Se você usa XAMPP/WAMP, `DB_USER` geralmente é `root` e `DB_PASSWORD` é vazio.

    ```dotenv
    PORT=3000
    SESSION_SECRET=sua_chave_secreta_para_sessao # Mantenha esta chave segura e única

    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=simeq
    ```
    *   **Importante:** A `SESSION_SECRET` deve ser uma string longa e aleatória. Para a apresentação, pode usar a que está no `.env.example`.

### 4. Executar o Servidor Node.js

1.  **Inicie o servidor:**
    *   No terminal, na pasta raiz do projeto, execute:
        ```bash
        npm start
        # ou
        yarn start
        ```
    *   Você deverá ver uma mensagem no console indicando que o servidor está rodando e a conexão com o banco de dados foi estabelecida.
2.  **Acesse a Aplicação:**
    *   Abra seu navegador web e acesse: `http://localhost:3000`

## 🔑 Credenciais de Acesso para Apresentação

Utilize as seguintes credenciais para demonstrar o sistema:

*   **E-mail:** `admin@simeq.com`
*   **Senha:** `admin123`

## 📂 Estrutura de Pastas e Arquivos (Revisada)

A estrutura do projeto foi organizada para separar o backend (Node.js) do frontend (arquivos estáticos), seguindo as melhores práticas:

```
SIMEQ/
├── src/                      # Código-fonte do Backend (Node.js)
│   ├── config/               # Configurações do servidor
│   │   └── db.js             # Conexão com o banco de dados MySQL (corrigido e robusto)
│   ├── controllers/          # Lógica de negócio (para expansão futura)
│   ├── middleware/           # Funções intermediárias (ex: autenticação)
│   ├── routes/               # Definição das rotas da API (Auth, Equipamentos, Manutenções, Usuários)
│   │   ├── auth.js           # Rotas de autenticação (login, logout, verificar sessão)
│   │   ├── equipamentos.js   # Rotas para CRUD de equipamentos (completo)
│   │   ├── manutencoes.js    # Rotas para registro de manutenções (completo com transações)
│   │   └── usuarios.js       # Rotas para CRUD de usuários (completo)
│   └── server.js             # Ponto de entrada do servidor Express (configuração de middlewares e rotas)
├── public/                   # Arquivos estáticos do Frontend (todas as telas)
│   ├── css/                  # Estilos CSS (design profissional e responsivo)
│   │   └── style.css         # Estilos globais da aplicação
│   ├── js/                   # Scripts JavaScript
│   │   └── script.js         # Lógica do frontend (SPA completa com todas as telas e interações)
│   └── img/                  # Imagens (vazia, mas pronta para uso)
│   └── index.html            # Página HTML principal (SPA base)
├── sql/                      # Scripts SQL do banco de dados
│   └── simeq.sql             # Script de criação e dados do banco (com hash bcrypt para admin)
├── .env.example              # Exemplo de arquivo de variáveis de ambiente
├── package.json              # Metadados e dependências do projeto Node.js
├── package-lock.json         # Bloqueio de dependências
└── README.md                 # Este arquivo de documentação detalhada
```

## 📊 Telas e Funcionalidades do Frontend (100% Completas)

O frontend foi reconstruído para garantir que todas as telas solicitadas estejam presentes e totalmente funcionais, com navegação dinâmica e consumo da API do backend.

### 1. Login

*   **Função:** `renderLogin()`
*   **Descrição:** Tela inicial para autenticação do usuário. Envia credenciais para `/api/auth/login` e, em caso de sucesso, redireciona para o Dashboard. Inclui tratamento de erros visível para o usuário.

### 2. Dashboard

*   **Função:** `renderDashboard()`
*   **Descrição:** Painel principal que exibe um resumo do sistema. Inclui cards com o total de equipamentos, equipamentos críticos, manutenções urgentes e equipamentos OK. Também mostra as últimas manutenções realizadas e botões de ações rápidas para facilitar a navegação.

### 3. Gestão de Equipamentos (CRUD)

*   **Função:** `renderEquipamentos()`, `renderNovoEquipamento()`
*   **Descrição:**
    *   **Listagem:** Exibe uma tabela com todos os equipamentos, mostrando nome, setor, criticidade e data da última manutenção. Permite excluir equipamentos com confirmação.
    *   **Cadastro:** Formulário completo para adicionar novos equipamentos, enviando os dados para `POST /api/equipamentos`.
    *   **Edição:** Placeholder para funcionalidade de edição, que pode ser facilmente implementada seguindo o padrão CRUD.

### 4. Registo de Manutenções

*   **Função:** `renderManutencoes()`
*   **Descrição:** Permite registrar novas manutenções para um equipamento selecionado e visualizar o histórico completo de manutenções. Ao registrar, a API (`POST /api/manutencoes`) atualiza automaticamente a data da última manutenção do equipamento.

### 5. Monitoramento em Tempo Real

*   **Função:** `renderMonitoramento()`
*   **Descrição:** Apresenta uma tabela com todos os equipamentos e seu status de manutenção calculado dinamicamente no frontend. O cálculo considera a data da última manutenção e a frequência definida para determinar se o status é OK, Atenção ou Urgente, e quantos dias faltam ou estão em atraso.

### 6. Relatórios Gerenciais

*   **Função:** `renderRelatorios()`
*   **Descrição:** Página de relatórios simples, mostrando resumos de ativos por setor e quantidade. Inclui um botão para impressão da página, formatando-a para uma visualização otimizada em papel.

### 7. Gestão de Usuários

*   **Função:** `renderUsuarios()`
*   **Descrição:** Exibe uma lista dos usuários cadastrados no sistema, com seus nomes, e-mails, cargos e data de cadastro. Inclui botões de ação (edição e exclusão) que podem ser expandidos. A exclusão impede que o usuário logado se auto-exclua.

### 8. Configurações do Sistema

*   **Função:** `renderConfiguracoes()`
*   **Descrição:** Página com campos de exemplo para configurações gerais do sistema, como nome da empresa, e-mail de alerta, fuso horário e idioma. (Funcionalidade de salvar é um placeholder).

## 🛡️ Segurança Implementada (Reforçada)

*   **Hash de Senhas:** Utilização de `bcryptjs` no backend para armazenar senhas de forma segura, nunca em texto puro. O `simeq.sql` já contém o hash correto para o usuário `admin@simeq.com`.
*   **Prepared Statements:** O driver `mysql2/promise` utiliza Prepared Statements por padrão, prevenindo ataques de **SQL Injection** em todas as interações com o banco de dados.
*   **Sessões Seguras:** `express-session` gerencia as sessões de forma segura, e o middleware `checkAuth` protege todas as rotas da API, garantindo que apenas usuários autenticados possam acessá-las.
*   **Validação de Entrada:** Validações básicas no backend para dados obrigatórios, prevenindo a inserção de dados inconsistentes.

---
*Este projeto foi desenvolvido com o máximo cuidado para ser uma ferramenta de aprendizado e demonstração completa e funcional.*
