#!/usr/bin/env bash
set -euo pipefail

SECRETS_FILE="${CODEX_MCP_SECRETS:-$HOME/.codex/.mcp-secrets}"

if [[ -f "$SECRETS_FILE" ]]; then
  # shellcheck source=/dev/null
  source "$SECRETS_FILE"
fi
