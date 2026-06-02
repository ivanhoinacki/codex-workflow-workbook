#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/mcp-credentials.sh"

: "${DATABASE_URL:?Set DATABASE_URL in ~/.codex/.mcp-secrets}"
: "${LOCAL_LE_VAULT_SERVER:?Set LOCAL_LE_VAULT_SERVER in ~/.codex/.mcp-secrets}"

LOCAL_LE_VAULT_PYTHON="${LOCAL_LE_VAULT_PYTHON:-python3}"

exec "$LOCAL_LE_VAULT_PYTHON" "$LOCAL_LE_VAULT_SERVER" "$@"
