/**
 * SIMEQ Frontend - Versão Definitiva para Apresentação
 * Gerencia navegação SPA, Autenticação e Todas as Telas.
 */

const app = document.getElementById('app');
let currentUser = null;

// Função de Inicialização
async function init() {
    try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.loggedIn) {
            currentUser = data.user;
            renderDashboard();
        } else {
            renderLogin();
        }
    } catch (err) {
        console.error("Erro na inicialização:", err);
        renderLogin();
    }
}

// --- Componentes de Layout ---

function renderLayout(contentHTML, activeLink) {
    app.innerHTML = `
        <div class="main-layout">
            <aside class="sidebar">
                <div class="sidebar-header">
                    <h2>SIMEQ</h2>
                    <p>SISTEMA INDUSTRIAL</p>
                </div>
                <nav>
                    <a onclick="renderDashboard()" class="${activeLink === 'dash' ? 'active' : ''}"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                    <a onclick="renderEquipamentos()" class="${activeLink === 'equip' ? 'active' : ''}"><i class="fas fa-tools"></i> Equipamentos</a>
                    <a onclick="renderManutencoes()" class="${activeLink === 'manut' ? 'active' : ''}"><i class="fas fa-history"></i> Manutenções</a>
                    <a onclick="renderMonitoramento()" class="${activeLink === 'monit' ? 'active' : ''}"><i class="fas fa-desktop"></i> Monitoramento</a>
                    <a onclick="renderRelatorios()" class="${activeLink === 'relat' ? 'active' : ''}"><i class="fas fa-file-alt"></i> Relatórios</a>
                    <a onclick="renderUsuarios()" class="${activeLink === 'user' ? 'active' : ''}"><i class="fas fa-users"></i> Usuários</a>
                    <a onclick="renderConfiguracoes()" class="${activeLink === 'config' ? 'active' : ''}"><i class="fas fa-cog"></i> Configurações</a>
                    <div class="sidebar-footer">
                        <a onclick="handleLogout()" class="logout-link"><i class="fas fa-sign-out-alt"></i> Sair</a>
                    </div>
                </nav>
            </aside>
            <main class="content">
                <header class="main-header">
                    <div class="breadcrumb">SIMEQ / ${activeLink.toUpperCase()}</div>
                    <div class="user-info">
                        <span class="user-name"><i class="fas fa-user-circle"></i> ${currentUser.nome}</span>
                        <span class="user-role">${currentUser.cargo}</span>
                    </div>
                </header>
                <div id="page-content" class="fade-in">
                    ${contentHTML}
                </div>
            </main>
        </div>
    `;
}

// --- Telas do Sistema ---

// 1. LOGIN
function renderLogin() {
    app.innerHTML = `
        <div class="login-container">
            <div class="login-box">
                <div class="login-logo">
                    <h1>SIMEQ</h1>
                    <p>Sistema Inteligente de Monitoramento</p>
                </div>
                <form id="loginForm">
                    <div class="form-group">
                        <label>E-mail</label>
                        <div class="input-icon">
                            <i class="fas fa-envelope"></i>
                            <input type="email" id="email" required placeholder="admin@simeq.com">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Senha</label>
                        <div class="input-icon">
                            <i class="fas fa-lock"></i>
                            <input type="password" id="senha" required placeholder="admin123">
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Entrar</button>
                    <p id="loginError" class="error-msg"></p>
                </form>
            </div>
        </div>
    `;

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        const errorEl = document.getElementById('loginError');
        errorEl.innerText = "Autenticando...";

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });
            const data = await res.json();
            if (data.success) {
                currentUser = data.user;
                renderDashboard();
            } else {
                errorEl.innerText = data.message;
            }
        } catch (err) {
            errorEl.innerText = "Erro de conexão com o servidor.";
        }
    });
}

// 2. DASHBOARD
async function renderDashboard() {
    try {
        const [resEquip, resManut] = await Promise.all([
            fetch('/api/equipamentos'),
            fetch('/api/manutencoes')
        ]);
        const equips = await resEquip.json();
        const manuts = await resManut.json();

        const total = equips.length;
        const criticos = equips.filter(e => e.criticidade === 'Alta').length;
        const urgentes = equips.filter(e => calcularStatus(e).label === 'Urgente').length;
        const ok = total - urgentes;

        const html = `
            <div class="page-header">
                <h2>Dashboard Geral</h2>
                <p>Indicadores de desempenho e estado dos ativos.</p>
            </div>
            <div class="dashboard-cards">
                <div class="card">
                    <div class="card-icon"><i class="fas fa-tools"></i></div>
                    <div class="card-body">
                        <h3>Total Equipamentos</h3>
                        <div class="value">${total}</div>
                    </div>
                </div>
                <div class="card success">
                    <div class="card-icon"><i class="fas fa-check-circle"></i></div>
                    <div class="card-body">
                        <h3>Equipamentos OK</h3>
                        <div class="value">${ok}</div>
                    </div>
                </div>
                <div class="card warning">
                    <div class="card-icon"><i class="fas fa-exclamation-triangle"></i></div>
                    <div class="card-body">
                        <h3>Críticos (Alta)</h3>
                        <div class="value">${criticos}</div>
                    </div>
                </div>
                <div class="card danger">
                    <div class="card-icon"><i class="fas fa-clock"></i></div>
                    <div class="card-body">
                        <h3>Manutenções Urgentes</h3>
                        <div class="value">${urgentes}</div>
                    </div>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="panel">
                    <h3><i class="fas fa-history"></i> Histórico Recente</h3>
                    <table>
                        <thead><tr><th>Equipamento</th><th>Data</th><th>Responsável</th></tr></thead>
                        <tbody>
                            ${manuts.slice(0, 5).map(m => `
                                <tr>
                                    <td><strong>${m.equipamento_nome}</strong></td>
                                    <td>${formatarData(m.data_manutencao)}</td>
                                    <td>${m.responsavel}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="3" class="text-center">Nenhuma manutenção registrada.</td></tr>'}
                        </tbody>
                    </table>
                </div>
                <div class="panel">
                    <h3><i class="fas fa-bolt"></i> Ações Rápidas</h3>
                    <div class="quick-actions">
                        <button class="btn btn-outline btn-block" onclick="renderNovoEquipamento()"><i class="fas fa-plus"></i> Novo Equipamento</button>
                        <button class="btn btn-outline btn-block" onclick="renderManutencoes()"><i class="fas fa-calendar-plus"></i> Registrar Manutenção</button>
                        <button class="btn btn-outline btn-block" onclick="renderRelatorios()"><i class="fas fa-file-pdf"></i> Gerar Relatório</button>
                    </div>
                </div>
            </div>
        `;
        renderLayout(html, 'dash');
    } catch (err) {
        console.error(err);
    }
}

// 3. EQUIPAMENTOS (CRUD COMPLETO)
async function renderEquipamentos() {
    const res = await fetch('/api/equipamentos');
    const equips = await res.json();
    
    const html = `
        <div class="header-actions">
            <div>
                <h2>Equipamentos</h2>
                <p>Gerencie os ativos industriais da empresa.</p>
            </div>
            <button class="btn btn-success" onclick="renderNovoEquipamento()"><i class="fas fa-plus"></i> Adicionar Ativo</button>
        </div>
        <div class="panel">
            <table>
                <thead>
                    <tr>
                        <th>Equipamento</th>
                        <th>Setor</th>
                        <th>Criticidade</th>
                        <th>Última Manut.</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${equips.map(e => `
                        <tr>
                            <td><strong>${e.nome}</strong><br><small class="text-muted">${e.tipo || ''}</small></td>
                            <td>${e.setor || 'N/A'}</td>
                            <td><span class="badge ${e.criticidade === 'Alta' ? 'urgente' : (e.criticidade === 'Média' ? 'atencao' : 'ok')}">${e.criticidade}</span></td>
                            <td>${formatarData(e.dataUltimaManutencao)}</td>
                            <td>
                                <button class="btn-icon" title="Editar" onclick="renderEditarEquipamento(${e.id})"><i class="fas fa-edit"></i></button>
                                <button class="btn-icon danger" title="Excluir" onclick="deletarEquipamento(${e.id})"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `).join('') || '<tr><td colspan="5" class="text-center">Nenhum equipamento cadastrado.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
    renderLayout(html, 'equip');
}

function renderNovoEquipamento() {
    const html = `
        <div class="page-header">
            <h2>Novo Equipamento</h2>
            <p>Cadastre um novo ativo para monitoramento.</p>
        </div>
        <div class="panel" style="max-width: 800px;">
            <form id="equipForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>Nome do Equipamento*</label>
                        <input type="text" id="nome" required placeholder="Ex: Motor Trifásico 5HP">
                    </div>
                    <div class="form-group">
                        <label>Tipo / Categoria</label>
                        <input type="text" id="tipo" placeholder="Ex: Motores">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Setor</label>
                        <input type="text" id="setor" placeholder="Ex: Usinagem">
                    </div>
                    <div class="form-group">
                        <label>Localização</label>
                        <input type="text" id="localizacao" placeholder="Ex: Linha 02">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Criticidade</label>
                        <select id="criticidade">
                            <option value="Baixa">Baixa</option>
                            <option value="Média" selected>Média</option>
                            <option value="Alta">Alta</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Frequência (Dias)</label>
                        <input type="number" id="frequencia" value="30">
                    </div>
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="observacoes" rows="3" placeholder="Detalhes adicionais..."></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-success">Salvar Equipamento</button>
                    <button type="button" class="btn btn-outline" onclick="renderEquipamentos()">Cancelar</button>
                </div>
            </form>
        </div>
    `;
    renderLayout(html, 'equip');
    
    document.getElementById('equipForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
            nome: document.getElementById('nome').value,
            tipo: document.getElementById('tipo').value,
            setor: document.getElementById('setor').value,
            localizacao: document.getElementById('localizacao').value,
            criticidade: document.getElementById('criticidade').value,
            frequenciaDias: document.getElementById('frequencia').value,
            observacoes: document.getElementById('observacoes').value
        };
        const res = await fetch('/api/equipamentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (res.ok) renderEquipamentos();
    });
}

async function renderEditarEquipamento(id) {
    try {
        const res = await fetch(`/api/equipamentos/${id}`);
        if (!res.ok) throw new Error("Erro ao buscar dados do equipamento.");
        const equip = await res.json();

        const dataFormatada = equip.dataUltimaManutencao ? equip.dataUltimaManutencao.split('T')[0] : '';

        const html = `
            <div class="page-header">
                <h2>Editar Equipamento</h2>
                <p>Modifique as informações do ativo industrial.</p>
            </div>
            <div class="panel" style="max-width: 800px;">
                <form id="editEquipForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nome do Equipamento*</label>
                            <input type="text" id="edit_nome" required value="${equip.nome || ''}">
                        </div>
                        <div class="form-group">
                            <label>Tipo / Categoria</label>
                            <input type="text" id="edit_tipo" value="${equip.tipo || ''}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Setor</label>
                            <input type="text" id="edit_setor" value="${equip.setor || ''}">
                        </div>
                        <div class="form-group">
                            <label>Localização</label>
                            <input type="text" id="edit_localizacao" value="${equip.localizacao || ''}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Responsável Técnico</label>
                            <input type="text" id="edit_responsavel" value="${equip.responsavel || ''}">
                        </div>
                        <div class="form-group">
                            <label>Data Última Manutenção</label>
                            <input type="date" id="edit_dataUltima" value="${dataFormatada}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Criticidade</label>
                            <select id="edit_criticidade">
                                <option value="Baixa" ${equip.criticidade === 'Baixa' ? 'selected' : ''}>Baixa</option>
                                <option value="Média" ${equip.criticidade === 'Média' ? 'selected' : ''}>Média</option>
                                <option value="Alta" ${equip.criticidade === 'Alta' ? 'selected' : ''}>Alta</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Frequência (Dias)</label>
                            <input type="number" id="edit_frequencia" value="${equip.frequenciaDias || 30}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Observações</label>
                        <textarea id="edit_observacoes" rows="3">${equip.observacoes || ''}</textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Atualizar Alterações</button>
                        <button type="button" class="btn btn-outline" onclick="renderEquipamentos()">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        renderLayout(html, 'equip');

        document.getElementById('editEquipForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const body = {
                nome: document.getElementById('edit_nome').value,
                tipo: document.getElementById('edit_tipo').value,
                setor: document.getElementById('edit_setor').value,
                localizacao: document.getElementById('edit_localizacao').value,
                responsavel: document.getElementById('edit_responsavel').value,
                dataUltimaManutencao: document.getElementById('edit_dataUltima').value || null,
                criticidade: document.getElementById('edit_criticidade').value,
                frequenciaDias: parseInt(document.getElementById('edit_frequencia').value, 10),
                observacoes: document.getElementById('edit_observacoes').value
            };

            const response = await fetch(`/api/equipamentos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                renderEquipamentos();
            } else {
                const errData = await response.json();
                alert(errData.message || 'Erro ao atualizar equipamento.');
            }
        });

    } catch (err) {
        console.error(err);
        alert("Não foi possível carregar os dados do equipamento.");
    }
}

// 4. MANUTENÇÕES
async function renderManutencoes() {
    const [resEquip, resManut] = await Promise.all([
        fetch('/api/equipamentos'),
        fetch('/api/manutencoes')
    ]);
    const equips = await resEquip.json();
    const manuts = await resManut.json();

    const html = `
        <div class="page-header">
            <h2>Manutenções</h2>
            <p>Registre novas intervenções e consulte o histórico.</p>
        </div>
        <div class="dashboard-grid">
            <div class="panel">
                <h3><i class="fas fa-edit"></i> Registrar Manutenção</h3>
                <form id="manutForm">
                    <div class="form-group">
                        <label>Equipamento*</label>
                        <select id="equip_id" required>
                            <option value="">Selecione um equipamento...</option>
                            ${equips.map(e => `<option value="${e.id}">${e.nome}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Data da Intervenção*</label>
                        <input type="date" id="data_manut" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label>Responsável*</label>
                        <input type="text" id="resp" required placeholder="Nome do técnico">
                    </div>
                    <div class="form-group">
                        <label>Descrição das Atividades*</label>
                        <textarea id="desc" required rows="3" placeholder="O que foi feito?"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Salvar Registro</button>
                </form>
            </div>
            <div class="panel">
                <h3><i class="fas fa-list"></i> Histórico Completo</h3>
                <div class="table-scroll">
                    <table>
                        <thead><tr><th>Data</th><th>Ativo</th><th>Descrição</th></tr></thead>
                        <tbody>
                            ${manuts.map(m => `
                                <tr>
                                    <td>${formatarData(m.data_manutencao)}</td>
                                    <td><strong>${m.equipamento_nome}</strong></td>
                                    <td>${m.descricao}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="3" class="text-center">Sem registros.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    renderLayout(html, 'manut');

    document.getElementById('manutForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
            equipamento_id: document.getElementById('equip_id').value,
            data_manutencao: document.getElementById('data_manut').value,
            responsavel: document.getElementById('resp').value,
            descricao: document.getElementById('desc').value
        };
        const res = await fetch('/api/manutencoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (res.ok) renderManutencoes();
    });
}

// 5. MONITORAMENTO
async function renderMonitoramento() {
    const res = await fetch('/api/equipamentos');
    const equips = await res.json();
    
    const html = `
        <div class="page-header">
            <h2>Monitoramento em Tempo Real</h2>
            <p>Cálculo automático de status baseado na frequência de manutenção.</p>
        </div>
        <div class="panel">
            <table>
                <thead>
                    <tr>
                        <th>Equipamento</th>
                        <th>Última Manut.</th>
                        <th>Frequência</th>
                        <th>Status Atual</th>
                        <th>Dias Restantes</th>
                    </tr>
                </thead>
                <tbody>
                    ${equips.map(e => {
                        const status = calcularStatus(e);
                        return `
                        <tr>
                            <td><strong>${e.nome}</strong></td>
                            <td>${formatarData(e.dataUltimaManutencao)}</td>
                            <td>${e.frequenciaDias} dias</td>
                            <td><span class="badge ${status.class}">${status.label}</span></td>
                            <td><strong>${status.dias}</strong></td>
                        </tr>`;
                    }).join('') || '<tr><td colspan="5" class="text-center">Nenhum equipamento para monitorar.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
    renderLayout(html, 'monit');
}

// 6. RELATÓRIOS
async function renderRelatorios() {
    const [resEquip, resManut] = await Promise.all([
        fetch('/api/equipamentos'),
        fetch('/api/manutencoes')
    ]);
    const equips = await resEquip.json();
    const manuts = await resManut.json();
    
    const html = `
        <div class="header-actions">
            <div>
                <h2>Relatórios</h2>
                <p>Análise de dados e exportação.</p>
            </div>
            <button class="btn btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Imprimir Página</button>
        </div>
        <div class="dashboard-grid">
            <div class="panel">
                <h3>Equipamentos por Setor</h3>
                <table>
                    <thead><tr><th>Setor</th><th>Quantidade</th></tr></thead>
                    <tbody>
                        ${Array.from(new Set(equips.map(e => e.setor || 'Não Definido'))).map(setor => `
                            <tr><td>${setor}</td><td>${equips.filter(e => (e.setor || 'Não Definido') === setor).length}</td></tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="panel">
                <h3>Resumo de Manutenções</h3>
                <p>Total Realizado: <strong>${manuts.length}</strong></p>
                <p>Equipamentos Monitorados: <strong>${equips.length}</strong></p>
            </div>
        </div>
    `;
    renderLayout(html, 'relat');
}

// 7. USUÁRIOS (CRUD COMPLETO)
async function renderUsuarios() {
    const res = await fetch('/api/usuarios');
    const users = await res.json();
    
    const html = `
        <div class="header-actions">
            <div>
                <h2>Gestão de Usuários</h2>
                <p>Administre quem tem acesso ao sistema SIMEQ.</p>
            </div>
            <button class="btn btn-primary" onclick="renderNovoUsuario()"><i class="fas fa-user-plus"></i> Novo Usuário</button>
        </div>
        <div class="panel">
            <table>
                <thead><tr><th>Nome</th><th>E-mail</th><th>Cargo</th><th>Data Cadastro</th><th>Ações</th></tr></thead>
                <tbody>
                    ${users.map(u => `
                        <tr>
                            <td><strong>${u.nome}</strong></td>
                            <td>${u.email}</td>
                            <td>${u.cargo}</td>
                            <td>${formatarData(u.dataCadastro)}</td>
                            <td>
                                <button class="btn-icon" title="Editar" onclick="renderEditarUsuario(${u.id})"><i class="fas fa-edit"></i></button>
                                <button class="btn-icon danger" title="Excluir" onclick="deletarUsuario(${u.id})"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    renderLayout(html, 'user');
}

function renderNovoUsuario() {
    const html = `
        <div class="page-header">
            <h2>Novo Usuário / Funcionário</h2>
            <p>Cadastre um novo colaborador com acesso ao sistema SIMEQ.</p>
        </div>
        <div class="panel" style="max-width: 600px;">
            <form id="userForm">
                <div class="form-group">
                    <label>Nome Completo*</label>
                    <input type="text" id="user_nome" required placeholder="Ex: João Silva">
                </div>
                <div class="form-group">
                    <label>E-mail*</label>
                    <input type="email" id="user_email" required placeholder="Ex: joao@simeq.com">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Senha*</label>
                        <input type="password" id="user_senha" required placeholder="Mínimo 6 caracteres">
                    </div>
                    <div class="form-group">
                        <label>Cargo / Função*</label>
                        <select id="user_cargo" required>
                            <option value="Técnico">Técnico</option>
                            <option value="Gerente">Gerente</option>
                            <option value="Operador">Operador</option>
                        </select>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Salvar Usuário</button>
                    <button type="button" class="btn btn-outline" onclick="renderUsuarios()">Cancelar</button>
                </div>
            </form>
        </div>
    `;
    renderLayout(html, 'user');
    
    document.getElementById('userForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const body = {
            nome: document.getElementById('user_nome').value,
            email: document.getElementById('user_email').value,
            senha: document.getElementById('user_senha').value,
            cargo: document.getElementById('user_cargo').value
        };

        try {
            const res = await fetch('/api/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                renderUsuarios();
            } else {
                const data = await res.json();
                alert(data.message || 'Erro ao criar usuário.');
            }
        } catch (err) {
            console.error(err);
            alert('Erro de conexão ao salvar usuário.');
        }
    });
}

async function renderEditarUsuario(id) {
    try {
        const res = await fetch(`/api/usuarios/${id}`);
        if (!res.ok) throw new Error("Erro ao buscar dados do usuário.");
        const user = await res.json();

        const html = `
            <div class="page-header">
                <h2>Editar Usuário / Funcionário</h2>
                <p>Modifique as informações cadastrais e permissões.</p>
            </div>
            <div class="panel" style="max-width: 600px;">
                <form id="editUserForm">
                    <div class="form-group">
                        <label>Nome Completo*</label>
                        <input type="text" id="edit_user_nome" required value="${user.nome || ''}">
                    </div>
                    <div class="form-group">
                        <label>E-mail*</label>
                        <input type="email" id="edit_user_email" required value="${user.email || ''}">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nova Senha (Deixe em branco para não alterar)</label>
                            <input type="password" id="edit_user_senha" placeholder="Digite uma nova senha se desejar">
                        </div>
                        <div class="form-group">
                            <label>Cargo / Função*</label>
                            <select id="edit_user_cargo" required>
                                <option value="Técnico" ${user.cargo === 'Técnico' ? 'selected' : ''}>Técnico</option>
                                <option value="Gerente" ${user.cargo === 'Gerente' ? 'selected' : ''}>Gerente</option>
                                <option value="Operador" ${user.cargo === 'Operador' ? 'selected' : ''}>Operador</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Atualizar Usuário</button>
                        <button type="button" class="btn btn-outline" onclick="renderUsuarios()">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        renderLayout(html, 'user');

        document.getElementById('editUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const body = {
                nome: document.getElementById('edit_user_nome').value,
                email: document.getElementById('edit_user_email').value,
                cargo: document.getElementById('edit_user_cargo').value
            };

            const senhaInput = document.getElementById('edit_user_senha').value;
            if (senhaInput) {
                body.senha = senhaInput;
            }

            const response = await fetch(`/api/usuarios/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                renderUsuarios();
            } else {
                const errData = await response.json();
                alert(errData.message || 'Erro ao atualizar usuário.');
            }
        });

    } catch (err) {
        console.error(err);
        alert("Não foi possível carregar os dados do usuário.");
    }
}

async function deletarUsuario(id) {
    if (confirm('Deseja realmente excluir este usuário? Esta ação não pode ser desfeita.')) {
        try {
            const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
            if (res.ok) {
                renderUsuarios();
            } else {
                const data = await res.json();
                alert(data.message || 'Erro ao excluir usuário.');
            }
        } catch (err) {
            console.error(err);
            alert('Erro de conexão ao deletar usuário.');
        }
    }
}

// 8. CONFIGURAÇÕES
function renderConfiguracoes() {
    const html = `
        <div class="page-header">
            <h2>Configurações</h2>
            <p>Ajustes globais do sistema.</p>
        </div>
        <div class="panel" style="max-width: 700px;">
            <div class="form-group">
                <label>Nome da Instituição/Empresa</label>
                <input type="text" value="Minha Indústria S.A.">
            </div>
            <div class="form-group">
                <label>E-mail para Notificações</label>
                <input type="email" value="manutencao@empresa.com">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Fuso Horário</label>
                    <select><option>Brasília (GMT-3)</option><option>Lisboa (GMT+0)</option></select>
                </div>
                <div class="form-group">
                    <label>Idioma do Sistema</label>
                    <select><option>Português (BR)</option><option>Português (PT)</option><option>English</option></select>
                </div>
            </div>
            <hr style="margin: 1.5rem 0; border: 0; border-top: 1px solid #eee;">
            <button class="btn btn-primary" onclick="alert('Configurações salvas com sucesso!')">Salvar Alterações</button>
        </div>
    `;
    renderLayout(html, 'config');
}

// --- Funções Auxiliares ---

function formatarData(dataStr) {
    if (!dataStr) return '---';
    const d = new Date(dataStr);
    return d.toLocaleDateString('pt-BR');
}

function calcularStatus(e) {
    if (!e.dataUltimaManutencao) return { label: 'Urgente', class: 'urgente', dias: 'Imediato' };
    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    const ultima = new Date(e.dataUltimaManutencao);
    ultima.setHours(0,0,0,0);
    
    const proxima = new Date(ultima.getTime() + (e.frequenciaDias * 24 * 60 * 60 * 1000));
    const diffTime = proxima - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Urgente', class: 'urgente', dias: `${Math.abs(diffDays)} dias em atraso` };
    if (diffDays <= 15) return { label: 'Atenção', class: 'atencao', dias: `${diffDays} dias restantes` };
    return { label: 'OK', class: 'ok', dias: `${diffDays} dias restantes` };
}

async function deletarEquipamento(id) {
    if (confirm('Deseja realmente excluir este equipamento?')) {
        const res = await fetch(`/api/equipamentos/${id}`, { method: 'DELETE' });
        if (res.ok) renderEquipamentos();
    }
}

async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    renderLogin();
}

// Inicializar aplicação
init();