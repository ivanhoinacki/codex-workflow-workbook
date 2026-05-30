# Luxury Escapes Codex Workflow Playbook

Interactive playbook and documentation source for the Luxury Escapes Codex workflow ecosystem.

## Purpose

This repository will host the publishable version of the Codex workflow documentation and the interactive playbook experience.

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

This repository is private while the content is still being refined and sanitized for GitHub Pages.

## Next Steps

1. Review and sanitize `docs/` and templates.
2. Configure GitHub Pages in the repository settings to use GitHub Actions.
3. Merge `playbook-pt-br` into `main` when the content review is complete.
4. Validate the full guided flow from step 1 to the final checkpoint with a fresh browser profile.
