#!/usr/bin/env python3
from __future__ import annotations

import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path


LOG = Path(f"/tmp/codex-worktree-setup.log")


def log(message: str) -> None:
    with LOG.open("a", encoding="utf-8") as fh:
        fh.write(f"[{datetime.utcnow().strftime('%H:%M:%SZ')}] {message}\n")


def git_root(path: Path) -> Path | None:
    try:
        result = subprocess.run(["git", "-C", str(path), "rev-parse", "--show-toplevel"], capture_output=True, text=True, timeout=10)
        if result.returncode == 0 and result.stdout.strip():
            return Path(result.stdout.strip())
    except Exception:
        return None
    return None


def main() -> int:
    if len(sys.argv) < 2:
        return 0
    worktree = Path(sys.argv[1]).expanduser()
    branch = sys.argv[2] if len(sys.argv) > 2 else "unknown"
    if not worktree.is_absolute():
        worktree = (Path.cwd() / worktree).resolve()
    if not worktree.exists():
        return 0
    root = git_root(worktree)
    if not root:
        return 0
    log(f"worktree-setup: path={worktree} branch={branch}")
    for env_name in (".env.local", ".env"):
        src = root / env_name
        dest = worktree / env_name
        if src.exists() and not dest.exists():
            try:
                shutil.copy2(src, dest)
                log(f"copied {env_name}")
            except Exception as exc:
                log(f"failed to copy {env_name}: {exc}")
    if (worktree / "package.json").exists():
        fail_state = Path(f"/tmp/worktree-setup-failed-{worktree.name}")
        fail_state.unlink(missing_ok=True)
        try:
            result = subprocess.run(["yarn", "install", "--frozen-lockfile", "--silent"], cwd=worktree, timeout=300)
            if result.returncode == 0:
                log("yarn install complete")
            else:
                fail_state.write_text(f"exit-{result.returncode}", encoding="utf-8")
                log(f"yarn install failed exit={result.returncode}")
        except subprocess.TimeoutExpired:
            fail_state.write_text("timeout", encoding="utf-8")
            log("yarn install timeout")
        except Exception as exc:
            fail_state.write_text("error", encoding="utf-8")
            log(f"yarn install error: {exc}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
