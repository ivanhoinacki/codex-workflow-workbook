#!/usr/bin/env bash
set -u

PASS=0
WARN=0
FAIL=0

pass() { printf "PASS: %s\n" "$1"; PASS=$((PASS + 1)); }
warn() { printf "WARN: %s\n" "$1"; WARN=$((WARN + 1)); }
fail() { printf "FAIL: %s\n" "$1"; FAIL=$((FAIL + 1)); }

check_command() {
  local command_name="$1"
  local label="$2"

  if command -v "$command_name" >/dev/null 2>&1; then
    pass "$label ($(command -v "$command_name"))"
  else
    fail "$label not found"
  fi
}

check_optional_command() {
  local command_name="$1"
  local label="$2"

  if command -v "$command_name" >/dev/null 2>&1; then
    pass "$label ($(command -v "$command_name"))"
  else
    warn "$label not found"
  fi
}

printf "\n== Required CLI ==\n"
check_command codex "Codex CLI"
check_command git "Git"
check_command node "Node.js"
check_command npm "npm"

printf "\n== Recommended Tools ==\n"
check_optional_command rg "ripgrep"
check_optional_command fd "fd"
check_optional_command jq "jq"
check_optional_command gh "GitHub CLI"
check_optional_command fzf "fzf"

printf "\n== Codex Files ==\n"
[ -d "$HOME/.codex" ] && pass "~/.codex exists" || warn "~/.codex does not exist yet"
[ -f "$HOME/.codex/config.toml" ] && pass "config.toml exists" || warn "config.toml not created yet"
[ -f "$HOME/.codex/copilot.config.toml" ] && pass "copilot.config.toml exists" || warn "copilot.config.toml not created yet"
[ -f "$HOME/.codex/AGENTS.md" ] && pass "AGENTS.md exists" || warn "AGENTS.md not created yet"
[ -f "$HOME/.codex/RTK.md" ] && pass "RTK.md exists" || warn "RTK.md not created yet"

printf "\n== Codex Runtime Config ==\n"
if [ -f "$HOME/.codex/config.toml" ]; then
  grep -E '^model = "gpt-5.5"' "$HOME/.codex/config.toml" >/dev/null && pass "config.toml uses gpt-5.5" || warn "config.toml model is not gpt-5.5"
  grep -E '^\[\[hooks\.' "$HOME/.codex/config.toml" >/dev/null && pass "hooks registered" || warn "no hooks registered"
  grep -E '^\[mcp_servers\.' "$HOME/.codex/config.toml" >/dev/null && pass "MCP servers registered" || warn "no MCP servers registered"
fi

printf "\n== Agents ==\n"
for agent in copilot researcher reviewer implementer; do
  [ -f "$HOME/.codex/agents/$agent.toml" ] && pass "agent $agent exists" || warn "agent $agent missing"
done

printf "\n== Hooks ==\n"
for hook in hook_lib.py session_start_context.py user_prompt_context.py pre_tool_use_guard.py post_tool_use_tracker.py session_end_save.py permission_request_log.py precompact_backup.py postcompact_log.py worktree_setup.py token-monitor.sh mcp-output-analytics.sh; do
  [ -f "$HOME/.codex/hooks/$hook" ] && pass "hook $hook exists" || warn "hook $hook missing"
done

printf "\n== Versions ==\n"
codex --version 2>/dev/null || warn "codex --version failed"
node --version 2>/dev/null || true
npm --version 2>/dev/null || true

printf "\n== Summary ==\n"
printf "PASS: %s\nWARN: %s\nFAIL: %s\n" "$PASS" "$WARN" "$FAIL"

[ "$FAIL" -eq 0 ]
