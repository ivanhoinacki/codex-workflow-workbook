---
name: investigation
description: Use this skill when behavior is unclear and the work needs evidence before deciding or changing code.
---

# Investigation

## When To Use

Use this skill for bugs, unclear behavior, production symptoms, ownership questions or decisions that need evidence.

## Steps

1. Define the question being investigated.
2. Gather evidence from local docs, source code, logs, tickets, PRs or approved MCPs.
3. Separate confirmed facts from assumptions.
4. Form hypotheses only after evidence exists.
5. Conclude with the most likely cause or the next concrete evidence gap.

## Output

Return:

- question;
- evidence;
- findings;
- likely cause or decision;
- next action.

## Rules

- Do not fix before identifying the likely cause.
- Do not treat memory or Slack as current truth without verification when accuracy matters.
- Do not query production systems without permission.
