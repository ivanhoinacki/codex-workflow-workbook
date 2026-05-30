---
name: feature-dev
description: Use this skill to implement a feature from a clear plan or scoped request, then validate the local result.
---

# Feature Development

## When To Use

Use this skill when the user asks to build, implement or continue a planned feature.

## Steps

1. Read the plan or clarify the scoped request.
2. Check local project rules and relevant docs.
3. Inspect nearby implementation and test patterns.
4. Make the smallest coherent change.
5. Run focused validation.
6. Summarize changed files, checks and remaining risk.

## Rules

- Do not silently change strategy when the plan fails.
- Do not commit, push or open a PR without explicit approval.
- Prefer existing project patterns over new abstractions.
- Avoid editing unrelated files.

## Output

Return:

- changed files;
- validation run;
- remaining gaps;
- next recommended step.
