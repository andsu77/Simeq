"use strict";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/** Fonte TypeScript compilada para public/js/script.js. */
/**
 * SIMEQ Frontend - Versão Definitiva para Apresentação
 * Gerencia navegação SPA, Autenticação e Todas as Telas.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vibration_1 = require("./vibration");
const app = document.getElementById('app');
let currentUser = null;
let tutorialStep = 0;
let tutorialKeyHandler = null;
let iotPort = null;
let iotReader = null;
let iotReading = false;
let iotConnecting = false;
let iotHasReceivedData = false;
let iotLastDataAt = 0;
let iotStatusTimer = null;
let iotSamples = [];
const defaultPreferences = {
    theme: 'dark',
    compactDashboard: false,
    showDashboardOrders: true,
    showDashboardAlerts: true
};
function applyTheme(theme) {
    document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.style.colorScheme = theme === 'light' ? 'light' : 'dark';
}
const tutorialSteps = [
    { path: '/dashboard', target: 'sidebar', title: 'Menu lateral', description: 'Use o menu para navegar pelas áreas do SIMEQ. As opções e ações disponíveis podem variar conforme o acesso da sua conta.' },
    { path: '/dashboard', target: 'dashboard-cards', title: 'Dashboard', description: 'Veja os indicadores operacionais, alertas (se habilitados nas preferências) e as informações prioritárias para a sua rotina.' },
    { path: '/equipamentos', target: 'equipment-list', title: 'Equipamentos', description: 'Consulte e pesquise os ativos cadastrados. Use “Adicionar Ativo” para incluir nome, setor, responsável, localização e dados de manutenção; os controles da linha permitem editar ou excluir.' },
    { path: '/planos', target: 'maintenance-plans', title: 'Planos de manutenção', description: 'Cadastre planos preventivos e defina periodicidade, próxima execução, responsável e instruções para organizar as rotinas.' },
    { path: '/ordens', target: 'service-orders', title: 'Ordens de serviço', description: 'Registre e acompanhe solicitações. Consulte o equipamento, responsável, prioridade, prazo e andamento de cada ordem.' },
    { path: '/monitoramento', target: 'equipment-monitoring', title: 'Monitoramento e atenção', description: 'Confira o prazo de manutenção de cada equipamento. O status é calculado com base na última manutenção registrada e na frequência definida.' },
    { path: '/alertas', target: 'alert-list', title: 'Alertas e notificações', description: 'Consulte alertas, sua severidade e estado para identificar ocorrências que precisam de atenção e priorizar ações.' },
    { path: '/monitoramento-iot', target: 'iot-monitor', title: 'IoT e sensores', description: 'Com o módulo Arduino liberado para sua conta, conecte o sensor por USB e acompanhe a vibração RMS e o nível calculado pelo dispositivo.', iotOnly: true },
    { path: '/relatorios', target: 'report-export', title: 'Relatórios', description: 'Consulte equipamentos, ordens, planos, manutenções e falhas recentes. A opção disponível nesta tela permite imprimir ou salvar o relatório em PDF.' },
    { path: '/configuracoes', target: 'account-settings', title: 'Perfil e configurações', description: 'Atualize seus dados de perfil e personalize o dashboard. A opção Ajuda permite rever este tutorial; alterações de acesso ao Arduino são feitas por um gerente após a compra.' }
];
// Mapa de rotas: cada aba principal tem seu próprio endereço (mesma porta/servidor)
const routes = {
    '/login': renderLogin,
    '/dashboard': renderDashboard,
    '/equipamentos': renderEquipamentos,
    '/manutencoes': renderManutencoes,
    '/monitoramento': renderMonitoramento,
    '/monitoramento-iot': renderMonitoramentoIoT,
    '/relatorios': renderRelatorios,
    '/usuarios': renderUsuarios,
    '/configuracoes': renderConfiguracoes,
    '/setores': renderSetores,
    '/planos': renderPlanos,
    '/ordens': renderOrdens,
    '/falhas': renderFalhas,
    '/alertas': renderAlertas,
    '/auditoria': renderAuditoria
};
function setRoute(path) {
    if (window.location.pathname !== path) {
        history.pushState({}, '', path);
    }
}
function renderMonitoramentoIoT() {
    return renderMonitoramento(true);
}
async function renderRotaAtual() {
    const renderFn = routes[window.location.pathname] || renderDashboard;
    await renderFn();
}
// Suporte aos botões voltar/avançar do navegador
window.addEventListener('popstate', () => {
    if (!currentUser) {
        renderLogin();
        return;
    }
    renderRotaAtual();
});
// Função de Inicialização
async function init() {
    try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.loggedIn) {
            currentUser = data.user;
            currentUser.preferences = { ...defaultPreferences, ...(data.user.preferences || {}) };
            applyTheme(currentUser.preferences.theme);
            await renderRotaAtual();
            await maybeStartOnboarding();
        }
        else {
            renderLogin();
        }
    }
    catch (err) {
        console.error("Erro na inicialização:", err);
        renderLogin();
    }
}
function availableTutorialSteps() {
    return tutorialSteps.filter(step => {
        if (step.iotOnly && !currentUser?.iotEnabled)
            return false;
        if (step.path === '/dashboard')
            return true;
        return Boolean(document.querySelector(`.sidebar [data-route="${step.path}"]`));
    });
}
function clearTutorialPresentation() {
    const overlay = document.getElementById('tutorial-overlay');
    overlay?._cleanup?.();
    document.getElementById('tutorial-overlay')?.remove();
    document.getElementById('tutorial-welcome')?.remove();
    if (tutorialKeyHandler) {
        document.removeEventListener('keydown', tutorialKeyHandler);
        tutorialKeyHandler = null;
    }
}
async function maybeStartOnboarding() {
    if (currentUser?.tutorialStatus === 'COMPLETED' || currentUser?.tutorialStatus === 'SKIPPED')
        return;
    try {
        const response = await fetch('/api/auth/tutorial/start', { method: 'POST' });
        const data = await response.json();
        if (!response.ok)
            throw new Error(data.message || 'Não foi possível consultar o tutorial.');
        currentUser.tutorialStatus = data.status;
        if (data.showWelcome) {
            renderTutorialWelcome();
        }
    }
    catch (error) {
        console.error('Erro ao iniciar o tutorial:', error);
        showToast(error.message || 'Não foi possível consultar o tutorial.', 'error');
    }
}
function renderTutorialWelcome() {
    clearTutorialPresentation();
    const welcome = document.createElement('div');
    welcome.id = 'tutorial-welcome';
    welcome.className = 'tutorial-welcome-overlay';
    welcome.innerHTML = `
        <section class="tutorial-welcome" role="dialog" aria-modal="true" aria-labelledby="tutorial-welcome-title">
            <img src="/images/favicon.png" alt="Logo SIMEQ" class="tutorial-logo">
            <h2 id="tutorial-welcome-title">Bem-vindo ao SIMEQ!</h2>
            <p>Vamos mostrar rapidamente como utilizar o sistema para monitorar equipamentos e gerenciar manutenções.</p>
            <div class="tutorial-actions">
                <button type="button" class="btn btn-primary" data-tutorial-start>Começar tutorial</button>
                <button type="button" class="btn btn-outline" data-tutorial-skip>Pular tutorial</button>
            </div>
        </section>`;
    document.body.appendChild(welcome);
    welcome.querySelector('[data-tutorial-start]').addEventListener('click', () => showTutorialStep(0));
    welcome.querySelector('[data-tutorial-skip]').addEventListener('click', () => finishTutorial('SKIPPED'));
    welcome.querySelector('[data-tutorial-start]').focus();
    tutorialKeyHandler = event => {
        if (event.key === 'Escape') {
            event.preventDefault();
            finishTutorial('SKIPPED');
        }
    };
    document.addEventListener('keydown', tutorialKeyHandler);
}
async function showTutorialStep(index) {
    const steps = availableTutorialSteps();
    if (!steps.length) {
        showToast('Não há etapas disponíveis para as permissões desta conta.', 'error');
        return;
    }
    tutorialStep = Math.max(0, Math.min(index, steps.length - 1));
    const step = steps[tutorialStep];
    clearTutorialPresentation();
    if (routes[step.path])
        await routes[step.path]();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const target = document.querySelector(`[data-tour="${step.target}"]`) || document.getElementById('page-content');
    target.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' });
    const overlay = document.createElement('div');
    overlay.id = 'tutorial-overlay';
    overlay.className = 'tutorial-overlay';
    overlay.innerHTML = `
        <div class="tutorial-spotlight" aria-hidden="true"></div>
        <section class="tutorial-popover" role="dialog" aria-modal="true" aria-labelledby="tutorial-step-title" aria-describedby="tutorial-step-description">
            <p class="tutorial-progress"></p>
            <h2 id="tutorial-step-title"></h2>
            <p id="tutorial-step-description"></p>
            <div class="tutorial-actions">
                <button type="button" class="btn btn-outline" data-tutorial-previous>Anterior</button>
                <button type="button" class="btn btn-outline" data-tutorial-skip>Pular tutorial</button>
                <button type="button" class="btn btn-primary" data-tutorial-next></button>
            </div>
        </section>`;
    document.body.appendChild(overlay);
    const spotlight = overlay.querySelector('.tutorial-spotlight');
    const popover = overlay.querySelector('.tutorial-popover');
    overlay.querySelector('.tutorial-progress').textContent = `Etapa ${tutorialStep + 1} de ${steps.length}`;
    overlay.querySelector('#tutorial-step-title').textContent = step.title;
    overlay.querySelector('#tutorial-step-description').textContent = step.description;
    const previous = overlay.querySelector('[data-tutorial-previous]');
    const next = overlay.querySelector('[data-tutorial-next]');
    previous.hidden = tutorialStep === 0;
    next.textContent = tutorialStep === steps.length - 1 ? 'Concluir' : 'Próximo';
    previous.addEventListener('click', () => showTutorialStep(tutorialStep - 1));
    next.addEventListener('click', () => tutorialStep === steps.length - 1 ? finishTutorial('COMPLETED') : showTutorialStep(tutorialStep + 1));
    overlay.querySelector('[data-tutorial-skip]').addEventListener('click', () => finishTutorial('SKIPPED'));
    const position = () => {
        const rect = target.getBoundingClientRect();
        spotlight.style.top = `${Math.max(4, rect.top - 5)}px`;
        spotlight.style.left = `${Math.max(4, rect.left - 5)}px`;
        spotlight.style.width = `${Math.min(window.innerWidth - 8, rect.width + 10)}px`;
        spotlight.style.height = `${Math.min(window.innerHeight - 8, rect.height + 10)}px`;
        const popoverRect = popover.getBoundingClientRect();
        const left = Math.min(Math.max(12, rect.left + rect.width / 2 - popoverRect.width / 2), window.innerWidth - popoverRect.width - 12);
        const below = rect.bottom + 16;
        const top = below + popoverRect.height < window.innerHeight - 12 ? below : Math.max(12, rect.top - popoverRect.height - 16);
        popover.style.left = `${left}px`;
        popover.style.top = `${top}px`;
    };
    position();
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    overlay._cleanup = () => {
        window.removeEventListener('resize', position);
        window.removeEventListener('scroll', position, true);
    };
    tutorialKeyHandler = event => {
        if (event.key === 'Escape') {
            event.preventDefault();
            finishTutorial('SKIPPED');
        }
        else if (event.key === 'ArrowRight' && tutorialStep < steps.length - 1) {
            showTutorialStep(tutorialStep + 1);
        }
        else if (event.key === 'ArrowLeft' && tutorialStep > 0) {
            showTutorialStep(tutorialStep - 1);
        }
    };
    document.addEventListener('keydown', tutorialKeyHandler);
    next.focus();
}
async function finishTutorial(status) {
    const needsPersistence = currentUser?.tutorialStatus !== 'COMPLETED' && currentUser?.tutorialStatus !== 'SKIPPED';
    if (needsPersistence) {
        try {
            const response = await fetch('/api/auth/tutorial/state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message || 'Não foi possível salvar o estado do tutorial.');
            currentUser.tutorialStatus = data.status;
        }
        catch (error) {
            console.error('Erro ao salvar o estado do tutorial:', error);
            showToast(error.message || 'Não foi possível salvar o estado do tutorial. Tente novamente.', 'error');
            return;
        }
    }
    const overlay = document.getElementById('tutorial-overlay');
    overlay?._cleanup?.();
    clearTutorialPresentation();
    showToast(status === 'COMPLETED' ? 'Tutorial concluído.' : 'Tutorial ignorado.');
}
function startTutorialFromSettings() {
    renderTutorialWelcome();
}
// --- Componentes de Layout ---
function renderLayout(contentHTML, activeLink) {
    if (iotReading && !['/monitoramento', '/monitoramento-iot'].includes(window.location.pathname)) {
        void disconnectIotSerial();
    }
    app.innerHTML = `
        <div class="main-layout">
            <aside class="sidebar" data-tour="sidebar">
                <div class="sidebar-header">
                    <div class="sidebar-brand">
                        <div>
                            <h2>SIMEQ</h2>
                            <p>SISTEMA INDUSTRIAL</p>
                        </div>
                        <img src="/images/favicon.png" alt="" aria-hidden="true">
                    </div>
                </div>
                <nav>
                    <a data-route="/dashboard" onclick="renderDashboard()" class="${activeLink === 'dash' ? 'active' : ''}"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                    <a data-route="/equipamentos" onclick="renderEquipamentos()" class="${activeLink === 'equip' ? 'active' : ''}"><i class="fas fa-tools"></i> Equipamentos</a>
                    <a data-route="/manutencoes" onclick="renderManutencoes()" class="${activeLink === 'manut' ? 'active' : ''}"><i class="fas fa-history"></i> Manutenções</a>
                    <a data-route="/monitoramento" onclick="renderMonitoramento()" class="${activeLink === 'monit' ? 'active' : ''}"><i class="fas fa-desktop"></i> Monitoramento</a>
                    ${currentUser?.iotEnabled ? `<a data-route="/monitoramento-iot" onclick="renderMonitoramentoIoT()" class="${activeLink === 'iot' ? 'active' : ''}"><i class="fas fa-wave-square"></i> Arduino / IoT</a>` : ''}
                    <a data-route="/relatorios" onclick="renderRelatorios()" class="${activeLink === 'relat' ? 'active' : ''}"><i class="fas fa-file-alt"></i> Relatórios</a>
                    <a data-route="/setores" onclick="renderSetores()" class="${activeLink === 'setores' ? 'active' : ''}"><i class="fas fa-sitemap"></i> Setores</a>
                    <a data-route="/planos" onclick="renderPlanos()" class="${activeLink === 'planos' ? 'active' : ''}"><i class="fas fa-calendar-check"></i> Planos</a>
                    <a data-route="/ordens" onclick="renderOrdens()" class="${activeLink === 'ordens' ? 'active' : ''}"><i class="fas fa-clipboard-list"></i> Ordens de serviço</a>
                    <a data-route="/falhas" onclick="renderFalhas()" class="${activeLink === 'falhas' ? 'active' : ''}"><i class="fas fa-bug"></i> Falhas</a>
                    <a data-route="/alertas" onclick="renderAlertas()" class="${activeLink === 'alertas' ? 'active' : ''}"><i class="fas fa-bell"></i> Alertas</a>
                    ${currentUser?.cargo === 'Gerente' ? `<a data-route="/usuarios" onclick="renderUsuarios()" class="${activeLink === 'user' ? 'active' : ''}"><i class="fas fa-users"></i> Usuários</a>` : ''}
                    <a data-route="/auditoria" onclick="renderAuditoria()" class="${activeLink === 'auditoria' ? 'active' : ''}"><i class="fas fa-shield-alt"></i> Auditoria</a>
                    <a data-route="/configuracoes" onclick="renderConfiguracoes()" class="${activeLink === 'config' ? 'active' : ''}"><i class="fas fa-cog"></i> Configurações</a>
                    <div class="sidebar-footer">
                        <a onclick="handleLogout()" class="logout-link"><i class="fas fa-sign-out-alt"></i> Sair</a>
                    </div>
                </nav>
            </aside>
            <main class="content">
                <header class="main-header">
                    <div class="breadcrumb">SIMEQ / ${activeLink.toUpperCase()}</div>
                    <div class="user-info">
                        <span class="user-name"><i class="fas fa-user-circle"></i> ${escapeHTML(currentUser.nome)}</span>
                        <span class="user-role">${escapeHTML(currentUser.cargo)}</span>
                    </div>
                </header>
                <div id="page-content" class="fade-in">
                    ${contentHTML}
                </div>
            </main>
        </div>
    `;
    ensureFeedbackHost();
}
function ensureFeedbackHost() {
    if (document.getElementById('feedback-host'))
        return;
    const host = document.createElement('div');
    host.id = 'feedback-host';
    host.className = 'app-toast-stack';
    document.body.appendChild(host);
}
function showToast(message, type = 'success') {
    ensureFeedbackHost();
    const host = document.getElementById('feedback-host');
    const toast = document.createElement('div');
    toast.className = `app-toast ${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.innerHTML = `<span class="app-toast-icon"><i class="fas ${type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i></span><span class="app-toast-message"></span><button type="button" class="app-toast-close" aria-label="Fechar notificação"><i class="fas fa-times"></i></button>`;
    toast.querySelector('.app-toast-message').textContent = message;
    const dismiss = () => toast.remove();
    toast.querySelector('.app-toast-close').addEventListener('click', dismiss);
    host.appendChild(toast);
    window.setTimeout(dismiss, 5000);
}
function confirmarAcao({ title = 'Confirmar ação', message, confirmLabel = 'Confirmar', danger = true }) {
    ensureFeedbackHost();
    const host = document.getElementById('feedback-host');
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        overlay.innerHTML = `
            <section class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
                <div class="confirm-dialog-icon ${danger ? 'danger' : ''}"><i class="fas ${danger ? 'fa-exclamation' : 'fa-circle-question'}"></i></div>
                <h2 id="confirm-title"></h2>
                <p class="confirm-dialog-message"></p>
                <div class="confirm-dialog-actions">
                    <button type="button" class="btn btn-outline confirm-cancel">Cancelar</button>
                    <button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'} confirm-accept"></button>
                </div>
            </section>`;
        overlay.querySelector('#confirm-title').textContent = title;
        overlay.querySelector('.confirm-dialog-message').textContent = message;
        overlay.querySelector('.confirm-accept').textContent = confirmLabel;
        const finish = answer => {
            document.removeEventListener('keydown', onKeyDown);
            overlay.remove();
            resolve(answer);
        };
        const onKeyDown = event => {
            if (event.key === 'Escape')
                finish(false);
            if (event.key === 'Enter' && document.activeElement === overlay.querySelector('.confirm-accept'))
                finish(true);
        };
        overlay.addEventListener('click', event => {
            if (event.target === overlay)
                finish(false);
        });
        overlay.querySelector('.confirm-cancel').addEventListener('click', () => finish(false));
        overlay.querySelector('.confirm-accept').addEventListener('click', () => finish(true));
        document.addEventListener('keydown', onKeyDown);
        host.appendChild(overlay);
        overlay.querySelector('.confirm-accept').focus();
    });
}
// --- Telas do Sistema ---
// 1. LOGIN
function renderLogin() {
    setRoute('/login');
    app.innerHTML = `
        <div class="login-container">
            <div class="login-box">
                <div class="login-logo">
                    <img class="brand-logo brand-logo-login" src="/images/logo-simeq.png" alt="SIMEQ">
                    <p>Sistema Industrial de Monitoramento de Equipamentos</p>
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
                currentUser.preferences = { ...defaultPreferences, ...(data.user.preferences || {}) };
                applyTheme(currentUser.preferences.theme);
                await renderDashboard();
                await maybeStartOnboarding();
            }
            else {
                errorEl.innerText = data.message;
            }
        }
        catch {
            errorEl.innerText = "Erro de conexão com o servidor.";
        }
    });
}
// 2. DASHBOARD
async function renderDashboard() {
    setRoute('/dashboard');
    try {
        const [equips, manuts, ordens, alertas, falhas] = await Promise.all([
            moduloFetch('/api/equipamentos'),
            moduloFetch('/api/manutencoes'),
            moduloFetch('/api/modulos/ordens'),
            moduloFetch('/api/modulos/alertas'),
            moduloFetch('/api/modulos/falhas')
        ]);
        const statusEquipamentos = equips.map(e => ({ equipamento: e, status: calcularStatus(e) }));
        const atrasados = statusEquipamentos.filter(item => item.status.label === 'Urgente');
        const atencao = statusEquipamentos.filter(item => item.status.label === 'Atenção');
        const normais = statusEquipamentos.filter(item => item.status.label === 'OK');
        const ordensAbertas = ordens
            .filter(o => !['CONCLUIDA', 'CANCELADA'].includes(o.status))
            .sort((a, b) => {
            const rank = { CRITICA: 0, ALTA: 1, MEDIA: 2, BAIXA: 3 };
            return (rank[a.prioridade] ?? 4) - (rank[b.prioridade] ?? 4);
        });
        const alertasAtivos = alertas.filter(alerta => !alerta.resolvidoEm);
        const historico = manuts
            .slice()
            .sort((a, b) => new Date(b.data_manutencao).getTime() - new Date(a.data_manutencao).getTime())
            .slice(0, 8);
        const itensCriticos = [...atrasados, ...atencao]
            .sort((a, b) => {
            const prioridade = { Urgente: 0, Atenção: 1 };
            return prioridade[a.status.label] - prioridade[b.status.label];
        })
            .slice(0, 6);
        const html = `
            <div class="page-header dashboard-page-header">
                <div>
                    <p class="dashboard-eyebrow">VISÃO OPERACIONAL</p>
                    <h2>Dashboard</h2>
                    <p>Acompanhe a condição dos ativos e as atividades da manutenção.</p>
                </div>
                <div class="dashboard-updated"><i class="fas fa-calendar-day"></i> ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            </div>
            <div class="dashboard-cards${currentUser?.preferences?.compactDashboard ? ' compact-dashboard' : ''}" data-tour="dashboard-cards">
                <div class="card">
                    <div class="card-icon"><i class="fas fa-industry"></i></div>
                    <div class="card-body">
                        <h3>Equipamentos</h3>
                        <div class="value">${equips.length}</div>
                    </div>
                </div>
                <div class="card success">
                    <div class="card-icon"><i class="fas fa-check-circle"></i></div>
                    <div class="card-body">
                        <h3>Em dia</h3>
                        <div class="value">${normais.length}</div>
                    </div>
                </div>
                <div class="card warning">
                    <div class="card-icon"><i class="fas fa-exclamation-circle"></i></div>
                    <div class="card-body">
                        <h3>Próximos do vencimento</h3>
                        <div class="value">${atencao.length}</div>
                    </div>
                </div>
                <div class="card danger">
                    <div class="card-icon"><i class="fas fa-wrench"></i></div>
                    <div class="card-body">
                        <h3>Manutenções atrasadas</h3>
                        <div class="value">${atrasados.length}</div>
                    </div>
                </div>
                <div class="card" ${currentUser?.preferences?.showDashboardOrders === false ? 'hidden' : ''}>
                    <div class="card-icon"><i class="fas fa-clipboard-list"></i></div>
                    <div class="card-body">
                        <h3>Ordens em aberto</h3>
                        <div class="value">${ordensAbertas.length}</div>
                    </div>
                </div>
                <div class="card ${alertasAtivos.length ? 'warning' : 'success'}" ${currentUser?.preferences?.showDashboardAlerts === false ? 'hidden' : ''}>
                    <div class="card-icon"><i class="fas fa-bell"></i></div>
                    <div class="card-body">
                        <h3>Alertas ativos</h3>
                        <div class="value">${alertasAtivos.length}</div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-icon"><i class="fas fa-triangle-exclamation"></i></div>
                    <div class="card-body">
                        <h3>Falhas registradas</h3>
                        <div class="value">${falhas.length}</div>
                    </div>
                </div>
            </div>

            <div class="dashboard-detail-grid">
                <div class="panel">
                    <div class="dashboard-panel-heading">
                        <div><h3><i class="fas fa-heartbeat"></i> Condição dos equipamentos</h3><p>Ativos que precisam de acompanhamento preventivo.</p></div>
                        <button class="btn btn-outline" onclick="renderMonitoramento()">Ver monitoramento</button>
                    </div>
                    <div class="table-scroll"><table>
                        <thead><tr><th>Equipamento</th><th>Setor</th><th>Criticidade</th><th>Situação</th><th>Prazo</th></tr></thead>
                        <tbody>${itensCriticos.map(({ equipamento, status }) => `
                            <tr><td><strong>${equipamento.nome}</strong></td><td>${equipamento.setor || '—'}</td><td>${equipamento.criticidade || '—'}</td><td><span class="badge ${status.class}">${status.label}</span></td><td>${status.dias}</td></tr>
                        `).join('') || '<tr><td colspan="5" class="text-center">Todos os equipamentos estão em dia.</td></tr>'}</tbody>
                    </table></div>
                    <p class="dashboard-table-footnote">Exibindo ${itensCriticos.length} de ${atrasados.length + atencao.length} equipamentos que exigem atenção.</p>
                </div>
                <div class="panel" ${currentUser?.preferences?.showDashboardOrders === false ? 'hidden' : ''}>
                    <div class="dashboard-panel-heading">
                        <div><h3><i class="fas fa-clipboard-list"></i> Ordens de serviço</h3><p>Pendências priorizadas para a equipe.</p></div>
                        <button class="btn btn-outline" onclick="renderOrdens()">Ver ordens</button>
                    </div>
                    <div class="dashboard-order-list">
                        ${ordensAbertas.slice(0, 5).map(ordem => `
                            <article class="dashboard-order-item">
                                <span class="dashboard-order-priority ${ordem.prioridade === 'CRITICA' ? 'critical' : ordem.prioridade === 'ALTA' ? 'high' : ''}"></span>
                                <div><strong>${ordem.titulo}</strong><span>${ordem.equipamento?.nome || 'Equipamento'} · ${ordem.status.replace(/_/g, ' ')}</span></div>
                                <small>${ordem.prioridade}</small>
                            </article>
                        `).join('') || '<p class="dashboard-empty">Não há ordens de serviço pendentes.</p>'}
                    </div>
                </div>
            </div>
            <div class="panel dashboard-history-panel">
                <div class="dashboard-panel-heading">
                    <div><h3><i class="fas fa-history"></i> Histórico de manutenções</h3><p>Intervenções registradas mais recentemente.</p></div>
                    <button class="btn btn-outline" onclick="renderManutencoes()">Ver histórico completo</button>
                </div>
                <div class="table-scroll"><table>
                    <thead><tr><th>Data</th><th>Equipamento</th><th>Setor</th><th>Serviço realizado</th><th>Responsável</th></tr></thead>
                    <tbody>${historico.map(m => {
            const equipamento = equips.find(e => e.id === m.equipamento_id);
            return `<tr><td>${formatarData(m.data_manutencao)}</td><td><strong>${m.equipamento_nome || '—'}</strong></td><td>${equipamento?.setor || '—'}</td><td>${m.descricao || '—'}</td><td>${m.responsavel || '—'}</td></tr>`;
        }).join('') || '<tr><td colspan="5" class="text-center">Nenhuma manutenção registrada.</td></tr>'}</tbody>
                </table></div>
            </div>
        `;
        renderLayout(html, 'dash');
    }
    catch (err) {
        console.error(err);
        renderLayout(`<div class="page-header"><h2>Dashboard</h2><p>Não foi possível carregar os indicadores operacionais.</p></div>`, 'dash');
        showToast(err.message || 'Falha ao carregar o dashboard.', 'error');
    }
}
// 3. EQUIPAMENTOS (CRUD COMPLETO)
async function renderEquipamentos() {
    setRoute('/equipamentos');
    let equips;
    try {
        equips = await moduloFetch('/api/equipamentos');
    }
    catch (error) {
        renderLayout(`<div class="page-header"><h2>Equipamentos</h2><p>${error.message}</p></div>`, 'equip');
        showToast(error.message, 'error');
        return;
    }
    const html = `
        <div class="header-actions">
            <div>
                <h2>Equipamentos</h2>
                <p>Gerencie os ativos industriais da empresa.</p>
            </div>
            <button class="btn btn-success" data-tour="equipment-create" onclick="renderNovoEquipamento()"><i class="fas fa-plus"></i> Adicionar Ativo</button>
        </div>
        <div class="panel" data-tour="equipment-list">
            <div class="form-group">
                <label for="equipmentSearch">Pesquisar equipamentos</label>
                <input id="equipmentSearch" type="search" placeholder="Pesquise por nome, setor ou tipo">
            </div>
            <table id="equipmentTable">
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
    document.getElementById('equipmentSearch').addEventListener('input', (event) => {
        const query = event.target.value.trim().toLocaleLowerCase('pt-BR');
        document.querySelectorAll('#equipmentTable tbody tr').forEach((row) => {
            row.hidden = !row.textContent.toLocaleLowerCase('pt-BR').includes(query);
        });
    });
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
        try {
            await moduloFetch('/api/equipamentos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            await renderEquipamentos();
            showToast('Equipamento cadastrado com sucesso.');
        }
        catch (error) {
            showToast(error.message, 'error');
        }
    });
}
async function renderEditarEquipamento(id) {
    try {
        const res = await fetch(`/api/equipamentos/${id}`);
        if (!res.ok)
            throw new Error("Erro ao buscar dados do equipamento.");
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
            try {
                await moduloFetch(`/api/equipamentos/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                await renderEquipamentos();
                showToast('Equipamento atualizado com sucesso.');
            }
            catch (error) {
                showToast(error.message, 'error');
            }
        });
    }
    catch (err) {
        console.error(err);
        showToast(err.message || 'Não foi possível carregar os dados do equipamento.', 'error');
    }
}
// 4. MANUTENÇÕES
async function renderManutencoes() {
    setRoute('/manutencoes');
    let equips;
    let manuts;
    try {
        [equips, manuts] = await Promise.all([
            moduloFetch('/api/equipamentos'),
            moduloFetch('/api/manutencoes')
        ]);
    }
    catch (error) {
        renderLayout(`<div class="page-header"><h2>Manutenções</h2><p>${error.message}</p></div>`, 'manut');
        showToast(error.message, 'error');
        return;
    }
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
                        <thead><tr><th>Data</th><th>Ativo</th><th>Descrição</th><th>Responsável</th><th>Ações</th></tr></thead>
                        <tbody>
                            ${manuts.map(m => `
                                <tr>
                                    <td>${formatarData(m.data_manutencao)}</td>
                                    <td><strong>${m.equipamento_nome}</strong></td>
                                    <td>${m.descricao}</td>
                                    <td>${m.responsavel || '—'}</td>
                                    <td><button class="btn-icon" title="Editar" onclick="renderEditarManutencao(${m.id})"><i class="fas fa-edit"></i></button><button class="btn-icon danger" title="Excluir" onclick="deletarManutencao(${m.id})"><i class="fas fa-trash"></i></button></td>
                                </tr>
                            `).join('') || '<tr><td colspan="5" class="text-center">Sem registros.</td></tr>'}
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
        try {
            await moduloFetch('/api/manutencoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            await renderManutencoes();
            showToast('Manutenção registrada com sucesso.');
        }
        catch (error) {
            showToast(error.message, 'error');
        }
    });
}
async function renderEditarManutencao(id) {
    try {
        const [manuts, equips] = await Promise.all([moduloFetch('/api/manutencoes'), moduloFetch('/api/equipamentos')]);
        const manut = manuts.find(item => item.id === id);
        if (!manut)
            throw new Error('Manutenção não encontrada.');
        const html = `<div class="page-header"><h2>Editar manutenção</h2><p>Atualize os dados da intervenção.</p></div>
            <div class="panel" style="max-width: 720px;"><form id="editManutForm">
                <div class="form-group"><label for="edit_manut_equip">Equipamento</label><select id="edit_manut_equip" required>${equips.map(e => `<option value="${e.id}" ${e.id === manut.equipamento_id ? 'selected' : ''}>${e.nome}</option>`).join('')}</select></div>
                <div class="form-group"><label for="edit_manut_data">Data</label><input id="edit_manut_data" type="date" value="${new Date(manut.data_manutencao).toISOString().slice(0, 10)}" required></div>
                <div class="form-group"><label for="edit_manut_resp">Responsável</label><input id="edit_manut_resp" value="${manut.responsavel || ''}"></div>
                <div class="form-group"><label for="edit_manut_desc">Descrição</label><textarea id="edit_manut_desc" rows="3" required>${manut.descricao || ''}</textarea></div>
                <div class="form-actions"><button class="btn btn-primary" type="submit">Salvar alterações</button><button class="btn btn-outline" type="button" onclick="renderManutencoes()">Cancelar</button></div>
            </form></div>`;
        renderLayout(html, 'manut');
        document.getElementById('editManutForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            try {
                await moduloFetch(`/api/manutencoes/${id}`, { method: 'PUT', body: JSON.stringify({
                        equipamento_id: document.getElementById('edit_manut_equip').value,
                        data_manutencao: document.getElementById('edit_manut_data').value,
                        responsavel: document.getElementById('edit_manut_resp').value,
                        descricao: document.getElementById('edit_manut_desc').value
                    }) });
                await renderManutencoes();
                showToast('Manutenção atualizada com sucesso.');
            }
            catch (error) {
                showToast(error.message, 'error');
            }
        });
    }
    catch (error) {
        showToast(error.message, 'error');
    }
}
async function deletarManutencao(id) {
    if (!await confirmarAcao({ title: 'Excluir manutenção?', message: 'O registro será removido do histórico. Esta ação não pode ser desfeita.', confirmLabel: 'Excluir' }))
        return;
    try {
        await moduloFetch(`/api/manutencoes/${id}`, { method: 'DELETE' });
        await renderManutencoes();
        showToast('Manutenção excluída com sucesso.');
    }
    catch (error) {
        showToast(error.message, 'error');
    }
}
// 5. MONITORAMENTO
async function renderMonitoramento(iotOnly = false) {
    setRoute(iotOnly ? '/monitoramento-iot' : '/monitoramento');
    if (iotOnly && !currentUser?.iotEnabled) {
        renderLayout('<div class="page-header"><h2>Monitoramento Arduino</h2><p>O módulo Arduino não está habilitado para esta conta. Solicite a liberação a um gerente após a compra.</p></div>', 'iot');
        return;
    }
    let equips;
    try {
        equips = await moduloFetch('/api/equipamentos');
    }
    catch (error) {
        renderLayout(`<div class="page-header"><h2>Monitoramento</h2><p>${error.message}</p></div>`, 'monit');
        showToast(error.message, 'error');
        return;
    }
    const iotPanel = `
        <section class="panel iot-panel" ${currentUser?.iotEnabled ? 'data-tour="iot-monitor"' : ''} aria-labelledby="iot-title">
            <div class="iot-heading">
                <div>
                    <h3 id="iot-title"><i class="fas fa-wave-square"></i> Monitoramento Arduino — vibração</h3>
                    <p>${currentUser?.iotEnabled
        ? 'Conecte o ADXL345 pela USB. As leituras são processadas ao vivo neste navegador e não são enviadas ao servidor.'
        : 'O acesso ao sensor Arduino é liberado individualmente por um gerente após a compra.'}</p>
                </div>
            </div>
            ${currentUser?.iotEnabled ? `<div class="iot-reading-grid">
                <div class="iot-reading"><span>Vibração RMS</span><strong id="iot-rms" aria-live="polite">—</strong><small>m/s²</small></div>
                <div class="iot-reading"><span>Nível do sensor</span><strong id="iot-level" class="badge atencao" aria-live="polite">Aguardando leitura</strong><small id="iot-reading-time">O código transmite uma janela por segundo.</small></div>
            </div>
            <p id="iot-serial-message" class="iot-serial-message" role="status" aria-live="polite">Conecte a porta USB para começar a receber dados.</p>
            <details class="iot-serial-debug"><summary>Diagnóstico da comunicação serial</summary><code id="iot-serial-last-line">Nenhuma linha recebida.</code></details>
            <div class="iot-chart-wrap">
                <canvas id="iot-chart" aria-label="Histórico recente da vibração RMS" role="img"></canvas>
            </div>
            <p class="iot-calibration-note">Nível calculado a partir da vibração RMS: baixo &lt; ${vibration_1.VIBRATION_LEVEL_MEDIUM_M_S2.toFixed(2)}, médio de ${vibration_1.VIBRATION_LEVEL_MEDIUM_M_S2.toFixed(2)} a &lt; ${vibration_1.VIBRATION_LEVEL_HIGH_M_S2.toFixed(2)} e alto a partir de ${vibration_1.VIBRATION_LEVEL_HIGH_M_S2.toFixed(2)} m/s². Limites iniciais; calibre para o motor e a instalação reais.</p>` : ''}
        </section>`;
    const html = iotOnly ? `
        <div class="page-header">
            <div><h2>Monitoramento Arduino</h2><p>Leituras do acelerômetro ADXL345 transmitidas pela porta serial USB.</p></div>
            ${renderIotConnectControl()}
        </div>
        ${iotPanel}
    ` : `
        <div class="page-header monitoring-page-header">
            <div><h2>Monitoramento</h2>
                <p>Cálculo automático de status baseado na frequência de manutenção.</p></div>
            ${renderIotConnectControl()}
        </div>
        <div class="panel" data-tour="equipment-monitoring">
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
        ${iotPanel}
    `;
    renderLayout(html, iotOnly ? 'iot' : 'monit');
    const connectButton = document.getElementById('iot-connect');
    if (connectButton) {
        connectButton.addEventListener('click', () => iotReading ? disconnectIotSerial() : connectIotSerial());
    }
    if (currentUser?.iotEnabled) {
        drawIotChart();
    }
}
function renderIotConnectControl() {
    const enabled = Boolean(currentUser?.iotEnabled);
    const serialAvailable = 'serial' in navigator;
    const statusText = iotConnecting
        ? 'Selecione a porta USB no navegador'
        : iotReading
            ? iotHasReceivedData ? 'Conectado · recebendo dados' : 'Porta conectada · aguardando dados'
            : 'Desconectado';
    return `<div class="iot-connect-control">
        <button id="iot-connect" class="btn btn-primary" type="button" aria-describedby="iot-connect-help">
            <i class="fas ${iotReading ? 'fa-plug-circle-xmark' : 'fa-plug'}"></i>
            ${iotConnecting ? 'Aguardando porta…' : iotReading ? 'Desconectar Arduino' : 'Conectar Arduino'}
        </button>
        <span id="iot-connection-status" class="badge ${iotHasReceivedData ? 'ok' : 'atencao'}" role="status" aria-live="polite">${statusText}</span>
        <small id="iot-connect-help">${!enabled
        ? 'Acesso ainda não liberado por um gerente'
        : !window.isSecureContext
            ? 'Acesse por localhost ou HTTPS'
            : !serialAvailable
                ? 'Conexão USB serial requer Chrome ou Edge'
                : 'Conecte a placa e clique para selecionar a porta USB'}</small>
    </div>`;
}
async function connectIotSerial() {
    if (iotConnecting || iotReading)
        return;
    if (!currentUser?.iotEnabled) {
        showToast('O módulo Arduino não está liberado para esta conta. Peça a um gerente para habilitar o acesso em Gestão de Usuários.', 'error');
        return;
    }
    if (!window.isSecureContext) {
        showToast('A conexão USB só funciona em localhost ou HTTPS. Abra o SIMEQ pelo endereço local seguro.', 'error');
        return;
    }
    if (!('serial' in navigator)) {
        showToast('Este navegador não oferece conexão USB serial. Abra o SIMEQ no Chrome ou Edge atualizado.', 'error');
        return;
    }
    try {
        const status = document.getElementById('iot-connection-status');
        iotConnecting = true;
        const button = document.getElementById('iot-connect');
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Aguardando porta…';
        status.textContent = 'Selecione a porta USB no navegador';
        status.className = 'badge atencao';
        iotPort = await navigator.serial.requestPort();
        await iotPort.open({ baudRate: 115200 });
        iotConnecting = false;
        iotReading = true;
        iotHasReceivedData = false;
        iotLastDataAt = Date.now();
        button.innerHTML = '<i class="fas fa-plug-circle-xmark"></i> Desconectar Arduino';
        status.textContent = 'Porta conectada · aguardando dados';
        status.className = 'badge atencao';
        setIotSerialMessage('Porta USB aberta. Aguardando a próxima leitura do sensor (normalmente até 1 segundo).');
        if (!iotPort.readable) {
            throw new Error('A porta foi aberta, mas não disponibilizou leitura. Desconecte e conecte o Arduino e tente novamente.');
        }
        iotStatusTimer = window.setInterval(updateIotSerialStatus, 1000);
        await readIotSerial();
    }
    catch (error) {
        iotConnecting = false;
        if (error.name !== 'NotFoundError') {
            console.error('Erro na conexão serial do Arduino:', error);
            const message = error.name === 'SecurityError'
                ? 'O navegador bloqueou a conexão serial. Use Chrome ou Edge em localhost ou HTTPS.'
                : error.name === 'NetworkError'
                    ? 'Não foi possível abrir a porta. Feche o Monitor Serial da Arduino IDE e tente novamente.'
                    : error.message || 'Não foi possível conectar ao Arduino.';
            showToast(message, 'error');
        }
        iotReading = false;
        clearIotStatusTimer();
        if (iotPort) {
            try {
                await iotPort.close();
            }
            catch (closeError) {
                console.error('Erro ao fechar a porta serial após falha:', closeError);
            }
        }
        iotPort = null;
        iotHasReceivedData = false;
        const status = document.getElementById('iot-connection-status');
        if (status) {
            status.textContent = 'Desconectado';
            status.className = 'badge atencao';
        }
        const button = document.getElementById('iot-connect');
        if (button)
            button.innerHTML = '<i class="fas fa-plug"></i> Conectar Arduino';
    }
}
async function readIotSerial() {
    const decoder = new TextDecoder();
    let buffer = '';
    try {
        if (!iotPort?.readable) {
            throw new Error('A porta serial não está disponível para leitura.');
        }
        iotReader = iotPort.readable.getReader();
        while (iotReading) {
            const { value, done } = await iotReader.read();
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split(/\r\n|\n|\r/);
            buffer = lines.pop() || '';
            lines.forEach(line => {
                if (line.trim())
                    processIotLine(line.trim());
            });
        }
    }
    catch (error) {
        if (iotReading) {
            console.error('Erro ao ler dados seriais do Arduino:', error);
            const message = error.name === 'NetworkError'
                ? 'A leitura serial foi interrompida. Feche o Monitor Serial da Arduino IDE: ele pode estar ocupando a porta.'
                : error.message || 'A leitura serial foi interrompida.';
            setIotSerialMessage(message);
            showToast(message, 'error');
        }
    }
    finally {
        iotReading = false;
        clearIotStatusTimer();
        try {
            iotReader.releaseLock();
        }
        catch (error) {
            console.error('Erro ao liberar a leitura serial:', error);
        }
        iotReader = null;
        if (iotPort) {
            try {
                await iotPort.close();
            }
            catch (error) {
                console.error('Erro ao fechar a porta serial:', error);
            }
        }
        iotPort = null;
        const status = document.getElementById('iot-connection-status');
        if (status) {
            status.textContent = 'Desconectado';
            status.className = 'badge atencao';
        }
        const button = document.getElementById('iot-connect');
        if (button)
            button.innerHTML = '<i class="fas fa-plug"></i> Conectar Arduino';
    }
}
async function disconnectIotSerial() {
    iotReading = false;
    clearIotStatusTimer();
    iotHasReceivedData = false;
    if (iotReader) {
        try {
            await iotReader.cancel();
        }
        catch (error) {
            console.error('Erro ao interromper a leitura serial:', error);
            showToast('Não foi possível interromper a leitura serial corretamente.', 'error');
        }
    }
}
function processIotLine(line) {
    const debugLine = document.getElementById('iot-serial-last-line');
    if (debugLine)
        debugLine.textContent = line;
    iotLastDataAt = Date.now();
    const rms = (0, vibration_1.parseVibrationRms)(line);
    if (rms === null) {
        if (/ADXL345 nao encontrado/i.test(line)) {
            setIotSerialMessage('O Arduino informou que não encontrou o ADXL345. Confira alimentação, GND, SDA e SCL.');
        }
        else {
            setIotSerialMessage('A porta USB está aberta, mas a linha recebida não tem um formato reconhecido. Verifique o sketch e abra o diagnóstico para conferir a mensagem recebida.');
        }
        updateIotSerialStatus();
        return;
    }
    if (!Number.isFinite(rms)) {
        setIotSerialMessage('Foi recebida uma leitura inválida do sensor.');
        return;
    }
    const level = (0, vibration_1.classifyVibrationLevel)(rms);
    iotHasReceivedData = true;
    iotSamples.push({ rms, timestamp: new Date() });
    iotSamples = iotSamples.slice(-60);
    const rmsValue = document.getElementById('iot-rms');
    const levelValue = document.getElementById('iot-level');
    const readingTime = document.getElementById('iot-reading-time');
    if (!rmsValue || !levelValue || !readingTime)
        return;
    const labels = ['Baixo', 'Médio', 'Alto'];
    const levelClasses = ['ok', 'atencao', 'urgente'];
    rmsValue.textContent = rms.toFixed(3);
    levelValue.textContent = labels[level];
    levelValue.className = `badge ${levelClasses[level]}`;
    readingTime.textContent = `Última leitura: ${new Date().toLocaleTimeString('pt-BR')}`;
    setIotSerialMessage(line.startsWith('Vibracao_RMS:')
        ? 'Arduino conectado. O nível é calculado a partir da vibração RMS recebida.'
        : 'Arduino conectado. RMS lido da quarta coluna do CSV; o nível é calculado pela vibração, independentemente do texto de status recebido.');
    updateIotSerialStatus();
    drawIotChart();
}
function updateIotSerialStatus() {
    const status = document.getElementById('iot-connection-status');
    if (!status || !iotReading)
        return;
    if (iotHasReceivedData && Date.now() - iotLastDataAt < 4000) {
        status.textContent = 'Conectado · recebendo dados';
        status.className = 'badge ok';
        return;
    }
    if (iotHasReceivedData) {
        status.textContent = 'Porta conectada · sem dados recentes';
        status.className = 'badge atencao';
        setIotSerialMessage('A porta segue aberta, mas os dados pararam. Confira a placa, o sketch e se a Arduino IDE não reabriu o Monitor Serial.');
    }
    else {
        status.textContent = 'Porta conectada · aguardando dados';
        status.className = 'badge atencao';
    }
}
function setIotSerialMessage(message) {
    const element = document.getElementById('iot-serial-message');
    if (element)
        element.textContent = message;
}
function clearIotStatusTimer() {
    if (iotStatusTimer !== null) {
        window.clearInterval(iotStatusTimer);
        iotStatusTimer = null;
    }
}
function drawIotChart() {
    const canvas = document.getElementById('iot-chart');
    if (!canvas)
        return;
    const width = Math.max(240, canvas.clientWidth);
    const height = 180;
    const scale = window.devicePixelRatio || 1;
    canvas.width = width * scale;
    canvas.height = height * scale;
    const context = canvas.getContext('2d');
    if (!context) {
        console.error('Não foi possível obter o contexto 2D do gráfico de vibração.');
        return;
    }
    context.scale(scale, scale);
    context.clearRect(0, 0, width, height);
    context.strokeStyle = '#29405b';
    context.lineWidth = 1;
    for (let row = 1; row < 4; row++) {
        const y = row * height / 4;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
    }
    if (iotSamples.length < 2)
        return;
    const maximum = Math.max(1, ...iotSamples.map(sample => sample.rms));
    context.strokeStyle = '#4a8fe7';
    context.lineWidth = 2;
    context.beginPath();
    iotSamples.forEach((sample, index) => {
        const x = index * width / (iotSamples.length - 1);
        const y = height - (sample.rms / maximum) * (height - 12) - 6;
        if (index === 0)
            context.moveTo(x, y);
        else
            context.lineTo(x, y);
    });
    context.stroke();
}
window.addEventListener('resize', drawIotChart);
// 6. RELATÓRIOS
async function renderRelatorios() {
    setRoute('/relatorios');
    try {
        const [equips, manuts, ordens, planos, falhas] = await Promise.all([
            moduloFetch('/api/equipamentos'),
            moduloFetch('/api/manutencoes'),
            moduloFetch('/api/modulos/ordens'),
            moduloFetch('/api/modulos/planos'),
            moduloFetch('/api/modulos/falhas')
        ]);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const statusEquipamentos = equips.map(e => ({ equipamento: e, status: calcularStatus(e) }));
        const atrasados = statusEquipamentos.filter(item => item.status.label === 'Urgente');
        const atencao = statusEquipamentos.filter(item => item.status.label === 'Atenção');
        const ordensAbertas = ordens
            .filter(o => !['CONCLUIDA', 'CANCELADA'].includes(o.status))
            .sort((a, b) => new Date(a.prazo || '9999-12-31').getTime() - new Date(b.prazo || '9999-12-31').getTime());
        const planosAtivos = planos
            .filter(p => p.ativo)
            .sort((a, b) => new Date(a.proximaData).getTime() - new Date(b.proximaData).getTime());
        const manutencoesRecentes = manuts
            .slice()
            .sort((a, b) => new Date(b.data_manutencao).getTime() - new Date(a.data_manutencao).getTime())
            .slice(0, 8);
        const falhasRecentes = falhas
            .slice()
            .sort((a, b) => new Date(b.dataOcorrencia).getTime() - new Date(a.dataOcorrencia).getTime())
            .slice(0, 5);
        const formatarPrioridade = prioridade => ({
            CRITICA: 'Crítica',
            ALTA: 'Alta',
            MEDIA: 'Média',
            BAIXA: 'Baixa'
        }[prioridade] || prioridade || '—');
        const estadoPlano = data => {
            const dias = Math.ceil((new Date(data).setHours(0, 0, 0, 0) - hoje.getTime()) / 86400000);
            return dias < 0 ? `${Math.abs(dias)} dia(s) atrasado` : dias === 0 ? 'Vence hoje' : `Em ${dias} dia(s)`;
        };
        const html = `
            <section class="maintenance-report">
                <div class="header-actions report-toolbar">
                    <div>
                        <h2>Relatório operacional de manutenção</h2>
                        <p>Posição dos ativos, serviços pendentes e atividades recentes.</p>
                    </div>
                    <button class="btn btn-primary" data-tour="report-export" onclick="window.print()"><i class="fas fa-file-pdf"></i> Exportar / Imprimir PDF</button>
                </div>
                <div class="report-heading">
                    <div>
                        <h1>SIMEQ <span>Relatório de manutenção</span></h1>
                        <p>Responsável pela emissão: ${currentUser.nome}${currentUser.cargo ? ` · ${currentUser.cargo}` : ''}</p>
                    </div>
                    <p class="report-date">Emitido em ${hoje.toLocaleDateString('pt-BR')}</p>
                </div>
                <div class="report-metrics">
                    <div><span>Equipamentos cadastrados</span><strong>${equips.length}</strong></div>
                    <div class="${atrasados.length ? 'metric-warning' : ''}"><span>Manutenções atrasadas</span><strong>${atrasados.length}</strong></div>
                    <div class="${atencao.length ? 'metric-attention' : ''}"><span>Requerem atenção</span><strong>${atencao.length}</strong></div>
                    <div><span>Ordens em aberto</span><strong>${ordensAbertas.length}</strong></div>
                </div>
                <section class="report-section">
                    <h3>Equipamentos que exigem acompanhamento</h3>
                    <p class="report-note">Status calculado pela última manutenção registrada e frequência preventiva cadastrada.</p>
                    <div class="table-scroll"><table class="report-table">
                        <thead><tr><th>Equipamento</th><th>Setor</th><th>Criticidade</th><th>Última manutenção</th><th>Situação</th></tr></thead>
                        <tbody>${[...atrasados, ...atencao].map(({ equipamento: e, status }) => `
                            <tr><td><strong>${e.nome}</strong></td><td>${e.setor || '—'}</td><td>${e.criticidade || '—'}</td><td>${formatarData(e.dataUltimaManutencao)}</td><td>${status.label}${status.dias !== 'Imediato' ? ` · ${status.dias}` : ''}</td></tr>
                        `).join('') || '<tr><td colspan="5">Nenhum equipamento atrasado ou próximo do vencimento.</td></tr>'}</tbody>
                    </table></div>
                </section>
                <section class="report-section">
                    <h3>Ordens de serviço em aberto</h3>
                    <div class="table-scroll"><table class="report-table">
                        <thead><tr><th>Ordem</th><th>Equipamento</th><th>Prioridade</th><th>Status</th><th>Responsável</th><th>Prazo</th></tr></thead>
                        <tbody>${ordensAbertas.map(o => `
                            <tr><td><strong>${o.numero}</strong><br>${o.titulo}</td><td>${o.equipamento?.nome || '—'}</td><td>${formatarPrioridade(o.prioridade)}</td><td>${o.status.replace(/_/g, ' ')}</td><td>${o.responsavel || '—'}</td><td>${formatarData(o.prazo)}</td></tr>
                        `).join('') || '<tr><td colspan="6">Não há ordens de serviço pendentes.</td></tr>'}</tbody>
                    </table></div>
                </section>
                <section class="report-section">
                    <h3>Próximas manutenções planejadas</h3>
                    <div class="table-scroll"><table class="report-table">
                        <thead><tr><th>Equipamento</th><th>Tipo de serviço</th><th>Periodicidade</th><th>Próxima data</th><th>Prazo</th><th>Responsável</th></tr></thead>
                        <tbody>${planosAtivos.map(p => `
                            <tr><td><strong>${p.equipamento?.nome || '—'}</strong></td><td>${p.tipo}</td><td>${p.periodicidade} ${p.unidade.toLowerCase()}</td><td>${formatarData(p.proximaData)}</td><td>${estadoPlano(p.proximaData)}</td><td>${p.responsavel || '—'}</td></tr>
                        `).join('') || '<tr><td colspan="6">Nenhum plano de manutenção ativo cadastrado.</td></tr>'}</tbody>
                    </table></div>
                </section>
                <section class="report-section report-section-last">
                    <h3>Atividades e falhas recentes</h3>
                    <div class="report-columns">
                        <div>
                            <h4>Manutenções registradas</h4>
                            <div class="table-scroll"><table class="report-table">
                                <thead><tr><th>Data</th><th>Equipamento</th><th>Serviço</th><th>Responsável</th></tr></thead>
                                <tbody>${manutencoesRecentes.map(m => `
                                    <tr><td>${formatarData(m.data_manutencao)}</td><td>${m.equipamento_nome || '—'}</td><td>${m.descricao || '—'}</td><td>${m.responsavel || '—'}</td></tr>
                                `).join('') || '<tr><td colspan="4">Nenhuma manutenção registrada.</td></tr>'}</tbody>
                            </table></div>
                        </div>
                        <div>
                            <h4>Falhas recentes</h4>
                            <div class="table-scroll"><table class="report-table">
                                <thead><tr><th>Data</th><th>Equipamento</th><th>Descrição</th><th>Parada</th></tr></thead>
                                <tbody>${falhasRecentes.map(f => `
                                    <tr><td>${formatarData(f.dataOcorrencia)}</td><td>${f.equipamento?.nome || '—'}</td><td>${f.descricao}</td><td>${f.tempoParadaMin != null ? `${f.tempoParadaMin} min` : '—'}</td></tr>
                                `).join('') || '<tr><td colspan="4">Nenhuma falha registrada.</td></tr>'}</tbody>
                            </table></div>
                        </div>
                    </div>
                </section>
                <footer class="report-footer">SIMEQ · Sistema Industrial de Monitoramento de Equipamentos · Documento gerado em ${new Date().toLocaleString('pt-BR')}</footer>
            </section>
        `;
        renderLayout(html, 'relat');
    }
    catch (error) {
        renderLayout(`<div class="page-header"><h2>Relatórios</h2><p>Não foi possível carregar os dados do relatório: ${error.message}</p></div>`, 'relat');
    }
}
// 7. USUÁRIOS (CRUD COMPLETO)
async function renderUsuarios() {
    setRoute('/usuarios');
    if (currentUser?.cargo !== 'Gerente') {
        await renderDashboard();
        showToast('Somente gerentes podem administrar usuários e liberar o módulo Arduino.', 'error');
        return;
    }
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
                <thead><tr><th>Nome</th><th>E-mail</th><th>Cargo</th><th>Módulo Arduino</th><th>Data Cadastro</th><th>Ações</th></tr></thead>
                <tbody>
                    ${users.map(u => `
                        <tr>
                            <td><strong>${escapeHTML(u.nome)}</strong></td>
                            <td>${escapeHTML(u.email)}</td>
                            <td>${escapeHTML(u.cargo)}</td>
                            <td><span class="badge ${u.iotEnabled ? 'ok' : 'atencao'}">${u.iotEnabled ? 'Habilitado' : 'Não habilitado'}</span>
                                ${currentUser?.cargo === 'Gerente' ? `<button class="btn btn-outline iot-access-button" type="button" onclick="toggleIotAccess(${u.id}, ${!u.iotEnabled})">${u.iotEnabled ? 'Revogar' : 'Liberar'}</button>` : ''}
                            </td>
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
        <p class="text-muted">O acesso Arduino / IoT deve ser liberado por um gerente após a confirmação da compra. A liberação é individual por usuário.</p>
    `;
    renderLayout(html, 'user');
}
async function toggleIotAccess(userId, enabled) {
    const confirmed = await confirmarAcao({
        title: enabled ? 'Liberar módulo Arduino?' : 'Revogar módulo Arduino?',
        message: enabled
            ? 'Confirme que a compra foi validada. O usuário passará a ver a aba Arduino / IoT.'
            : 'O usuário deixará de visualizar e usar o módulo Arduino / IoT.',
        confirmLabel: enabled ? 'Liberar acesso' : 'Revogar acesso',
        danger: !enabled
    });
    if (!confirmed)
        return;
    try {
        const result = await moduloFetch(`/api/auth/users/${userId}/iot-access`, {
            method: 'PATCH',
            body: JSON.stringify({ enabled })
        });
        if (Number(userId) === Number(currentUser?.id))
            currentUser.iotEnabled = result.iotEnabled;
        await renderUsuarios();
        showToast(enabled ? 'Módulo Arduino liberado para o usuário.' : 'Acesso ao módulo Arduino revogado.');
    }
    catch (error) {
        showToast(error.message, 'error');
    }
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
                await renderUsuarios();
                showToast('Usuário cadastrado com sucesso.');
            }
            else {
                const data = await res.json();
                showToast(data.message || 'Erro ao criar usuário.', 'error');
            }
        }
        catch (err) {
            console.error(err);
            showToast('Erro de conexão ao salvar usuário.', 'error');
        }
    });
}
async function renderEditarUsuario(id) {
    try {
        const res = await fetch(`/api/usuarios/${id}`);
        if (!res.ok)
            throw new Error("Erro ao buscar dados do usuário.");
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
                await renderUsuarios();
                showToast('Usuário atualizado com sucesso.');
            }
            else {
                const errData = await response.json();
                showToast(errData.message || 'Erro ao atualizar usuário.', 'error');
            }
        });
    }
    catch (err) {
        console.error(err);
        showToast(err.message || 'Não foi possível carregar os dados do usuário.', 'error');
    }
}
async function deletarUsuario(id) {
    if (await confirmarAcao({ title: 'Excluir usuário?', message: 'A conta e o acesso ao sistema serão removidos. Esta ação não pode ser desfeita.', confirmLabel: 'Excluir usuário' })) {
        try {
            const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await renderUsuarios();
                showToast('Usuário excluído com sucesso.');
            }
            else {
                const data = await res.json();
                showToast(data.message || 'Erro ao excluir usuário.', 'error');
            }
        }
        catch (err) {
            console.error(err);
            showToast('Erro de conexão ao excluir usuário.', 'error');
        }
    }
}
// 8. CONFIGURAÇÕES
function renderConfiguracoes() {
    setRoute('/configuracoes');
    const preferences = { ...defaultPreferences, ...(currentUser?.preferences || {}) };
    const html = `
        <div class="page-header">
            <h2>Configurações</h2>
            <p>Gerencie seu perfil, personalize o dashboard e acesse a ajuda do sistema.</p>
        </div>
        <div class="panel" data-tour="account-settings">
            <h3><i class="fas fa-user-gear"></i> Perfil e segurança</h3>
            <p class="text-muted">Atualize os dados da sua conta. A nova senha deve ter ao menos 8 caracteres.</p>
            <form id="profileSettingsForm">
                <div class="form-row">
                    <div class="form-group"><label for="profileName">Nome</label><input id="profileName" required></div>
                    <div class="form-group"><label for="profileEmail">E-mail</label><input id="profileEmail" type="email" required></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label for="profilePassword">Nova senha (opcional)</label><input id="profilePassword" type="password" minlength="8" autocomplete="new-password"></div>
                    <div class="form-group"><label for="profilePasswordConfirm">Confirmar nova senha</label><input id="profilePasswordConfirm" type="password" minlength="8" autocomplete="new-password"></div>
                </div>
                <button class="btn btn-primary" type="submit">Salvar perfil</button>
            </form>
        </div>
        <div class="panel">
            <h3><i class="fas fa-circle-half-stroke"></i> Aparência</h3>
            <p class="text-muted">Escolha entre o modo escuro, com tons pretos e azul, e o modo claro, com fundo branco e texto escuro.</p>
            <div class="form-group">
                <label for="systemTheme">Tema do sistema</label>
                <select id="systemTheme">
                    <option value="dark" ${preferences.theme !== 'light' ? 'selected' : ''}>Modo escuro</option>
                    <option value="light" ${preferences.theme === 'light' ? 'selected' : ''}>Modo claro</option>
                </select>
            </div>
        </div>
        <div class="panel">
            <h3><i class="fas fa-sliders"></i> Preferências do dashboard</h3>
            <p class="text-muted">Estas preferências são salvas na sua conta e permanecem ao trocar de navegador ou dispositivo.</p>
            <form id="dashboardPreferencesForm">
                <label class="form-check"><input id="compactDashboard" type="checkbox" ${preferences.compactDashboard ? 'checked' : ''}> Exibir indicadores em modo compacto</label>
                <label class="form-check"><input id="showDashboardOrders" type="checkbox" ${preferences.showDashboardOrders ? 'checked' : ''}> Mostrar resumo de ordens de serviço</label>
                <label class="form-check"><input id="showDashboardAlerts" type="checkbox" ${preferences.showDashboardAlerts ? 'checked' : ''}> Mostrar indicador de alertas</label>
                <button class="btn btn-primary" type="submit">Salvar preferências</button>
            </form>
        </div>
        <div class="panel" data-tour="tutorial-settings">
            <h3><i class="fas fa-circle-question"></i> Ajuda e tutorial</h3>
            <p>Revise o tutorial guiado do sistema quando quiser. Concluir ou pular não afeta seus registros.</p>
            <button class="btn btn-outline" type="button" onclick="startTutorialFromSettings()">Ver tutorial do sistema</button>
        </div>
        <div class="panel">
            <h3><i class="fas fa-wave-square"></i> Módulo Arduino / IoT</h3>
            <p>${currentUser?.iotEnabled
        ? 'O acesso ao módulo está habilitado para sua conta. A aba Arduino / IoT permite conectar o sensor ADXL345 via USB.'
        : 'O módulo está indisponível nesta conta. Após a compra do Arduino, um gerente pode liberar o acesso individual na Gestão de Usuários.'}</p>
        </div>
    `;
    renderLayout(html, 'config');
    document.getElementById('profileName').value = currentUser?.nome || '';
    document.getElementById('profileEmail').value = currentUser?.email || '';
    document.getElementById('profileSettingsForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const senha = document.getElementById('profilePassword').value;
        if (senha !== document.getElementById('profilePasswordConfirm').value) {
            showToast('A confirmação da nova senha não corresponde.', 'error');
            return;
        }
        try {
            const result = await moduloFetch('/api/auth/profile', {
                method: 'PATCH',
                body: JSON.stringify({
                    nome: document.getElementById('profileName').value,
                    email: document.getElementById('profileEmail').value,
                    ...(senha ? { senha } : {})
                })
            });
            currentUser = { ...currentUser, ...result.user };
            await renderConfiguracoes();
            showToast('Perfil atualizado.');
        }
        catch (error) {
            showToast(error.message, 'error');
        }
    });
    document.getElementById('dashboardPreferencesForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const nextPreferences = {
            theme: document.getElementById('systemTheme').value,
            compactDashboard: document.getElementById('compactDashboard').checked,
            showDashboardOrders: document.getElementById('showDashboardOrders').checked,
            showDashboardAlerts: document.getElementById('showDashboardAlerts').checked
        };
        await saveUserPreferences(nextPreferences);
    });
    document.getElementById('systemTheme').addEventListener('change', async (event) => {
        const previousTheme = currentUser.preferences.theme;
        const selectedTheme = event.target.value;
        applyTheme(selectedTheme);
        const saved = await saveUserPreferences({ ...currentUser.preferences, theme: selectedTheme }, false);
        if (!saved) {
            event.target.value = previousTheme;
            applyTheme(previousTheme);
        }
    });
}
async function saveUserPreferences(preferences, notify = true) {
    try {
        const result = await moduloFetch('/api/auth/preferences', {
            method: 'PATCH',
            body: JSON.stringify(preferences)
        });
        currentUser.preferences = { ...defaultPreferences, ...result.preferences };
        applyTheme(currentUser.preferences.theme);
        if (notify)
            showToast('Preferências salvas.');
        return true;
    }
    catch (error) {
        showToast(error.message, 'error');
        return false;
    }
}
// --- Funções Auxiliares ---
function formatarData(dataStr) {
    if (!dataStr)
        return '---';
    const d = new Date(dataStr);
    return d.toLocaleDateString('pt-BR');
}
function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}
function calcularStatus(e) {
    if (!e.dataUltimaManutencao)
        return { label: 'Urgente', class: 'urgente', dias: 'Imediato' };
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const ultima = new Date(e.dataUltimaManutencao);
    ultima.setHours(0, 0, 0, 0);
    const proxima = new Date(ultima.getTime() + (e.frequenciaDias * 24 * 60 * 60 * 1000));
    const diffTime = proxima - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0)
        return { label: 'Urgente', class: 'urgente', dias: `${Math.abs(diffDays)} dias em atraso` };
    if (diffDays <= 15)
        return { label: 'Atenção', class: 'atencao', dias: `${diffDays} dias restantes` };
    return { label: 'OK', class: 'ok', dias: `${diffDays} dias restantes` };
}
async function deletarEquipamento(id) {
    if (!await confirmarAcao({ title: 'Excluir equipamento?', message: 'Esta ação também excluirá o histórico de manutenções, planos, ordens, falhas e alertas vinculados. Não será possível recuperar esses dados.', confirmLabel: 'Excluir equipamento' }))
        return;
    try {
        const resultado = await moduloFetch(`/api/equipamentos/${id}`, { method: 'DELETE' });
        await renderEquipamentos();
        const removidos = resultado.removidos || {};
        const vinculados = Object.entries(removidos)
            .filter(([, quantidade]) => quantidade > 0)
            .map(([tipo, quantidade]) => `${quantidade} ${tipo}`)
            .join(', ');
        showToast(`Equipamento excluído.${vinculados ? ` Registros removidos: ${vinculados}.` : ''}`);
    }
    catch (error) {
        showToast(error.message, 'error');
    }
}
async function handleLogout() {
    if (iotReading)
        await disconnectIotSerial();
    await fetch('/api/auth/logout', { method: 'POST' });
    currentUser = null;
    renderLogin();
}
// Inicializar aplicação
init();
// --- Módulos da plataforma (persistência real via /api/modulos) ---
async function moduloFetch(url, options = {}) {
    const response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok)
        throw new Error(payload.message || 'Não foi possível concluir a operação.');
    return payload;
}
function renderModulo(title, description, active, content) {
    renderLayout(`<div class="page-header"><h2>${title}</h2><p>${description}</p></div>${content}`, active);
}
async function renderSetores() {
    setRoute('/setores');
    try {
        const [setores, categorias] = await Promise.all([moduloFetch('/api/modulos/setores'), moduloFetch('/api/modulos/categorias')]);
        renderModulo('Setores e categorias', 'Organize a operação e acompanhe a distribuição dos equipamentos.', 'setores', `
            <div class="dashboard-grid">
              <div class="panel"><h3><i class="fas fa-plus-circle"></i> Novo setor</h3>
                <form id="setorForm"><div class="form-group"><label for="setorNome">Nome</label><input id="setorNome" required placeholder="Ex.: Produção"></div><div class="form-group"><label for="setorLocal">Localização</label><input id="setorLocal" placeholder="Ex.: Galpão A"></div><div class="form-group"><label for="setorDesc">Descrição</label><textarea id="setorDesc" rows="3"></textarea></div><button class="btn btn-success" type="submit">Cadastrar setor</button></form>
              </div>
              <div class="panel"><h3><i class="fas fa-sitemap"></i> Setores cadastrados</h3><div class="table-scroll"><table><thead><tr><th>Setor</th><th>Localização</th><th>Equipamentos</th><th>Ações</th></tr></thead><tbody>${setores.map(s => `<tr><td><strong>${s.nome}</strong><br><small class="text-muted">${s.descricao || 'Sem descrição'}</small></td><td>${s.localizacao || '—'}</td><td><span class="badge ok">${s._count.equipamentos}</span></td><td><button class="btn-icon" title="Editar" onclick="editarSetor(${s.id})"><i class="fas fa-edit"></i></button><button class="btn-icon danger" title="Excluir" onclick="deletarSetor(${s.id})"><i class="fas fa-trash"></i></button></td></tr>`).join('') || '<tr><td colspan="4" class="text-center">Nenhum setor cadastrado.</td></tr>'}</tbody></table></div></div>
            </div>
            <div class="dashboard-grid">
              <div class="panel"><h3><i class="fas fa-plus-circle"></i> Nova categoria</h3><form id="categoriaForm"><div class="form-group"><label for="categoriaNome">Nome</label><input id="categoriaNome" required placeholder="Ex.: Elétrica"></div><div class="form-group"><label for="categoriaDesc">Descrição</label><textarea id="categoriaDesc" rows="2"></textarea></div><button class="btn btn-success" type="submit">Cadastrar categoria</button></form></div>
              <div class="panel"><h3><i class="fas fa-tags"></i> Categorias cadastradas</h3><div class="table-scroll"><table><thead><tr><th>Categoria</th><th>Equipamentos</th><th>Ações</th></tr></thead><tbody>${categorias.map(c => `<tr><td><strong>${c.nome}</strong><br><small class="text-muted">${c.descricao || 'Sem descrição'}</small></td><td><span class="badge ok">${c._count.equipamentos}</span></td><td><button class="btn-icon" title="Editar" onclick="editarCategoria(${c.id})"><i class="fas fa-edit"></i></button><button class="btn-icon danger" title="Excluir" onclick="deletarCategoria(${c.id})"><i class="fas fa-trash"></i></button></td></tr>`).join('') || '<tr><td colspan="3" class="text-center">Nenhuma categoria cadastrada.</td></tr>'}</tbody></table></div></div>
            </div>`);
        document.getElementById('setorForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            try {
                await moduloFetch('/api/modulos/setores', { method: 'POST', body: JSON.stringify({ nome: document.getElementById('setorNome').value, localizacao: document.getElementById('setorLocal').value, descricao: document.getElementById('setorDesc').value }) });
                await renderSetores();
                showToast('Setor cadastrado com sucesso.');
            }
            catch (error) {
                showToast(error.message, 'error');
            }
        });
        document.getElementById('categoriaForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            try {
                await moduloFetch('/api/modulos/categorias', { method: 'POST', body: JSON.stringify({ nome: document.getElementById('categoriaNome').value, descricao: document.getElementById('categoriaDesc').value }) });
                await renderSetores();
                showToast('Categoria cadastrada com sucesso.');
            }
            catch (error) {
                showToast(error.message, 'error');
            }
        });
    }
    catch (error) {
        renderModulo('Setores e categorias', error.message, 'setores', '<div class="panel"><p class="error-msg">Não foi possível carregar setores e categorias.</p></div>');
        showToast(error.message, 'error');
    }
}
async function editarSetor(id) {
    try {
        const setor = (await moduloFetch('/api/modulos/setores')).find(item => item.id === id);
        if (!setor)
            throw new Error('Setor não encontrado.');
        renderModulo('Editar setor', 'Atualize os dados do setor.', 'setores', `<div class="panel" style="max-width:640px"><form id="editSetorForm"><div class="form-group"><label for="editSetorNome">Nome</label><input id="editSetorNome" required value="${setor.nome}"></div><div class="form-group"><label for="editSetorLocal">Localização</label><input id="editSetorLocal" value="${setor.localizacao || ''}"></div><div class="form-group"><label for="editSetorDesc">Descrição</label><textarea id="editSetorDesc" rows="3">${setor.descricao || ''}</textarea></div><div class="form-actions"><button class="btn btn-primary">Salvar alterações</button><button type="button" class="btn btn-outline" onclick="renderSetores()">Cancelar</button></div></form></div>`);
        document.getElementById('editSetorForm').addEventListener('submit', async (event) => { event.preventDefault(); try {
            await moduloFetch(`/api/modulos/setores/${id}`, { method: 'PUT', body: JSON.stringify({ nome: document.getElementById('editSetorNome').value, localizacao: document.getElementById('editSetorLocal').value, descricao: document.getElementById('editSetorDesc').value }) });
            await renderSetores();
            showToast('Setor atualizado.');
        }
        catch (error) {
            showToast(error.message, 'error');
        } });
    }
    catch (error) {
        showToast(error.message, 'error');
    }
}
async function deletarSetor(id) {
    if (!await confirmarAcao({ title: 'Excluir setor?', message: 'A exclusão só será permitida quando não houver equipamentos vinculados.', confirmLabel: 'Excluir setor' }))
        return;
    try {
        await moduloFetch(`/api/modulos/setores/${id}`, { method: 'DELETE' });
        await renderSetores();
        showToast('Setor excluído.');
    }
    catch (error) {
        showToast(error.message, 'error');
    }
}
async function editarCategoria(id) {
    try {
        const categoria = (await moduloFetch('/api/modulos/categorias')).find(item => item.id === id);
        if (!categoria)
            throw new Error('Categoria não encontrada.');
        renderModulo('Editar categoria', 'Atualize os dados da categoria.', 'setores', `<div class="panel" style="max-width:640px"><form id="editCategoriaForm"><div class="form-group"><label for="editCategoriaNome">Nome</label><input id="editCategoriaNome" required value="${categoria.nome}"></div><div class="form-group"><label for="editCategoriaDesc">Descrição</label><textarea id="editCategoriaDesc" rows="3">${categoria.descricao || ''}</textarea></div><div class="form-actions"><button class="btn btn-primary">Salvar alterações</button><button type="button" class="btn btn-outline" onclick="renderSetores()">Cancelar</button></div></form></div>`);
        document.getElementById('editCategoriaForm').addEventListener('submit', async (event) => { event.preventDefault(); try {
            await moduloFetch(`/api/modulos/categorias/${id}`, { method: 'PUT', body: JSON.stringify({ nome: document.getElementById('editCategoriaNome').value, descricao: document.getElementById('editCategoriaDesc').value }) });
            await renderSetores();
            showToast('Categoria atualizada.');
        }
        catch (error) {
            showToast(error.message, 'error');
        } });
    }
    catch (error) {
        showToast(error.message, 'error');
    }
}
async function deletarCategoria(id) {
    if (!await confirmarAcao({ title: 'Excluir categoria?', message: 'A exclusão só será permitida quando não houver equipamentos vinculados.', confirmLabel: 'Excluir categoria' }))
        return;
    try {
        await moduloFetch(`/api/modulos/categorias/${id}`, { method: 'DELETE' });
        await renderSetores();
        showToast('Categoria excluída.');
    }
    catch (error) {
        showToast(error.message, 'error');
    }
}
async function renderPlanos(editId = null) {
    setRoute('/planos');
    try {
        const [planos, equipamentos] = await Promise.all([moduloFetch('/api/modulos/planos'), moduloFetch('/api/equipamentos')]);
        const editing = editId == null ? null : planos.find(plan => plan.id === editId);
        if (editId != null && !editing)
            throw new Error('Plano de manutenção não encontrado.');
        const selected = (value, actual) => value === actual ? 'selected' : '';
        renderModulo('Planos de manutenção', 'Planeje e acompanhe as intervenções preventivas.', 'planos', `
            <div class="panel">
                <h3><i class="fas fa-calendar-check"></i> ${editing ? 'Editar plano' : 'Novo plano de manutenção'}</h3>
                <form id="planoForm">
                    <div class="form-row">
                        <div class="form-group"><label for="planoEquip">Equipamento</label><select id="planoEquip" required>${equipamentos.map(e => `<option value="${e.id}" ${selected(e.id, editing?.equipamentoId)}>${e.nome}</option>`).join('')}</select></div>
                        <div class="form-group"><label for="planoTipo">Tipo</label><select id="planoTipo">${['PREVENTIVA', 'INSPEÇÃO', 'LUBRIFICAÇÃO', 'CALIBRAÇÃO'].map(v => `<option ${selected(v, editing?.tipo || 'PREVENTIVA')}>${v}</option>`).join('')}</select></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label for="planoPeriodo">Periodicidade</label><input id="planoPeriodo" type="number" min="1" value="${editing?.periodicidade || 30}" required></div>
                        <div class="form-group"><label for="planoUnidade">Unidade</label><select id="planoUnidade">${['DIAS', 'SEMANAS', 'MESES'].map(v => `<option ${selected(v, editing?.unidade || 'DIAS')}>${v}</option>`).join('')}</select></div>
                        <div class="form-group"><label for="planoData">Próxima execução</label><input id="planoData" type="date" value="${editing ? new Date(editing.proximaData).toISOString().slice(0, 10) : ''}" required></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label for="planoResp">Responsável</label><input id="planoResp" value="${editing?.responsavel || ''}"></div>
                        <div class="form-group"><label for="planoAntecedencia">Avisar com antecedência (dias)</label><input id="planoAntecedencia" type="number" min="0" value="${editing?.antecedencia ?? 7}"></div>
                    </div>
                    <div class="form-group"><label for="planoInstr">Instruções</label><textarea id="planoInstr" rows="2">${editing?.instrucoes || ''}</textarea></div>
                    ${editing ? `<div class="form-group"><label for="planoAtivo">Situação</label><select id="planoAtivo"><option value="true" ${selected(true, editing.ativo)}>Ativo</option><option value="false" ${selected(false, editing.ativo)}>Inativo</option></select></div>` : ''}
                    <div class="form-actions"><button class="btn btn-success" type="submit">${editing ? 'Salvar alterações' : 'Cadastrar plano'}</button>${editing ? '<button class="btn btn-outline" type="button" onclick="renderPlanos()">Cancelar</button>' : ''}</div>
                </form>
            </div>
            <div class="panel" data-tour="maintenance-plans"><h3><i class="fas fa-list"></i> Planos cadastrados</h3><div class="table-scroll"><table><thead><tr><th>Equipamento</th><th>Tipo</th><th>Periodicidade</th><th>Próxima data</th><th>Situação</th><th>Ações</th></tr></thead><tbody>
                ${planos.map(p => `<tr><td><strong>${p.equipamento.nome}</strong></td><td>${p.tipo}</td><td>${p.periodicidade} ${p.unidade.toLowerCase()}</td><td>${formatarData(p.proximaData)}</td><td>${p.ativo ? 'Ativo' : 'Inativo'}</td><td><button class="btn-icon" title="Editar" onclick="renderPlanos(${p.id})"><i class="fas fa-edit"></i></button><button class="btn-icon danger" title="Excluir" onclick="deletarPlano(${p.id})"><i class="fas fa-trash"></i></button></td></tr>`).join('') || '<tr><td colspan="6" class="text-center">Nenhum plano cadastrado.</td></tr>'}
            </tbody></table></div></div>`);
        document.getElementById('planoForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            const body = { equipamentoId: document.getElementById('planoEquip').value, tipo: document.getElementById('planoTipo').value, periodicidade: document.getElementById('planoPeriodo').value, unidade: document.getElementById('planoUnidade').value, proximaData: document.getElementById('planoData').value, responsavel: document.getElementById('planoResp').value || undefined, antecedencia: document.getElementById('planoAntecedencia').value, instrucoes: document.getElementById('planoInstr').value, ...(editing ? { ativo: document.getElementById('planoAtivo').value === 'true' } : {}) };
            try {
                await moduloFetch(editing ? `/api/modulos/planos/${editing.id}` : '/api/modulos/planos', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(body) });
                await renderPlanos();
                showToast(editing ? 'Plano atualizado.' : 'Plano cadastrado.');
            }
            catch (error) {
                showToast(error.message, 'error');
            }
        });
    }
    catch (error) {
        renderModulo('Planos de manutenção', error.message, 'planos', '<div class="panel"><p class="error-msg">Não foi possível carregar os planos.</p></div>');
        showToast(error.message, 'error');
    }
}
async function deletarPlano(id) {
    if (!await confirmarAcao({ title: 'Excluir plano?', message: 'Ordens de serviço vinculadas serão preservadas sem vínculo com este plano.', confirmLabel: 'Excluir plano' }))
        return;
    try {
        await moduloFetch(`/api/modulos/planos/${id}`, { method: 'DELETE' });
        await renderPlanos();
        showToast('Plano excluído.');
    }
    catch (error) {
        showToast(error.message, 'error');
    }
}
async function renderOrdens(editId = null) {
    setRoute('/ordens');
    try {
        const [ordens, equipamentos] = await Promise.all([moduloFetch('/api/modulos/ordens'), moduloFetch('/api/equipamentos')]);
        const editing = editId == null ? null : ordens.find(order => order.id === editId);
        if (editId != null && !editing)
            throw new Error('Ordem de serviço não encontrada.');
        const selected = (value, actual) => value === actual ? 'selected' : '';
        const labelPriority = { CRITICA: 'Crítica', ALTA: 'Alta', MEDIA: 'Média', BAIXA: 'Baixa' };
        renderModulo('Ordens de serviço', 'Controle abertura, prioridade, prazo e conclusão das intervenções.', 'ordens', `
            <div class="panel"><h3><i class="fas fa-clipboard-list"></i> ${editing ? 'Editar ordem' : 'Abrir ordem de serviço'}</h3>
                <form id="ordemForm">
                    <div class="form-row">
                        <div class="form-group"><label for="osEquip">Equipamento</label><select id="osEquip" required>${equipamentos.map(e => `<option value="${e.id}" ${selected(e.id, editing?.equipamentoId)}>${e.nome}</option>`).join('')}</select></div>
                        <div class="form-group"><label for="osPrioridade">Prioridade</label><select id="osPrioridade">${Object.entries(labelPriority).map(([v, label]) => `<option value="${v}" ${selected(v, editing?.prioridade || 'MEDIA')}>${label}</option>`).join('')}</select></div>
                        <div class="form-group"><label for="osPrazo">Prazo</label><input id="osPrazo" type="date" value="${editing?.prazo ? new Date(editing.prazo).toISOString().slice(0, 10) : ''}"></div>
                    </div>
                    <div class="form-group"><label for="osTitulo">Título</label><input id="osTitulo" required value="${editing?.titulo || ''}" placeholder="Ex.: Verificar vibração anormal"></div>
                    <div class="form-group"><label for="osDescricao">Descrição</label><textarea id="osDescricao" required rows="2">${editing?.descricao || ''}</textarea></div>
                    <div class="form-row"><div class="form-group"><label for="osResponsavel">Responsável</label><input id="osResponsavel" value="${editing?.responsavel || ''}"></div>
                    ${editing ? `<div class="form-group"><label for="osStatus">Status</label><select id="osStatus">${['ABERTA', 'EM_ANDAMENTO', 'AGUARDANDO_PECA', 'CONCLUIDA', 'CANCELADA'].map(v => `<option ${selected(v, editing.status)}>${v}</option>`).join('')}</select></div>` : ''}</div>
                    <div class="form-actions"><button class="btn btn-success" type="submit">${editing ? 'Salvar alterações' : 'Abrir ordem'}</button>${editing ? '<button type="button" class="btn btn-outline" onclick="renderOrdens()">Cancelar</button>' : ''}</div>
                </form>
            </div>
            <div class="panel" data-tour="service-orders"><h3><i class="fas fa-list"></i> Ordens de serviço</h3><div class="table-scroll"><table><thead><tr><th>Número</th><th>Equipamento</th><th>Prioridade</th><th>Status</th><th>Responsável</th><th>Prazo</th><th>Ações</th></tr></thead><tbody>
                ${ordens.map(o => `<tr><td><strong>${o.numero}</strong><br><small>${o.titulo}</small></td><td>${o.equipamento.nome}</td><td><span class="badge ${o.prioridade === 'CRITICA' || o.prioridade === 'ALTA' ? 'urgente' : 'atencao'}">${labelPriority[o.prioridade] || o.prioridade}</span></td><td>${o.status.replace(/_/g, ' ')}</td><td>${o.responsavel || '—'}</td><td>${formatarData(o.prazo)}</td><td><button class="btn-icon" title="Editar" onclick="renderOrdens(${o.id})"><i class="fas fa-edit"></i></button>${!['CONCLUIDA', 'CANCELADA'].includes(o.status) ? `<button class="btn btn-outline" onclick="concluirOrdem(${o.id})">Concluir</button>` : ''}<button class="btn-icon danger" title="Excluir" onclick="deletarOrdem(${o.id})"><i class="fas fa-trash"></i></button></td></tr>`).join('') || '<tr><td colspan="7" class="text-center">Nenhuma ordem cadastrada.</td></tr>'}
            </tbody></table></div></div>`);
        document.getElementById('ordemForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            const body = { equipamentoId: document.getElementById('osEquip').value, titulo: document.getElementById('osTitulo').value, descricao: document.getElementById('osDescricao').value, prioridade: document.getElementById('osPrioridade').value, prazo: document.getElementById('osPrazo').value || null, responsavel: document.getElementById('osResponsavel').value || undefined, ...(editing ? { tipo: editing.tipo, status: document.getElementById('osStatus').value } : {}) };
            try {
                await moduloFetch(editing ? `/api/modulos/ordens/${editing.id}` : '/api/modulos/ordens', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(body) });
                await renderOrdens();
                showToast(editing ? 'Ordem atualizada.' : 'Ordem de serviço aberta.');
            }
            catch (error) {
                showToast(error.message, 'error');
            }
        });
    }
    catch (error) {
        renderModulo('Ordens de serviço', error.message, 'ordens', '<div class="panel"><p class="error-msg">Não foi possível carregar as ordens.</p></div>');
        showToast(error.message, 'error');
    }
}
async function concluirOrdem(id) {
    if (!await confirmarAcao({ title: 'Concluir ordem?', message: 'A ordem será marcada como concluída. Confirme se o serviço foi finalizado.', confirmLabel: 'Concluir', danger: false }))
        return;
    try {
        await moduloFetch(`/api/modulos/ordens/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'CONCLUIDA' }) });
        await renderOrdens();
        showToast('Ordem concluída.');
    }
    catch (error) {
        showToast(error.message, 'error');
    }
}
async function deletarOrdem(id) {
    if (!await confirmarAcao({ title: 'Excluir ordem de serviço?', message: 'A ordem será excluída. Registros relacionados serão preservados quando possível.', confirmLabel: 'Excluir ordem' }))
        return;
    try {
        await moduloFetch(`/api/modulos/ordens/${id}`, { method: 'DELETE' });
        await renderOrdens();
        showToast('Ordem excluída.');
    }
    catch (error) {
        showToast(error.message, 'error');
    }
}
async function renderFalhas(editId = null) {
    setRoute('/falhas');
    try {
        const [falhas, equipamentos] = await Promise.all([moduloFetch('/api/modulos/falhas'), moduloFetch('/api/equipamentos')]);
        const editing = editId == null ? null : falhas.find(failure => failure.id === editId);
        if (editId != null && !editing)
            throw new Error('Falha não encontrada.');
        const selected = (value, actual) => value === actual ? 'selected' : '';
        renderModulo('Falhas e ocorrências', 'Registre sintomas, impacto e causa sem confundir hipótese com causa confirmada.', 'falhas', `
            <div class="panel"><h3><i class="fas fa-bug"></i> ${editing ? 'Editar ocorrência' : 'Registrar falha'}</h3>
                <form id="falhaForm">
                    <div class="form-row">
                        <div class="form-group"><label for="falhaEquip">Equipamento</label><select id="falhaEquip" required>${equipamentos.map(e => `<option value="${e.id}" ${selected(e.id, editing?.equipamentoId)}>${e.nome}</option>`).join('')}</select></div>
                        <div class="form-group"><label for="falhaImpacto">Impacto</label><select id="falhaImpacto">${['BAIXO', 'MEDIO', 'ALTO', 'CRITICO'].map(v => `<option ${selected(v, editing?.impacto || 'BAIXO')}>${v}</option>`).join('')}</select></div>
                    </div>
                    <div class="form-group"><label for="falhaDesc">Descrição do problema</label><textarea id="falhaDesc" required rows="2">${editing?.descricao || ''}</textarea></div>
                    <div class="form-row"><div class="form-group"><label for="falhaCausa">Causa (se conhecida)</label><input id="falhaCausa" value="${editing?.causa || ''}"></div>
                    <div class="form-group"><label for="falhaTempo">Tempo de parada (minutos)</label><input id="falhaTempo" type="number" min="0" value="${editing?.tempoParadaMin ?? ''}"></div></div>
                    <div class="form-group"><label for="falhaCorretiva">Ação corretiva</label><textarea id="falhaCorretiva" rows="2">${editing?.acaoCorretiva || ''}</textarea></div>
                    <label class="form-check"><input id="falhaCausaConfirmada" type="checkbox" ${editing?.causaConfirmada ? 'checked' : ''}> Causa confirmada</label>
                    <div class="form-actions"><button class="btn btn-danger" type="submit">${editing ? 'Salvar alterações' : 'Registrar falha'}</button>${editing ? '<button type="button" class="btn btn-outline" onclick="renderFalhas()">Cancelar</button>' : ''}</div>
                </form>
            </div>
            <div class="panel"><h3><i class="fas fa-list"></i> Histórico de ocorrências</h3><div class="table-scroll"><table><thead><tr><th>Data</th><th>Equipamento</th><th>Descrição</th><th>Impacto</th><th>Causa</th><th>Ações</th></tr></thead><tbody>
                ${falhas.map(f => `<tr><td>${formatarData(f.dataOcorrencia)}</td><td>${f.equipamento.nome}</td><td>${f.descricao}</td><td><span class="badge ${f.impacto === 'CRITICO' ? 'urgente' : 'atencao'}">${f.impacto || '—'}</span></td><td>${f.causa || 'Em investigação'}${f.causaConfirmada ? ' (confirmada)' : ''}</td><td><button class="btn-icon" title="Editar" onclick="renderFalhas(${f.id})"><i class="fas fa-edit"></i></button><button class="btn-icon danger" title="Excluir" onclick="deletarFalha(${f.id})"><i class="fas fa-trash"></i></button></td></tr>`).join('') || '<tr><td colspan="6" class="text-center">Nenhuma falha registrada.</td></tr>'}
            </tbody></table></div></div>`);
        document.getElementById('falhaForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            const body = { equipamentoId: document.getElementById('falhaEquip').value, impacto: document.getElementById('falhaImpacto').value, descricao: document.getElementById('falhaDesc').value, causa: document.getElementById('falhaCausa').value || undefined, causaConfirmada: document.getElementById('falhaCausaConfirmada').checked, tempoParadaMin: document.getElementById('falhaTempo').value ? Number(document.getElementById('falhaTempo').value) : undefined, acaoCorretiva: document.getElementById('falhaCorretiva').value || undefined, ...(editing ? { dataOcorrencia: editing.dataOcorrencia, ordemId: editing.ordemId } : {}) };
            try {
                await moduloFetch(editing ? `/api/modulos/falhas/${editing.id}` : '/api/modulos/falhas', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(body) });
                await renderFalhas();
                showToast(editing ? 'Ocorrência atualizada.' : 'Falha registrada.');
            }
            catch (error) {
                showToast(error.message, 'error');
            }
        });
    }
    catch (error) {
        renderModulo('Falhas e ocorrências', error.message, 'falhas', '<div class="panel"><p class="error-msg">Não foi possível carregar as falhas.</p></div>');
        showToast(error.message, 'error');
    }
}
async function deletarFalha(id) {
    if (!await confirmarAcao({ title: 'Excluir ocorrência?', message: 'A falha será removida do histórico e dos relatórios.', confirmLabel: 'Excluir ocorrência' }))
        return;
    try {
        await moduloFetch(`/api/modulos/falhas/${id}`, { method: 'DELETE' });
        await renderFalhas();
        showToast('Ocorrência excluída.');
    }
    catch (error) {
        showToast(error.message, 'error');
    }
}
async function renderAlertas(editId = null) {
    setRoute('/alertas');
    try {
        const alertas = await moduloFetch('/api/modulos/alertas');
        const editing = editId == null ? null : alertas.find(alert => alert.id === editId);
        if (editId != null && !editing)
            throw new Error('Alerta não encontrado.');
        const selected = (value, actual) => value === actual ? 'selected' : '';
        renderModulo('Central de alertas', 'Acompanhe situações que exigem atenção e reconheça cada evento.', 'alertas', `
            <div class="panel"><h3><i class="fas fa-bell"></i> ${editing ? 'Editar alerta' : 'Novo alerta'}</h3>
                <form id="alertaForm">
                    <div class="form-row"><div class="form-group"><label for="alertaTipo">Tipo</label><input id="alertaTipo" required value="${editing?.tipo || ''}" placeholder="Ex.: MANUTENCAO"></div><div class="form-group"><label for="alertaSeveridade">Severidade</label><select id="alertaSeveridade">${['INFO', 'ATENCAO', 'CRITICO'].map(v => `<option ${selected(v, editing?.severidade || 'ATENCAO')}>${v}</option>`).join('')}</select></div></div>
                    <div class="form-group"><label for="alertaTitulo">Título</label><input id="alertaTitulo" required value="${editing?.titulo || ''}"></div>
                    <div class="form-group"><label for="alertaMensagem">Mensagem</label><textarea id="alertaMensagem" rows="2" required>${editing?.mensagem || ''}</textarea></div>
                    ${editing ? '' : '<p class="text-muted">Este alerta será criado sem vínculo com equipamento ou ordem de serviço.</p>'}
                    <div class="form-actions"><button class="btn btn-primary" type="submit">${editing ? 'Salvar alterações' : 'Criar alerta'}</button>${editing ? '<button type="button" class="btn btn-outline" onclick="renderAlertas()">Cancelar</button>' : ''}</div>
                </form>
            </div>
            <div class="panel" data-tour="alert-list"><div class="table-scroll"><table><thead><tr><th>Severidade</th><th>Alerta</th><th>Equipamento</th><th>Estado</th><th>Data</th><th>Ações</th></tr></thead><tbody>
                ${alertas.map(a => `<tr><td><span class="badge ${a.severidade === 'CRITICO' ? 'urgente' : a.severidade === 'INFO' ? 'ok' : 'atencao'}">${a.severidade}</span></td><td><strong>${a.titulo}</strong><br><small>${a.mensagem}</small></td><td>${a.equipamento?.nome || '—'}</td><td>${a.resolvidoEm ? 'Resolvido' : a.reconhecidoEm ? 'Reconhecido' : 'Novo'}</td><td>${formatarData(a.criadoEm)}</td><td>${!a.reconhecidoEm && !a.resolvidoEm ? `<button class="btn btn-outline" onclick="reconhecerAlerta(${a.id})">Reconhecer</button>` : ''}${!a.resolvidoEm ? `<button class="btn btn-outline" onclick="resolverAlerta(${a.id})">Resolver</button>` : ''}<button class="btn-icon" title="Editar" onclick="renderAlertas(${a.id})"><i class="fas fa-edit"></i></button><button class="btn-icon danger" title="Excluir" onclick="deletarAlerta(${a.id})"><i class="fas fa-trash"></i></button></td></tr>`).join('') || '<tr><td colspan="6" class="text-center">Nenhum alerta registrado.</td></tr>'}
            </tbody></table></div></div>`);
        document.getElementById('alertaForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            const body = { tipo: document.getElementById('alertaTipo').value, severidade: document.getElementById('alertaSeveridade').value, titulo: document.getElementById('alertaTitulo').value, mensagem: document.getElementById('alertaMensagem').value };
            try {
                await moduloFetch(editing ? `/api/modulos/alertas/${editing.id}` : '/api/modulos/alertas', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(body) });
                await renderAlertas();
                showToast(editing ? 'Alerta atualizado.' : 'Alerta criado.');
            }
            catch (error) {
                showToast(error.message, 'error');
            }
        });
    }
    catch (error) {
        renderModulo('Central de alertas', error.message, 'alertas', '<div class="panel"><p class="error-msg">Não foi possível carregar os alertas.</p></div>');
        showToast(error.message, 'error');
    }
}
async function reconhecerAlerta(id) { try {
    await moduloFetch(`/api/modulos/alertas/${id}/reconhecer`, { method: 'PATCH' });
    await renderAlertas();
    showToast('Alerta reconhecido.');
}
catch (error) {
    showToast(error.message, 'error');
} }
async function resolverAlerta(id) {
    if (!await confirmarAcao({ title: 'Resolver alerta?', message: 'Confirme que a ocorrência foi tratada para removê-la da lista de pendências.', confirmLabel: 'Marcar resolvido', danger: false }))
        return;
    try {
        await moduloFetch(`/api/modulos/alertas/${id}/resolver`, { method: 'PATCH' });
        await renderAlertas();
        showToast('Alerta resolvido.');
    }
    catch (error) {
        showToast(error.message, 'error');
    }
}
async function deletarAlerta(id) {
    if (!await confirmarAcao({ title: 'Excluir alerta?', message: 'O alerta será removido permanentemente do histórico.', confirmLabel: 'Excluir alerta' }))
        return;
    try {
        await moduloFetch(`/api/modulos/alertas/${id}`, { method: 'DELETE' });
        await renderAlertas();
        showToast('Alerta excluído.');
    }
    catch (error) {
        showToast(error.message, 'error');
    }
}
async function renderAuditoria() { setRoute('/auditoria'); try {
    const logs = await moduloFetch('/api/modulos/auditoria');
    renderModulo('Auditoria', 'Rastreabilidade das ações relevantes do sistema.', 'auditoria', `<div class="panel"><div class="table-scroll"><table><thead><tr><th>Data</th><th>Ação</th><th>Entidade</th><th>ID</th></tr></thead><tbody>${logs.map(l => `<tr><td>${formatarData(l.criadoEm)}</td><td>${l.acao}</td><td>${l.entidade}</td><td>${l.entidadeId || '—'}</td></tr>`).join('') || '<tr><td colspan="4" class="text-center">Nenhuma atividade registrada.</td></tr>'}</tbody></table></div></div>`);
}
catch (error) {
    renderModulo('Auditoria', error.message, 'auditoria', '<div class="panel"><p class="error-msg">Não foi possível carregar a auditoria.</p></div>');
} }
Object.assign(window, { renderDashboard, renderEquipamentos, renderManutencoes, renderMonitoramento, renderMonitoramentoIoT, renderRelatorios, renderUsuarios, renderConfiguracoes, renderSetores, renderPlanos, renderOrdens, renderFalhas, renderAlertas, renderAuditoria, renderNovoEquipamento, renderEditarEquipamento, renderNovoUsuario, renderEditarUsuario, deletarUsuario, deletarEquipamento, deletarPlano, deletarOrdem, deletarFalha, deletarAlerta, editarSetor, deletarSetor, editarCategoria, deletarCategoria, renderEditarManutencao, deletarManutencao, handleLogout, concluirOrdem, reconhecerAlerta, resolverAlerta, showToast, startTutorialFromSettings, toggleIotAccess });
//# sourceMappingURL=script.js.map