---
name: example-workflow
description: Use this skill when a recurring local workflow needs the same steps, checks and output every time.
---

# Example Workflow

## When To Use

Use this skill when the user asks for a repeated workflow that benefits from a stable checklist.

## Steps

1. Read the requested goal and target files.
2. Gather only the context needed for this workflow.
3. Execute the smallest safe local change.
4. Run focused validation.
5. Return changed files, validation result and remaining risk.

## Rules

- Prefer local source of truth.
- Do not mutate external systems without explicit approval.
- Keep output short and evidence-based.
- Save durable learnings only when they will help a future session.

## Output

Return:

- what changed;
- why it changed;
- checks run;
- what remains unverified.
