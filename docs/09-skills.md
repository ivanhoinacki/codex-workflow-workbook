---
date: 2026-05-29
type: workbook-module
project: codex-workflow
module: skills
status: draft
order: 9
---

# 09 - Skills

## In One Sentence

Skills turn a recurring way of working into a reusable procedure.

## What You Will Understand

By the end of this page, you should be able to create a simple skill, install a shared skill and explain how it enters the workflow.

## Summary

Skills are reusable workflows stored at `~/.codex/skills/<name>/SKILL.md`.

A skill should explain:

- when to use it;
- what steps to follow;
- what evidence to gather;
- when to stop;
- what output is expected;
- what references help.

## Flow

```plantuml
@startuml
!theme plain
skinparam backgroundColor #FEFEFE

actor User
participant Codex
participant "Skill Registry" as Registry
participant "SKILL.md" as Skill
participant Scripts
participant Validation

User -> Codex: Ask for recurring workflow
Codex -> Registry: Match skill by name or description
Registry -> Skill: Load instructions
Skill -> Scripts: Use helper scripts when useful
Skill -> Validation: Run expected checks
Validation --> Codex: Result and limits
Codex --> User: Structured outcome
@enduml
```

## How To Think About A Skill

Ask:

1. When should this workflow be used?
2. What steps are repeated?
3. Which files, scripts or references help?
4. How do we know it finished correctly?
5. What should the final output contain?

If you cannot answer these questions, it may be too early to create a skill.

## Local Configuration Steps

1. Create `~/.codex/skills/<skill-name>`.
2. Add a `SKILL.md`.
3. Define `name` and `description` in frontmatter.
4. Write when to use it, steps, rules and expected output.
5. Put scripts in `scripts/` only when repetition is mechanical.
6. Test the skill with a small request before relying on it daily.

Templates:

- [Download example-skill-SKILL.md](templates/skills-downloads/example-skill-SKILL.md)
- [Download study-SKILL.md](templates/skills-downloads/study-SKILL.md)
- [Download feature-dev-SKILL.md](templates/skills-downloads/feature-dev-SKILL.md)
- [Download investigation-SKILL.md](templates/skills-downloads/investigation-SKILL.md)
- [Download codereview-SKILL.md](templates/skills-downloads/codereview-SKILL.md)
- [Download session-memory-SKILL.md](templates/skills-downloads/session-memory-SKILL.md)

```bash
mkdir -p ~/.codex/skills/example-workflow
$EDITOR ~/.codex/skills/example-workflow/SKILL.md
```

## Shared Starter Pack

| Skill | Purpose | Needs adaptation |
|---|---|---|
| `study` | Research before uncertain implementation. | Sources and planning format. |
| `feature-dev` | Implementation from a clear plan. | Project validation commands. |
| `investigation` | Evidence-based investigation. | Approved sources, logs and MCPs. |
| `codereview` | Risk and regression review. | Team checklist and severities. |
| `session-memory` | Durable memory and handoff. | Vault or notes path. |

## Why It Works

Skills transform operational practice into procedure. They reduce improvisation and make recurring work easier to inspect.

## Checkpoint

```bash
rtk proxy find ~/.codex/skills -maxdepth 2 -name SKILL.md -print
rtk sed -n '1,80p' ~/.codex/skills/session-memory/SKILL.md
rtk rg -n '^name:|^description:' ~/.codex/skills -g 'SKILL.md'
rtk rg -n 'YOUR_|REPLACE_ME|TODO' ~/.codex/skills -g 'SKILL.md'
```

You should be able to explain why a skill exists and what signal proves it was used.

## Next Module

Go to [[09-local-configuration-hands-on]].
