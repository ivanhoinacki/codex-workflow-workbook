#!/usr/bin/env bash
# PostToolUse hook: track MCP output sizes for local token analytics.

input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name // empty')

case "$tool_name" in
  mcp__*) ;;
  *) exit 0 ;;
esac

output_bytes=$(echo "$input" | jq -r '.tool_output // .tool_response // empty' | wc -c | tr -d ' ')

[ "${output_bytes:-0}" -lt 256 ] && exit 0

log="/tmp/codex-mcp-output-analytics-${PPID}.jsonl"
ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
jq -cn \
  --arg ts "$ts" \
  --arg tool "$tool_name" \
  --argjson bytes "$output_bytes" \
  --argjson tokens "$(( output_bytes / 4 ))" \
  '{ts:$ts,tool:$tool,bytes:$bytes,tokens:$tokens}' \
  >> "$log" 2>/dev/null

source "$HOME/.codex/hooks/token-monitor.sh" 2>/dev/null
token_log "mcp:${tool_name}" "$output_bytes" 2>/dev/null

exit 0
