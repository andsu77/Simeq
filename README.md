<div align="center">
  <img src="public/images/logo-simeq.png" alt="Logo SIMEQ" width="220" />
  <h1>SIMEQ — Sistema Integrado de Manutenção e Monitoramento de Equipamentos</h1>
  <p><strong>Trabalho de Conclusão de Curso (TCC)</strong></p>

  <p>
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
    <img src="https://img.shields.io/badge/Arduino-00979D?style=for-the-badge&logo=arduino&logoColor=white" alt="Arduino" />
  </p>
</div>

---

## 📋 Sobre o Projeto

O **SIMEQ** é uma plataforma web full-stack desenvolvida para modernizar e centralizar a gestão de ativos industriais, o controle de ordens de manutenção e o monitoramento preditivo de equipamentos em tempo real por meio de IoT (Internet das Coisas).

O sistema resolve o problema da descentralização de informações em ambientes operacionais, unindo o gerenciamento administrativo (cadastro de equipamentos, histórico de manutenções, controle de acesso e módulos operacionais) à telemetria física capturada via microcontrolador **Arduino** e acelerômetro **ADXL345**, permitindo identificar anomalias de vibração antes que ocorram falhas críticas.

---

## ✨ Principais Funcionalidades

- **🔐 Autenticação e Controle de Acesso:** Sistema seguro de login e gerenciamento de sessões de usuários (`express-session`), com preferências individuais e fluxo de *onboarding* (tutorial interativo para novos usuários).
- **🏭 Gestão de Equipamentos:** Cadastro completo, consulta, atualização e remoção (CRUD) de máquinas e ativos industriais.
- **🛠️ Controle de Manutenções:** Registro, acompanhamento e histórico de manutenções preventivas e corretivas vinculadas aos equipamentos.
- **📡 Monitoramento IoT & Análise de Vibração:** Integração com hardware (Arduino + sensor acelerômetro ADXL345) para leitura contínua de eixos de vibração e detecção de anomalias diretamente na interface web.
- **🧩 Arquitetura Modular:** Suporte a módulos operacionais expansíveis dentro da plataforma para adaptação a diferentes fluxos de trabalho.
- **🧪 Qualidade de Software Garantida:** Cobertura de testes automatizados unitários/integração (Jest) e testes de ponta a ponta / E2E (Cypress).

---

## 🛠️ Tecnologias Utilizadas

### **Back-end & Banco de Dados**
- **Node.js & Express:** Servidor web e construção da API RESTful.
- **TypeScript:** Tipagem estática para maior segurança, manutenibilidade e escalabilidade do código.
- **Prisma ORM:** Modelagem de dados, migrations versionadas e queries seguras.
- **SQLite:** Banco de dados relacional leve e embutido para persistência eficiente.

### **Front-end**
- **HTML5, CSS3 & TypeScript/JavaScript:** Interface responsiva, painel de controle dinâmico e visualização de dados de telemetria em tempo real.

### **Hardware / IoT**
- **Arduino (C++ / `.ino`):** Firmware dedicado para coleta e envio de dados seriais.
- **Sensor ADXL345:** Acelerômetro digital de 3 eixos para análise de vibração mecânica.

### **Testes & Qualidade de Código**
- **Jest:** Testes unitários e de rotas/modelos (`authTutorial`, `equipamentoModel`, `manutencoesCrud`, `modulosCrud`, `vibration`).
- **Cypress:** Testes automatizados E2E simulando a navegação real do usuário.
- **ESLint:** Padronização e análise estática de código.

---

## 🏗️ Arquitetura e Estrutura de Diretórios

O projeto segue o padrão arquitetural **MVC (Model-View-Controller)** combinado com camadas de roteamento e middlewares:

```text
Simeq-main/
├── arduino/
│   └── simeq_adxl345/         # Código-fonte (.ino) para leitura do sensor de vibração
├── cypress/
│   └── e2e/                   # Testes automatizados de ponta a ponta (E2E)
├── prisma/
│   ├── migrations/            # Histórico de migrações do banco de dados
│   ├── schema.prisma          # Definição das entidades e relacionamentos
│   ├── seed.ts                # Script para popular o banco com dados iniciais
│   └── dev.db                 # Arquivo do banco de dados SQLite
├── public/
│   ├── css/                   # Estilização global da aplicação
│   ├── images/                # Logotipos e ícones (favicon, logo-simeq)
│   ├── js/                    # Scripts compilados do cliente
│   └── index.html             # Ponto de entrada da interface web
├── src/
│   ├── config/                # Configurações de conexão (Prisma Client)
│   ├── controllers/           # Regras de negócio (Equipamentos, Manutenções, Usuários)
│   ├── frontend/              # Lógica front-end em TypeScript (script.ts, vibration.ts)
│   ├── middleware/            # Interceptadores de autenticação e proteção de rotas
│   ├── models/                # Camada de abstração e acesso aos dados
│   ├── routes/                # Definição dos endpoints da API REST
│   ├── tests/                 # Suíte de testes unitários e de integração (Jest)
│   ├── types/                 # Tipagens customizadas do TypeScript
│   └── server.ts              # Inicialização e configuração do servidor Express
├── package.json               # Dependências e scripts de execução
└── tsconfig.json              # Configurações do compilador TypeScript
```

---

## 🚀 Como Executar o Projeto Localmente

### **Pré-requisitos**
- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
- [Git](https://git-scm.com/)
- *(Opcional)* Arduino IDE para carregar o firmware no microcontrolador.

### **Passo a Passo**

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/Simeq-main.git
   cd Simeq-main
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Certifique-se de que o arquivo `.env` esteja presente na raiz do projeto contendo a URL do banco de dados:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

4. **Prepare o banco de dados (Prisma):**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```
   *(Opcional)* Para popular o banco com dados iniciais de demonstração:
   ```bash
   npx prisma db seed
   ```

5. **Inicie o servidor:**
   ```bash
   # Modo de desenvolvimento
   npm run dev

   # Ou compilação e execução em produção
   npm run build
   npm start
   ```

6. **Acesse a aplicação:**
   Abra o navegador e acesse `http://localhost:3000` *(verifique no terminal a porta exata exibida ao iniciar)*.

---

## 🔌 Configuração do Módulo IoT (Arduino + ADXL345)

Para habilitar o monitoramento de vibração em tempo real:
1. Conecte o sensor acelerômetro **ADXL345** ao **Arduino** via barramento I2C (`SDA`, `SCL`, `VCC` 3.3V/5V e `GND`).
2. Abra o arquivo `arduino/simeq_adxl345/simeq_adxl345.ino` na **Arduino IDE**.
3. Selecione a placa e a porta COM correspondente e faça o *upload* do código.
4. Consulte o arquivo `arduino/README.md` para detalhes específicos de pinagem e taxa de transmissão (*baud rate*).

---

## 🧪 Executando os Testes Automatizados

O SIMEQ conta com duas frentes de validação automatizada para garantir a estabilidade do sistema:

- **Testes Unitários e de Integração (Jest):**
  ```bash
  npm test
  ```

- **Testes End-to-End / Interface (Cypress):**
  ```bash
  npx cypress open
  ```

---

## 🔌 Principais Endpoints da API

| Recurso | Rota Base | Descrição |
| :--- | :--- | :--- |
| **Autenticação** | `/api/auth` | Login, logout, verificação de sessão e estado do tutorial |
| **Usuários** | `/api/usuarios` | Gestão de contas e preferências de usuários |
| **Equipamentos** | `/api/equipamentos` | CRUD completo dos equipamentos cadastrados |
| **Manutenções** | `/api/manutencoes` | Registro e consulta de ordens e históricos de manutenção |
| **Módulos** | `/api/modulos` | Gerenciamento dos módulos funcionais da plataforma |

---

## 👥 Autores e Orientação

- **Desenvolvedor(es):** [Seu Nome Completo / Nomes da Equipe]
- **Orientador(a):** Prof. [Nome do seu Professor Orientador]
- **Instituição:** [Nome da sua Escola / Faculdade / Universidade]
- **Curso:** [Nome do seu Curso — ex: Técnico em Desenvolvimento de Sistemas / Engenharia / Ciência da Computação]

---

<div align="center">
  <sub>Desenvolvido como Trabalho de Conclusão de Curso — SIMEQ © 2026</sub>
</div>
