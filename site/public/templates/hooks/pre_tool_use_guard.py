#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import shlex
import sys
from pathlib import Path

from hook_lib import (
    command_from_input,
    compact_text,
    cwd_from_input,
    deny_output,
    emit,
    hash_short,
    load_stdin_json,
    log_event,
    service_context_for_cwd,
    system_message,
    token_log,
    tool_input,
    tracker_file,
)


def deny(reason: str) -> None:
    emit(deny_output(reason))
    sys.exit(0)


def add_warning(warnings: list[str], message: str) -> None:
    if message and message not in warnings:
        warnings.append(message)


def strip_literals(command: str) -> str:
    return re.sub(r"'[^']*'|\"[^\"]*\"", "", command)


def command_segments(command: str) -> list[str]:
    return [part.strip() for part in re.split(r"\s*(?:&&|\|\||;|\|)\s*", command) if part.strip()]


def looks_like_luxury_path(text: str) -> bool:
    return bool(re.search(r"(?:/LuxuryEscapes/|/Luxury-Escapes/|/lux-group/|LuxuryEscapes/|Luxury-Escapes/|lux-group/)", text))


def readish_command(command: str) -> bool:
    return bool(re.search(r"\b(?:rg|sed|cat|nl|head|tail|find|ls|git\s+-C)\b", command))


def python_heredoc_writes(command: str) -> bool:
    if not re.search(r"\bpython3?\s+-\s*<<", command):
        return False
    write_patterns = [
        r"\.write_text\s*\(",
        r"\.write_bytes\s*\(",
        r"\bopen\s*\([^)]*,\s*[\"'][wa+x]",
        r"\bPath\s*\([^)]*\)\.write_",
    ]
    return any(re.search(pattern, command, re.DOTALL) for pattern in write_patterns)


def gh_api_unquoted_query_arg(command: str) -> bool:
    return bool(re.search(r"\b(?:rtk\s+)?gh\s+api\s+[^\s'\";&|]*\?[^\s'\";&|]*", command))


def rtk_block_reason(command: str) -> str:
    noisy_patterns = [
        r"\bgit(?:\s+-C\s+\S+)?\s+diff\b",
        r"\bgit(?:\s+-C\s+\S+)?\s+show\b",
        r"\bgit(?:\s+-C\s+\S+)?\s+log\b",
        r"\bgh\s+pr\s+(?:view|diff|checks|list)\b",
        r"\bgh\s+search\s+(?:prs|repos)\b",
        r"\bgh\s+pr\s+diff\b",
        r"\bgh\s+api\b",
        r"\bgh\s+run\s+view\b",
        r"\b(?:yarn|npm|pnpm)\s+(?:test|build|lint|typecheck|test:types|test:unit)\b",
        r"\bps\s+(?:-ef|aux)\b",
        r"\bpsql\b",
        r"\bcat\s+/.+",
        r"\btail\s+(?:-[0-9]+|-n\s+[0-9]+)\s+/.+",
    ]
    for segment in command_segments(command):
        stripped = segment.lstrip()
        if stripped.startswith(("rtk ", "command rtk ", "source ", "nvm use")):
            continue
        if "nvm use" in command and re.match(r"^(?:node|yarn|npm|pnpm|corepack)\b", stripped):
            continue
        if any(re.search(pattern, segment) for pattern in noisy_patterns):
            return (
                "RTK TOKEN ECONOMY BLOCK: This command can produce noisy output. "
                "Re-run it with `rtk <cmd>` or `rtk proxy <cmd>` if raw output is explicitly needed. "
                "Prefer scoped paths, `--stat`, `--name-only`, `--json ... --jq ...`, `LIMIT`, or focused tests."
            )
    return ""


def rtk_warning(command: str) -> str:
    advisory_patterns = [
        r"\brg\b.*(?:/\.codex|/workspace|/vault)",
        r"\bfind\b.*(?:/\.codex|/workspace|/vault)",
        r"\bgh\s+pr\s+create\b",
        r"\bgh\s+pr\s+edit\b",
    ]
    for segment in command_segments(command):
        stripped = segment.lstrip()
        if stripped.startswith(("rtk ", "command rtk ", "source ", "nvm use")):
            continue
        if any(re.search(pattern, segment) for pattern in advisory_patterns):
            return (
                "RTK TOKEN ECONOMY: This command may read or emit broad output. "
                "Prefix it with `rtk` when possible and keep paths/output bounded."
            )
    return ""


def frontend_layout_warning(data: dict) -> str:
    ti = tool_input(data)
    tool = str(data.get("tool_name") or "")
    file_candidates: list[str] = []
    for key in ("file_path", "path"):
        value = ti.get(key)
        if isinstance(value, str):
            file_candidates.append(value)
    raw_input = ""
    if isinstance(data.get("tool_input"), str):
        raw_input = data["tool_input"]
    else:
        try:
            raw_input = json.dumps(ti, ensure_ascii=False)
        except Exception:
            raw_input = str(ti)
    if "apply_patch" in tool or "*** Update File:" in raw_input or "*** Add File:" in raw_input:
        for match in re.finditer(r"^\*\*\* (?:Update|Add) File:\s+(.+)$", raw_input, re.MULTILINE):
            file_candidates.append(match.group(1).strip())
    style_blob = " ".join(str(ti.get(k, "")) for k in ("old_string", "new_string", "content")) + " " + raw_input
    frontend_file = False
    for file_path in file_candidates:
        if re.search(r"\.(?:css|scss|styled\.ts|styled\.tsx|tsx|jsx)$", file_path):
            frontend_file = True
            break
    style_related = bool(re.search(r"styled\(|className=|sx=\{|style=|css`", style_blob))
    if frontend_file and (style_related or re.search(r"\.(?:css|scss|styled\.ts|styled\.tsx)$", " ".join(file_candidates))):
        return (
            "FRONTEND LAYOUT VALIDATION: Editing style-related code.\n"
            "After implementation, validate visually at 375px, 768px, and 1440px when a browser is available. "
            "Use Playwright or Chrome DevTools screenshots, inspect computed styles and box model, and use Imugi when a Figma reference exists."
        )
    return ""


def critical_config_warning(data: dict) -> str:
    ti = tool_input(data)
    values = [str(ti.get(key, "")) for key in ("file_path", "path")]
    if isinstance(data.get("tool_input"), str):
        values.append(data["tool_input"])
    blob = "\n".join(values)
    if re.search(r"(?:/\.codex/config\.toml|/\.codex/hooks/|AGENTS\.md|/\.codex/rules/)", blob):
        return "CONFIG CHANGE WATCH: You are modifying Codex instructions, hooks, rules, or AGENTS.md. Keep the change scoped and validate config after editing."
    return ""


def agent_model_warning(data: dict) -> str:
    tool = str(data.get("tool_name") or "").lower()
    ti = tool_input(data)
    if "spawn_agent" not in tool or not ti.get("model"):
        return ""

    agent_type = str(ti.get("agent_type") or "").lower()
    model = str(ti.get("model") or "").lower()
    effort = str(ti.get("reasoning_effort") or ti.get("model_reasoning_effort") or "").lower()
    approved = {
        ("researcher", "gpt-5.4-mini", "low"),
        ("reviewer", "gpt-5.4-mini", "low"),
        ("copilot", "gpt-5.4-mini", "low"),
        ("implementer", "gpt-5.4", "medium"),
        ("worker", "gpt-5.4", "medium"),
    }
    if (agent_type, model, effort) not in approved:
        return "AGENT MODEL GUARD: Use only tier-approved spawn_agent model overrides unless the user explicitly asked or task risk justifies escalation."
    return ""


def datadog_token_warning(data: dict) -> str:
    tool = str(data.get("tool_name") or "").lower()
    if "datadog" not in tool or "search_datadog_logs" not in tool:
        return ""
    ti = tool_input(data)
    max_tokens = ti.get("max_tokens")
    try:
        max_tokens_int = int(max_tokens) if max_tokens is not None else 0
    except (TypeError, ValueError):
        max_tokens_int = 0
    extra_fields = ti.get("extra_fields") if isinstance(ti.get("extra_fields"), list) else []
    if max_tokens_int > 3000 or len(extra_fields) > 6:
        return (
            "DATADOG TOKEN ECONOMY: Large raw log search detected. Prefer `analyze_datadog_logs` for counts/groups. "
            "If raw evidence is required, use `python3 ~/.codex/scripts/datadog-log-compact-search.py` with the same query/window/extra fields "
            "so raw output is saved under `/tmp/codex-datadog` and only compact samples enter the conversation."
        )
    return ""


def check_command(data: dict, command: str, warnings: list[str]) -> None:
    clean = strip_literals(command)
    clean_lower = clean.lower()
    cwd = cwd_from_input(data)

    if (looks_like_luxury_path(cwd) or looks_like_luxury_path(clean)) and re.search(r"\b(?:node|yarn|npm|pnpm|corepack)\b", clean):
        if "nvm use" not in clean and ".nvmrc" not in clean:
            deny("LE NODE TOOLCHAIN BLOCK: load the repo Node version before running node/yarn/npm. Use `source ~/.nvm/nvm.sh && nvm use && <command>` from the worktree.")

    if re.search(r"\bpup\b", clean_lower):
        deny("The Datadog pup CLI is deprecated in this Codex setup. Use the datadog-mcp skill and mcp__datadog_mcp__ tools instead.")

    if re.search(r"\ble\s+aws\s+postgres\b", clean):
        deny("Use le-tunnel.sh instead of `le aws postgres`. Prefer read-only tunnels unless the user explicitly approves write access.")

    if gh_api_unquoted_query_arg(command):
        deny("GH API QUERY ARG BLOCK: quote gh api paths that contain `?`, for example `rtk gh api 'repos/org/repo/contents/file.js?ref=sha'`.")

    if python_heredoc_writes(command):
        deny("PYTHON HEREDOC EDIT BLOCK: use apply_patch for manual file edits. Keep Python heredocs read-only or move reusable scripts into a checked file.")

    if re.search(r"\bgit\s+worktree\s+remove\b", clean) and re.search(r"(?:^|\s)(?:-f|--force)(?:\s|$)", clean):
        deny("`git worktree remove --force` can discard a worktree with local changes. Ask the user explicitly before forcing removal.")

    if re.search(r"\bgit\s+reset\s+--hard\b", clean):
        deny("`git reset --hard` discards local work. Ask the user explicitly before running it.")

    if re.search(r"\bgit\s+checkout\s+-b\b", clean):
        deny("Feature work should use git worktrees. Ask the user before creating a branch in the main checkout.")

    if re.search(r"\bgit\s+checkout\s+\.\s*(?:$|[;&|])", clean):
        deny("`git checkout .` discards local changes. Ask the user explicitly before running it.")

    if re.search(r"\bgit\s+add\s+\.(?:\s|$|[;&|])", clean):
        deny("Stage files explicitly by path. Do not use `git add .` in this workspace.")

    if re.search(r"\bgit\s+clean\b.*(?:\s|^)-[A-Za-z]*f", clean):
        deny("`git clean -f` removes untracked files. Run `git clean -n` first and ask the user before deleting anything.")

    if re.search(r"\bgit\s+push\b.*(?:^|\s)(?:-f|--force)(?:\s|$)", clean) and "--force-with-lease" not in clean:
        deny("Bare force push is blocked. Use `--force-with-lease` only after explaining what remote history changes.")

    if re.search(r"\bgit\s+stash\b", clean):
        deny("`git stash` can hide work across context switches. Ask the user before stashing, or make a named WIP commit if appropriate.")

    if re.search(r"\brm\s+-rf\b", clean):
        safe_fragments = ("node_modules", "/tmp/", "/private/tmp/", "dist", "build", ".cache", ".turbo")
        if not any(fragment in clean for fragment in safe_fragments):
            deny("`rm -rf` on this path requires explicit user approval. Safe cleanup paths are node_modules, /tmp, dist, build, .cache, and .turbo.")

    if re.search(r"\bgh\s+pr\s+checks\b.*(?:^|\s)--watch(?:\s|$)", clean):
        deny("`gh pr checks --watch` is blocked for token economy. Use bounded polling with `rtk gh pr checks --json ... --jq ...` and stop after a fixed number of polls.")

    if re.search(r"\bgh\s+pr\s+diff\b.*(?:^|\s)--stat(?:\s|$)", clean):
        deny("`gh pr diff --stat` is not supported by the current GitHub CLI. Use `rtk gh pr view <PR> --json files` for changed-file stats.")

    if re.search(r"\bgh\s+pr\s+diff\b.*(?:^|\s)--\s+\S+", clean):
        deny("`gh pr diff -- <path>` is not supported by the current GitHub CLI. Use a matching local worktree with `rtk git diff origin/<base>...HEAD -- <path>`, or one bounded PR patch.")

    if re.search(r"\bsleep\s+\d+\b.*(?:&&|\|\|)\s*(?:tail|cat|grep|head)\b", clean):
        deny("Polling with `sleep N && tail/cat/grep/head` is blocked. Use the active terminal session and poll it directly.")

    if re.search(r"\bgit\s+(?:merge|rebase)\s+origin/(?:master|main)\b", clean):
        deny("Updating a feature branch from origin/master or origin/main can pull a large unrelated diff. Check PR mergeability/base first and ask the user before merge/rebase.")

    for segment in command_segments(clean):
        if re.match(r"^\s*grep\b", segment):
            add_warning(warnings, "Prefer `rg` over shell `grep` for repository searches.")
        if re.match(r"^\s*find\b.*\s-name\b", segment):
            add_warning(warnings, "Prefer `rg --files` over `find ... -name` for repository file discovery.")
        if re.match(r"^\s*cat\s+/", segment):
            add_warning(warnings, "Prefer bounded reads such as `sed -n '1,220p'` or `nl -ba` instead of `cat` on absolute paths.")
        if re.match(r"^\s*(?:head|tail)\b.*\s/", segment):
            add_warning(warnings, "Prefer deterministic bounded reads with `sed -n` for source files; reserve `tail` for live logs.")

    if looks_like_luxury_path(command) and readish_command(clean):
        queried = tracker_file(data, "vault-queried")
        reminded = tracker_file(data, "vault-reminded")
        if not queried.exists() and not reminded.exists():
            reminded.write_text("1\n", encoding="utf-8")
            add_warning(warnings, "VAULT FIRST: query local-le-vault before reading Luxury Escapes source files. Ignore this if the vault was already queried but the hook could not observe it.")


def main() -> None:
    data = load_stdin_json()
    warnings: list[str] = []

    cwd = cwd_from_input(data)
    cwd_context = service_context_for_cwd(cwd)
    if cwd_context:
        key = hash_short(cwd)
        seen = tracker_file(data, f"cwd-context-{key}")
        if not seen.exists():
            seen.write_text(cwd + "\n", encoding="utf-8")
            add_warning(warnings, cwd_context)

    command = command_from_input(data)
    tool_name = str(data.get("tool_name") or "")
    is_shell_tool = any(name in tool_name for name in ("exec_command", "shell", "bash", "terminal"))
    if command and is_shell_tool:
        check_command(data, command, warnings)

        block = rtk_block_reason(command)
        if block:
            deny(block)

    for maybe in (
        rtk_warning(command) if is_shell_tool else "",
        frontend_layout_warning(data),
        critical_config_warning(data),
        agent_model_warning(data),
        datadog_token_warning(data),
    ):
        add_warning(warnings, maybe)

    if warnings:
        message = "\n\n".join(warnings[:4])
        token_log("hook:pre-tool-use", message)
        log_event("PreToolUseWarning", {"tool": str(data.get("tool_name", "")), "warnings": warnings[:4]})
        emit(system_message(message))


if __name__ == "__main__":
    main()
