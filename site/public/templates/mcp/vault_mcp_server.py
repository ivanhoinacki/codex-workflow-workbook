#!/usr/bin/env python3
"""
vault-mcp-server: MCP server exposing PostgreSQL pgvector RAG for Codex.

Uses the official MCP Python SDK (stdio transport). All knowledge lives in the
PostgreSQL knowledge table with pgvector embeddings. No legacy vector-store dependency.

Tools:
  - query_vault: Semantic + keyword hybrid search in the LE knowledge base
  - list_vault_sources: Discover indexed types and services

Requires: PostgreSQL with pgvector on DATABASE_URL, Ollama for embeddings.

Config example:
  "local-le-vault": {
    "type": "stdio",
    "command": "$HOME/.local/share/le-vault/venv/bin/python",
    "args": ["/ABSOLUTE/PATH/TO/vault_mcp_server.py"],
    "env": { "DATABASE_URL": "postgresql://USER:PASSWORD@localhost:PORT/DATABASE" }
  }
"""

from __future__ import annotations

import asyncio
import logging
import os
import sys
from typing import Any

import requests


# Embedding provider: Ollama. Keep EMBED_PROVIDER for compatibility with
# existing MCP env/config and older process snapshots.
EMBED_PROVIDER = os.environ.get("EMBED_PROVIDER", "auto").lower()
OLLAMA_PORT = os.environ.get("OLLAMA_PORT", "11434")
OLLAMA_URL = f"http://localhost:{OLLAMA_PORT}"
OLLAMA_EMBED_MODEL = os.environ.get("OLLAMA_EMBED_MODEL", "nomic-embed-text")

# MCP SDK venv - discover actual site-packages regardless of runtime Python version
MCP_VENV = os.path.expanduser(os.environ.get("LOCAL_LE_VAULT_VENV", "~/.local/share/le-vault/venv"))
_venv_lib = os.path.join(MCP_VENV, "lib")
if os.path.isdir(_venv_lib):
    for _d in sorted(os.listdir(_venv_lib), reverse=True):
        _sp = os.path.join(_venv_lib, _d, "site-packages")
        if os.path.isdir(_sp):
            sys.path.insert(0, _sp)
            break

import mcp.server.stdio  # noqa: E402
import mcp.types as types  # noqa: E402
from mcp.server.lowlevel import NotificationOptions, Server  # noqa: E402
from mcp.server.models import InitializationOptions  # noqa: E402

_LOG_PATH = os.path.expanduser("~/.local/share/le-vault/mcp-server.log")


def _setup_logging() -> None:
    log_path = _LOG_PATH
    try:
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
        with open(log_path, "a"):
            pass
    except OSError:
        fallback_dir = os.path.expanduser("~/.codex/tmp")
        try:
            os.makedirs(fallback_dir, exist_ok=True)
            log_path = os.path.join(fallback_dir, "local-le-vault-mcp-server.log")
            with open(log_path, "a"):
                pass
        except OSError:
            logging.basicConfig(
                stream=sys.stderr,
                level=logging.DEBUG,
                format="%(asctime)s %(levelname)s %(message)s",
            )
            return
    logging.basicConfig(
        filename=log_path,
        level=logging.DEBUG,
        format="%(asctime)s %(levelname)s %(message)s",
    )


def _detect_embed_provider() -> str:
    """Check if Ollama is available for embeddings."""
    if EMBED_PROVIDER != "auto":
        return EMBED_PROVIDER
    try:
        resp = requests.get(f"{OLLAMA_URL}/api/tags", timeout=3)
        if resp.status_code == 200:
            return "ollama"
    except Exception:
        pass
    return "none"


def _log_ollama_request(caller: str, endpoint: str, model: str, duration_ms: float):
    """Append to shared Ollama request log for caller tracing."""
    try:
        import datetime
        ts = datetime.datetime.now().strftime("%H:%M:%S")
        dur = f"{duration_ms:.0f}ms" if duration_ms < 1000 else f"{duration_ms/1000:.1f}s"
        with open("/tmp/ollama-requests.log", "a") as f:
            f.write(f"{ts} [{caller}] POST {endpoint} model={model} ({dur})\n")
    except Exception:
        pass


def get_embedding(text: str) -> list[float]:
    """Get embedding from Ollama."""
    provider = _detect_embed_provider()

    if provider == "ollama":
        import time as _t
        _start = _t.monotonic()
        resp = requests.post(
            f"{OLLAMA_URL}/api/embed",
            json={"model": OLLAMA_EMBED_MODEL, "input": text},
            timeout=30,
        )
        _elapsed = (_t.monotonic() - _start) * 1000
        resp.raise_for_status()
        _log_ollama_request("vault-rag", "/api/embed", OLLAMA_EMBED_MODEL, _elapsed)
        return resp.json()["embeddings"][0]

    raise ConnectionError(
        "Ollama is not reachable. Start Ollama locally and make sure nomic-embed-text is available."
    )


# ---------------------------------------------------------------------------
# PostgreSQL hybrid search backend
# ---------------------------------------------------------------------------

PG_DATABASE_URL = os.environ.get("DATABASE_URL")
if not PG_DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required for local-le-vault")



def _get_pg_conn():
    import psycopg2
    import psycopg2.extras
    conn = psycopg2.connect(PG_DATABASE_URL)
    conn.cursor_factory = psycopg2.extras.RealDictCursor
    return conn


def handle_query_vault_pg(params: dict[str, Any]) -> tuple[str, list[dict]]:
    """Hybrid search via PostgreSQL + pgvector.

    Sends pre-computed embedding to the API via POST to avoid double
    embedding generation (MCP generates once, API reuses). Total latency
    is ~5-10ms instead of ~55ms.
    """
    query = params.get("query", "")
    n_results = min(int(params.get("n_results", 5)), 10)
    service_filter = params.get("service_filter") or None
    type_filter = params.get("type_filter") or []

    if not query:
        return "Error: query parameter is required", []

    try:
        embedding = get_embedding(query)
    except Exception as e:
        logging.warning(f"Embedding unavailable, falling back to keyword search: {e}")
        embedding = None

    # Map type_filter to the actual stored tags. Most vault sources are
    # stored as doc_type='learning' and differentiated by tags.
    doc_type = None
    tag_filter: list[str] = []
    if type_filter:
        tag_map = {
            # Core content types (high row count)
            "business-rule": "business-rule",
            "troubleshooting": "troubleshooting",
            "pitfall": "pitfall",
            "review-learning": "review-learning",
            "code-review": "code-review",
            "session-memory": "session-memory",
            "runbook": "runbook",
            "meeting": "meeting",
            # Feature documentation (332+ rows from feature_ingest)
            "feature-doc": "feature-doc",
            "feature-ko": "feature-ko",
            # Infrastructure
            "infrastructure": "infrastructure",
            "ci-infra": "infrastructure",
            # Confluence spaces (use tag, not doc_type)
            "confluence": "confluence",
            # Less common (kept for compatibility)
            "frontend": "frontend",
            "local-dev": "local-dev",
            "radar-export": "radar-export",
        }
        for tf in type_filter:
            mapped = tag_map.get(tf)
            if mapped:
                tag_filter.append(mapped)

    import time as _t
    _start = _t.monotonic()

    try:
        # POST with pre-computed embedding (avoids server-side Ollama call)
        api_url = os.environ.get("RADAR_API_URL", "http://localhost:8900")
        resp = requests.post(
            f"{api_url}/api/knowledge/search",
            json={
                "query": query,
                "embedding": embedding,
                "service": service_filter,
                "doc_type": doc_type,
                "tags": tag_filter or None,
                "n": n_results,
            },
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        rows = data.get("results", [])
    except Exception as e:
        logging.error(f"PG search failed: {e}")
        return f"Error: PG search failed: {e}", []

    _elapsed = (_t.monotonic() - _start) * 1000
    logging.info(f"query_vault_pg: {len(rows)} results in {_elapsed:.0f}ms for {query!r}")

    if not rows:
        return f"No relevant results found for: {query}", []

    MIN_SCORE = 0.40
    rows = [r for r in rows if r.get("score", 0) >= MIN_SCORE or r.get("keyword_score", 0) > 0]

    if not rows:
        return f"No relevant results found for: {query}", []

    output_parts = []
    for r in rows:
        # Prefer summary over full body when available (reduces context consumption)
        content = r.get('summary') or r.get('body', '')
        if r.get('summary') and r.get('body'):
            content = r['summary'] + "\n\n[Full content available in vault]"
        output_parts.append(
            f"## [{r.get('doc_type','')}] {r['title']} (score: {r.get('score',0):.3f})"
            + (f"\nServices: {r['service']}" if r.get('service') else "")
            + f"\n\n{content}\n"
        )

    response = f"Found {len(output_parts)} relevant chunks:\n\n" + "\n---\n".join(output_parts)
    return response, rows


def _handle_query_vault(params: dict[str, Any]) -> str:
    """Query the PostgreSQL knowledge base via pgvector hybrid search."""
    text, _ = handle_query_vault_pg(params)
    return text


def handle_list_vault_sources(_params: dict[str, Any]) -> str:
    """List indexed types and services from PostgreSQL knowledge table."""
    try:
        conn = _get_pg_conn()
        cur = conn.cursor()

        cur.execute("SELECT COUNT(*) as n FROM knowledge")
        total = cur.fetchone()["n"]

        cur.execute("""
            SELECT unnest(tags) as tag, COUNT(*) as n
            FROM knowledge GROUP BY 1 ORDER BY n DESC LIMIT 20
        """)
        tags = [(r["tag"], r["n"]) for r in cur.fetchall()]

        cur.execute("""
            SELECT COALESCE(NULLIF(service,''), 'general') as svc, COUNT(*) as n
            FROM knowledge GROUP BY 1 ORDER BY n DESC LIMIT 15
        """)
        services = [(r["svc"], r["n"]) for r in cur.fetchall()]

        cur.execute("SELECT COUNT(*) as n FROM knowledge WHERE embedding IS NOT NULL")
        with_emb = cur.fetchone()["n"]

        conn.close()

        output = f"Knowledge Base: PostgreSQL (pgvector)\n"
        output += f"Total rows: {total}\n"
        output += f"With embeddings: {with_emb}\n\n"
        output += "Tags / type_filter options:\n"
        for t, c in tags:
            output += f"  - {t}: {c} rows\n"
        output += "\nServices / service_filter options:\n"
        for s, c in services:
            output += f"  - {s}: {c} rows\n"

        return output
    except Exception as e:
        return f"Error listing sources: {e}"


TOOLS: list[types.Tool] = [
    types.Tool(
        name="query_vault",
        description=(
            "Semantic search in the Luxury Escapes team knowledge base. "
            "Returns relevant chunks from review learnings, business rules, "
            "service dossiers, pitfalls, troubleshooting guides, runbooks, and "
            "radar-export (DB digests exported to Knowledge-Base/Radar-RAG-Exports). "
            "Use before code review or when investigating domain-specific behavior."
        ),
        inputSchema={
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": (
                        "Natural language search query "
                        "(e.g. 'boolean validation zod query params')"
                    ),
                },
                "n_results": {
                    "type": "integer",
                    "description": "Number of results to return (default 5, max 10)",
                    "default": 5,
                },
                "type_filter": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": (
                        "Filter by document type. Options: "
                        "business-rule, troubleshooting, pitfall, code-review, "
                        "review-learning, session-memory, runbook, meeting, "
                        "feature-doc, feature-ko, confluence, infrastructure"
                    ),
                },
                "service_filter": {
                    "type": "string",
                    "description": (
                        "Filter by service name (e.g. 'svc-search', 'svc-experiences', "
                        "'svc-order', 'www-le-customer')"
                    ),
                },
            },
            "required": ["query"],
        },
    ),
    types.Tool(
        name="list_vault_sources",
        description=(
            "List available document types and services in the LE knowledge base. "
            "Use to discover what filters are available for query_vault."
        ),
        inputSchema={"type": "object", "properties": {}},
    ),
]

server = Server("local-le-vault", version="1.0.0")


@server.list_tools()
async def list_tools() -> list[types.Tool]:
    return TOOLS


@server.call_tool()
async def call_tool(name: str, arguments: dict[str, Any]) -> types.CallToolResult:
    if name == "query_vault":
        text = await asyncio.to_thread(_handle_query_vault, arguments)
    elif name == "list_vault_sources":
        text = await asyncio.to_thread(handle_list_vault_sources, arguments)
    else:
        return types.CallToolResult(
            content=[types.TextContent(type="text", text=f"Unknown tool: {name}")],
            isError=True,
        )
    return types.CallToolResult(
        content=[types.TextContent(type="text", text=text)],
        isError=False,
    )


async def run() -> None:
    logging.info("vault-mcp-server (MCP SDK stdio) starting")
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="local-le-vault",
                server_version="1.0.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )


def main() -> None:
    _setup_logging()
    try:
        asyncio.run(run())
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
