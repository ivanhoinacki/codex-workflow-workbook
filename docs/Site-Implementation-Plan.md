---
date: 2026-05-29
type: implementation-plan
project: codex-workflow
status: in-progress
---

# Site Implementation Plan

## Objetivo

Implementar a pagina interativa do `codex-workflow-workbook` usando os documentos Markdown como fonte de conteudo.

O modelo de produto e:

```text
Journey -> Chapter -> Page -> Checkpoint / Question
```

## Decisoes De Produto

- Uma jornada representa uma trilha grande.
- Uma jornada tem varios capitulos.
- Um capitulo tem varias paginas.
- Uma pagina e a menor unidade de conteudo navegavel.
- Checkpoints e perguntas vivem na pagina.
- Perguntas podem bloquear a proxima pagina, capitulo ou jornada.
- MVP usa `localStorage`.
- Leaderboard e sala multiusuario ficam fora do MVP.

## Stack Recomendada

Usar Vite + React.

Motivos:

- interatividade simples sem backend;
- boa experiencia com GitHub Pages;
- facil renderizar Markdown;
- facil manter estado local;
- bom controle de UI para jornadas, capitulos, paginas e perguntas.

## Estrutura Alvo No Repo

```text
codex-workflow-workbook/
  docs/
    *.md
  site/
    package.json
    vite.config.ts
    src/
      App.tsx
      main.tsx
      content/
        loadDocs.ts
        journeyMap.ts
      components/
        Layout.tsx
        JourneySidebar.tsx
        ChapterNav.tsx
        PageReader.tsx
        CheckpointPanel.tsx
        QuestionGate.tsx
        ProgressBar.tsx
      state/
        progressStore.ts
      styles/
        app.css
  scripts/
    validate-docs
    sanitize-docs
```

## Conteudo

Primeira organizacao:

| Journey | Chapter | Pages |
|---|---|---|
| Foundations | Purpose and System Shape | `01-purpose.md`, `02-ecosystem-layers.md`, `03-main-sequence.md`, `04-workflow-boundaries.md` |
| Local Configuration | Environment Setup | `00-terminal-and-codex-cli.md`, `00-environment-prerequisites.md` |
| Local Configuration | Runtime Configuration | `05-config-toml.md`, `05-rules-and-instructions.md`, `06-copilot-config.md` |
| Local Configuration | Execution Roles and Guardrails | `07-agents.md`, `08-hooks.md`, `09-mcp-and-connectors-setup.md`, `09-skills.md`, `09-local-configuration-hands-on.md` |
| Knowledge System | Cost and Memory | `10-token-economy.md`, `11-vault-and-memory.md` |
| Knowledge System | Reusable Knowledge | `12-local-knowledge-base.md`, `13-knowledge-reuse-loop.md`, `14-automation-sync.md` |
| Build and Publish | Validation and Site | `15-checkpoints.md`, `16-github-pages-workbook.md` |

## Contrato De Dados

Cada page deve ser representada internamente assim:

```ts
type WorkbookPage = {
  id: string;
  title: string;
  journeyId: string;
  chapterId: string;
  order: number;
  track: string[];
  sourcePath: string;
  markdown: string;
  checkpoints: Checkpoint[];
  questions: Question[];
};
```

Cada pergunta:

```ts
type Question = {
  id: string;
  type: 'single-choice' | 'true-false' | 'short-answer';
  prompt: string;
  options?: string[];
  answer: string | boolean;
  required: boolean;
  feedback?: string;
};
```

## Rotas

```text
/
/journeys/:journeyId
/journeys/:journeyId/:chapterId
/journeys/:journeyId/:chapterId/:pageId
/summary
```

## Estado Local

Persistir em `localStorage`:

```text
codex-workbook:progress
codex-workbook:current-journey
codex-workbook:current-chapter
codex-workbook:current-page
codex-workbook:answers
```

## Fases

### Fase 1 - Content Loader

- [x] Criar app Vite + React em `site/`.
- [x] Carregar arquivos Markdown de `docs/`.
- [x] Criar `journeyMap.ts` com a primeira estrutura manual.
- [x] Renderizar uma pagina Markdown.

Checkpoint:

- [x] `npm run dev` abre a primeira pagina.
- [x] Conteudo Markdown aparece sem quebrar layout.

### Fase 2 - Navegacao

- [x] Implementar sidebar de jornadas.
- [x] Implementar navegacao por capitulos e paginas.
- [x] Implementar previous/next.
- [x] Implementar progress bar global.

Checkpoint:

- [x] Usuario navega pelas paginas liberadas.
- [x] URL reflete jornada, capitulo e pagina via hash route compativel com GitHub Pages.

### Fase 3 - Checkpoints E Perguntas

- [x] Implementar `CheckpointPanel`.
- [x] Implementar `QuestionGate`.
- [x] Bloquear avancos obrigatorios quando resposta estiver errada.
- [x] Persistir respostas e progresso.

Checkpoint:

- [x] Resposta correta libera proxima pagina.
- [x] Resposta errada mostra feedback e mantem bloqueio.
- [x] Reload preserva progresso.

### Fase 4 - Templates, UX E Sanitizacao

- [x] Remover toggle `Public/Internal` e manter sempre a experiencia de usuario final.
- [x] Renderizar PlantUML como SVG.
- [x] Adicionar fullscreen para diagramas.
- [x] Adicionar copy button em code blocks.
- [x] Adicionar templates para config, agents, rules, hooks, MCPs e skills.
- [x] Garantir nomes explicitos para download de skills.
- Criar `scripts/sanitize-docs`.
- Criar `scripts/validate-docs`.

Checkpoint:

- Validacao detecta frontmatter faltante e links quebrados.

### Fase 5 - GitHub Pages

- [x] Configurar build.
- [x] Configurar base path do GitHub Pages.
- [x] Validar build local.
- Preparar publish.

Checkpoint:

- [x] `npm run build` passa.
- Site funciona em preview local.

## Implementacao Atual

Arquivos principais:

```text
site/package.json
site/vite.config.ts
site/src/App.tsx
site/src/content/loadDocs.ts
site/src/content/journeyMap.ts
site/src/components/*
site/src/state/progressStore.ts
site/src/styles/app.css
```

Decisoes implementadas:

- Hash routes foram usadas para evitar problema de reload direto no GitHub Pages.
- O estado local usa `codex-workbook:progress`.
- A experiencia mostra sempre a versao de usuario final, sem alternancia publico/interno.
- Terminal e requisitos minimos pertencem a `Local Configuration`, antes de copiar templates.
- O capitulo `Purpose and System Shape` valida entendimento, nao instalacao local.
- Cada diagrama deve representar o fluxo do step atual, nao um mapa generico de todo o ecossistema.
- A navegacao futura fica bloqueada ate a pagina anterior estar completa.
- Deep links para paginas bloqueadas voltam para a primeira pagina acessivel.
- Tabelas Markdown viram blocos empilhados no mobile para evitar overflow.
- Blocos `plantuml` sao renderizados como fluxo visual no site, em vez de aparecerem como codigo bruto.
- Diagramas possuem fullscreen modal na mesma tela.
- Blocos de codigo possuem botao `Copy`.
- Links `templates/` recebem atributo `download`; quando o arquivo e `SKILL.md`, o nome de download usa a pasta da skill, como `study-SKILL.md`.
- O painel lateral de tarefas acompanha o scroll no desktop.
- Wikilinks do Obsidian sao renderizados como etiquetas legiveis.

## Handoff Atual

O status completo da implementacao esta em:

```text
docs/Current-Handoff.md
```

Resumo:

- Site local funcional em `http://127.0.0.1:5174/codex-workflow-workbook/`.
- `npm run build` passa.
- Repo ainda sem commit inicial.
- GitHub Pages workflow/publicacao ainda pendente.

## Perguntas Iniciais Por Pagina

As perguntas podem comecar simples e evoluir depois.

Exemplos:

| Page | Pergunta |
|---|---|
| `00-environment-prerequisites.md` | O que a pessoa precisa ter antes de fazer as configuracoes reais? |
| `01-purpose.md` | Qual problema o ecossistema resolve alem de usar uma IA no chat? |
| `02-ecosystem-layers.md` | Qual camada e responsavel por hooks e MCPs? |
| `08-hooks.md` | Qual hook bloqueia comandos perigosos antes da execucao? |
| `11-vault-and-memory.md` | Quando uma informacao deve virar Session-Memory? |
| `13-knowledge-reuse-loop.md` | Por que code reviews e gotchas devem voltar para a base de conhecimento? |

## Definition Of Done

- App roda localmente.
- Todas as jornadas, capitulos e paginas sao navegaveis.
- Checkpoints e perguntas funcionam.
- Progresso persiste em `localStorage`.
- Conteudo Markdown e fonte da pagina.
- Build passa.
- Conteudo sensivel fica fora da experiencia de usuario final.
- Templates compartilhaveis usam placeholders por usuario.
- Handoff atual existe para retomada sem depender do historico da conversa.
