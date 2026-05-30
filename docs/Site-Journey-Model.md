---
date: 2026-05-29
type: ux-model
project: codex-workflow
status: draft
---

# Site Journey Model

## Decisao

O site deve organizar o conteudo em uma hierarquia:

```text
Journey -> Chapter -> Page -> Checkpoint / Question
```

Uma jornada representa uma trilha grande de aprendizado. Cada jornada tem varios capitulos. Cada capitulo pode ter varias paginas. Cada pagina pode ter checkpoints praticos e perguntas de revisao de entendimento.

Quando uma pergunta for obrigatoria, o usuario so avanca depois de responder corretamente.

## Por Que

O conteudo do workbook e denso. Uma lista unica de tasks ficaria longa demais e faria o usuario perder contexto.

Essa hierarquia permite:

- foco em uma jornada por vez;
- narrativa clara por capitulo;
- paginas pequenas o suficiente para nao sobrecarregar;
- revisao de entendimento no final de paginas ou capitulos;
- progresso mais granular;
- reutilizacao dos documentos como fonte da pagina.

## Modelo De Conteudo

```text
Journey
  Chapter
    Page
      Explanation
      Files involved
      Why it works
      Practical checkpoint
      Understanding question
    Page
      ...
    Chapter review
  Chapter
    ...
```

## Exemplo De Jornada

```yaml
journey: hooks
title: Hooks and Guardrails
order: 8
track:
  - Config
  - Automation
chapters:
  - id: session-start
    title: SessionStart context
    pages:
      - id: what-session-start-does
        title: What SessionStart does
        source: docs/08-hooks.md#sessionstart
        checkpoint: Check that the hook is registered in config.toml
        question:
          type: single-choice
          prompt: What does SessionStart add before the conversation begins?
          answer: context
      - id: session-memory-warning
        title: Session-Memory warnings
        source: docs/11-vault-and-memory.md
        checkpoint: Confirm the warning appears when unprocessed entries exist
  - id: pre-tool-use
    title: PreToolUse guardrails
    pages:
      - id: destructive-command-blocks
        title: Destructive command blocks
        checkpoint: Inspect the guard script for blocked commands
        question:
          type: single-choice
          prompt: Which layer blocks destructive commands before execution?
          answer: hooks
```

## Mapeamento Inicial Das Jornadas

| Jornada | Capitulo | Paginas iniciais |
|---|---|---|
| Foundations | Purpose and System Shape | `01-purpose.md`, `02-ecosystem-layers.md`, `03-main-sequence.md`, `04-workflow-boundaries.md` |
| Local Configuration | Environment Setup | `00-terminal-and-codex-cli.md`, `00-environment-prerequisites.md` |
| Local Configuration | Runtime Configuration | `05-config-toml.md`, `05-rules-and-instructions.md`, `06-copilot-config.md` |
| Local Configuration | Execution Roles and Guardrails | `07-agents.md`, `08-hooks.md`, `09-mcp-and-connectors-setup.md`, `09-skills.md`, `09-local-configuration-hands-on.md` |
| Knowledge System | Cost and Memory | `10-token-economy.md`, `11-vault-and-memory.md` |
| Knowledge System | Reusable Knowledge | `12-local-knowledge-base.md`, `13-knowledge-reuse-loop.md`, `14-automation-sync.md` |
| Build and Publish | Validation and Site | `15-checkpoints.md`, `16-github-pages-workbook.md` |

## Estados

| Estado | Significado |
|---|---|
| `not_started` | Usuario ainda nao abriu a jornada. |
| `journey_in_progress` | Jornada aberta, algum capitulo pendente. |
| `chapter_in_progress` | Capitulo aberto, alguma pagina pendente. |
| `page_complete` | Pagina passou checkpoint e pergunta obrigatoria. |
| `chapter_complete` | Todas as paginas obrigatorias do capitulo foram concluidas. |
| `journey_complete` | Todos os capitulos obrigatorios da jornada foram concluidos. |
| `locked` | Etapa futura bloqueada por pergunta pendente. |

## Perguntas

As perguntas devem validar entendimento pratico.

Tipos iniciais:

- single choice;
- true/false;
- short answer com normalizacao simples;
- checklist confirmation para checkpoints manuais.

Evitar perguntas de memorizacao literal. Preferir perguntas que confirmem:

- qual camada resolve o problema;
- por que a camada existe;
- quando usar ou nao usar;
- qual checkpoint comprova funcionamento.

## Persistencia

MVP usa `localStorage`.

Chaves sugeridas:

```text
codex-workbook:progress
codex-workbook:current-journey
codex-workbook:current-chapter
codex-workbook:current-page
codex-workbook:answers
```

## Rotas

Rotas sugeridas:

```text
/
/journeys/:journeyId
/journeys/:journeyId/:chapterId
/journeys/:journeyId/:chapterId/:pageId
/summary
```

## MVP

No MVP:

- uma rota por jornada;
- capitulos dentro da jornada;
- paginas pequenas dentro de cada capitulo;
- progresso global;
- checkpoint por pagina;
- pergunta obrigatoria para liberar proxima pagina ou proximo capitulo;
- progresso salvo localmente;
- markdown como fonte de conteudo;
- templates baixaveis para configuracao local;
- PlantUML renderizado como diagrama visual;
- sem leaderboard.

## Futuro

Fases futuras:

- modo sala/workshop;
- nickname;
- leaderboard;
- exportar progresso;
- compartilhar certificado/checklist final.
