---
date: 2026-05-29
type: workbook-module
project: codex-workflow
module: token-economy
status: draft
order: 10
---

# 10 - Token Economy

## In One Sentence

Token Economy means using session context carefully so Codex reads what matters, not everything that exists.

## What You Will Understand

By the end of this page, you should understand why focused commands, on-demand search and durable memory improve answer quality.

## Summary

Token Economy is a set of practices that reduces useless output and preserves context for important reasoning.

The goal is not cost reduction for its own sake. The goal is to avoid logs, diffs and large files pushing useful context out of the session.

## Core Practices

| Practice | Meaning |
|---|---|
| focused search | Use `rg` and scoped paths before broad reads. |
| bounded output | Prefer `sed -n`, `nl -ba`, `--stat` and JSON filters. |
| on-demand context | Query vault, docs or MCPs when needed instead of pasting everything. |
| compact skills | Load references only when relevant. |
| durable memory | Save reusable learning outside the chat. |

## Diagram

```plantuml
@startuml
!theme plain
skinparam backgroundColor #FEFEFE

actor User
participant Codex
participant "Focused Search" as Search
participant "Bounded Read" as Read
participant Vault
participant Memory

User -> Codex: Ask for work
Codex -> Search: Find relevant files
Search -> Read: Read only useful ranges
Codex -> Vault: Query context on demand
Codex -> Memory: Save durable learning when useful
Codex --> User: Answer with less noise
@enduml
```

## Why It Works

The session context is a limited resource. Useful evidence should stay visible; noisy output should stay out.

## Checkpoint

You should be able to explain why `rg`, bounded file reads and vault search are better defaults than dumping entire directories into the session.

## Next Module

Go to [[11-vault-and-memory]].
