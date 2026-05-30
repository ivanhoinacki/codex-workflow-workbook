#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/mcp-credentials.sh"

: "${ATLASSIAN_USERNAME:?Set ATLASSIAN_USERNAME in ~/.codex/.mcp-secrets}"
: "${JIRA_API_TOKEN:?Set JIRA_API_TOKEN in ~/.codex/.mcp-secrets}"
: "${CONFLUENCE_API_TOKEN:?Set CONFLUENCE_API_TOKEN in ~/.codex/.mcp-secrets}"

MCP_ATLASSIAN_BIN="${MCP_ATLASSIAN_BIN:-mcp-atlassian}"

exec "$MCP_ATLASSIAN_BIN" "$@"
