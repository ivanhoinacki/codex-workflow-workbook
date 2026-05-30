#!/bin/bash
# Token monitor: instruments context injection across all Codex hooks.
# Called by other hooks via: source $HOME/.codex/hooks/token-monitor.sh
# Then: token_log <source> <bytes>
#
# Log format: JSONL at /tmp/codex-token-monitor-<PPID>.jsonl

TOKEN_LOG="/tmp/codex-token-monitor-${PPID}.jsonl"

token_log() {
  local source="$1"
  local bytes="$2"
  local tokens=$(( bytes / 4 ))
  local ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)

  jq -cn --arg ts "$ts" --arg src "$source" --argjson bytes "$bytes" --argjson tokens "$tokens" \
    '{ts: $ts, source: $src, bytes: $bytes, tokens: $tokens}' \
    >> "$TOKEN_LOG" 2>/dev/null
}
