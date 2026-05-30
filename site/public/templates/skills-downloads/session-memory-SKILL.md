---
name: session-memory
description: Use this skill when the user asks to save, recall or update durable session memory.
---

# Session Memory

## When To Use

Use this skill when the user asks to save memory, remember a decision, resume prior context, or create a handoff note.

## Local Setup

Replace this path with your own vault or notes directory:

```text
YOUR_VAULT_PATH/Session-Memory/
```

## Save Steps

1. Identify only durable information: decisions, changed files, pending actions, gotchas and validation state.
2. Avoid secrets, transient logs and casual conversation.
3. Append to today's `YYYY-MM-DD.md`.
4. Keep the note concise and useful for a future session.

## Recall Steps

1. Read today's note first.
2. Search recent relevant memory notes.
3. Verify against current files when the fact may have changed.

## Output

Return what was saved or what was recalled, plus any uncertainty.
