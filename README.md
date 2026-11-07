
## Módulos adicionados nesta atualização

A versão atual possui persistência e API protegida para:

- Setores e categorias com contagem de equipamentos.
- Planos de manutenção com periodicidade, próxima data e antecedência.
- Ordens de serviço com prioridade, prazo, status e conclusão.
- Falhas e ocorrências com distinção entre causa conhecida e investigação.
- Central de alertas com reconhecimento e deduplicação por chave.
- Auditoria de ações relevantes.
- Resumo operacional para dashboard com status calculado a partir do banco.

As telas novas estão disponíveis em `/setores`, `/planos`, `/ordens`, `/falhas`, `/alertas` e `/auditoria` depois do login.

## Paleta visual

A interface utiliza a paleta solicitada:

- `#11141A` — canvas principal.
- `#1C1F26` — superfícies e sidebar.
- `#2E3340` — campos e controles.
- `#FFFFFF` — texto principal.
- `#6C768A` — texto secundário e bordas.
- `#00E676` — sucesso e ação principal.
- `#FFD600` — atenção.
- `#FF1744` — crítico/perigo.

## O que permanece planejado

IoT com Arduino/ESP32, envio real de e-mails, pagamentos Mercado Pago e kits físicos ainda não estão conectados a provedores externos. A API e o modelo podem evoluir para esses módulos, mas eles não são apresentados como implementados até existir integração, autenticação, validação e testes reais.
