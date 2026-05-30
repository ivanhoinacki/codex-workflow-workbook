---
title: UX Reference Notes
type: maintainer-note
audience: maintainer
---

# UX Reference Notes

## Reference Pattern

The playbook follows the guided-room idea: a learner enters a structured path, reads one step at a time, validates understanding, and unlocks the next step.

## Adaptation For This Project

The Codex workflow playbook is not a generic course page. It is an engineering onboarding playbook for the Luxury Escapes Codex workflow.

The useful patterns are:

- progressive unlock;
- visible progress;
- one page per learning step;
- diagrams tied to the current step;
- checkpoints and short questions;
- a persistent side panel for validation.

## Decisions

- Use one page per step instead of one long article.
- Use chapters to group related steps.
- Use PlantUML diagrams for architecture and sequence flows.
- Keep template downloads near the configuration pages.
- Keep maintainer-only GitHub Pages instructions outside the learner journey.

## Example Understanding Questions

- Why should local context be checked before implementation?
- Which layer owns hooks and MCPs?
- What type of action requires explicit approval?
- Why do code review gotchas return to the knowledge base?
