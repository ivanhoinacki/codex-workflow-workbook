# Scripts

Repository utilities for validating the playbook before publishing.

## Validate Docs

```bash
python3 scripts/validate-docs.py
```

Checks:

- mapped workbook docs exist;
- public docs have frontmatter;
- template download links point to existing files;
- non-operational docs are the only unmapped docs;
- wikilinks resolve to local docs when possible.

## Sanitize Docs

```bash
python3 scripts/sanitize-docs.py
```

Checks:

- no absolute macOS user paths;
- no personal username;
- no personal Obsidian vault path;
- no obvious Slack or provider tokens;
- no specific PostgreSQL URL outside safe placeholders.

Run both scripts before publishing to GitHub Pages.
