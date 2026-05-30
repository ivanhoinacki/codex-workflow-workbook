#!/usr/bin/env python3
from __future__ import annotations

import re
import shlex
import subprocess
from pathlib import Path

from hook_lib import command_from_input, load_stdin_json, log_event, tool_input, tracker_file


def command_succeeded(data: dict) -> bool:
    response = data.get("tool_response")
    if isinstance(response, dict):
        for key in ("exit_code", "returncode", "status"):
            value = response.get(key)
            if isinstance(value, int):
                return value == 0
            if isinstance(value, str) and value.lower() in ("success", "completed", "ok"):
                return True
    if isinstance(response, str):
        lowered = response.lower()
        if "process exited with code 0" in lowered or "exit_code\":0" in lowered:
            return True
    return True


def parse_worktree_add(command: str) -> tuple[str, str]:
    try:
        tokens = shlex.split(command)
    except ValueError:
        return "", ""
    if len(tokens) < 4 or tokens[:3] != ["git", "worktree", "add"]:
        return "", ""
    path = ""
    branch = "unknown"
    i = 3
    while i < len(tokens):
        token = tokens[i]
        if token in ("-b", "-B") and i + 1 < len(tokens):
            branch = tokens[i + 1]
            i += 2
            continue
        if token.startswith("-"):
            i += 1
            continue
        path = token
        break
    return path, branch


def main() -> None:
    data = load_stdin_json()
    tool = str(data.get("tool_name") or "")
    ti = tool_input(data)
    command = command_from_input(data)
    blob = " ".join([tool, command, str(ti)])

    if re.search(r"local-le-vault|query_vault|mcp__local-le-vault__query_vault", blob):
        tracker_file(data, "vault-queried").write_text("1\n", encoding="utf-8")
        log_event("VaultQueryObserved", {"tool": tool})

    skill_name = ti.get("skill") or ti.get("skill_name") or ti.get("name")
    if skill_name or tool.lower() == "skill":
        log_event("SkillUsed", {"skill": str(skill_name or "unknown")}, suffix="skills")

    if command and command_succeeded(data):
        path, branch = parse_worktree_add(command)
        if path:
            try:
                subprocess.Popen(
                    ["/usr/bin/python3", str(Path(__file__).with_name("worktree_setup.py")), path, branch],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    start_new_session=True,
                )
                log_event("WorktreeSetupQueued", {"path": path, "branch": branch})
            except Exception as exc:
                log_event("WorktreeSetupQueueFailed", {"path": path, "error": str(exc)})
        if re.search(r"\bgit\s+worktree\s+remove\b", command):
            log_event("WorktreeRemove", {"command": command})


if __name__ == "__main__":
    main()
