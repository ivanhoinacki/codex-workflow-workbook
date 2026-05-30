#!/usr/bin/env python3
from __future__ import annotations

import os
import re
import shutil
import subprocess
import time
from pathlib import Path

from hook_lib import (
    CODEX_HOME,
    HOOK_DIR,
    LE_VAULT,
    context_output,
    cwd_from_input,
    emit,
    load_stdin_json,
    log_event,
    service_context_for_cwd,
    token_log,
)


def session_id_from_path(path: Path) -> str:
    name = path.stem
    match = re.search(r"([0-9a-f]{8}-[0-9a-f-]{27,})$", name)
    if match:
        return match.group(1)
    return name[-36:]


def processed_ids() -> set[str]:
    path = HOOK_DIR / ".processed-sessions"
    if not path.exists():
        return set()
    return {line.strip() for line in path.read_text(encoding="utf-8", errors="ignore").splitlines() if line.strip()}


def queue_previous_sessions(data: dict) -> list[str]:
    sessions_dir = CODEX_HOME / "sessions"
    if not sessions_dir.exists():
        return []
    processed = processed_ids()
    current = str(data.get("session_id") or data.get("thread_id") or "")
    cutoff = time.time() - 18 * 3600
    candidates = []
    for path in sessions_dir.rglob("*.jsonl"):
        try:
            st = path.stat()
        except OSError:
            continue
        if st.st_mtime < cutoff or st.st_size < 2048:
            continue
        if time.time() - st.st_mtime < 120:
            continue
        sid = session_id_from_path(path)
        if current and current[:8] and sid.startswith(current[:8]):
            continue
        if sid[:8] in processed or sid in processed:
            continue
        candidates.append((st.st_mtime, path, sid))
    candidates.sort(reverse=True, key=lambda item: item[0])
    queued = []
    saver = HOOK_DIR / "session_end_save.py"
    for _, path, sid in candidates[:2]:
        try:
            subprocess.Popen(
                ["/usr/bin/python3", str(saver), str(path), sid],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True,
            )
            queued.append(sid[:8])
        except Exception as exc:
            log_event("SessionAutosaveQueueFailed", {"session": sid[:8], "error": str(exc)})
    return queued


def unprocessed_count() -> int:
    session_memory = LE_VAULT / "Knowledge-Base" / "Session-Memory"
    if not session_memory.exists():
        return 0
    count = 0
    for path in session_memory.rglob("*.md"):
        try:
            if "[UNPROCESSED]" in path.read_text(encoding="utf-8", errors="ignore"):
                count += 1
        except Exception:
            pass
    return count


def env_status() -> str:
    checks = []
    gh = shutil.which("gh")
    if gh:
        try:
            result = subprocess.run([gh, "auth", "status"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=2)
            checks.append("GitHub CLI: OK" if result.returncode == 0 else "GitHub CLI: installed, auth not confirmed")
        except Exception:
            checks.append("GitHub CLI: installed, auth not confirmed")
    else:
        checks.append("GitHub CLI: missing")
    checks.append("CircleCI: OK" if (Path.home() / ".circleci" / "cli.yml").exists() else "CircleCI: not configured")
    checks.append("AWS CLI: OK" if (Path.home() / ".aws" / "config").exists() else "AWS CLI: not configured")
    return "; ".join(checks)


def static_token_baseline(cwd: str) -> None:
    current = Path(cwd)
    for parent in (current, *current.parents):
        agents = parent / "AGENTS.md"
        if agents.exists():
            token_log("static:AGENTS.md", agents.stat().st_size)
            break
    for rules_dir in (CODEX_HOME / "rules", current / ".codex" / "rules"):
        if rules_dir.exists():
            for path in rules_dir.glob("*.rules"):
                try:
                    token_log(f"static:rule:{path.name}", path.stat().st_size)
                except Exception:
                    pass


def main() -> None:
    data = load_stdin_json()
    cwd = cwd_from_input(data)
    queued = queue_previous_sessions(data)
    static_token_baseline(cwd)

    parts = [
        "Codex local setup: use ~/.codex/skills and ~/.codex/hooks. Main vault: /ABSOLUTE/PATH/TO/OBSIDIAN_VAULT. Session-Memory lives at Luxury-Escapes/Knowledge-Base/Session-Memory; when the user asks to save/use memory, use the session-memory skill, append to today's file, or read recent entries before answering. For Luxury Escapes work, consult the vault or local-le-vault before source edits. Ask before destructive git actions, production-impacting commands, or writes to Slack, Jira, Confluence, Datadog, CI/CD, or infrastructure.",
    ]
    cwd_ctx = service_context_for_cwd(cwd)
    if cwd_ctx:
        parts.append(cwd_ctx)
    if queued:
        parts.append("Session autosave queued previous Codex session(s): " + ", ".join(queued) + ". Log: /tmp/codex-session-end-save.log.")
    unresolved = unprocessed_count()
    if unresolved:
        parts.append(f"Session-Memory warning: {unresolved} file(s) still contain [UNPROCESSED] entries, usually because Ollama was unavailable.")
    parts.append("Environment check: " + env_status() + ".")

    context = "\n".join(parts)
    token_log("hook:session-start", context)
    emit(context_output("SessionStart", context))


if __name__ == "__main__":
    main()
