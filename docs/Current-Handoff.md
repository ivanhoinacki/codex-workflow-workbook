---
date: 2026-05-29
type: handoff
project: codex-workflow
status: in-progress
---

# Codex Workflow Workbook - Current Handoff

## Estado Atual

O workbook ja tem uma primeira versao funcional do site interativo e dos documentos publicaveis.

Estado de trabalho: revisao didatica aplicada, aguardando nova revisao manual de Ivan.

Repositorio local:

```text
<local-workspace>/codex-workflow-workbook
```

Workbook espelhado no vault:

```text
Luxury-Escapes/Projects/codex-workflow/workbook
```

URL local ativa:

```text
http://127.0.0.1:5174/codex-workflow-workbook/
```

O servidor em `5174` foi reaberto porque a aba do Chrome estava apontando para essa porta. Pode existir tambem um servidor antigo em `5173`, mas a validacao mais recente foi feita contra `5174`.

## O Que Foi Implementado

### Documentacao

- Criados documentos guiados para Foundations, Local Configuration, Knowledge System e Build/Publish.
- Revisao didatica aplicada para publico iniciante/intermediario.
- Paginas principais agora explicam `Em Uma Frase`, `O Que Voce Vai Entender`, exemplos, conceitos chave ou erros comuns quando aplicavel.
- Checkpoints e textos de apoio foram ajustados para validar entendimento antes de exigir configuracao pratica.
- Adicionadas paginas novas que nao existiam no plano inicial:
  - `00-terminal-and-codex-cli.md`;
  - `00-environment-prerequisites.md`;
  - `05-rules-and-instructions.md`;
  - `09-mcp-and-connectors-setup.md`;
  - `09-local-configuration-hands-on.md`.
- Criada explicacao de MCPs e connectors com separacao entre MCP local, wrapper com secrets, OAuth e plugin/connector.
- Criado starter pack compartilhavel para `rules`, `hooks` e `skills`, com placeholders por usuario.
- Atualizados checkpoints para separar entendimento conceitual de validacao local real.

### Site

- App Vite + React criado em `site/`.
- Markdown de `docs/` carregado como fonte do workbook.
- Hierarquia implementada:

```text
Journey -> Chapter -> Page -> Checkpoint / Question
```

- Hash routes compatíveis com GitHub Pages.
- Progresso, respostas e bloqueio de paginas persistidos em `localStorage`.
- Sidebar de jornadas e capitulos.
- Painel lateral sticky de checkpoint/pergunta no desktop.
- Layout responsivo com painel empilhado em viewports menores.
- Card de conclusao e navegacao usam textos em portugues.
- Blocos de codigo possuem botao `Copiar`.
- Diagramas `plantuml` renderizam SVG via PlantUML server.
- Diagramas possuem botao `Tela cheia` na mesma tela.
- Wikilinks do Obsidian sao renderizados como etiquetas legiveis.
- Toggle `Public/Internal` foi removido; a experiencia mostra sempre a versao de usuario final.
- Adicionado bloco fixo por pagina `Como estudar`, com roteiro de leitura, diagrama, exemplos/comandos e checkpoint.

### Templates

Templates disponiveis em `site/public/templates/`:

- `config.toml`;
- `copilot.config.toml`;
- agents: `copilot`, `researcher`, `reviewer`, `implementer`;
- rules: `AGENTS.md`, `PROJECT_AGENTS.md`, `RTK.md`;
- hooks: contexto, prompt, guardrail, tracker, permission log, compaction e MCP output analytics;
- MCPs: config, `.mcp-secrets.example`, wrappers e verify script;
- skills: `example-workflow`, `study`, `feature-dev`, `investigation`, `codereview`, `session-memory`;
- shell helper e verify script.

Correções recentes:

- Links de download para arquivos `SKILL.md` agora usam nomes explicitos como `study-SKILL.md` e `feature-dev-SKILL.md`.
- Para evitar UUID no historico de downloads do Chrome, os links de skills agora apontam para arquivos fisicos em `site/public/templates/skills-downloads/`, como `study-SKILL.md`, em vez de apontar para caminhos terminados em `SKILL.md`.
- A jornada ganhou a pagina `00-template-variables.md`, usada para preencher uma vez os paths e comandos locais.
- O formulario de variaveis aparece apenas na pagina `Variáveis dos Templates`, nao em todas as paginas de Configuracao Local.
- Downloads de templates agora passam por `fetch` + substituicao local antes de salvar, para aplicar os valores preenchidos no navegador.
- A substituicao cobre `Codex home`, workspace, vault, Datadog CLI, local-le-vault, Atlassian MCP, PostgreSQL URL, nome, time, projeto, stack e comandos de validacao.
- O renderer de wikilinks foi corrigido para nao transformar sintaxe TOML como `[[hooks.PreToolUse]]` dentro de code blocks ou inline code.
- Scripts reais de validacao foram criados em `scripts/validate-docs.py` e `scripts/sanitize-docs.py`.
- Arquivos alterados: `docs/00-template-variables.md`, `docs/00-environment-prerequisites.md`, `docs/05-config-toml.md`, `docs/09-skills.md`, `site/public/templates/skills-downloads/*`, `site/src/App.tsx`, `site/src/state/templateConfigStore.ts`, `site/src/components/TemplateConfigPanel.tsx`, `site/src/content/journeyMap.ts`, `site/src/content/loadDocs.ts`, `site/src/components/PageReader.tsx` e `site/src/styles/app.css`.

Revisao didatica recente:

- Arquivos de conteudo revisados: `00-*`, `01-*`, `02-*`, `03-*`, `04-*`, `05-*`, `06-*`, `07-*`, `08-*`, `09-*`, `10-*`, `11-*`, `12-*`, `13-*`, `14-*`, `15-*`, `16-*`.
- Arquivos de UI revisados: `PageReader.tsx`, `ProgressBar.tsx`, `Layout.tsx`, `JourneySidebar.tsx`, `CheckpointPanel.tsx`, `QuestionGate.tsx`, `ChapterNav.tsx`, `App.tsx`, `journeyMap.ts`, `loadDocs.ts`, `app.css`.

## Validacao Feita

Comandos executados:

```bash
cd <local-workspace>/codex-workflow-workbook/site
source ~/.nvm/nvm.sh
nvm use
npm run build
```

Resultado:

- build passou.
- Vite transformou 71 modules na validacao mais recente.
- Bundle gerado com sucesso.
- Build mais recente gerou `dist/assets/index-B_MHoj26.js` e `dist/assets/index-BmAHycHH.css`.

Validacao visual/browser:

- paginas de Rules, Hooks, Skills e MCPs abriram no browser;
- pagina de Skills revisada no Playwright em desktop;
- pagina Purpose revisada em viewport mobile;
- links de templates aparecem como download;
- skills baixam com nome correto por URL fisica e atributo `download`;
- a pagina `Variáveis dos Templates` aparece na sidebar;
- o formulario de variaveis aparece apenas nessa pagina;
- `config.toml` nao repete o formulario;
- download dinamico de `config.toml` foi validado com valores locais de teste e sem placeholders principais restantes;
- code blocks possuem botoes `Copiar`;
- PlantUML renderiza imagem e tem `Tela cheia`;
- nao houve overflow horizontal nas paginas testadas;
- existe um erro de console recorrente observado pelo Playwright, provavelmente relacionado a recurso externo de imagem/PlantUML; nao bloqueou renderizacao nas paginas testadas.

## Status De Git

O repo ainda esta sem commit inicial.

Estado esperado:

```text
?? .gitignore
?? README.md
?? docs/
?? scripts/
?? site/
```

Nao houve commit, push ou PR.

## Decisoes Tomadas

- O site usa Vite + React.
- O conteudo guiado vem de Markdown em `docs/`.
- O progresso fica em `localStorage` no MVP.
- GitHub Pages usa hash routes.
- O workbook deve ser usuario final, sem toggle publico/interno.
- A experiencia deve usar portugues na interface principal, mantendo nomes tecnicos quando forem naturais.
- Cada pagina deve ensinar antes de testar, com checkpoint conceitual quando a pessoa ainda nao configurou a maquina.
- Terminal e requisitos pertencem a `Local Configuration`, nao a `Foundations`.
- MCPs/connectors entram antes de Skills e antes do hands-on.
- Templates publicos usam placeholders e nao copiam paths/tokens reais.
- O vault `workbook/` continua como espelho/staging por enquanto.

## Pendencias

1. Ivan revisar o fluxo completo no browser e retornar consideracoes.
2. Revisar sanitizacao final antes de publicar.
3. Investigar o erro de console do Playwright se ele aparecer no Chrome manual.
4. Expandir scripts `validate-docs` e `sanitize-docs` quando novas regras de publicacao aparecerem.
5. Criar workflow de GitHub Pages.
6. Fazer commit inicial quando Ivan pedir.
7. Fazer push e configurar Pages.
8. Testar o fluxo completo como usuario novo, do primeiro step ao ultimo.
9. Decidir se o repo vira fonte canonica ou se o vault continua sendo fonte primaria.

## Como Retomar

1. Abrir o repo:

```bash
cd <local-workspace>/codex-workflow-workbook
```

2. Verificar estado:

```bash
rtk git status --short
rtk rg --files docs site/public/templates site/src | rtk sort
```

3. Rodar o site:

```bash
cd site
source ~/.nvm/nvm.sh
nvm use
npm run dev -- --host 127.0.0.1 --port 5174
```

4. Validar build:

```bash
npm run build
```

5. Abrir:

```text
http://127.0.0.1:5174/codex-workflow-workbook/
```
