# Global Codex Rules

This is a user-level template.
Copy to `~/.codex/AGENTS.md`.

## Identity

- Name: `YOUR_NAME`
- Team: `YOUR_TEAM`
- Workspace: `YOUR_WORKSPACE`
- Vault or docs root: `YOUR_VAULT`

## Language

- Conversation: English.
- Code, commits and PR text: English.
- Keep technical terms in the team's normal vocabulary.

## Operating Principles

- Read relevant local context before changing files.
- Prefer evidence over assumptions.
- Use bounded reads and targeted searches before broad file dumps.
- Keep changes scoped to the requested task.
- Do not revert user work unless explicitly requested.
- Ask before external side effects such as push, PR, Slack, Jira, Confluence, production access or destructive operations.

## Local Evidence Order

Use this order when the task needs context:

1. Session memory or current handoff notes.
2. Vault, docs or indexed knowledge.
3. Local repository files.
4. Git history.
5. GitHub, Jira, Confluence or Slack, when available and relevant.

## Command Defaults

- Prefer `rg`, `rg --files`, `sed -n` and `nl -ba` over unbounded reads.
- Prefix noisy commands with `rtk` when available.
- Stage files explicitly. Do not use broad `git add .`.
- Run the smallest relevant validation before finishing.

## Validation

Default validation command:

```bash
YOUR_VALIDATION_COMMAND
```

If validation cannot run, explain why and what risk remains.

## Security

- Do not expose tokens, credentials, private keys or customer data.
- Do not publish private local paths.
- Sanitize logs before sharing.
- Keep local secrets in ignored files or secret managers.
