#!/usr/bin/env bash
set -euo pipefail

NODE_BIN="${NODE_BIN:-$(command -v node 2>/dev/null || true)}"
NPM_BIN="${NPM_BIN:-$(command -v npm 2>/dev/null || true)}"
NPX_BIN="${NPX_BIN:-$(command -v npx 2>/dev/null || true)}"
PROBE_VERSION="${PROBE_VERSION:-0.6.0-rc319}"
PROBE_CACHE_ROOT="${PROBE_CACHE_ROOT:-$HOME/.npm/_npx}"

if [[ -z "$NODE_BIN" || ! -x "$NODE_BIN" ]]; then
  echo "probe MCP wrapper: node not found" >&2
  exit 127
fi

find_probe_mcp() {
  find "$PROBE_CACHE_ROOT" -path "*/@probelabs/probe/build/mcp/index.js" -type f 2>/dev/null | sort | tail -n 1
}

find_probe_bin() {
  find "$PROBE_CACHE_ROOT" -path "*/node_modules/.bin/probe" -type f 2>/dev/null | sort | tail -n 1
}

if [[ -n "${CODEX_RG_PATH:-}" && -x "$CODEX_RG_PATH" ]]; then
  export PROBE_GREP_COMMAND="${PROBE_GREP_COMMAND:-$CODEX_RG_PATH}"
elif command -v rg >/dev/null 2>&1; then
  export PROBE_GREP_COMMAND="${PROBE_GREP_COMMAND:-$(command -v rg)}"
fi

if [[ "${1:-}" == "mcp" ]]; then
  shift
  PROBE_MCP="${PROBE_MCP:-$(find_probe_mcp)}"
  if [[ -f "$PROBE_MCP" ]]; then
    exec "$NODE_BIN" "$PROBE_MCP" "$@"
  fi
  if [[ -n "$NPX_BIN" ]]; then
    exec "$NPX_BIN" -y "@probelabs/probe@$PROBE_VERSION" mcp "$@"
  fi
  echo "probe MCP wrapper: probe MCP not found and npx unavailable" >&2
  exit 127
fi

PROBE_BIN="${PROBE_BIN:-$(find_probe_bin)}"
if [[ -f "$PROBE_BIN" ]]; then
  exec "$NODE_BIN" "$PROBE_BIN" "$@"
fi

if [[ -n "$NPX_BIN" ]]; then
  exec "$NPX_BIN" -y "@probelabs/probe@$PROBE_VERSION" "$@"
fi

if [[ -n "$NPM_BIN" ]]; then
  echo "probe MCP wrapper: probe binary not cached. Install with: $NPM_BIN exec -y @probelabs/probe@$PROBE_VERSION -- probe --help" >&2
else
  echo "probe MCP wrapper: probe binary not cached and npm/npx unavailable" >&2
fi
exit 127
