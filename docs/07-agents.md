---
date: 2026-05-29
type: workbook-module
project: codex-workflow
module: agents
status: draft
order: 7
---

# 07 - Agents

## In One Sentence

Agents are role definitions used for bounded delegation, not a replacement for the parent agent's judgment.

## What You Will Understand

By the end of this page, you should know when to delegate to an agent and when a simple local read is enough.

## Summary

Agents help when work can be split into clear, bounded responsibilities.

Use agents for:

- read-only research slices;
- independent review lanes;
- scoped implementation after a plan exists;
- parallel evidence collection.

Do not use agents for every small question. The parent agent remains responsible for final synthesis, decisions and user communication.

## Flow

```plantuml
@startuml
!theme plain
skinparam backgroundColor #FEFEFE

actor User
participant "Parent Codex" as Parent
participant Researcher
participant Reviewer
participant Implementer
participant Validation

User -> Parent: Ask for work
Parent -> Parent: Decide if delegation is useful
Parent -> Researcher: Collect bounded evidence
Parent -> Reviewer: Inspect risk and regressions
Parent -> Implementer: Make scoped local change
Researcher --> Parent: Findings
Reviewer --> Parent: Findings
Implementer --> Parent: Patch summary
Parent -> Validation: Verify final result
Validation --> User: Evidence and limits
@enduml
```

## Local Configuration Steps

1. Create `~/.codex/agents`.
2. Download the templates.
3. Keep roles narrow and explicit.
4. Use cheaper read-only tiers for research and review.
5. Use implementer only for scoped local changes.

- [Download copilot.toml](templates/agents/copilot.toml)
- [Download researcher.toml](templates/agents/researcher.toml)
- [Download reviewer.toml](templates/agents/reviewer.toml)
- [Download implementer.toml](templates/agents/implementer.toml)

```bash
mkdir -p ~/.codex/agents
```

## Why It Works

Delegation works when the task has clear ownership and a small surface area. It fails when agents are asked to make broad decisions without enough context.

## Role In The Ecosystem

Agents are useful when the work can be split into bounded tasks with clear ownership. They are not a replacement for the main plan.

## How They Work

A parent session owns the goal. An agent receives a specific job, gathers or changes only the scoped area, and reports back. The parent session decides what to trust and how to synthesize it.

## When to Use and When to Avoid

Use agents for:

- parallel evidence collection;
- focused review slices;
- bounded implementation with clear files;
- independent checks that do not need shared mutable state.

Avoid agents for:

- simple questions;
- tiny local reads;
- unclear requirements;
- work where two agents might edit the same files.

## Practical Rules

- Give each agent a concrete scope.
- Prefer read-only agents for investigation.
- Keep final synthesis in the parent session.
- Do not use agents to bypass approval boundaries.

## Common Mistakes

- Delegating before understanding the problem.
- Asking multiple agents to touch the same files.
- Trusting agent output without parent verification.
- Using expensive agents for cheap context reads.

## Checkpoint

```bash
rtk proxy find ~/.codex/agents -maxdepth 1 -type f -name '*.toml' -print
rtk sed -n '1,80p' ~/.codex/agents/researcher.toml
```

You should be able to explain when to use `researcher`, `reviewer` and `implementer`.

## Next Module

Go to [[08-hooks]].
