---
title: Implementation Plan
type: maintainer-note
audience: maintainer
---

# Implementation Plan

## Goal

Create a public English playbook that teaches a developer how the Luxury Escapes Codex workflow is structured, how to configure the local environment, and how reusable knowledge flows back into future work.

## Learning Model

The site uses a progressive learning model:

1. Foundations: explain purpose, layers, main sequence and workflow boundaries.
2. Local Configuration: prepare terminal and Codex CLI, fill template variables, install configuration files, rules, agents, hooks, MCPs and skills.
3. Knowledge System: explain token economy, vault memory, PostgreSQL knowledge base and the reuse loop.
4. Guided First Task: validate the environment with a small local task.

Each page must include:

- a clear purpose;
- an explanation for beginners and intermediate developers;
- a diagram when the flow benefits from one;
- examples or commands where useful;
- one checkpoint;
- one understanding question.

## Content Map

| File | Topic |
| --- | --- |
| `00-terminal-and-codex-cli.md` | Terminal and Codex CLI setup |
| `00-environment-prerequisites.md` | Minimum prerequisites |
| `00-template-variables.md` | User-specific template values |
| `01-purpose.md` | Why the workflow exists |
| `02-ecosystem-layers.md` | Runtime, rules, tools and knowledge layers |
| `03-main-sequence.md` | Normal request to result path |
| `04-workflow-boundaries.md` | Local, external and destructive action boundaries |
| `05-config-toml.md` | Main Codex runtime configuration |
| `05-rules-and-instructions.md` | Global and project instructions |
| `06-copilot-config.md` | Copilot configuration |
| `07-agents.md` | Agent roles and delegation |
| `08-hooks.md` | Runtime guardrails and automation hooks |
| `09-mcp-and-connectors-setup.md` | MCPs and authenticated connectors |
| `09-skills.md` | Reusable workflow skills |
| `09-local-configuration-hands-on.md` | Hands-on local validation |
| `10-token-economy.md` | Context and token economy |
| `11-vault-and-memory.md` | Obsidian vault and Session-Memory |
| `12-local-knowledge-base.md` | PostgreSQL-backed knowledge base |
| `13-knowledge-reuse-loop.md` | Gotchas and reusable learning loop |
| `14-automation-sync.md` | Confluence, review and knowledge synchronization |
| `15-checkpoints.md` | Guided first task |
| `16-github-pages-workbook.md` | Maintainer publishing note |

## Technical Plan

- Keep content in Markdown under `docs/`.
- Keep the site under `site/`.
- Use hash routes so GitHub Pages can serve deep links safely.
- Use Vite `base: '/codex-workflow-workbook/'`.
- Render PlantUML diagrams through encoded SVG URLs.
- Store progress and template variables in browser `localStorage`.
- Generate template downloads on the client, replacing placeholders only at download time.
- Publish with GitHub Actions from `playbook-en-us`.

## Quality Gates

- `python3 scripts/validate-docs.py`
- `python3 scripts/sanitize-docs.py`
- `npm run build` from `site/`
- Manual review of the full journey in a browser after deployment.
