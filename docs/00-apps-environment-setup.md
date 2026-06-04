---
date: 2026-06-02
type: workbook-module
project: codex-workflow
module: apps-environment-setup
status: draft
order: 0.3
---

# 00.3 - Local Vault Environment Setup

## In One Sentence

This step explains the optional local knowledge environment used by `local-le-vault`.

## What You Will Understand

By the end of this page, you should know when this setup is needed, which local services it uses, and which checks must pass before enabling the `local-le-vault` MCP wrapper.

## Summary

`local-le-vault` is the bridge between Codex and reusable Luxury Escapes knowledge.

This setup is optional. A learner can use Codex, rules, hooks, subagents and skills without PostgreSQL.

Use this step only when the learner wants Codex to search a local indexed knowledge base.

That optional knowledge path works when this chain is complete:

1. A local vault stores durable Markdown knowledge.
2. Sync or ingest jobs index that knowledge.
3. PostgreSQL stores indexed chunks, metadata and vectors.
4. pgvector enables vector search.
5. Ollama provides the embedding model.
6. The `local-le-vault` Python server exposes MCP tools.
7. The Codex wrapper starts that server with the correct local environment.
8. Codex can call `query_vault` before broad source reads.

This page prepares only the optional `local-le-vault` chain. If the learner does not need local indexed knowledge yet, they can read this page for context, skip the PostgreSQL/Ollama setup, and continue with the normal configuration templates.

## Important Source Note

`vault_mcp_server.py` is not currently published as a standalone public repository.

In the current internal setup, it comes from the older workshop/config material:

```text
team-exp-claude-config/local-ai/vault/vault_mcp_server.py
```

Use that file only if you have access to the internal source package. Otherwise, treat this section as the shape of the optional integration and skip `local-le-vault` until the server script is provided as a clearer package.

The base Codex setup does not depend on this file.

## Required Pieces

| Piece | Purpose | Required for base Codex setup | Required for `local-le-vault` |
|---|---|---:|---:|
| Terminal | Runs checks and local setup commands. | Yes | Yes |
| Codex CLI | Loads configuration and calls tools. | Yes | Yes |
| Python 3 | Runs local MCP server scripts. | No | Yes |
| Python dependencies | Provide MCP, HTTP and PostgreSQL access. | No | Yes |
| Markdown or Obsidian vault | Stores source knowledge and Session-Memory. | No | Yes |
| PostgreSQL | Stores indexed knowledge rows. | No | Yes |
| pgvector | Stores and searches embeddings. | No | Yes |
| Ollama | Runs the local embedding model. | No | Yes |
| `nomic-embed-text` | Embedding model used by the search flow. | No | Yes |
| `vault_mcp_server.py` | Exposes `query_vault` and source discovery. Today this comes from the internal workshop/config source package, not a standalone public repo. | No | Yes |
| Python executable | Runs the MCP server with the correct dependencies. | No | Yes |
| MCP wrapper | Starts the server from `~/.codex/hooks`. | No | Yes |
| `.mcp-secrets` | Holds local database URL and server path. | No | Yes |
| Sync or ingest job | Keeps vault content indexed in PostgreSQL. | No | Yes for fresh results |

## Recommended Install Order

If the learner is not enabling `local-le-vault`, they can stop after step 2 and continue to [[00-template-variables]]. The rest of this page is only for the optional indexed knowledge path.

1. Confirm Codex CLI and Python 3 work.
2. Create `~/.codex/hooks`.
3. Create or choose the local vault directory.
4. Prepare PostgreSQL with pgvector.
5. Create the knowledge database used by the vault index.
6. Install Ollama.
7. Pull `nomic-embed-text`.
8. Copy or clone the source package that contains `vault_mcp_server.py`.
9. Create a Python environment with the server dependencies.
10. Identify the Python executable or venv that can run the MCP server.
11. Create `~/.codex/.mcp-secrets`.
12. Download the `mcp-local-le-vault-wrapper.sh` template.
13. Register `local-le-vault` in `~/.codex/config.toml`.
14. Validate the MCP before using it in real work.

## Base Commands

Validate the local base:

```bash
git --version
rg --version
python3 --version
codex --version
```

Create the Codex hook directory:

```bash
mkdir -p ~/.codex/hooks
```

## Windows With WSL2

For Windows users, run this workflow inside WSL2, not in PowerShell.

Recommended shape:

| Item | Recommendation |
|---|---|
| Distribution | Ubuntu on WSL2. |
| Paths | Use Linux paths such as `/home/you/workspace`, not `C:\Users\...`. |
| Package manager | Use `apt`, not Homebrew. |
| Shell | `bash` works; `zsh` is optional. |
| Repositories | Clone repos inside the WSL filesystem for better performance. |
| Vault | Use a WSL-accessible path. Avoid editing the same vault concurrently from Windows and WSL tools. |
| PostgreSQL | Can run inside WSL2, Docker Desktop with WSL integration, or another local Linux-accessible service. |
| Ollama | Can run inside WSL2 or on Windows, as long as WSL can reach the Ollama API. |

Confirm WSL2:

```bash
grep -qiE "(microsoft|wsl)" /proc/version && echo "WSL detected"
```

Install base packages:

```bash
sudo apt-get update
sudo apt-get install -y git curl python3 python3-venv python3-pip ripgrep jq fd-find fzf
```

On Ubuntu, `fd` may be installed as `fdfind`. That is fine.

Check Node.js and Codex CLI from inside WSL:

```bash
node --version
npm --version
codex --version
```

If Node.js is missing, install it using your team-supported path, for example `nvm` inside WSL. Avoid relying on the Windows Node binary from WSL.

WSL2 path examples:

```bash
mkdir -p ~/workspace/luxury-escapes
mkdir -p ~/workspace/obsidian-vault
mkdir -p ~/.codex/hooks ~/.codex/skills ~/.codex/agents
```

Optional clipboard bridge:

```bash
sudo apt-get install -y xclip
```

This is only needed if shell helpers depend on clipboard commands.

## PostgreSQL and pgvector

PostgreSQL is optional. Install it only when enabling `local-le-vault` with indexed local knowledge.

The exact install command depends on the machine and team standard. The important requirement for this optional path is that the local database is reachable and can store vector embeddings.

Minimum expected shape:

| Value | Example |
|---|---|
| Host | `localhost` |
| Port | `5600` or another local port |
| Database | `radar_db` or another local knowledge database |
| Extension | `pgvector` enabled |
| Connection string | Stored locally, not committed |

Check PostgreSQL:

```bash
pg_isready -h localhost -p YOUR_POSTGRES_PORT
```

For WSL2, also confirm the database is reachable from inside the WSL shell where Codex runs. If PostgreSQL runs in Windows or Docker Desktop, `localhost` may behave differently depending on networking configuration.

The database URL should be stored in `~/.codex/.mcp-secrets`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:PORT/DATABASE"
```

## Ollama and Embeddings

`local-le-vault` needs embeddings to search by meaning, not only exact keywords.

Check Ollama:

```bash
ollama --version
ollama list | rg nomic-embed-text
```

If the model is missing:

```bash
ollama pull nomic-embed-text
```

For WSL2, if Ollama runs on Windows, confirm WSL can reach the API endpoint. If it cannot, either run Ollama inside WSL or configure the host URL explicitly in the MCP server environment.

## MCP Server Script

The template expects a local path to the Python server script:

```bash
LOCAL_LE_VAULT_SERVER="/absolute/path/to/vault_mcp_server.py"
```

Today, the known internal source location is:

```text
team-exp-claude-config/local-ai/vault/vault_mcp_server.py
```

After copying or cloning that source package, set `LOCAL_LE_VAULT_SERVER` to the absolute path on your machine. Do not use another developer's private path.

The server must be able to:

- read `DATABASE_URL`;
- generate query embeddings;
- connect to PostgreSQL;
- expose `query_vault`;
- expose source discovery such as `list_vault_sources`.

Use a Python environment that can import the required libraries:

```bash
python3 -c "import mcp, requests, psycopg2; print('ok')"
```

If this fails, fix the Python environment before registering the MCP in Codex.

If the working environment is a venv, store that executable path in `.mcp-secrets` instead of relying on global `python3`.

Recommended venv shape:

```bash
python3 -m venv ~/.local/share/le-vault/venv
~/.local/share/le-vault/venv/bin/python3 -m pip install --upgrade pip
~/.local/share/le-vault/venv/bin/python3 -m pip install mcp requests psycopg2-binary
~/.local/share/le-vault/venv/bin/python3 -c "import mcp, requests, psycopg2; print('ok')"
```

For WSL2, keep the venv inside the Linux filesystem, for example under `~/.local/share`, not under `/mnt/c`.

## Wrapper and Secrets

The wrapper belongs in `~/.codex/hooks`:

```bash
~/.codex/hooks/mcp-local-le-vault-wrapper.sh
```

The wrapper reads secrets from:

```bash
~/.codex/.mcp-secrets
```

The secret file should include at least:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:PORT/DATABASE"
LOCAL_LE_VAULT_SERVER="/absolute/path/to/vault_mcp_server.py"
LOCAL_LE_VAULT_PYTHON="/absolute/path/to/python-or-venv/bin/python3"
```

Then make wrappers executable:

```bash
chmod +x ~/.codex/hooks/mcp-*.sh
```

## Codex MCP Registration

The generated config should contain:

```toml
[mcp_servers.local-le-vault]
command = "ABSOLUTE/PATH/TO/.codex/hooks/mcp-local-le-vault-wrapper.sh"
```

After copying config, validate:

```bash
codex mcp get local-le-vault
```

Expected result:

```text
local-le-vault
  enabled: true
  transport: stdio
  command: ...
```

## Sync Requirement

The MCP can only return what has been indexed.

To keep it useful, the workflow needs a sync or ingest path that moves durable knowledge into PostgreSQL:

| Source | What should be indexed |
|---|---|
| Vault docs | Runbooks, project docs, architecture notes and gotchas. |
| Session-Memory | Durable decisions, handoffs and pending context. |
| Code reviews | Review learnings and repeated pitfalls. |
| Confluence sync | Stable company or project documentation. |
| Incident notes | Root causes, symptoms and mitigations. |

If new notes are not indexed, `local-le-vault` will not find them.

## Flow

```plantuml
@startuml
!theme plain
skinparam backgroundColor #FEFEFE

actor Learner
participant "Template Variables" as Vars
participant "Codex CLI" as Codex
participant "MCP Wrapper" as Wrapper
participant "local-le-vault Server" as Server
participant "Ollama\nnomic-embed-text" as Ollama
database "PostgreSQL\nknowledge + pgvector" as PG
participant "Vault / Sync" as Vault

Learner -> Vars: Fill vault, database and server paths
Learner -> Codex: Start session
Codex -> Wrapper: Start local-le-vault
Wrapper -> Server: Pass DATABASE_URL and server path
Codex -> Server: query_vault(query, service_filter)
Server -> Ollama: Generate query embedding
Server -> PG: Hybrid search
PG --> Server: Matching knowledge
Server --> Codex: Bounded evidence
Vault -> PG: Sync durable notes into indexed knowledge
@enduml
```

## Why It Works

`local-le-vault` turns durable knowledge into a searchable evidence source.

The setup works because each responsibility is separate:

- the vault stores authored knowledge;
- sync jobs index durable sources;
- PostgreSQL stores searchable content and vectors;
- Ollama creates embeddings;
- the MCP server exposes search tools;
- the wrapper starts the server safely from Codex;
- Codex retrieves bounded context before acting.

## What Can Wait Until Later

These tools are useful, but they are not required for `local-le-vault` itself:

- GitHub connector;
- Slack connector;
- Atlassian MCP;
- Datadog MCP;
- Browser tooling;
- Context7;
- Probe.

Configure them after the local knowledge flow works.

## Troubleshooting

| Symptom | Likely cause | Next step |
|---|---|---|
| `codex mcp get local-le-vault` shows nothing | MCP entry missing from config. | Add the `[mcp_servers.local-le-vault]` entry and restart Codex if needed. |
| MCP starts but returns no useful results | Knowledge was not indexed or query is too narrow. | Run/source-check the sync job and broaden the query. |
| `No module named psycopg2` | Wrong Python environment. | Install dependencies in the venv used by the wrapper. |
| PostgreSQL connection fails | Database down, wrong port or wrong URL. | Check `pg_isready` and the `DATABASE_URL` in `.mcp-secrets`. |
| Semantic search fails | Ollama missing or model not pulled. | Start Ollama and run `ollama pull nomic-embed-text`. |
| `vault_mcp_server.py` cannot be found | The learner does not have the internal source package yet. | Skip `local-le-vault` for now or get the source package that contains `team-exp-claude-config/local-ai/vault/vault_mcp_server.py`. |
| Old knowledge appears | Stale or superseded rows were not curated. | Update the source note or mark old rows as replaced in the index. |
| WSL2 path works in terminal but not Codex | Config used Windows paths or mixed `/mnt/c` paths. | Use Linux paths in WSL and update template variables. |
| WSL2 cannot reach PostgreSQL or Ollama | Service is running outside WSL with different networking. | Test from WSL, then adjust host, port or run the service inside WSL. |

## Checkpoint

Before moving on, confirm that:

- Codex CLI opens from the terminal;
- `~/.codex/hooks` exists;
- the vault path is known;
- PostgreSQL is reachable, if the learner is enabling indexed local knowledge;
- pgvector is available;
- Ollama has `nomic-embed-text`;
- the MCP server script path is known;
- the Python executable or venv path is known;
- `.mcp-secrets` has placeholders ready for `DATABASE_URL`, `LOCAL_LE_VAULT_SERVER` and `LOCAL_LE_VAULT_PYTHON`;
- Windows users know to run setup and Codex inside WSL2 using Linux paths;
- you understand that sync or ingest is required to keep results current.

## Next Module

Go to [[00-template-variables]].
