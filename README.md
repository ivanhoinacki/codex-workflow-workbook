# Luxury Escapes Codex Workflow Playbook

Interactive playbook and documentation source for the Luxury Escapes Codex workflow ecosystem.

## Purpose

This repository hosts the public English version of the Codex workflow documentation and the interactive playbook experience.

The workbook explains:

- why the ecosystem exists;
- how the layers connect;
- how local Codex configuration works;
- how hooks, skills, agents, MCPs, Obsidian, Session-Memory, PostgreSQL and `local-le-vault` fit together;
- how operational work becomes reusable knowledge;
- which checkpoints prove the setup is working.

## Structure

```text
docs/     Markdown workbook modules used as source content.
site/     Vite + React interactive workbook.
scripts/  Validation and sanitization scripts.
```

## Current Status

The first interactive workbook is implemented under `site/` and uses `docs/` as content source:

- Markdown docs are loaded from `docs/`;
- content is organized as `Journey -> Chapter -> Page`;
- each page has a checkpoint and required understanding question;
- progress and answers are persisted in `localStorage`;
- GitHub Pages base path is configured in Vite;
- PlantUML diagrams render as SVG with fullscreen support;
- code blocks include copy buttons;
- template links download starter files for config, agents, rules, hooks, MCPs and skills;
- downloads for skill templates use explicit filenames such as `study-SKILL.md`.

Current handoff:

```text
docs/Current-Handoff.md
```

Run locally:

```bash
cd site
source ~/.nvm/nvm.sh
nvm use
npm install
npm run dev -- --host 127.0.0.1 --port 5174
```

Local URL:

```text
http://127.0.0.1:5174/codex-workflow-workbook/
```

Build:

```bash
cd site
source ~/.nvm/nvm.sh
nvm use
npm run build
```

Validate before publishing:

```bash
python3 scripts/validate-docs.py
python3 scripts/sanitize-docs.py
```

GitHub Pages is published through `.github/workflows/pages.yml` from the `playbook-en-us` branch.

## Next Steps

1. Review the deployed flow from the first page to the final checkpoint.
2. Keep templates sanitized and placeholder-based.
3. Expand the playbook as new workflow conventions become stable.
