#!/usr/bin/env python3
from __future__ import annotations

from hook_lib import compact_text, command_from_input, load_stdin_json, log_event


def main() -> None:
    data = load_stdin_json()
    command = command_from_input(data)
    log_event("PermissionRequest", {
        "tool": str(data.get("tool_name") or "unknown"),
        "command": compact_text(command, 300),
    })


if __name__ == "__main__":
    main()
