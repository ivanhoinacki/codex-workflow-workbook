---
date: 2026-05-29
type: workbook-module
project: codex-workflow
module: ecosystem-layers
status: draft
order: 2
---

# 02 - Ecosystem Layers

## In One Sentence

The ecosystem is a set of layers that separate instructions, tools, memory, workflows and validation.

## What You Will Understand

By the end of this page, you should know which layer owns instructions, tools, memory and reusable knowledge.

## Summary

A reliable Codex setup is not one large prompt. It is a layered system.

Each layer has a job:

| Layer | Main role |
|---|---|
| `config.toml` | Runtime settings, MCPs, hooks, plugins and trusted projects. |
| Rules | Human instructions and operating boundaries. |
| Hooks | Local guardrails and automatic context injection. |
| Skills | Repeatable workflows. |
| Agents | Bounded delegation for specific roles. |
| MCPs | Access to external or indexed evidence. |
| Vault | Durable Markdown knowledge. |
| PostgreSQL KB | Indexed search base for reusable knowledge. |
| Playbook site | Guided reading and progress tracking. |

## Diagram

```plantuml
@startuml
!theme plain
skinparam backgroundColor #FEFEFE

actor User
participant Codex
participant "config.toml" as Config
participant Rules
participant Hooks
participant Skills
participant Agents
participant MCPs
participant Vault
database "PostgreSQL KB" as DB

User -> Codex: Request
Codex -> Config: Load runtime behavior
Codex -> Rules: Load instruction contract
Hooks -> Codex: Inject context and guardrails
Codex -> Skills: Select workflow when matched
Codex -> Agents: Delegate bounded work when useful
Codex -> MCPs: Fetch indexed evidence
MCPs -> Vault: Read operational context
MCPs -> DB: Query reusable knowledge
Codex --> User: Result with validation and limits
@enduml
```

## Why It Works

Layers reduce coupling. When behavior changes, usually only one layer needs to change.

Examples:

- language and policy live in rules;
- hooks block or track tool use;
- skills define procedures;
- agents define roles;
- MCPs retrieve evidence;
- vault and PostgreSQL preserve knowledge.

## Checkpoint

You should be able to identify which layer owns:

- global behavior;
- project behavior;
- command guardrails;
- reusable workflows;
- delegated roles;
- indexed knowledge.

## Next Module

Go to [[03-main-sequence]].
