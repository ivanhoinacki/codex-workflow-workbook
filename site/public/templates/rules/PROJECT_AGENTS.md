# Project Codex Rules

This is a project-level template.
Copy to `AGENTS.md` in a repository or documentation project.

## Project

- Project name: `YOUR_PROJECT_NAME`.
- Owner/team: `YOUR_TEAM`.
- Main language/framework: `YOUR_STACK`.
- Important commands:
  - install: `YOUR_INSTALL_COMMAND`
  - test: `YOUR_TEST_COMMAND`
  - lint: `YOUR_LINT_COMMAND`
  - build: `YOUR_BUILD_COMMAND`

## Source Of Truth

- Requirements live in: `PATH_OR_LINK_TO_REQUIREMENTS`.
- Architecture docs live in: `PATH_OR_LINK_TO_ARCHITECTURE`.
- Runbooks live in: `PATH_OR_LINK_TO_RUNBOOKS`.
- Known gotchas live in: `PATH_OR_LINK_TO_GOTCHAS`.

## Local Rules

- Read nearby files before changing a module.
- Follow existing naming, exports, error handling and test patterns.
- Do not introduce new dependencies without approval.
- Do not change public APIs, schemas, migrations or infrastructure without explicit approval.
- Keep generated files, build outputs and dependency folders out of manual edits.

## Validation

Before finishing, run the smallest relevant checks:

```bash
YOUR_VALIDATION_COMMAND
```

If validation cannot run, explain why and what remains risky.

## Security

- Do not commit tokens, credentials, customer data, invoices or private keys.
- Do not paste production data into prompts.
- Sanitize logs before sharing.
