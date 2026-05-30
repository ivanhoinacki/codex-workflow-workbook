---
date: 2026-05-29
type: maintenance-note
project: codex-workflow
module: github-pages-workbook
status: draft
order: 16
---

# 16 - GitHub Pages Maintenance

This note is for maintainers, not for the onboarding journey.

GitHub Pages is the distribution layer for the interactive playbook. Learners do not need to create a repository, configure Pages or publish anything.

## Maintainer Responsibilities

- keep `docs/` sanitized;
- run `scripts/validate-docs.py`;
- run `scripts/sanitize-docs.py`;
- run the site build;
- publish with GitHub Actions when the repository is public or the plan supports private Pages.

## Flow

```plantuml
@startuml
!theme plain
skinparam backgroundColor #FEFEFE

participant Maintainer
participant Docs
participant Site
participant "GitHub Actions" as Actions
participant "GitHub Pages" as Pages

Maintainer -> Docs: Update markdown
Maintainer -> Site: Build and validate
Site -> Actions: Push or manual workflow
Actions -> Pages: Deploy static assets
Pages --> Maintainer: Published URL
@enduml
```
