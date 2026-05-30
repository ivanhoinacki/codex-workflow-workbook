---
title: Current Handoff
type: maintainer-note
audience: maintainer
---

# Current Handoff

## Status

The repository contains an English Luxury Escapes Codex Workflow Playbook.

The interactive site is implemented with Vite and React under `site/`. It reads Markdown modules from `docs/`, organizes them as Journey -> Chapter -> Page, and persists learner progress in browser `localStorage`.

## Implemented

- Luxury Escapes branded header.
- Light and dark themes.
- Guided journey navigation with locked pages.
- Per-page checkpoint and understanding question.
- Markdown rendering from `docs/`.
- PlantUML diagrams rendered as SVG with fullscreen support.
- Code blocks with copy buttons.
- Template downloads for config, rules, agents, hooks, MCPs and skills.
- Template variables form that personalizes downloads in the browser.
- Sanitization and documentation validation scripts.
- GitHub Pages workflow prepared for `playbook-en-us`.

## Validation Commands

```bash
python3 scripts/validate-docs.py
python3 scripts/sanitize-docs.py
cd site
source ~/.nvm/nvm.sh
nvm use
npm run build
```

## Publishing Target

- Repository: `OWNER/codex-workflow-workbook`
- Default branch: `playbook-en-us`
- Pages source: GitHub Actions workflow `.github/workflows/pages.yml`
- Public URL: `https://OWNER.github.io/codex-workflow-workbook/`

## Notes

Do not publish private local paths, tokens, connection strings, or internal-only notes. Template files must keep placeholders for user-specific values and only receive real values in the browser during download.
