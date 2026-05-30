---
name: study
description: Use this skill before implementation when a request needs research, prior context, risks and an implementation plan.
---

# Study

## When To Use

Use this skill when the user asks to study, research, analyze before coding, or build an implementation plan.

## Steps

1. Restate the goal and scope in one short paragraph.
2. Search durable local context first: project docs, vault, runbooks, prior plans and known gotchas.
3. Inspect the target repository or files with bounded reads.
4. Identify dependencies, risks, unknowns and validation needs.
5. Produce or update an implementation plan.

## Output

Return:

- goal;
- relevant context found;
- proposed implementation steps;
- risks and assumptions;
- validation plan.

## Rules

- Do not implement during study unless the user explicitly asks to continue.
- Do not use broad recursive reads when targeted search is enough.
- Keep secrets and private paths out of public notes.
