#!/usr/bin/env python3
from __future__ import annotations

import shutil
from datetime import datetime
from pathlib import Path

from hook_lib import load_stdin_json, log_event


def main() -> None:
    data = load_stdin_json()
    transcript = data.get("transcript_path")
    trigger = str(data.get("trigger") or "auto")
    if not isinstance(transcript, str) or not transcript:
        return
    src = Path(transcript)
    if not src.exists():
        return
    backup_dir = Path("/tmp/codex-compact-backups")
    backup_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    dest = backup_dir / f"transcript-{trigger}-{stamp}.jsonl"
    shutil.copy2(src, dest)
    backups = sorted(backup_dir.glob("transcript-*.jsonl"), key=lambda p: p.stat().st_mtime, reverse=True)
    for old in backups[5:]:
        old.unlink(missing_ok=True)
    log_event("PreCompactBackup", {"backup": str(dest), "trigger": trigger})


if __name__ == "__main__":
    main()
