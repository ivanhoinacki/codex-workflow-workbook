---
title: Site Implementation Plan
type: maintainer-note
audience: maintainer
---

# Site Implementation Plan

## Objective

Build an interactive playbook from the Markdown documentation. The site should be understandable by developers who are new to Codex and by developers who already understand local tooling but need the Luxury Escapes workflow model.

## UX Requirements

- Start at the first page and unlock the next page only after the checkpoint and question are complete.
- Keep the sidebar synchronized with progress.
- Keep diagrams centered, responsive and available in fullscreen.
- Use a stable layout on desktop and responsive layout on narrower screens.
- Avoid maintainer-only publishing instructions in the learner journey.
- Keep all learner-facing copy in EN-US.

## Content Requirements

- Explain what each configuration item is.
- Explain why it works.
- Explain how it relates to the rest of the ecosystem.
- Provide copyable commands and downloadable templates where relevant.
- Keep user-specific local paths out of public templates.

## Implementation Notes

- `site/src/content/journeyMap.ts` is the source of journey structure, checkpoints and questions.
- `site/src/content/loadDocs.ts` loads and renders Markdown.
- `site/src/state/progressStore.ts` stores learner progress in `localStorage`.
- `site/src/state/templateConfigStore.ts` stores template variables in `localStorage`.
- `site/public/templates/` contains downloadable template files.

## Deployment

GitHub Pages is deployed by `.github/workflows/pages.yml`. The intended publishing branch is `playbook-en-us`.
