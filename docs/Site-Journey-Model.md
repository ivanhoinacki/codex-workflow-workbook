---
title: Site Journey Model
type: maintainer-note
audience: maintainer
---

# Site Journey Model

## Model

The playbook is structured as:

```text
Journey -> Chapter -> Page -> Checkpoint + Question
```

A learner starts on the first page. A page becomes complete only when the required checkpoint is checked and the required question is answered correctly. The next page is locked until the current page is complete.

## Journeys

### Foundations

Explains the shape of the system before asking the learner to configure anything.

Pages:

- Purpose
- Ecosystem Layers
- Main Sequence
- Workflow Boundaries

### Local Configuration

Turns the concepts into a local Codex setup.

Pages:

- Environment Prerequisites
- Terminal and Codex CLI
- Local Vault Environment Setup

### Local Configuration

Turns prepared local tools into Codex runtime configuration.

Pages:

- Template Variables
- config.toml
- Rules and Instructions
- copilot.config.toml
- Agents
- Hooks
- External Apps and Services
- MCPs and Connectors
- Skills
- Configuration Hands-on

### Knowledge System

Explains how durable knowledge becomes reusable context.

Pages:

- Token Economy
- Vault and Memory
- Local Knowledge Base
- Knowledge Reuse Loop
- Automation Sync

### Guided First Task

Provides a small exercise to validate the configured workflow.

Pages:

- Guided First Task

## Progress Storage

Progress is stored per browser profile in `localStorage`. It is not synchronized across users or devices.
