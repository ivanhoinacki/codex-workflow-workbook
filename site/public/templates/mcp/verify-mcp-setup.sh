#!/usr/bin/env bash
set -euo pipefail

CONFIG_FILE="${CODEX_CONFIG_FILE:-$HOME/.codex/config.toml}"
SECRETS_FILE="${CODEX_MCP_SECRETS:-$HOME/.codex/.mcp-secrets}"

echo "Checking Codex MCP setup..."

test -f "$CONFIG_FILE"
grep -E '^\[mcp_servers\.' "$CONFIG_FILE" >/dev/null

echo "MCP entries found:"
grep -E '^\[mcp_servers\.' "$CONFIG_FILE" || true

echo
echo "Connector plugins:"
grep -E '^\[plugins\."(github|slack)@openai-curated"\]' "$CONFIG_FILE" || true

echo
echo "Secret file:"
if [[ -f "$SECRETS_FILE" ]]; then
  echo "found $SECRETS_FILE"
else
  echo "missing $SECRETS_FILE, required for token-based wrappers"
fi

echo
echo "Command availability:"
command -v npx >/dev/null && echo "npx ok" || echo "npx missing"
command -v datadog_mcp_cli >/dev/null && echo "datadog_mcp_cli ok" || echo "datadog_mcp_cli not in PATH"

echo
echo "Wrapper files:"
for wrapper in mcp-credentials.sh mcp-atlassian-wrapper.sh mcp-local-le-vault-wrapper.sh mcp-probe-wrapper.sh; do
  if [[ -x "$HOME/.codex/hooks/$wrapper" ]]; then
    echo "$wrapper ok"
  elif [[ -f "$HOME/.codex/hooks/$wrapper" ]]; then
    echo "$wrapper exists but is not executable"
  else
    echo "$wrapper missing"
  fi
done

echo
echo "Do not print secret values in shared logs."
