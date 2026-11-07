"use strict";(()=>{function de(e){let a=e.match(/Vibracao_RMS:\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)/),o=a?Number(a[1]):$e(e);return o!==null&&Number.isFinite(o)&&o>=0?o:null}function $e(e){let a=e.split(",").map(t=>t.trim());if(a.length<5||!a[3])return null;let o=Number(a[3]);return Number.isFinite(o)?o:null}function le(e){return e<.5?0:e<1.5?1:2}var ve=document.getElementById("app"),c=null,q=0,B=null,I=null,P=null,y=!1,O=!1,x=!1,Z=0,G=null,D=[],Q={theme:"dark",compactDashboard:!1,showDashboardOrders:!0,showDashboardAlerts:!0};function F(e){document.documentElement.dataset.theme=e==="light"?"light":"dark",document.documentElement.style.colorScheme=e==="light"?"light":"dark"}var we=[{path:"/dashboard",target:"sidebar",title:"Menu lateral",description:"Use o menu para navegar pelas \xE1reas do SIMEQ. As op\xE7\xF5es e a\xE7\xF5es dispon\xEDveis podem variar conforme o acesso da sua conta."},{path:"/dashboard",target:"dashboard-cards",title:"Dashboard",description:"Veja os indicadores operacionais, alertas (se habilitados nas prefer\xEAncias) e as informa\xE7\xF5es priorit\xE1rias para a sua rotina."},{path:"/equipamentos",target:"equipment-list",title:"Equipamentos",description:"Consulte e pesquise os ativos cadastrados. Use \u201CAdicionar Ativo\u201D para incluir nome, setor, respons\xE1vel, localiza\xE7\xE3o e dados de manuten\xE7\xE3o; os controles da linha permitem editar ou excluir."},{path:"/planos",target:"maintenance-plans",title:"Planos de manuten\xE7\xE3o",description:"Cadastre planos preventivos e defina periodicidade, pr\xF3xima execu\xE7\xE3o, respons\xE1vel e instru\xE7\xF5es para organizar as rotinas."},{path:"/ordens",target:"service-orders",title:"Ordens de servi\xE7o",description:"Registre e acompanhe solicita\xE7\xF5es. Consulte o equipamento, respons\xE1vel, prioridade, prazo e andamento de cada ordem."},{path:"/monitoramento",target:"equipment-monitoring",title:"Monitoramento e aten\xE7\xE3o",description:"Confira o prazo de manuten\xE7\xE3o de cada equipamento. O status \xE9 calculado com base na \xFAltima manuten\xE7\xE3o registrada e na frequ\xEAncia definida."},{path:"/alertas",target:"alert-list",title:"Alertas e notifica\xE7\xF5es",description:"Consulte alertas, sua severidade e estado para identificar ocorr\xEAncias que precisam de aten\xE7\xE3o e priorizar a\xE7\xF5es."},{path:"/monitoramento-iot",target:"iot-monitor",title:"IoT e sensores",description:"Com o m\xF3dulo Arduino liberado para sua conta, conecte o sensor por USB e acompanhe a vibra\xE7\xE3o RMS e o n\xEDvel calculado pelo dispositivo.",iotOnly:!0},{path:"/relatorios",target:"report-export",title:"Relat\xF3rios",description:"Consulte equipamentos, ordens, planos, manuten\xE7\xF5es e falhas recentes. A op\xE7\xE3o dispon\xEDvel nesta tela permite imprimir ou salvar o relat\xF3rio em PDF."},{path:"/configuracoes",target:"account-settings",title:"Perfil e configura\xE7\xF5es",description:"Atualize seus dados de perfil e personalize o dashboard. A op\xE7\xE3o Ajuda permite rever este tutorial; altera\xE7\xF5es de acesso ao Arduino s\xE3o feitas por um gerente ap\xF3s a compra."}],W={"/login":z,"/dashboard":j,"/equipamentos":H,"/manutencoes":V,"/monitoramento":te,"/monitoramento-iot":he,"/relatorios":ye,"/usuarios":L,"/configuracoes":se,"/setores":C,"/planos":K,"/ordens":J,"/falhas":X,"/alertas":k,"/auditoria":Ee};function $(e){window.location.pathname!==e&&history.pushState({},"",e)}function he(){return te(!0)}async function be(){await(W[window.location.pathname]||j)()}window.addEventListener("popstate",()=>{if(!c){z();return}be()});async function qe(){try{let a=await(await fetch("/api/auth/me")).json();a.loggedIn?(c=a.user,c.preferences={...Q,...a.user.preferences||{}},F(c.preferences.theme),await be(),await fe()):z()}catch(e){console.error("Erro na inicializa\xE7\xE3o:",e),z()}}function Ae(){return we.filter(e=>e.iotOnly&&!c?.iotEnabled?!1:e.path==="/dashboard"?!0:!!document.querySelector(`.sidebar [data-route="${e.path}"]`))}function ee(){document.getElementById("tutorial-overlay")?._cleanup?.(),document.getElementById("tutorial-overlay")?.remove(),document.getElementById("tutorial-welcome")?.remove(),B&&(document.removeEventListener("keydown",B),B=null)}async function fe(){if(!(c?.tutorialStatus==="COMPLETED"||c?.tutorialStatus==="SKIPPED"))try{let e=await fetch("/api/auth/tutorial/start",{method:"POST"}),a=await e.json();if(!e.ok)throw new Error(a.message||"N\xE3o foi poss\xEDvel consultar o tutorial.");c.tutorialStatus=a.status,a.showWelcome&&ge()}catch(e){console.error("Erro ao iniciar o tutorial:",e),n(e.message||"N\xE3o foi poss\xEDvel consultar o tutorial.","error")}}function ge(){ee();let e=document.createElement("div");e.id="tutorial-welcome",e.className="tutorial-welcome-overlay",e.innerHTML=`
        <section class="tutorial-welcome" role="dialog" aria-modal="true" aria-labelledby="tutorial-welcome-title">
            <img src="/images/favicon.png" alt="Logo SIMEQ" class="tutorial-logo">
            <h2 id="tutorial-welcome-title">Bem-vindo ao SIMEQ!</h2>
            <p>Vamos mostrar rapidamente como utilizar o sistema para monitorar equipamentos e gerenciar manuten\xE7\xF5es.</p>
            <div class="tutorial-actions">
                <button type="button" class="btn btn-primary" data-tutorial-start>Come\xE7ar tutorial</button>
                <button type="button" class="btn btn-outline" data-tutorial-skip>Pular tutorial</button>
            </div>
        </section>`,document.body.appendChild(e),e.querySelector("[data-tutorial-start]").addEventListener("click",()=>_(0)),e.querySelector("[data-tutorial-skip]").addEventListener("click",()=>R("SKIPPED")),e.querySelector("[data-tutorial-start]").focus(),B=a=>{a.key==="Escape"&&(a.preventDefault(),R("SKIPPED"))},document.addEventListener("keydown",B)}async function _(e){let a=Ae();if(!a.length){n("N\xE3o h\xE1 etapas dispon\xEDveis para as permiss\xF5es desta conta.","error");return}q=Math.max(0,Math.min(e,a.length-1));let o=a[q];ee(),W[o.path]&&await W[o.path](),await new Promise(h=>requestAnimationFrame(()=>requestAnimationFrame(h)));let t=document.querySelector(`[data-tour="${o.target}"]`)||document.getElementById("page-content");t.scrollIntoView({behavior:"auto",block:"center",inline:"nearest"});let r=document.createElement("div");r.id="tutorial-overlay",r.className="tutorial-overlay",r.innerHTML=`
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
        </section>`,document.body.appendChild(r);let i=r.querySelector(".tutorial-spotlight"),s=r.querySelector(".tutorial-popover");r.querySelector(".tutorial-progress").textContent=`Etapa ${q+1} de ${a.length}`,r.querySelector("#tutorial-step-title").textContent=o.title,r.querySelector("#tutorial-step-description").textContent=o.description;let u=r.querySelector("[data-tutorial-previous]"),p=r.querySelector("[data-tutorial-next]");u.hidden=q===0,p.textContent=q===a.length-1?"Concluir":"Pr\xF3ximo",u.addEventListener("click",()=>_(q-1)),p.addEventListener("click",()=>q===a.length-1?R("COMPLETED"):_(q+1)),r.querySelector("[data-tutorial-skip]").addEventListener("click",()=>R("SKIPPED"));let v=()=>{let h=t.getBoundingClientRect();i.style.top=`${Math.max(4,h.top-5)}px`,i.style.left=`${Math.max(4,h.left-5)}px`,i.style.width=`${Math.min(window.innerWidth-8,h.width+10)}px`,i.style.height=`${Math.min(window.innerHeight-8,h.height+10)}px`;let S=s.getBoundingClientRect(),N=Math.min(Math.max(12,h.left+h.width/2-S.width/2),window.innerWidth-S.width-12),M=h.bottom+16,m=M+S.height<window.innerHeight-12?M:Math.max(12,h.top-S.height-16);s.style.left=`${N}px`,s.style.top=`${m}px`};v(),window.addEventListener("resize",v),window.addEventListener("scroll",v,!0),r._cleanup=()=>{window.removeEventListener("resize",v),window.removeEventListener("scroll",v,!0)},B=h=>{h.key==="Escape"?(h.preventDefault(),R("SKIPPED")):h.key==="ArrowRight"&&q<a.length-1?_(q+1):h.key==="ArrowLeft"&&q>0&&_(q-1)},document.addEventListener("keydown",B),p.focus()}async function R(e){if(c?.tutorialStatus!=="COMPLETED"&&c?.tutorialStatus!=="SKIPPED")try{let t=await fetch("/api/auth/tutorial/state",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:e})}),r=await t.json();if(!t.ok)throw new Error(r.message||"N\xE3o foi poss\xEDvel salvar o estado do tutorial.");c.tutorialStatus=r.status}catch(t){console.error("Erro ao salvar o estado do tutorial:",t),n(t.message||"N\xE3o foi poss\xEDvel salvar o estado do tutorial. Tente novamente.","error");return}document.getElementById("tutorial-overlay")?._cleanup?.(),ee(),n(e==="COMPLETED"?"Tutorial conclu\xEDdo.":"Tutorial ignorado.")}function Ie(){ge()}function b(e,a){y&&!["/monitoramento","/monitoramento-iot"].includes(window.location.pathname)&&oe(),ve.innerHTML=`
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
                    <a data-route="/dashboard" onclick="renderDashboard()" class="${a==="dash"?"active":""}"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                    <a data-route="/equipamentos" onclick="renderEquipamentos()" class="${a==="equip"?"active":""}"><i class="fas fa-tools"></i> Equipamentos</a>
                    <a data-route="/manutencoes" onclick="renderManutencoes()" class="${a==="manut"?"active":""}"><i class="fas fa-history"></i> Manuten\xE7\xF5es</a>
                    <a data-route="/monitoramento" onclick="renderMonitoramento()" class="${a==="monit"?"active":""}"><i class="fas fa-desktop"></i> Monitoramento</a>
                    ${c?.iotEnabled?`<a data-route="/monitoramento-iot" onclick="renderMonitoramentoIoT()" class="${a==="iot"?"active":""}"><i class="fas fa-wave-square"></i> Arduino / IoT</a>`:""}
                    <a data-route="/relatorios" onclick="renderRelatorios()" class="${a==="relat"?"active":""}"><i class="fas fa-file-alt"></i> Relat\xF3rios</a>
                    <a data-route="/setores" onclick="renderSetores()" class="${a==="setores"?"active":""}"><i class="fas fa-sitemap"></i> Setores</a>
                    <a data-route="/planos" onclick="renderPlanos()" class="${a==="planos"?"active":""}"><i class="fas fa-calendar-check"></i> Planos</a>
                    <a data-route="/ordens" onclick="renderOrdens()" class="${a==="ordens"?"active":""}"><i class="fas fa-clipboard-list"></i> Ordens de servi\xE7o</a>
                    <a data-route="/falhas" onclick="renderFalhas()" class="${a==="falhas"?"active":""}"><i class="fas fa-bug"></i> Falhas</a>
                    <a data-route="/alertas" onclick="renderAlertas()" class="${a==="alertas"?"active":""}"><i class="fas fa-bell"></i> Alertas</a>
                    ${c?.cargo==="Gerente"?`<a data-route="/usuarios" onclick="renderUsuarios()" class="${a==="user"?"active":""}"><i class="fas fa-users"></i> Usu\xE1rios</a>`:""}
                    <a data-route="/auditoria" onclick="renderAuditoria()" class="${a==="auditoria"?"active":""}"><i class="fas fa-shield-alt"></i> Auditoria</a>
                    <a data-route="/configuracoes" onclick="renderConfiguracoes()" class="${a==="config"?"active":""}"><i class="fas fa-cog"></i> Configura\xE7\xF5es</a>
                    <div class="sidebar-footer">
                        <a onclick="handleLogout()" class="logout-link"><i class="fas fa-sign-out-alt"></i> Sair</a>
                    </div>
                </nav>
            </aside>
            <main class="content">
                <header class="main-header">
                    <div class="breadcrumb">SIMEQ / ${a.toUpperCase()}</div>
                    <div class="user-info">
                        <span class="user-name"><i class="fas fa-user-circle"></i> ${U(c.nome)}</span>
                        <span class="user-role">${U(c.cargo)}</span>
                    </div>
                </header>
                <div id="page-content" class="fade-in">
                    ${e}
                </div>
            </main>
        </div>
    `,ae()}function ae(){if(document.getElementById("feedback-host"))return;let e=document.createElement("div");e.id="feedback-host",e.className="app-toast-stack",document.body.appendChild(e)}function n(e,a="success"){ae();let o=document.getElementById("feedback-host"),t=document.createElement("div");t.className=`app-toast ${a}`,t.setAttribute("role",a==="error"?"alert":"status"),t.innerHTML=`<span class="app-toast-icon"><i class="fas ${a==="error"?"fa-circle-exclamation":"fa-circle-check"}"></i></span><span class="app-toast-message"></span><button type="button" class="app-toast-close" aria-label="Fechar notifica\xE7\xE3o"><i class="fas fa-times"></i></button>`,t.querySelector(".app-toast-message").textContent=e;let r=()=>t.remove();t.querySelector(".app-toast-close").addEventListener("click",r),o.appendChild(t),window.setTimeout(r,5e3)}function A({title:e="Confirmar a\xE7\xE3o",message:a,confirmLabel:o="Confirmar",danger:t=!0}){ae();let r=document.getElementById("feedback-host");return new Promise(i=>{let s=document.createElement("div");s.className="confirm-overlay",s.innerHTML=`
            <section class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
                <div class="confirm-dialog-icon ${t?"danger":""}"><i class="fas ${t?"fa-exclamation":"fa-circle-question"}"></i></div>
                <h2 id="confirm-title"></h2>
                <p class="confirm-dialog-message"></p>
                <div class="confirm-dialog-actions">
                    <button type="button" class="btn btn-outline confirm-cancel">Cancelar</button>
                    <button type="button" class="btn ${t?"btn-danger":"btn-primary"} confirm-accept"></button>
                </div>
            </section>`,s.querySelector("#confirm-title").textContent=e,s.querySelector(".confirm-dialog-message").textContent=a,s.querySelector(".confirm-accept").textContent=o;let u=v=>{document.removeEventListener("keydown",p),s.remove(),i(v)},p=v=>{v.key==="Escape"&&u(!1),v.key==="Enter"&&document.activeElement===s.querySelector(".confirm-accept")&&u(!0)};s.addEventListener("click",v=>{v.target===s&&u(!1)}),s.querySelector(".confirm-cancel").addEventListener("click",()=>u(!1)),s.querySelector(".confirm-accept").addEventListener("click",()=>u(!0)),document.addEventListener("keydown",p),r.appendChild(s),s.querySelector(".confirm-accept").focus()})}function z(){$("/login"),ve.innerHTML=`
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
    `,document.getElementById("loginForm").addEventListener("submit",async e=>{e.preventDefault();let a=document.getElementById("email").value,o=document.getElementById("senha").value,t=document.getElementById("loginError");t.innerText="Autenticando...";try{let i=await(await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:a,senha:o})})).json();i.success?(c=i.user,c.preferences={...Q,...i.user.preferences||{}},F(c.preferences.theme),await j(),await fe()):t.innerText=i.message}catch{t.innerText="Erro de conex\xE3o com o servidor."}})}async function j(){$("/dashboard");try{let[e,a,o,t,r]=await Promise.all([l("/api/equipamentos"),l("/api/manutencoes"),l("/api/modulos/ordens"),l("/api/modulos/alertas"),l("/api/modulos/falhas")]),i=e.map(m=>({equipamento:m,status:ne(m)})),s=i.filter(m=>m.status.label==="Urgente"),u=i.filter(m=>m.status.label==="Aten\xE7\xE3o"),p=i.filter(m=>m.status.label==="OK"),v=o.filter(m=>!["CONCLUIDA","CANCELADA"].includes(m.status)).sort((m,w)=>{let d={CRITICA:0,ALTA:1,MEDIA:2,BAIXA:3};return(d[m.prioridade]??4)-(d[w.prioridade]??4)}),h=t.filter(m=>!m.resolvidoEm),S=a.slice().sort((m,w)=>new Date(w.data_manutencao).getTime()-new Date(m.data_manutencao).getTime()).slice(0,8),N=[...s,...u].sort((m,w)=>{let d={Urgente:0,Aten\u00E7\u00E3o:1};return d[m.status.label]-d[w.status.label]}).slice(0,6),M=`
            <div class="page-header dashboard-page-header">
                <div>
                    <p class="dashboard-eyebrow">VIS\xC3O OPERACIONAL</p>
                    <h2>Dashboard</h2>
                    <p>Acompanhe a condi\xE7\xE3o dos ativos e as atividades da manuten\xE7\xE3o.</p>
                </div>
                <div class="dashboard-updated"><i class="fas fa-calendar-day"></i> ${new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}</div>
            </div>
            <div class="dashboard-cards${c?.preferences?.compactDashboard?" compact-dashboard":""}" data-tour="dashboard-cards">
                <div class="card">
                    <div class="card-icon"><i class="fas fa-industry"></i></div>
                    <div class="card-body">
                        <h3>Equipamentos</h3>
                        <div class="value">${e.length}</div>
                    </div>
                </div>
                <div class="card success">
                    <div class="card-icon"><i class="fas fa-check-circle"></i></div>
                    <div class="card-body">
                        <h3>Em dia</h3>
                        <div class="value">${p.length}</div>
                    </div>
                </div>
                <div class="card warning">
                    <div class="card-icon"><i class="fas fa-exclamation-circle"></i></div>
                    <div class="card-body">
                        <h3>Pr\xF3ximos do vencimento</h3>
                        <div class="value">${u.length}</div>
                    </div>
                </div>
                <div class="card danger">
                    <div class="card-icon"><i class="fas fa-wrench"></i></div>
                    <div class="card-body">
                        <h3>Manuten\xE7\xF5es atrasadas</h3>
                        <div class="value">${s.length}</div>
                    </div>
                </div>
                <div class="card" ${c?.preferences?.showDashboardOrders===!1?"hidden":""}>
                    <div class="card-icon"><i class="fas fa-clipboard-list"></i></div>
                    <div class="card-body">
                        <h3>Ordens em aberto</h3>
                        <div class="value">${v.length}</div>
                    </div>
                </div>
                <div class="card ${h.length?"warning":"success"}" ${c?.preferences?.showDashboardAlerts===!1?"hidden":""}>
                    <div class="card-icon"><i class="fas fa-bell"></i></div>
                    <div class="card-body">
                        <h3>Alertas ativos</h3>
                        <div class="value">${h.length}</div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-icon"><i class="fas fa-triangle-exclamation"></i></div>
                    <div class="card-body">
                        <h3>Falhas registradas</h3>
                        <div class="value">${r.length}</div>
                    </div>
                </div>
            </div>

            <div class="dashboard-detail-grid">
                <div class="panel">
                    <div class="dashboard-panel-heading">
                        <div><h3><i class="fas fa-heartbeat"></i> Condi\xE7\xE3o dos equipamentos</h3><p>Ativos que precisam de acompanhamento preventivo.</p></div>
                        <button class="btn btn-outline" onclick="renderMonitoramento()">Ver monitoramento</button>
                    </div>
                    <div class="table-scroll"><table>
                        <thead><tr><th>Equipamento</th><th>Setor</th><th>Criticidade</th><th>Situa\xE7\xE3o</th><th>Prazo</th></tr></thead>
                        <tbody>${N.map(({equipamento:m,status:w})=>`
                            <tr><td><strong>${m.nome}</strong></td><td>${m.setor||"\u2014"}</td><td>${m.criticidade||"\u2014"}</td><td><span class="badge ${w.class}">${w.label}</span></td><td>${w.dias}</td></tr>
                        `).join("")||'<tr><td colspan="5" class="text-center">Todos os equipamentos est\xE3o em dia.</td></tr>'}</tbody>
                    </table></div>
                    <p class="dashboard-table-footnote">Exibindo ${N.length} de ${s.length+u.length} equipamentos que exigem aten\xE7\xE3o.</p>
                </div>
                <div class="panel" ${c?.preferences?.showDashboardOrders===!1?"hidden":""}>
                    <div class="dashboard-panel-heading">
                        <div><h3><i class="fas fa-clipboard-list"></i> Ordens de servi\xE7o</h3><p>Pend\xEAncias priorizadas para a equipe.</p></div>
                        <button class="btn btn-outline" onclick="renderOrdens()">Ver ordens</button>
                    </div>
                    <div class="dashboard-order-list">
                        ${v.slice(0,5).map(m=>`
                            <article class="dashboard-order-item">
                                <span class="dashboard-order-priority ${m.prioridade==="CRITICA"?"critical":m.prioridade==="ALTA"?"high":""}"></span>
                                <div><strong>${m.titulo}</strong><span>${m.equipamento?.nome||"Equipamento"} \xB7 ${m.status.replace(/_/g," ")}</span></div>
                                <small>${m.prioridade}</small>
                            </article>
                        `).join("")||'<p class="dashboard-empty">N\xE3o h\xE1 ordens de servi\xE7o pendentes.</p>'}
                    </div>
                </div>
            </div>
            <div class="panel dashboard-history-panel">
                <div class="dashboard-panel-heading">
                    <div><h3><i class="fas fa-history"></i> Hist\xF3rico de manuten\xE7\xF5es</h3><p>Interven\xE7\xF5es registradas mais recentemente.</p></div>
                    <button class="btn btn-outline" onclick="renderManutencoes()">Ver hist\xF3rico completo</button>
                </div>
                <div class="table-scroll"><table>
                    <thead><tr><th>Data</th><th>Equipamento</th><th>Setor</th><th>Servi\xE7o realizado</th><th>Respons\xE1vel</th></tr></thead>
                    <tbody>${S.map(m=>{let w=e.find(d=>d.id===m.equipamento_id);return`<tr><td>${g(m.data_manutencao)}</td><td><strong>${m.equipamento_nome||"\u2014"}</strong></td><td>${w?.setor||"\u2014"}</td><td>${m.descricao||"\u2014"}</td><td>${m.responsavel||"\u2014"}</td></tr>`}).join("")||'<tr><td colspan="5" class="text-center">Nenhuma manuten\xE7\xE3o registrada.</td></tr>'}</tbody>
                </table></div>
            </div>
        `;b(M,"dash")}catch(e){console.error(e),b('<div class="page-header"><h2>Dashboard</h2><p>N\xE3o foi poss\xEDvel carregar os indicadores operacionais.</p></div>',"dash"),n(e.message||"Falha ao carregar o dashboard.","error")}}async function H(){$("/equipamentos");let e;try{e=await l("/api/equipamentos")}catch(o){b(`<div class="page-header"><h2>Equipamentos</h2><p>${o.message}</p></div>`,"equip"),n(o.message,"error");return}let a=`
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
                        <th>\xDAltima Manut.</th>
                        <th>A\xE7\xF5es</th>
                    </tr>
                </thead>
                <tbody>
                    ${e.map(o=>`
                        <tr>
                            <td><strong>${o.nome}</strong><br><small class="text-muted">${o.tipo||""}</small></td>
                            <td>${o.setor||"N/A"}</td>
                            <td><span class="badge ${o.criticidade==="Alta"?"urgente":o.criticidade==="M\xE9dia"?"atencao":"ok"}">${o.criticidade}</span></td>
                            <td>${g(o.dataUltimaManutencao)}</td>
                            <td>
                                <button class="btn-icon" title="Editar" onclick="renderEditarEquipamento(${o.id})"><i class="fas fa-edit"></i></button>
                                <button class="btn-icon danger" title="Excluir" onclick="deletarEquipamento(${o.id})"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `).join("")||'<tr><td colspan="5" class="text-center">Nenhum equipamento cadastrado.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;b(a,"equip"),document.getElementById("equipmentSearch").addEventListener("input",o=>{let t=o.target.value.trim().toLocaleLowerCase("pt-BR");document.querySelectorAll("#equipmentTable tbody tr").forEach(r=>{r.hidden=!r.textContent.toLocaleLowerCase("pt-BR").includes(t)})})}function Se(){b(`
        <div class="page-header">
            <h2>Novo Equipamento</h2>
            <p>Cadastre um novo ativo para monitoramento.</p>
        </div>
        <div class="panel" style="max-width: 800px;">
            <form id="equipForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>Nome do Equipamento*</label>
                        <input type="text" id="nome" required placeholder="Ex: Motor Trif\xE1sico 5HP">
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
                        <label>Localiza\xE7\xE3o</label>
                        <input type="text" id="localizacao" placeholder="Ex: Linha 02">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Criticidade</label>
                        <select id="criticidade">
                            <option value="Baixa">Baixa</option>
                            <option value="M\xE9dia" selected>M\xE9dia</option>
                            <option value="Alta">Alta</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Frequ\xEAncia (Dias)</label>
                        <input type="number" id="frequencia" value="30">
                    </div>
                </div>
                <div class="form-group">
                    <label>Observa\xE7\xF5es</label>
                    <textarea id="observacoes" rows="3" placeholder="Detalhes adicionais..."></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-success">Salvar Equipamento</button>
                    <button type="button" class="btn btn-outline" onclick="renderEquipamentos()">Cancelar</button>
                </div>
            </form>
        </div>
    `,"equip"),document.getElementById("equipForm").addEventListener("submit",async a=>{a.preventDefault();let o={nome:document.getElementById("nome").value,tipo:document.getElementById("tipo").value,setor:document.getElementById("setor").value,localizacao:document.getElementById("localizacao").value,criticidade:document.getElementById("criticidade").value,frequenciaDias:document.getElementById("frequencia").value,observacoes:document.getElementById("observacoes").value};try{await l("/api/equipamentos",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)}),await H(),n("Equipamento cadastrado com sucesso.")}catch(t){n(t.message,"error")}})}async function xe(e){try{let a=await fetch(`/api/equipamentos/${e}`);if(!a.ok)throw new Error("Erro ao buscar dados do equipamento.");let o=await a.json(),t=o.dataUltimaManutencao?o.dataUltimaManutencao.split("T")[0]:"",r=`
            <div class="page-header">
                <h2>Editar Equipamento</h2>
                <p>Modifique as informa\xE7\xF5es do ativo industrial.</p>
            </div>
            <div class="panel" style="max-width: 800px;">
                <form id="editEquipForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nome do Equipamento*</label>
                            <input type="text" id="edit_nome" required value="${o.nome||""}">
                        </div>
                        <div class="form-group">
                            <label>Tipo / Categoria</label>
                            <input type="text" id="edit_tipo" value="${o.tipo||""}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Setor</label>
                            <input type="text" id="edit_setor" value="${o.setor||""}">
                        </div>
                        <div class="form-group">
                            <label>Localiza\xE7\xE3o</label>
                            <input type="text" id="edit_localizacao" value="${o.localizacao||""}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Respons\xE1vel T\xE9cnico</label>
                            <input type="text" id="edit_responsavel" value="${o.responsavel||""}">
                        </div>
                        <div class="form-group">
                            <label>Data \xDAltima Manuten\xE7\xE3o</label>
                            <input type="date" id="edit_dataUltima" value="${t}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Criticidade</label>
                            <select id="edit_criticidade">
                                <option value="Baixa" ${o.criticidade==="Baixa"?"selected":""}>Baixa</option>
                                <option value="M\xE9dia" ${o.criticidade==="M\xE9dia"?"selected":""}>M\xE9dia</option>
                                <option value="Alta" ${o.criticidade==="Alta"?"selected":""}>Alta</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Frequ\xEAncia (Dias)</label>
                            <input type="number" id="edit_frequencia" value="${o.frequenciaDias||30}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Observa\xE7\xF5es</label>
                        <textarea id="edit_observacoes" rows="3">${o.observacoes||""}</textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Atualizar Altera\xE7\xF5es</button>
                        <button type="button" class="btn btn-outline" onclick="renderEquipamentos()">Cancelar</button>
                    </div>
                </form>
            </div>
        `;b(r,"equip"),document.getElementById("editEquipForm").addEventListener("submit",async i=>{i.preventDefault();let s={nome:document.getElementById("edit_nome").value,tipo:document.getElementById("edit_tipo").value,setor:document.getElementById("edit_setor").value,localizacao:document.getElementById("edit_localizacao").value,responsavel:document.getElementById("edit_responsavel").value,dataUltimaManutencao:document.getElementById("edit_dataUltima").value||null,criticidade:document.getElementById("edit_criticidade").value,frequenciaDias:parseInt(document.getElementById("edit_frequencia").value,10),observacoes:document.getElementById("edit_observacoes").value};try{await l(`/api/equipamentos/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)}),await H(),n("Equipamento atualizado com sucesso.")}catch(u){n(u.message,"error")}})}catch(a){console.error(a),n(a.message||"N\xE3o foi poss\xEDvel carregar os dados do equipamento.","error")}}async function V(){$("/manutencoes");let e,a;try{[e,a]=await Promise.all([l("/api/equipamentos"),l("/api/manutencoes")])}catch(t){b(`<div class="page-header"><h2>Manuten\xE7\xF5es</h2><p>${t.message}</p></div>`,"manut"),n(t.message,"error");return}let o=`
        <div class="page-header">
            <h2>Manuten\xE7\xF5es</h2>
            <p>Registre novas interven\xE7\xF5es e consulte o hist\xF3rico.</p>
        </div>
        <div class="dashboard-grid">
            <div class="panel">
                <h3><i class="fas fa-edit"></i> Registrar Manuten\xE7\xE3o</h3>
                <form id="manutForm">
                    <div class="form-group">
                        <label>Equipamento*</label>
                        <select id="equip_id" required>
                            <option value="">Selecione um equipamento...</option>
                            ${e.map(t=>`<option value="${t.id}">${t.nome}</option>`).join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Data da Interven\xE7\xE3o*</label>
                        <input type="date" id="data_manut" value="${new Date().toISOString().split("T")[0]}" required>
                    </div>
                    <div class="form-group">
                        <label>Respons\xE1vel*</label>
                        <input type="text" id="resp" required placeholder="Nome do t\xE9cnico">
                    </div>
                    <div class="form-group">
                        <label>Descri\xE7\xE3o das Atividades*</label>
                        <textarea id="desc" required rows="3" placeholder="O que foi feito?"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Salvar Registro</button>
                </form>
            </div>
            <div class="panel">
                <h3><i class="fas fa-list"></i> Hist\xF3rico Completo</h3>
                <div class="table-scroll">
                    <table>
                        <thead><tr><th>Data</th><th>Ativo</th><th>Descri\xE7\xE3o</th><th>Respons\xE1vel</th><th>A\xE7\xF5es</th></tr></thead>
                        <tbody>
                            ${a.map(t=>`
                                <tr>
                                    <td>${g(t.data_manutencao)}</td>
                                    <td><strong>${t.equipamento_nome}</strong></td>
                                    <td>${t.descricao}</td>
                                    <td>${t.responsavel||"\u2014"}</td>
                                    <td><button class="btn-icon" title="Editar" onclick="renderEditarManutencao(${t.id})"><i class="fas fa-edit"></i></button><button class="btn-icon danger" title="Excluir" onclick="deletarManutencao(${t.id})"><i class="fas fa-trash"></i></button></td>
                                </tr>
                            `).join("")||'<tr><td colspan="5" class="text-center">Sem registros.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;b(o,"manut"),document.getElementById("manutForm").addEventListener("submit",async t=>{t.preventDefault();let r={equipamento_id:document.getElementById("equip_id").value,data_manutencao:document.getElementById("data_manut").value,responsavel:document.getElementById("resp").value,descricao:document.getElementById("desc").value};try{await l("/api/manutencoes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)}),await V(),n("Manuten\xE7\xE3o registrada com sucesso.")}catch(i){n(i.message,"error")}})}async function Ce(e){try{let[a,o]=await Promise.all([l("/api/manutencoes"),l("/api/equipamentos")]),t=a.find(i=>i.id===e);if(!t)throw new Error("Manuten\xE7\xE3o n\xE3o encontrada.");let r=`<div class="page-header"><h2>Editar manuten\xE7\xE3o</h2><p>Atualize os dados da interven\xE7\xE3o.</p></div>
            <div class="panel" style="max-width: 720px;"><form id="editManutForm">
                <div class="form-group"><label for="edit_manut_equip">Equipamento</label><select id="edit_manut_equip" required>${o.map(i=>`<option value="${i.id}" ${i.id===t.equipamento_id?"selected":""}>${i.nome}</option>`).join("")}</select></div>
                <div class="form-group"><label for="edit_manut_data">Data</label><input id="edit_manut_data" type="date" value="${new Date(t.data_manutencao).toISOString().slice(0,10)}" required></div>
                <div class="form-group"><label for="edit_manut_resp">Respons\xE1vel</label><input id="edit_manut_resp" value="${t.responsavel||""}"></div>
                <div class="form-group"><label for="edit_manut_desc">Descri\xE7\xE3o</label><textarea id="edit_manut_desc" rows="3" required>${t.descricao||""}</textarea></div>
                <div class="form-actions"><button class="btn btn-primary" type="submit">Salvar altera\xE7\xF5es</button><button class="btn btn-outline" type="button" onclick="renderManutencoes()">Cancelar</button></div>
            </form></div>`;b(r,"manut"),document.getElementById("editManutForm").addEventListener("submit",async i=>{i.preventDefault();try{await l(`/api/manutencoes/${e}`,{method:"PUT",body:JSON.stringify({equipamento_id:document.getElementById("edit_manut_equip").value,data_manutencao:document.getElementById("edit_manut_data").value,responsavel:document.getElementById("edit_manut_resp").value,descricao:document.getElementById("edit_manut_desc").value})}),await V(),n("Manuten\xE7\xE3o atualizada com sucesso.")}catch(s){n(s.message,"error")}})}catch(a){n(a.message,"error")}}async function De(e){if(await A({title:"Excluir manuten\xE7\xE3o?",message:"O registro ser\xE1 removido do hist\xF3rico. Esta a\xE7\xE3o n\xE3o pode ser desfeita.",confirmLabel:"Excluir"}))try{await l(`/api/manutencoes/${e}`,{method:"DELETE"}),await V(),n("Manuten\xE7\xE3o exclu\xEDda com sucesso.")}catch(a){n(a.message,"error")}}async function te(e=!1){if($(e?"/monitoramento-iot":"/monitoramento"),e&&!c?.iotEnabled){b('<div class="page-header"><h2>Monitoramento Arduino</h2><p>O m\xF3dulo Arduino n\xE3o est\xE1 habilitado para esta conta. Solicite a libera\xE7\xE3o a um gerente ap\xF3s a compra.</p></div>',"iot");return}let a;try{a=await l("/api/equipamentos")}catch(i){b(`<div class="page-header"><h2>Monitoramento</h2><p>${i.message}</p></div>`,"monit"),n(i.message,"error");return}let o=`
        <section class="panel iot-panel" ${c?.iotEnabled?'data-tour="iot-monitor"':""} aria-labelledby="iot-title">
            <div class="iot-heading">
                <div>
                    <h3 id="iot-title"><i class="fas fa-wave-square"></i> Monitoramento Arduino \u2014 vibra\xE7\xE3o</h3>
                    <p>${c?.iotEnabled?"Conecte o ADXL345 pela USB. As leituras s\xE3o processadas ao vivo neste navegador e n\xE3o s\xE3o enviadas ao servidor.":"O acesso ao sensor Arduino \xE9 liberado individualmente por um gerente ap\xF3s a compra."}</p>
                </div>
            </div>
            ${c?.iotEnabled?`<div class="iot-reading-grid">
                <div class="iot-reading"><span>Vibra\xE7\xE3o RMS</span><strong id="iot-rms" aria-live="polite">\u2014</strong><small>m/s\xB2</small></div>
                <div class="iot-reading"><span>N\xEDvel do sensor</span><strong id="iot-level" class="badge atencao" aria-live="polite">Aguardando leitura</strong><small id="iot-reading-time">O c\xF3digo transmite uma janela por segundo.</small></div>
            </div>
            <p id="iot-serial-message" class="iot-serial-message" role="status" aria-live="polite">Conecte a porta USB para come\xE7ar a receber dados.</p>
            <details class="iot-serial-debug"><summary>Diagn\xF3stico da comunica\xE7\xE3o serial</summary><code id="iot-serial-last-line">Nenhuma linha recebida.</code></details>
            <div class="iot-chart-wrap">
                <canvas id="iot-chart" aria-label="Hist\xF3rico recente da vibra\xE7\xE3o RMS" role="img"></canvas>
            </div>
            <p class="iot-calibration-note">N\xEDvel calculado a partir da vibra\xE7\xE3o RMS: baixo &lt; ${.5.toFixed(2)}, m\xE9dio de ${.5.toFixed(2)} a &lt; ${1.5.toFixed(2)} e alto a partir de ${1.5.toFixed(2)} m/s\xB2. Limites iniciais; calibre para o motor e a instala\xE7\xE3o reais.</p>`:""}
        </section>`,t=e?`
        <div class="page-header">
            <div><h2>Monitoramento Arduino</h2><p>Leituras do aceler\xF4metro ADXL345 transmitidas pela porta serial USB.</p></div>
            ${me()}
        </div>
        ${o}
    `:`
        <div class="page-header monitoring-page-header">
            <div><h2>Monitoramento</h2>
                <p>C\xE1lculo autom\xE1tico de status baseado na frequ\xEAncia de manuten\xE7\xE3o.</p></div>
            ${me()}
        </div>
        <div class="panel" data-tour="equipment-monitoring">
            <table>
                <thead>
                    <tr>
                        <th>Equipamento</th>
                        <th>\xDAltima Manut.</th>
                        <th>Frequ\xEAncia</th>
                        <th>Status Atual</th>
                        <th>Dias Restantes</th>
                    </tr>
                </thead>
                <tbody>
                    ${a.map(i=>{let s=ne(i);return`
                        <tr>
                            <td><strong>${i.nome}</strong></td>
                            <td>${g(i.dataUltimaManutencao)}</td>
                            <td>${i.frequenciaDias} dias</td>
                            <td><span class="badge ${s.class}">${s.label}</span></td>
                            <td><strong>${s.dias}</strong></td>
                        </tr>`}).join("")||'<tr><td colspan="5" class="text-center">Nenhum equipamento para monitorar.</td></tr>'}
                </tbody>
            </table>
        </div>
        ${o}
    `;b(t,e?"iot":"monit");let r=document.getElementById("iot-connect");r&&r.addEventListener("click",()=>y?oe():Te()),c?.iotEnabled&&ie()}function me(){let e=!!c?.iotEnabled,a="serial"in navigator;return`<div class="iot-connect-control">
        <button id="iot-connect" class="btn btn-primary" type="button" aria-describedby="iot-connect-help">
            <i class="fas ${y?"fa-plug-circle-xmark":"fa-plug"}"></i>
            ${O?"Aguardando porta\u2026":y?"Desconectar Arduino":"Conectar Arduino"}
        </button>
        <span id="iot-connection-status" class="badge ${x?"ok":"atencao"}" role="status" aria-live="polite">${O?"Selecione a porta USB no navegador":y?x?"Conectado \xB7 recebendo dados":"Porta conectada \xB7 aguardando dados":"Desconectado"}</span>
        <small id="iot-connect-help">${e?window.isSecureContext?a?"Conecte a placa e clique para selecionar a porta USB":"Conex\xE3o USB serial requer Chrome ou Edge":"Acesse por localhost ou HTTPS":"Acesso ainda n\xE3o liberado por um gerente"}</small>
    </div>`}async function Te(){if(!(O||y)){if(!c?.iotEnabled){n("O m\xF3dulo Arduino n\xE3o est\xE1 liberado para esta conta. Pe\xE7a a um gerente para habilitar o acesso em Gest\xE3o de Usu\xE1rios.","error");return}if(!window.isSecureContext){n("A conex\xE3o USB s\xF3 funciona em localhost ou HTTPS. Abra o SIMEQ pelo endere\xE7o local seguro.","error");return}if(!("serial"in navigator)){n("Este navegador n\xE3o oferece conex\xE3o USB serial. Abra o SIMEQ no Chrome ou Edge atualizado.","error");return}try{let e=document.getElementById("iot-connection-status");O=!0;let a=document.getElementById("iot-connect");if(a.innerHTML='<i class="fas fa-spinner fa-spin"></i> Aguardando porta\u2026',e.textContent="Selecione a porta USB no navegador",e.className="badge atencao",I=await navigator.serial.requestPort(),await I.open({baudRate:115200}),O=!1,y=!0,x=!1,Z=Date.now(),a.innerHTML='<i class="fas fa-plug-circle-xmark"></i> Desconectar Arduino',e.textContent="Porta conectada \xB7 aguardando dados",e.className="badge atencao",T("Porta USB aberta. Aguardando a pr\xF3xima leitura do sensor (normalmente at\xE9 1 segundo)."),!I.readable)throw new Error("A porta foi aberta, mas n\xE3o disponibilizou leitura. Desconecte e conecte o Arduino e tente novamente.");G=window.setInterval(Y,1e3),await Be()}catch(e){if(O=!1,e.name!=="NotFoundError"){console.error("Erro na conex\xE3o serial do Arduino:",e);let t=e.name==="SecurityError"?"O navegador bloqueou a conex\xE3o serial. Use Chrome ou Edge em localhost ou HTTPS.":e.name==="NetworkError"?"N\xE3o foi poss\xEDvel abrir a porta. Feche o Monitor Serial da Arduino IDE e tente novamente.":e.message||"N\xE3o foi poss\xEDvel conectar ao Arduino.";n(t,"error")}if(y=!1,re(),I)try{await I.close()}catch(t){console.error("Erro ao fechar a porta serial ap\xF3s falha:",t)}I=null,x=!1;let a=document.getElementById("iot-connection-status");a&&(a.textContent="Desconectado",a.className="badge atencao");let o=document.getElementById("iot-connect");o&&(o.innerHTML='<i class="fas fa-plug"></i> Conectar Arduino')}}}async function Be(){let e=new TextDecoder,a="";try{if(!I?.readable)throw new Error("A porta serial n\xE3o est\xE1 dispon\xEDvel para leitura.");for(P=I.readable.getReader();y;){let{value:o,done:t}=await P.read();if(t)break;a+=e.decode(o,{stream:!0});let r=a.split(/\r\n|\n|\r/);a=r.pop()||"",r.forEach(i=>{i.trim()&&Ne(i.trim())})}}catch(o){if(y){console.error("Erro ao ler dados seriais do Arduino:",o);let t=o.name==="NetworkError"?"A leitura serial foi interrompida. Feche o Monitor Serial da Arduino IDE: ele pode estar ocupando a porta.":o.message||"A leitura serial foi interrompida.";T(t),n(t,"error")}}finally{y=!1,re();try{P.releaseLock()}catch(r){console.error("Erro ao liberar a leitura serial:",r)}if(P=null,I)try{await I.close()}catch(r){console.error("Erro ao fechar a porta serial:",r)}I=null;let o=document.getElementById("iot-connection-status");o&&(o.textContent="Desconectado",o.className="badge atencao");let t=document.getElementById("iot-connect");t&&(t.innerHTML='<i class="fas fa-plug"></i> Conectar Arduino')}}async function oe(){if(y=!1,re(),x=!1,P)try{await P.cancel()}catch(e){console.error("Erro ao interromper a leitura serial:",e),n("N\xE3o foi poss\xEDvel interromper a leitura serial corretamente.","error")}}function Ne(e){let a=document.getElementById("iot-serial-last-line");a&&(a.textContent=e),Z=Date.now();let o=de(e);if(o===null){/ADXL345 nao encontrado/i.test(e)?T("O Arduino informou que n\xE3o encontrou o ADXL345. Confira alimenta\xE7\xE3o, GND, SDA e SCL."):T("A porta USB est\xE1 aberta, mas a linha recebida n\xE3o tem um formato reconhecido. Verifique o sketch e abra o diagn\xF3stico para conferir a mensagem recebida."),Y();return}if(!Number.isFinite(o)){T("Foi recebida uma leitura inv\xE1lida do sensor.");return}let t=le(o);x=!0,D.push({rms:o,timestamp:new Date}),D=D.slice(-60);let r=document.getElementById("iot-rms"),i=document.getElementById("iot-level"),s=document.getElementById("iot-reading-time");if(!r||!i||!s)return;let u=["Baixo","M\xE9dio","Alto"],p=["ok","atencao","urgente"];r.textContent=o.toFixed(3),i.textContent=u[t],i.className=`badge ${p[t]}`,s.textContent=`\xDAltima leitura: ${new Date().toLocaleTimeString("pt-BR")}`,T(e.startsWith("Vibracao_RMS:")?"Arduino conectado. O n\xEDvel \xE9 calculado a partir da vibra\xE7\xE3o RMS recebida.":"Arduino conectado. RMS lido da quarta coluna do CSV; o n\xEDvel \xE9 calculado pela vibra\xE7\xE3o, independentemente do texto de status recebido."),Y(),ie()}function Y(){let e=document.getElementById("iot-connection-status");if(!(!e||!y)){if(x&&Date.now()-Z<4e3){e.textContent="Conectado \xB7 recebendo dados",e.className="badge ok";return}x?(e.textContent="Porta conectada \xB7 sem dados recentes",e.className="badge atencao",T("A porta segue aberta, mas os dados pararam. Confira a placa, o sketch e se a Arduino IDE n\xE3o reabriu o Monitor Serial.")):(e.textContent="Porta conectada \xB7 aguardando dados",e.className="badge atencao")}}function T(e){let a=document.getElementById("iot-serial-message");a&&(a.textContent=e)}function re(){G!==null&&(window.clearInterval(G),G=null)}function ie(){let e=document.getElementById("iot-chart");if(!e)return;let a=Math.max(240,e.clientWidth),o=180,t=window.devicePixelRatio||1;e.width=a*t,e.height=o*t;let r=e.getContext("2d");if(!r){console.error("N\xE3o foi poss\xEDvel obter o contexto 2D do gr\xE1fico de vibra\xE7\xE3o.");return}r.scale(t,t),r.clearRect(0,0,a,o),r.strokeStyle="#29405b",r.lineWidth=1;for(let s=1;s<4;s++){let u=s*o/4;r.beginPath(),r.moveTo(0,u),r.lineTo(a,u),r.stroke()}if(D.length<2)return;let i=Math.max(1,...D.map(s=>s.rms));r.strokeStyle="#4a8fe7",r.lineWidth=2,r.beginPath(),D.forEach((s,u)=>{let p=u*a/(D.length-1),v=o-s.rms/i*(o-12)-6;u===0?r.moveTo(p,v):r.lineTo(p,v)}),r.stroke()}window.addEventListener("resize",ie);async function ye(){$("/relatorios");try{let[e,a,o,t,r]=await Promise.all([l("/api/equipamentos"),l("/api/manutencoes"),l("/api/modulos/ordens"),l("/api/modulos/planos"),l("/api/modulos/falhas")]),i=new Date;i.setHours(0,0,0,0);let s=e.map(d=>({equipamento:d,status:ne(d)})),u=s.filter(d=>d.status.label==="Urgente"),p=s.filter(d=>d.status.label==="Aten\xE7\xE3o"),v=o.filter(d=>!["CONCLUIDA","CANCELADA"].includes(d.status)).sort((d,f)=>new Date(d.prazo||"9999-12-31").getTime()-new Date(f.prazo||"9999-12-31").getTime()),h=t.filter(d=>d.ativo).sort((d,f)=>new Date(d.proximaData).getTime()-new Date(f.proximaData).getTime()),S=a.slice().sort((d,f)=>new Date(f.data_manutencao).getTime()-new Date(d.data_manutencao).getTime()).slice(0,8),N=r.slice().sort((d,f)=>new Date(f.dataOcorrencia).getTime()-new Date(d.dataOcorrencia).getTime()).slice(0,5),M=d=>({CRITICA:"Cr\xEDtica",ALTA:"Alta",MEDIA:"M\xE9dia",BAIXA:"Baixa"})[d]||d||"\u2014",m=d=>{let f=Math.ceil((new Date(d).setHours(0,0,0,0)-i.getTime())/864e5);return f<0?`${Math.abs(f)} dia(s) atrasado`:f===0?"Vence hoje":`Em ${f} dia(s)`},w=`
            <section class="maintenance-report">
                <div class="header-actions report-toolbar">
                    <div>
                        <h2>Relat\xF3rio operacional de manuten\xE7\xE3o</h2>
                        <p>Posi\xE7\xE3o dos ativos, servi\xE7os pendentes e atividades recentes.</p>
                    </div>
                    <button class="btn btn-primary" data-tour="report-export" onclick="window.print()"><i class="fas fa-file-pdf"></i> Exportar / Imprimir PDF</button>
                </div>
                <div class="report-heading">
                    <div>
                        <h1>SIMEQ <span>Relat\xF3rio de manuten\xE7\xE3o</span></h1>
                        <p>Respons\xE1vel pela emiss\xE3o: ${c.nome}${c.cargo?` \xB7 ${c.cargo}`:""}</p>
                    </div>
                    <p class="report-date">Emitido em ${i.toLocaleDateString("pt-BR")}</p>
                </div>
                <div class="report-metrics">
                    <div><span>Equipamentos cadastrados</span><strong>${e.length}</strong></div>
                    <div class="${u.length?"metric-warning":""}"><span>Manuten\xE7\xF5es atrasadas</span><strong>${u.length}</strong></div>
                    <div class="${p.length?"metric-attention":""}"><span>Requerem aten\xE7\xE3o</span><strong>${p.length}</strong></div>
                    <div><span>Ordens em aberto</span><strong>${v.length}</strong></div>
                </div>
                <section class="report-section">
                    <h3>Equipamentos que exigem acompanhamento</h3>
                    <p class="report-note">Status calculado pela \xFAltima manuten\xE7\xE3o registrada e frequ\xEAncia preventiva cadastrada.</p>
                    <div class="table-scroll"><table class="report-table">
                        <thead><tr><th>Equipamento</th><th>Setor</th><th>Criticidade</th><th>\xDAltima manuten\xE7\xE3o</th><th>Situa\xE7\xE3o</th></tr></thead>
                        <tbody>${[...u,...p].map(({equipamento:d,status:f})=>`
                            <tr><td><strong>${d.nome}</strong></td><td>${d.setor||"\u2014"}</td><td>${d.criticidade||"\u2014"}</td><td>${g(d.dataUltimaManutencao)}</td><td>${f.label}${f.dias!=="Imediato"?` \xB7 ${f.dias}`:""}</td></tr>
                        `).join("")||'<tr><td colspan="5">Nenhum equipamento atrasado ou pr\xF3ximo do vencimento.</td></tr>'}</tbody>
                    </table></div>
                </section>
                <section class="report-section">
                    <h3>Ordens de servi\xE7o em aberto</h3>
                    <div class="table-scroll"><table class="report-table">
                        <thead><tr><th>Ordem</th><th>Equipamento</th><th>Prioridade</th><th>Status</th><th>Respons\xE1vel</th><th>Prazo</th></tr></thead>
                        <tbody>${v.map(d=>`
                            <tr><td><strong>${d.numero}</strong><br>${d.titulo}</td><td>${d.equipamento?.nome||"\u2014"}</td><td>${M(d.prioridade)}</td><td>${d.status.replace(/_/g," ")}</td><td>${d.responsavel||"\u2014"}</td><td>${g(d.prazo)}</td></tr>
                        `).join("")||'<tr><td colspan="6">N\xE3o h\xE1 ordens de servi\xE7o pendentes.</td></tr>'}</tbody>
                    </table></div>
                </section>
                <section class="report-section">
                    <h3>Pr\xF3ximas manuten\xE7\xF5es planejadas</h3>
                    <div class="table-scroll"><table class="report-table">
                        <thead><tr><th>Equipamento</th><th>Tipo de servi\xE7o</th><th>Periodicidade</th><th>Pr\xF3xima data</th><th>Prazo</th><th>Respons\xE1vel</th></tr></thead>
                        <tbody>${h.map(d=>`
                            <tr><td><strong>${d.equipamento?.nome||"\u2014"}</strong></td><td>${d.tipo}</td><td>${d.periodicidade} ${d.unidade.toLowerCase()}</td><td>${g(d.proximaData)}</td><td>${m(d.proximaData)}</td><td>${d.responsavel||"\u2014"}</td></tr>
                        `).join("")||'<tr><td colspan="6">Nenhum plano de manuten\xE7\xE3o ativo cadastrado.</td></tr>'}</tbody>
                    </table></div>
                </section>
                <section class="report-section report-section-last">
                    <h3>Atividades e falhas recentes</h3>
                    <div class="report-columns">
                        <div>
                            <h4>Manuten\xE7\xF5es registradas</h4>
                            <div class="table-scroll"><table class="report-table">
                                <thead><tr><th>Data</th><th>Equipamento</th><th>Servi\xE7o</th><th>Respons\xE1vel</th></tr></thead>
                                <tbody>${S.map(d=>`
                                    <tr><td>${g(d.data_manutencao)}</td><td>${d.equipamento_nome||"\u2014"}</td><td>${d.descricao||"\u2014"}</td><td>${d.responsavel||"\u2014"}</td></tr>
                                `).join("")||'<tr><td colspan="4">Nenhuma manuten\xE7\xE3o registrada.</td></tr>'}</tbody>
                            </table></div>
                        </div>
                        <div>
                            <h4>Falhas recentes</h4>
                            <div class="table-scroll"><table class="report-table">
                                <thead><tr><th>Data</th><th>Equipamento</th><th>Descri\xE7\xE3o</th><th>Parada</th></tr></thead>
                                <tbody>${N.map(d=>`
                                    <tr><td>${g(d.dataOcorrencia)}</td><td>${d.equipamento?.nome||"\u2014"}</td><td>${d.descricao}</td><td>${d.tempoParadaMin!=null?`${d.tempoParadaMin} min`:"\u2014"}</td></tr>
                                `).join("")||'<tr><td colspan="4">Nenhuma falha registrada.</td></tr>'}</tbody>
                            </table></div>
                        </div>
                    </div>
                </section>
                <footer class="report-footer">SIMEQ \xB7 Sistema Industrial de Monitoramento de Equipamentos \xB7 Documento gerado em ${new Date().toLocaleString("pt-BR")}</footer>
            </section>
        `;b(w,"relat")}catch(e){b(`<div class="page-header"><h2>Relat\xF3rios</h2><p>N\xE3o foi poss\xEDvel carregar os dados do relat\xF3rio: ${e.message}</p></div>`,"relat")}}async function L(){if($("/usuarios"),c?.cargo!=="Gerente"){await j(),n("Somente gerentes podem administrar usu\xE1rios e liberar o m\xF3dulo Arduino.","error");return}let o=`
        <div class="header-actions">
            <div>
                <h2>Gest\xE3o de Usu\xE1rios</h2>
                <p>Administre quem tem acesso ao sistema SIMEQ.</p>
            </div>
            <button class="btn btn-primary" onclick="renderNovoUsuario()"><i class="fas fa-user-plus"></i> Novo Usu\xE1rio</button>
        </div>
        <div class="panel">
            <table>
                <thead><tr><th>Nome</th><th>E-mail</th><th>Cargo</th><th>M\xF3dulo Arduino</th><th>Data Cadastro</th><th>A\xE7\xF5es</th></tr></thead>
                <tbody>
                    ${(await(await fetch("/api/usuarios")).json()).map(t=>`
                        <tr>
                            <td><strong>${U(t.nome)}</strong></td>
                            <td>${U(t.email)}</td>
                            <td>${U(t.cargo)}</td>
                            <td><span class="badge ${t.iotEnabled?"ok":"atencao"}">${t.iotEnabled?"Habilitado":"N\xE3o habilitado"}</span>
                                ${c?.cargo==="Gerente"?`<button class="btn btn-outline iot-access-button" type="button" onclick="toggleIotAccess(${t.id}, ${!t.iotEnabled})">${t.iotEnabled?"Revogar":"Liberar"}</button>`:""}
                            </td>
                            <td>${g(t.dataCadastro)}</td>
                            <td>
                                <button class="btn-icon" title="Editar" onclick="renderEditarUsuario(${t.id})"><i class="fas fa-edit"></i></button>
                                <button class="btn-icon danger" title="Excluir" onclick="deletarUsuario(${t.id})"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
        <p class="text-muted">O acesso Arduino / IoT deve ser liberado por um gerente ap\xF3s a confirma\xE7\xE3o da compra. A libera\xE7\xE3o \xE9 individual por usu\xE1rio.</p>
    `;b(o,"user")}async function Me(e,a){if(await A({title:a?"Liberar m\xF3dulo Arduino?":"Revogar m\xF3dulo Arduino?",message:a?"Confirme que a compra foi validada. O usu\xE1rio passar\xE1 a ver a aba Arduino / IoT.":"O usu\xE1rio deixar\xE1 de visualizar e usar o m\xF3dulo Arduino / IoT.",confirmLabel:a?"Liberar acesso":"Revogar acesso",danger:!a}))try{let t=await l(`/api/auth/users/${e}/iot-access`,{method:"PATCH",body:JSON.stringify({enabled:a})});Number(e)===Number(c?.id)&&(c.iotEnabled=t.iotEnabled),await L(),n(a?"M\xF3dulo Arduino liberado para o usu\xE1rio.":"Acesso ao m\xF3dulo Arduino revogado.")}catch(t){n(t.message,"error")}}function Pe(){b(`
        <div class="page-header">
            <h2>Novo Usu\xE1rio / Funcion\xE1rio</h2>
            <p>Cadastre um novo colaborador com acesso ao sistema SIMEQ.</p>
        </div>
        <div class="panel" style="max-width: 600px;">
            <form id="userForm">
                <div class="form-group">
                    <label>Nome Completo*</label>
                    <input type="text" id="user_nome" required placeholder="Ex: Jo\xE3o Silva">
                </div>
                <div class="form-group">
                    <label>E-mail*</label>
                    <input type="email" id="user_email" required placeholder="Ex: joao@simeq.com">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Senha*</label>
                        <input type="password" id="user_senha" required placeholder="M\xEDnimo 6 caracteres">
                    </div>
                    <div class="form-group">
                        <label>Cargo / Fun\xE7\xE3o*</label>
                        <select id="user_cargo" required>
                            <option value="T\xE9cnico">T\xE9cnico</option>
                            <option value="Gerente">Gerente</option>
                            <option value="Operador">Operador</option>
                        </select>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Salvar Usu\xE1rio</button>
                    <button type="button" class="btn btn-outline" onclick="renderUsuarios()">Cancelar</button>
                </div>
            </form>
        </div>
    `,"user"),document.getElementById("userForm").addEventListener("submit",async a=>{a.preventDefault();let o={nome:document.getElementById("user_nome").value,email:document.getElementById("user_email").value,senha:document.getElementById("user_senha").value,cargo:document.getElementById("user_cargo").value};try{let t=await fetch("/api/usuarios",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)});if(t.ok)await L(),n("Usu\xE1rio cadastrado com sucesso.");else{let r=await t.json();n(r.message||"Erro ao criar usu\xE1rio.","error")}}catch(t){console.error(t),n("Erro de conex\xE3o ao salvar usu\xE1rio.","error")}})}async function Oe(e){try{let a=await fetch(`/api/usuarios/${e}`);if(!a.ok)throw new Error("Erro ao buscar dados do usu\xE1rio.");let o=await a.json(),t=`
            <div class="page-header">
                <h2>Editar Usu\xE1rio / Funcion\xE1rio</h2>
                <p>Modifique as informa\xE7\xF5es cadastrais e permiss\xF5es.</p>
            </div>
            <div class="panel" style="max-width: 600px;">
                <form id="editUserForm">
                    <div class="form-group">
                        <label>Nome Completo*</label>
                        <input type="text" id="edit_user_nome" required value="${o.nome||""}">
                    </div>
                    <div class="form-group">
                        <label>E-mail*</label>
                        <input type="email" id="edit_user_email" required value="${o.email||""}">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nova Senha (Deixe em branco para n\xE3o alterar)</label>
                            <input type="password" id="edit_user_senha" placeholder="Digite uma nova senha se desejar">
                        </div>
                        <div class="form-group">
                            <label>Cargo / Fun\xE7\xE3o*</label>
                            <select id="edit_user_cargo" required>
                                <option value="T\xE9cnico" ${o.cargo==="T\xE9cnico"?"selected":""}>T\xE9cnico</option>
                                <option value="Gerente" ${o.cargo==="Gerente"?"selected":""}>Gerente</option>
                                <option value="Operador" ${o.cargo==="Operador"?"selected":""}>Operador</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Atualizar Usu\xE1rio</button>
                        <button type="button" class="btn btn-outline" onclick="renderUsuarios()">Cancelar</button>
                    </div>
                </form>
            </div>
        `;b(t,"user"),document.getElementById("editUserForm").addEventListener("submit",async r=>{r.preventDefault();let i={nome:document.getElementById("edit_user_nome").value,email:document.getElementById("edit_user_email").value,cargo:document.getElementById("edit_user_cargo").value},s=document.getElementById("edit_user_senha").value;s&&(i.senha=s);let u=await fetch(`/api/usuarios/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)});if(u.ok)await L(),n("Usu\xE1rio atualizado com sucesso.");else{let p=await u.json();n(p.message||"Erro ao atualizar usu\xE1rio.","error")}})}catch(a){console.error(a),n(a.message||"N\xE3o foi poss\xEDvel carregar os dados do usu\xE1rio.","error")}}async function Le(e){if(await A({title:"Excluir usu\xE1rio?",message:"A conta e o acesso ao sistema ser\xE3o removidos. Esta a\xE7\xE3o n\xE3o pode ser desfeita.",confirmLabel:"Excluir usu\xE1rio"}))try{let a=await fetch(`/api/usuarios/${e}`,{method:"DELETE"});if(a.ok)await L(),n("Usu\xE1rio exclu\xEDdo com sucesso.");else{let o=await a.json();n(o.message||"Erro ao excluir usu\xE1rio.","error")}}catch(a){console.error(a),n("Erro de conex\xE3o ao excluir usu\xE1rio.","error")}}function se(){$("/configuracoes");let e={...Q,...c?.preferences||{}},a=`
        <div class="page-header">
            <h2>Configura\xE7\xF5es</h2>
            <p>Gerencie seu perfil, personalize o dashboard e acesse a ajuda do sistema.</p>
        </div>
        <div class="panel" data-tour="account-settings">
            <h3><i class="fas fa-user-gear"></i> Perfil e seguran\xE7a</h3>
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
            <h3><i class="fas fa-circle-half-stroke"></i> Apar\xEAncia</h3>
            <p class="text-muted">Escolha entre o modo escuro, com tons pretos e azul, e o modo claro, com fundo branco e texto escuro.</p>
            <div class="form-group">
                <label for="systemTheme">Tema do sistema</label>
                <select id="systemTheme">
                    <option value="dark" ${e.theme!=="light"?"selected":""}>Modo escuro</option>
                    <option value="light" ${e.theme==="light"?"selected":""}>Modo claro</option>
                </select>
            </div>
        </div>
        <div class="panel">
            <h3><i class="fas fa-sliders"></i> Prefer\xEAncias do dashboard</h3>
            <p class="text-muted">Estas prefer\xEAncias s\xE3o salvas na sua conta e permanecem ao trocar de navegador ou dispositivo.</p>
            <form id="dashboardPreferencesForm">
                <label class="form-check"><input id="compactDashboard" type="checkbox" ${e.compactDashboard?"checked":""}> Exibir indicadores em modo compacto</label>
                <label class="form-check"><input id="showDashboardOrders" type="checkbox" ${e.showDashboardOrders?"checked":""}> Mostrar resumo de ordens de servi\xE7o</label>
                <label class="form-check"><input id="showDashboardAlerts" type="checkbox" ${e.showDashboardAlerts?"checked":""}> Mostrar indicador de alertas</label>
                <button class="btn btn-primary" type="submit">Salvar prefer\xEAncias</button>
            </form>
        </div>
        <div class="panel" data-tour="tutorial-settings">
            <h3><i class="fas fa-circle-question"></i> Ajuda e tutorial</h3>
            <p>Revise o tutorial guiado do sistema quando quiser. Concluir ou pular n\xE3o afeta seus registros.</p>
            <button class="btn btn-outline" type="button" onclick="startTutorialFromSettings()">Ver tutorial do sistema</button>
        </div>
        <div class="panel">
            <h3><i class="fas fa-wave-square"></i> M\xF3dulo Arduino / IoT</h3>
            <p>${c?.iotEnabled?"O acesso ao m\xF3dulo est\xE1 habilitado para sua conta. A aba Arduino / IoT permite conectar o sensor ADXL345 via USB.":"O m\xF3dulo est\xE1 indispon\xEDvel nesta conta. Ap\xF3s a compra do Arduino, um gerente pode liberar o acesso individual na Gest\xE3o de Usu\xE1rios."}</p>
        </div>
    `;b(a,"config"),document.getElementById("profileName").value=c?.nome||"",document.getElementById("profileEmail").value=c?.email||"",document.getElementById("profileSettingsForm").addEventListener("submit",async o=>{o.preventDefault();let t=document.getElementById("profilePassword").value;if(t!==document.getElementById("profilePasswordConfirm").value){n("A confirma\xE7\xE3o da nova senha n\xE3o corresponde.","error");return}try{let r=await l("/api/auth/profile",{method:"PATCH",body:JSON.stringify({nome:document.getElementById("profileName").value,email:document.getElementById("profileEmail").value,...t?{senha:t}:{}})});c={...c,...r.user},await se(),n("Perfil atualizado.")}catch(r){n(r.message,"error")}}),document.getElementById("dashboardPreferencesForm").addEventListener("submit",async o=>{o.preventDefault();let t={theme:document.getElementById("systemTheme").value,compactDashboard:document.getElementById("compactDashboard").checked,showDashboardOrders:document.getElementById("showDashboardOrders").checked,showDashboardAlerts:document.getElementById("showDashboardAlerts").checked};await pe(t)}),document.getElementById("systemTheme").addEventListener("change",async o=>{let t=c.preferences.theme,r=o.target.value;F(r),await pe({...c.preferences,theme:r},!1)||(o.target.value=t,F(t))})}async function pe(e,a=!0){try{let o=await l("/api/auth/preferences",{method:"PATCH",body:JSON.stringify(e)});return c.preferences={...Q,...o.preferences},F(c.preferences.theme),a&&n("Prefer\xEAncias salvas."),!0}catch(o){return n(o.message,"error"),!1}}function g(e){return e?new Date(e).toLocaleDateString("pt-BR"):"---"}function U(e){return String(e??"").replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a])}function ne(e){if(!e.dataUltimaManutencao)return{label:"Urgente",class:"urgente",dias:"Imediato"};let a=new Date;a.setHours(0,0,0,0);let o=new Date(e.dataUltimaManutencao);o.setHours(0,0,0,0);let r=new Date(o.getTime()+e.frequenciaDias*24*60*60*1e3)-a,i=Math.ceil(r/(1e3*60*60*24));return i<0?{label:"Urgente",class:"urgente",dias:`${Math.abs(i)} dias em atraso`}:i<=15?{label:"Aten\xE7\xE3o",class:"atencao",dias:`${i} dias restantes`}:{label:"OK",class:"ok",dias:`${i} dias restantes`}}async function ke(e){if(await A({title:"Excluir equipamento?",message:"Esta a\xE7\xE3o tamb\xE9m excluir\xE1 o hist\xF3rico de manuten\xE7\xF5es, planos, ordens, falhas e alertas vinculados. N\xE3o ser\xE1 poss\xEDvel recuperar esses dados.",confirmLabel:"Excluir equipamento"}))try{let a=await l(`/api/equipamentos/${e}`,{method:"DELETE"});await H();let o=a.removidos||{},t=Object.entries(o).filter(([,r])=>r>0).map(([r,i])=>`${i} ${r}`).join(", ");n(`Equipamento exclu\xEDdo.${t?` Registros removidos: ${t}.`:""}`)}catch(a){n(a.message,"error")}}async function _e(){y&&await oe(),await fetch("/api/auth/logout",{method:"POST"}),c=null,z()}qe();async function l(e,a={}){let o=await fetch(e,{headers:{"Content-Type":"application/json"},...a}),t=await o.json().catch(()=>({}));if(!o.ok)throw new Error(t.message||"N\xE3o foi poss\xEDvel concluir a opera\xE7\xE3o.");return t}function E(e,a,o,t){b(`<div class="page-header"><h2>${e}</h2><p>${a}</p></div>${t}`,o)}async function C(){$("/setores");try{let[e,a]=await Promise.all([l("/api/modulos/setores"),l("/api/modulos/categorias")]);E("Setores e categorias","Organize a opera\xE7\xE3o e acompanhe a distribui\xE7\xE3o dos equipamentos.","setores",`
            <div class="dashboard-grid">
              <div class="panel"><h3><i class="fas fa-plus-circle"></i> Novo setor</h3>
                <form id="setorForm"><div class="form-group"><label for="setorNome">Nome</label><input id="setorNome" required placeholder="Ex.: Produ\xE7\xE3o"></div><div class="form-group"><label for="setorLocal">Localiza\xE7\xE3o</label><input id="setorLocal" placeholder="Ex.: Galp\xE3o A"></div><div class="form-group"><label for="setorDesc">Descri\xE7\xE3o</label><textarea id="setorDesc" rows="3"></textarea></div><button class="btn btn-success" type="submit">Cadastrar setor</button></form>
              </div>
              <div class="panel"><h3><i class="fas fa-sitemap"></i> Setores cadastrados</h3><div class="table-scroll"><table><thead><tr><th>Setor</th><th>Localiza\xE7\xE3o</th><th>Equipamentos</th><th>A\xE7\xF5es</th></tr></thead><tbody>${e.map(o=>`<tr><td><strong>${o.nome}</strong><br><small class="text-muted">${o.descricao||"Sem descri\xE7\xE3o"}</small></td><td>${o.localizacao||"\u2014"}</td><td><span class="badge ok">${o._count.equipamentos}</span></td><td><button class="btn-icon" title="Editar" onclick="editarSetor(${o.id})"><i class="fas fa-edit"></i></button><button class="btn-icon danger" title="Excluir" onclick="deletarSetor(${o.id})"><i class="fas fa-trash"></i></button></td></tr>`).join("")||'<tr><td colspan="4" class="text-center">Nenhum setor cadastrado.</td></tr>'}</tbody></table></div></div>
            </div>
            <div class="dashboard-grid">
              <div class="panel"><h3><i class="fas fa-plus-circle"></i> Nova categoria</h3><form id="categoriaForm"><div class="form-group"><label for="categoriaNome">Nome</label><input id="categoriaNome" required placeholder="Ex.: El\xE9trica"></div><div class="form-group"><label for="categoriaDesc">Descri\xE7\xE3o</label><textarea id="categoriaDesc" rows="2"></textarea></div><button class="btn btn-success" type="submit">Cadastrar categoria</button></form></div>
              <div class="panel"><h3><i class="fas fa-tags"></i> Categorias cadastradas</h3><div class="table-scroll"><table><thead><tr><th>Categoria</th><th>Equipamentos</th><th>A\xE7\xF5es</th></tr></thead><tbody>${a.map(o=>`<tr><td><strong>${o.nome}</strong><br><small class="text-muted">${o.descricao||"Sem descri\xE7\xE3o"}</small></td><td><span class="badge ok">${o._count.equipamentos}</span></td><td><button class="btn-icon" title="Editar" onclick="editarCategoria(${o.id})"><i class="fas fa-edit"></i></button><button class="btn-icon danger" title="Excluir" onclick="deletarCategoria(${o.id})"><i class="fas fa-trash"></i></button></td></tr>`).join("")||'<tr><td colspan="3" class="text-center">Nenhuma categoria cadastrada.</td></tr>'}</tbody></table></div></div>
            </div>`),document.getElementById("setorForm").addEventListener("submit",async o=>{o.preventDefault();try{await l("/api/modulos/setores",{method:"POST",body:JSON.stringify({nome:document.getElementById("setorNome").value,localizacao:document.getElementById("setorLocal").value,descricao:document.getElementById("setorDesc").value})}),await C(),n("Setor cadastrado com sucesso.")}catch(t){n(t.message,"error")}}),document.getElementById("categoriaForm").addEventListener("submit",async o=>{o.preventDefault();try{await l("/api/modulos/categorias",{method:"POST",body:JSON.stringify({nome:document.getElementById("categoriaNome").value,descricao:document.getElementById("categoriaDesc").value})}),await C(),n("Categoria cadastrada com sucesso.")}catch(t){n(t.message,"error")}})}catch(e){E("Setores e categorias",e.message,"setores",'<div class="panel"><p class="error-msg">N\xE3o foi poss\xEDvel carregar setores e categorias.</p></div>'),n(e.message,"error")}}async function Re(e){try{let a=(await l("/api/modulos/setores")).find(o=>o.id===e);if(!a)throw new Error("Setor n\xE3o encontrado.");E("Editar setor","Atualize os dados do setor.","setores",`<div class="panel" style="max-width:640px"><form id="editSetorForm"><div class="form-group"><label for="editSetorNome">Nome</label><input id="editSetorNome" required value="${a.nome}"></div><div class="form-group"><label for="editSetorLocal">Localiza\xE7\xE3o</label><input id="editSetorLocal" value="${a.localizacao||""}"></div><div class="form-group"><label for="editSetorDesc">Descri\xE7\xE3o</label><textarea id="editSetorDesc" rows="3">${a.descricao||""}</textarea></div><div class="form-actions"><button class="btn btn-primary">Salvar altera\xE7\xF5es</button><button type="button" class="btn btn-outline" onclick="renderSetores()">Cancelar</button></div></form></div>`),document.getElementById("editSetorForm").addEventListener("submit",async o=>{o.preventDefault();try{await l(`/api/modulos/setores/${e}`,{method:"PUT",body:JSON.stringify({nome:document.getElementById("editSetorNome").value,localizacao:document.getElementById("editSetorLocal").value,descricao:document.getElementById("editSetorDesc").value})}),await C(),n("Setor atualizado.")}catch(t){n(t.message,"error")}})}catch(a){n(a.message,"error")}}async function Ue(e){if(await A({title:"Excluir setor?",message:"A exclus\xE3o s\xF3 ser\xE1 permitida quando n\xE3o houver equipamentos vinculados.",confirmLabel:"Excluir setor"}))try{await l(`/api/modulos/setores/${e}`,{method:"DELETE"}),await C(),n("Setor exclu\xEDdo.")}catch(a){n(a.message,"error")}}async function Fe(e){try{let a=(await l("/api/modulos/categorias")).find(o=>o.id===e);if(!a)throw new Error("Categoria n\xE3o encontrada.");E("Editar categoria","Atualize os dados da categoria.","setores",`<div class="panel" style="max-width:640px"><form id="editCategoriaForm"><div class="form-group"><label for="editCategoriaNome">Nome</label><input id="editCategoriaNome" required value="${a.nome}"></div><div class="form-group"><label for="editCategoriaDesc">Descri\xE7\xE3o</label><textarea id="editCategoriaDesc" rows="3">${a.descricao||""}</textarea></div><div class="form-actions"><button class="btn btn-primary">Salvar altera\xE7\xF5es</button><button type="button" class="btn btn-outline" onclick="renderSetores()">Cancelar</button></div></form></div>`),document.getElementById("editCategoriaForm").addEventListener("submit",async o=>{o.preventDefault();try{await l(`/api/modulos/categorias/${e}`,{method:"PUT",body:JSON.stringify({nome:document.getElementById("editCategoriaNome").value,descricao:document.getElementById("editCategoriaDesc").value})}),await C(),n("Categoria atualizada.")}catch(t){n(t.message,"error")}})}catch(a){n(a.message,"error")}}async function ze(e){if(await A({title:"Excluir categoria?",message:"A exclus\xE3o s\xF3 ser\xE1 permitida quando n\xE3o houver equipamentos vinculados.",confirmLabel:"Excluir categoria"}))try{await l(`/api/modulos/categorias/${e}`,{method:"DELETE"}),await C(),n("Categoria exclu\xEDda.")}catch(a){n(a.message,"error")}}async function K(e=null){$("/planos");try{let[a,o]=await Promise.all([l("/api/modulos/planos"),l("/api/equipamentos")]),t=e==null?null:a.find(i=>i.id===e);if(e!=null&&!t)throw new Error("Plano de manuten\xE7\xE3o n\xE3o encontrado.");let r=(i,s)=>i===s?"selected":"";E("Planos de manuten\xE7\xE3o","Planeje e acompanhe as interven\xE7\xF5es preventivas.","planos",`
            <div class="panel">
                <h3><i class="fas fa-calendar-check"></i> ${t?"Editar plano":"Novo plano de manuten\xE7\xE3o"}</h3>
                <form id="planoForm">
                    <div class="form-row">
                        <div class="form-group"><label for="planoEquip">Equipamento</label><select id="planoEquip" required>${o.map(i=>`<option value="${i.id}" ${r(i.id,t?.equipamentoId)}>${i.nome}</option>`).join("")}</select></div>
                        <div class="form-group"><label for="planoTipo">Tipo</label><select id="planoTipo">${["PREVENTIVA","INSPE\xC7\xC3O","LUBRIFICA\xC7\xC3O","CALIBRA\xC7\xC3O"].map(i=>`<option ${r(i,t?.tipo||"PREVENTIVA")}>${i}</option>`).join("")}</select></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label for="planoPeriodo">Periodicidade</label><input id="planoPeriodo" type="number" min="1" value="${t?.periodicidade||30}" required></div>
                        <div class="form-group"><label for="planoUnidade">Unidade</label><select id="planoUnidade">${["DIAS","SEMANAS","MESES"].map(i=>`<option ${r(i,t?.unidade||"DIAS")}>${i}</option>`).join("")}</select></div>
                        <div class="form-group"><label for="planoData">Pr\xF3xima execu\xE7\xE3o</label><input id="planoData" type="date" value="${t?new Date(t.proximaData).toISOString().slice(0,10):""}" required></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label for="planoResp">Respons\xE1vel</label><input id="planoResp" value="${t?.responsavel||""}"></div>
                        <div class="form-group"><label for="planoAntecedencia">Avisar com anteced\xEAncia (dias)</label><input id="planoAntecedencia" type="number" min="0" value="${t?.antecedencia??7}"></div>
                    </div>
                    <div class="form-group"><label for="planoInstr">Instru\xE7\xF5es</label><textarea id="planoInstr" rows="2">${t?.instrucoes||""}</textarea></div>
                    ${t?`<div class="form-group"><label for="planoAtivo">Situa\xE7\xE3o</label><select id="planoAtivo"><option value="true" ${r(!0,t.ativo)}>Ativo</option><option value="false" ${r(!1,t.ativo)}>Inativo</option></select></div>`:""}
                    <div class="form-actions"><button class="btn btn-success" type="submit">${t?"Salvar altera\xE7\xF5es":"Cadastrar plano"}</button>${t?'<button class="btn btn-outline" type="button" onclick="renderPlanos()">Cancelar</button>':""}</div>
                </form>
            </div>
            <div class="panel" data-tour="maintenance-plans"><h3><i class="fas fa-list"></i> Planos cadastrados</h3><div class="table-scroll"><table><thead><tr><th>Equipamento</th><th>Tipo</th><th>Periodicidade</th><th>Pr\xF3xima data</th><th>Situa\xE7\xE3o</th><th>A\xE7\xF5es</th></tr></thead><tbody>
                ${a.map(i=>`<tr><td><strong>${i.equipamento.nome}</strong></td><td>${i.tipo}</td><td>${i.periodicidade} ${i.unidade.toLowerCase()}</td><td>${g(i.proximaData)}</td><td>${i.ativo?"Ativo":"Inativo"}</td><td><button class="btn-icon" title="Editar" onclick="renderPlanos(${i.id})"><i class="fas fa-edit"></i></button><button class="btn-icon danger" title="Excluir" onclick="deletarPlano(${i.id})"><i class="fas fa-trash"></i></button></td></tr>`).join("")||'<tr><td colspan="6" class="text-center">Nenhum plano cadastrado.</td></tr>'}
            </tbody></table></div></div>`),document.getElementById("planoForm").addEventListener("submit",async i=>{i.preventDefault();let s={equipamentoId:document.getElementById("planoEquip").value,tipo:document.getElementById("planoTipo").value,periodicidade:document.getElementById("planoPeriodo").value,unidade:document.getElementById("planoUnidade").value,proximaData:document.getElementById("planoData").value,responsavel:document.getElementById("planoResp").value||void 0,antecedencia:document.getElementById("planoAntecedencia").value,instrucoes:document.getElementById("planoInstr").value,...t?{ativo:document.getElementById("planoAtivo").value==="true"}:{}};try{await l(t?`/api/modulos/planos/${t.id}`:"/api/modulos/planos",{method:t?"PUT":"POST",body:JSON.stringify(s)}),await K(),n(t?"Plano atualizado.":"Plano cadastrado.")}catch(u){n(u.message,"error")}})}catch(a){E("Planos de manuten\xE7\xE3o",a.message,"planos",'<div class="panel"><p class="error-msg">N\xE3o foi poss\xEDvel carregar os planos.</p></div>'),n(a.message,"error")}}async function je(e){if(await A({title:"Excluir plano?",message:"Ordens de servi\xE7o vinculadas ser\xE3o preservadas sem v\xEDnculo com este plano.",confirmLabel:"Excluir plano"}))try{await l(`/api/modulos/planos/${e}`,{method:"DELETE"}),await K(),n("Plano exclu\xEDdo.")}catch(a){n(a.message,"error")}}async function J(e=null){$("/ordens");try{let[a,o]=await Promise.all([l("/api/modulos/ordens"),l("/api/equipamentos")]),t=e==null?null:a.find(s=>s.id===e);if(e!=null&&!t)throw new Error("Ordem de servi\xE7o n\xE3o encontrada.");let r=(s,u)=>s===u?"selected":"",i={CRITICA:"Cr\xEDtica",ALTA:"Alta",MEDIA:"M\xE9dia",BAIXA:"Baixa"};E("Ordens de servi\xE7o","Controle abertura, prioridade, prazo e conclus\xE3o das interven\xE7\xF5es.","ordens",`
            <div class="panel"><h3><i class="fas fa-clipboard-list"></i> ${t?"Editar ordem":"Abrir ordem de servi\xE7o"}</h3>
                <form id="ordemForm">
                    <div class="form-row">
                        <div class="form-group"><label for="osEquip">Equipamento</label><select id="osEquip" required>${o.map(s=>`<option value="${s.id}" ${r(s.id,t?.equipamentoId)}>${s.nome}</option>`).join("")}</select></div>
                        <div class="form-group"><label for="osPrioridade">Prioridade</label><select id="osPrioridade">${Object.entries(i).map(([s,u])=>`<option value="${s}" ${r(s,t?.prioridade||"MEDIA")}>${u}</option>`).join("")}</select></div>
                        <div class="form-group"><label for="osPrazo">Prazo</label><input id="osPrazo" type="date" value="${t?.prazo?new Date(t.prazo).toISOString().slice(0,10):""}"></div>
                    </div>
                    <div class="form-group"><label for="osTitulo">T\xEDtulo</label><input id="osTitulo" required value="${t?.titulo||""}" placeholder="Ex.: Verificar vibra\xE7\xE3o anormal"></div>
                    <div class="form-group"><label for="osDescricao">Descri\xE7\xE3o</label><textarea id="osDescricao" required rows="2">${t?.descricao||""}</textarea></div>
                    <div class="form-row"><div class="form-group"><label for="osResponsavel">Respons\xE1vel</label><input id="osResponsavel" value="${t?.responsavel||""}"></div>
                    ${t?`<div class="form-group"><label for="osStatus">Status</label><select id="osStatus">${["ABERTA","EM_ANDAMENTO","AGUARDANDO_PECA","CONCLUIDA","CANCELADA"].map(s=>`<option ${r(s,t.status)}>${s}</option>`).join("")}</select></div>`:""}</div>
                    <div class="form-actions"><button class="btn btn-success" type="submit">${t?"Salvar altera\xE7\xF5es":"Abrir ordem"}</button>${t?'<button type="button" class="btn btn-outline" onclick="renderOrdens()">Cancelar</button>':""}</div>
                </form>
            </div>
            <div class="panel" data-tour="service-orders"><h3><i class="fas fa-list"></i> Ordens de servi\xE7o</h3><div class="table-scroll"><table><thead><tr><th>N\xFAmero</th><th>Equipamento</th><th>Prioridade</th><th>Status</th><th>Respons\xE1vel</th><th>Prazo</th><th>A\xE7\xF5es</th></tr></thead><tbody>
                ${a.map(s=>`<tr><td><strong>${s.numero}</strong><br><small>${s.titulo}</small></td><td>${s.equipamento.nome}</td><td><span class="badge ${s.prioridade==="CRITICA"||s.prioridade==="ALTA"?"urgente":"atencao"}">${i[s.prioridade]||s.prioridade}</span></td><td>${s.status.replace(/_/g," ")}</td><td>${s.responsavel||"\u2014"}</td><td>${g(s.prazo)}</td><td><button class="btn-icon" title="Editar" onclick="renderOrdens(${s.id})"><i class="fas fa-edit"></i></button>${["CONCLUIDA","CANCELADA"].includes(s.status)?"":`<button class="btn btn-outline" onclick="concluirOrdem(${s.id})">Concluir</button>`}<button class="btn-icon danger" title="Excluir" onclick="deletarOrdem(${s.id})"><i class="fas fa-trash"></i></button></td></tr>`).join("")||'<tr><td colspan="7" class="text-center">Nenhuma ordem cadastrada.</td></tr>'}
            </tbody></table></div></div>`),document.getElementById("ordemForm").addEventListener("submit",async s=>{s.preventDefault();let u={equipamentoId:document.getElementById("osEquip").value,titulo:document.getElementById("osTitulo").value,descricao:document.getElementById("osDescricao").value,prioridade:document.getElementById("osPrioridade").value,prazo:document.getElementById("osPrazo").value||null,responsavel:document.getElementById("osResponsavel").value||void 0,...t?{tipo:t.tipo,status:document.getElementById("osStatus").value}:{}};try{await l(t?`/api/modulos/ordens/${t.id}`:"/api/modulos/ordens",{method:t?"PUT":"POST",body:JSON.stringify(u)}),await J(),n(t?"Ordem atualizada.":"Ordem de servi\xE7o aberta.")}catch(p){n(p.message,"error")}})}catch(a){E("Ordens de servi\xE7o",a.message,"ordens",'<div class="panel"><p class="error-msg">N\xE3o foi poss\xEDvel carregar as ordens.</p></div>'),n(a.message,"error")}}async function He(e){if(await A({title:"Concluir ordem?",message:"A ordem ser\xE1 marcada como conclu\xEDda. Confirme se o servi\xE7o foi finalizado.",confirmLabel:"Concluir",danger:!1}))try{await l(`/api/modulos/ordens/${e}/status`,{method:"PATCH",body:JSON.stringify({status:"CONCLUIDA"})}),await J(),n("Ordem conclu\xEDda.")}catch(a){n(a.message,"error")}}async function Ve(e){if(await A({title:"Excluir ordem de servi\xE7o?",message:"A ordem ser\xE1 exclu\xEDda. Registros relacionados ser\xE3o preservados quando poss\xEDvel.",confirmLabel:"Excluir ordem"}))try{await l(`/api/modulos/ordens/${e}`,{method:"DELETE"}),await J(),n("Ordem exclu\xEDda.")}catch(a){n(a.message,"error")}}async function X(e=null){$("/falhas");try{let[a,o]=await Promise.all([l("/api/modulos/falhas"),l("/api/equipamentos")]),t=e==null?null:a.find(i=>i.id===e);if(e!=null&&!t)throw new Error("Falha n\xE3o encontrada.");let r=(i,s)=>i===s?"selected":"";E("Falhas e ocorr\xEAncias","Registre sintomas, impacto e causa sem confundir hip\xF3tese com causa confirmada.","falhas",`
            <div class="panel"><h3><i class="fas fa-bug"></i> ${t?"Editar ocorr\xEAncia":"Registrar falha"}</h3>
                <form id="falhaForm">
                    <div class="form-row">
                        <div class="form-group"><label for="falhaEquip">Equipamento</label><select id="falhaEquip" required>${o.map(i=>`<option value="${i.id}" ${r(i.id,t?.equipamentoId)}>${i.nome}</option>`).join("")}</select></div>
                        <div class="form-group"><label for="falhaImpacto">Impacto</label><select id="falhaImpacto">${["BAIXO","MEDIO","ALTO","CRITICO"].map(i=>`<option ${r(i,t?.impacto||"BAIXO")}>${i}</option>`).join("")}</select></div>
                    </div>
                    <div class="form-group"><label for="falhaDesc">Descri\xE7\xE3o do problema</label><textarea id="falhaDesc" required rows="2">${t?.descricao||""}</textarea></div>
                    <div class="form-row"><div class="form-group"><label for="falhaCausa">Causa (se conhecida)</label><input id="falhaCausa" value="${t?.causa||""}"></div>
                    <div class="form-group"><label for="falhaTempo">Tempo de parada (minutos)</label><input id="falhaTempo" type="number" min="0" value="${t?.tempoParadaMin??""}"></div></div>
                    <div class="form-group"><label for="falhaCorretiva">A\xE7\xE3o corretiva</label><textarea id="falhaCorretiva" rows="2">${t?.acaoCorretiva||""}</textarea></div>
                    <label class="form-check"><input id="falhaCausaConfirmada" type="checkbox" ${t?.causaConfirmada?"checked":""}> Causa confirmada</label>
                    <div class="form-actions"><button class="btn btn-danger" type="submit">${t?"Salvar altera\xE7\xF5es":"Registrar falha"}</button>${t?'<button type="button" class="btn btn-outline" onclick="renderFalhas()">Cancelar</button>':""}</div>
                </form>
            </div>
            <div class="panel"><h3><i class="fas fa-list"></i> Hist\xF3rico de ocorr\xEAncias</h3><div class="table-scroll"><table><thead><tr><th>Data</th><th>Equipamento</th><th>Descri\xE7\xE3o</th><th>Impacto</th><th>Causa</th><th>A\xE7\xF5es</th></tr></thead><tbody>
                ${a.map(i=>`<tr><td>${g(i.dataOcorrencia)}</td><td>${i.equipamento.nome}</td><td>${i.descricao}</td><td><span class="badge ${i.impacto==="CRITICO"?"urgente":"atencao"}">${i.impacto||"\u2014"}</span></td><td>${i.causa||"Em investiga\xE7\xE3o"}${i.causaConfirmada?" (confirmada)":""}</td><td><button class="btn-icon" title="Editar" onclick="renderFalhas(${i.id})"><i class="fas fa-edit"></i></button><button class="btn-icon danger" title="Excluir" onclick="deletarFalha(${i.id})"><i class="fas fa-trash"></i></button></td></tr>`).join("")||'<tr><td colspan="6" class="text-center">Nenhuma falha registrada.</td></tr>'}
            </tbody></table></div></div>`),document.getElementById("falhaForm").addEventListener("submit",async i=>{i.preventDefault();let s={equipamentoId:document.getElementById("falhaEquip").value,impacto:document.getElementById("falhaImpacto").value,descricao:document.getElementById("falhaDesc").value,causa:document.getElementById("falhaCausa").value||void 0,causaConfirmada:document.getElementById("falhaCausaConfirmada").checked,tempoParadaMin:document.getElementById("falhaTempo").value?Number(document.getElementById("falhaTempo").value):void 0,acaoCorretiva:document.getElementById("falhaCorretiva").value||void 0,...t?{dataOcorrencia:t.dataOcorrencia,ordemId:t.ordemId}:{}};try{await l(t?`/api/modulos/falhas/${t.id}`:"/api/modulos/falhas",{method:t?"PUT":"POST",body:JSON.stringify(s)}),await X(),n(t?"Ocorr\xEAncia atualizada.":"Falha registrada.")}catch(u){n(u.message,"error")}})}catch(a){E("Falhas e ocorr\xEAncias",a.message,"falhas",'<div class="panel"><p class="error-msg">N\xE3o foi poss\xEDvel carregar as falhas.</p></div>'),n(a.message,"error")}}async function Je(e){if(await A({title:"Excluir ocorr\xEAncia?",message:"A falha ser\xE1 removida do hist\xF3rico e dos relat\xF3rios.",confirmLabel:"Excluir ocorr\xEAncia"}))try{await l(`/api/modulos/falhas/${e}`,{method:"DELETE"}),await X(),n("Ocorr\xEAncia exclu\xEDda.")}catch(a){n(a.message,"error")}}async function k(e=null){$("/alertas");try{let a=await l("/api/modulos/alertas"),o=e==null?null:a.find(r=>r.id===e);if(e!=null&&!o)throw new Error("Alerta n\xE3o encontrado.");let t=(r,i)=>r===i?"selected":"";E("Central de alertas","Acompanhe situa\xE7\xF5es que exigem aten\xE7\xE3o e reconhe\xE7a cada evento.","alertas",`
            <div class="panel"><h3><i class="fas fa-bell"></i> ${o?"Editar alerta":"Novo alerta"}</h3>
                <form id="alertaForm">
                    <div class="form-row"><div class="form-group"><label for="alertaTipo">Tipo</label><input id="alertaTipo" required value="${o?.tipo||""}" placeholder="Ex.: MANUTENCAO"></div><div class="form-group"><label for="alertaSeveridade">Severidade</label><select id="alertaSeveridade">${["INFO","ATENCAO","CRITICO"].map(r=>`<option ${t(r,o?.severidade||"ATENCAO")}>${r}</option>`).join("")}</select></div></div>
                    <div class="form-group"><label for="alertaTitulo">T\xEDtulo</label><input id="alertaTitulo" required value="${o?.titulo||""}"></div>
                    <div class="form-group"><label for="alertaMensagem">Mensagem</label><textarea id="alertaMensagem" rows="2" required>${o?.mensagem||""}</textarea></div>
                    ${o?"":'<p class="text-muted">Este alerta ser\xE1 criado sem v\xEDnculo com equipamento ou ordem de servi\xE7o.</p>'}
                    <div class="form-actions"><button class="btn btn-primary" type="submit">${o?"Salvar altera\xE7\xF5es":"Criar alerta"}</button>${o?'<button type="button" class="btn btn-outline" onclick="renderAlertas()">Cancelar</button>':""}</div>
                </form>
            </div>
            <div class="panel" data-tour="alert-list"><div class="table-scroll"><table><thead><tr><th>Severidade</th><th>Alerta</th><th>Equipamento</th><th>Estado</th><th>Data</th><th>A\xE7\xF5es</th></tr></thead><tbody>
                ${a.map(r=>`<tr><td><span class="badge ${r.severidade==="CRITICO"?"urgente":r.severidade==="INFO"?"ok":"atencao"}">${r.severidade}</span></td><td><strong>${r.titulo}</strong><br><small>${r.mensagem}</small></td><td>${r.equipamento?.nome||"\u2014"}</td><td>${r.resolvidoEm?"Resolvido":r.reconhecidoEm?"Reconhecido":"Novo"}</td><td>${g(r.criadoEm)}</td><td>${!r.reconhecidoEm&&!r.resolvidoEm?`<button class="btn btn-outline" onclick="reconhecerAlerta(${r.id})">Reconhecer</button>`:""}${r.resolvidoEm?"":`<button class="btn btn-outline" onclick="resolverAlerta(${r.id})">Resolver</button>`}<button class="btn-icon" title="Editar" onclick="renderAlertas(${r.id})"><i class="fas fa-edit"></i></button><button class="btn-icon danger" title="Excluir" onclick="deletarAlerta(${r.id})"><i class="fas fa-trash"></i></button></td></tr>`).join("")||'<tr><td colspan="6" class="text-center">Nenhum alerta registrado.</td></tr>'}
            </tbody></table></div></div>`),document.getElementById("alertaForm").addEventListener("submit",async r=>{r.preventDefault();let i={tipo:document.getElementById("alertaTipo").value,severidade:document.getElementById("alertaSeveridade").value,titulo:document.getElementById("alertaTitulo").value,mensagem:document.getElementById("alertaMensagem").value};try{await l(o?`/api/modulos/alertas/${o.id}`:"/api/modulos/alertas",{method:o?"PUT":"POST",body:JSON.stringify(i)}),await k(),n(o?"Alerta atualizado.":"Alerta criado.")}catch(s){n(s.message,"error")}})}catch(a){E("Central de alertas",a.message,"alertas",'<div class="panel"><p class="error-msg">N\xE3o foi poss\xEDvel carregar os alertas.</p></div>'),n(a.message,"error")}}async function Ge(e){try{await l(`/api/modulos/alertas/${e}/reconhecer`,{method:"PATCH"}),await k(),n("Alerta reconhecido.")}catch(a){n(a.message,"error")}}async function Qe(e){if(await A({title:"Resolver alerta?",message:"Confirme que a ocorr\xEAncia foi tratada para remov\xEA-la da lista de pend\xEAncias.",confirmLabel:"Marcar resolvido",danger:!1}))try{await l(`/api/modulos/alertas/${e}/resolver`,{method:"PATCH"}),await k(),n("Alerta resolvido.")}catch(a){n(a.message,"error")}}async function Ke(e){if(await A({title:"Excluir alerta?",message:"O alerta ser\xE1 removido permanentemente do hist\xF3rico.",confirmLabel:"Excluir alerta"}))try{await l(`/api/modulos/alertas/${e}`,{method:"DELETE"}),await k(),n("Alerta exclu\xEDdo.")}catch(a){n(a.message,"error")}}async function Ee(){$("/auditoria");try{let e=await l("/api/modulos/auditoria");E("Auditoria","Rastreabilidade das a\xE7\xF5es relevantes do sistema.","auditoria",`<div class="panel"><div class="table-scroll"><table><thead><tr><th>Data</th><th>A\xE7\xE3o</th><th>Entidade</th><th>ID</th></tr></thead><tbody>${e.map(a=>`<tr><td>${g(a.criadoEm)}</td><td>${a.acao}</td><td>${a.entidade}</td><td>${a.entidadeId||"\u2014"}</td></tr>`).join("")||'<tr><td colspan="4" class="text-center">Nenhuma atividade registrada.</td></tr>'}</tbody></table></div></div>`)}catch(e){E("Auditoria",e.message,"auditoria",'<div class="panel"><p class="error-msg">N\xE3o foi poss\xEDvel carregar a auditoria.</p></div>')}}Object.assign(window,{renderDashboard:j,renderEquipamentos:H,renderManutencoes:V,renderMonitoramento:te,renderMonitoramentoIoT:he,renderRelatorios:ye,renderUsuarios:L,renderConfiguracoes:se,renderSetores:C,renderPlanos:K,renderOrdens:J,renderFalhas:X,renderAlertas:k,renderAuditoria:Ee,renderNovoEquipamento:Se,renderEditarEquipamento:xe,renderNovoUsuario:Pe,renderEditarUsuario:Oe,deletarUsuario:Le,deletarEquipamento:ke,deletarPlano:je,deletarOrdem:Ve,deletarFalha:Je,deletarAlerta:Ke,editarSetor:Re,deletarSetor:Ue,editarCategoria:Fe,deletarCategoria:ze,renderEditarManutencao:Ce,deletarManutencao:De,handleLogout:_e,concluirOrdem:He,reconhecerAlerta:Ge,resolverAlerta:Qe,showToast:n,startTutorialFromSettings:Ie,toggleIotAccess:Me});})();
