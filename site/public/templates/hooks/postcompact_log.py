#!/usr/bin/env python3
from __future__ import annotations

from hook_lib import compact_text, load_stdin_json, log_event


def main() -> None:
    data = load_stdin_json()
    summary = compact_text(data.get("summary") or data.get("last_assistant_message") or "", 300)
    log_event("PostCompact", {"summary": summary})


if __name__ == "__main__":
    main()
