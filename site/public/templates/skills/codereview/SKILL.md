---
name: codereview
description: Use this skill when the user asks for a code review, PR review, quality check or readiness review.
---

# Code Review

## When To Use

Use this skill for review requests, PR readiness checks and quality reviews.

## Review Order

1. Inspect the diff and changed files.
2. Read nearby code to understand local patterns.
3. Check correctness, security, performance, data contracts, error handling, test coverage and rollback risk.
4. Prioritize real defects over style.
5. Return findings first.

## Output

Use this format:

```text
Findings
- [Severity] file:line - issue, impact and suggested fix.

Open Questions
- ...

Validation
- Checks reviewed or missing.
```

## Rules

- If there are no findings, say that clearly.
- Do not invent line references.
- Do not post comments externally unless the user explicitly approves.
