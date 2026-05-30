#!/usr/bin/env python3
from __future__ import annotations

import datetime as _dt
import hashlib
import json
import os
import re
import sys
from pathlib import Path


HOME = Path.home()
CODEX_HOME = HOME / ".codex"
HOOK_DIR = CODEX_HOME / "hooks"
VAULT_ROOT = Path("/ABSOLUTE/PATH/TO/OBSIDIAN_VAULT")
LE_VAULT = VAULT_ROOT / "Luxury-Escapes"


def load_stdin_json() -> dict:
    try:
        raw = sys.stdin.read()
        if not raw.strip():
            return {}
        data = json.loads(raw)
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def emit(obj: dict) -> None:
    print(json.dumps(obj, ensure_ascii=False))


def context_output(event_name: str, context: str) -> dict:
    return {
        "hookSpecificOutput": {
            "hookEventName": event_name,
            "additionalContext": context,
        }
    }


def system_message(message: str) -> dict:
    return {"systemMessage": message}


def deny_output(reason: str, event_name: str = "PreToolUse") -> dict:
    return {
        "hookSpecificOutput": {
            "hookEventName": event_name,
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }


def utc_now() -> str:
    return _dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def session_key(data: dict) -> str:
    for key in ("session_id", "thread_id", "turn_id"):
        value = data.get(key)
        if isinstance(value, str) and value.strip():
            return re.sub(r"[^A-Za-z0-9_.-]", "_", value.strip())[:80]
    env_value = os.environ.get("CODEX_THREAD_ID") or os.environ.get("CODEX_SESSION_ID")
    if env_value:
        return re.sub(r"[^A-Za-z0-9_.-]", "_", env_value)[:80]
    return str(os.getppid())


def token_log(source: str, payload: str | bytes | int) -> None:
    try:
        if isinstance(payload, int):
            size = payload
        elif isinstance(payload, bytes):
            size = len(payload)
        else:
            size = len(payload.encode("utf-8"))
        path = Path(f"/tmp/codex-token-monitor-{os.getppid()}.jsonl")
        entry = {
            "ts": utc_now(),
            "source": source,
            "bytes": size,
            "tokens_est": size // 4,
        }
        with path.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception:
        pass


def log_event(event: str, payload: dict | None = None, suffix: str = "events") -> None:
    try:
        path = Path(f"/tmp/codex-{suffix}-{os.getppid()}.jsonl")
        if path.exists() and path.stat().st_size > 102400:
            lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()[-500:]
            path.write_text("\n".join(lines) + "\n", encoding="utf-8")
        entry = {"timestamp": utc_now(), "event": event}
        if payload:
            entry.update(payload)
        with path.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception:
        pass


def command_from_input(data: dict) -> str:
    tool_input = data.get("tool_input")
    if isinstance(tool_input, dict):
        for key in ("command", "cmd", "shell_command"):
            value = tool_input.get(key)
            if isinstance(value, str):
                return value
    for key in ("command", "cmd", "shell_command"):
        value = data.get(key)
        if isinstance(value, str):
            return value
    return ""


def tool_input(data: dict) -> dict:
    value = data.get("tool_input")
    return value if isinstance(value, dict) else {}


def cwd_from_input(data: dict) -> str:
    ti = tool_input(data)
    for key in ("cwd", "workdir", "current_working_directory"):
        value = ti.get(key) or data.get(key)
        if isinstance(value, str) and value:
            return value
    return os.getcwd()


def tracker_file(data: dict, name: str) -> Path:
    return Path(f"/tmp/codex-{name}-{session_key(data)}")


def hash_short(text: str) -> str:
    return hashlib.sha1(text.encode("utf-8")).hexdigest()[:12]


def service_context_for_cwd(cwd: str) -> str:
    if not cwd:
        return ""
    mappings = [
        (("svc-experiences", "svc-experiences--"), "CWD CONTEXT [svc-experiences]: TypeScript, TypeORM, PostgreSQL port 5439. Stack: Node.js, Express, BullMQ. DB tunnel: le-tunnel.sh -s svc-experiences -d svc_experiences -m ro. Query the LE vault with service_filter=\"svc-experiences\" for pitfalls and provider patterns."),
        (("svc-order", "svc-order--"), "CWD CONTEXT [svc-order]: TypeScript, Sequelize, PostgreSQL port 5436. Owns booking lifecycle, payments, refunds. DB tunnel: le-tunnel.sh -s svc-order -d svc_order -m ro. Query the LE vault with service_filter=\"svc-order\" for refund and promo business rules."),
        (("svc-car-hire", "svc-car-hire--"), "CWD CONTEXT [svc-car-hire]: TypeScript, Prisma, BullMQ. Provider: CartTrawler. Query the LE vault with service_filter=\"svc-car-hire\" for integration patterns."),
        (("svc-ee-offer", "svc-ee-offer--"), "CWD CONTEXT [svc-ee-offer]: Salesforce Connect, LED, Lux Everyday aliases. Syncs offer data to Salesforce. Query the LE vault with service_filter=\"svc-ee-offer\" for sync patterns."),
        (("www-le-customer", "www-le-customer--"), "CWD CONTEXT [www-le-customer]: Next.js customer frontend on port 3000. Query the LE vault with service_filter=\"www-le-customer\" for frontend patterns and gotchas."),
        (("www-le-admin", "www-le-admin--"), "CWD CONTEXT [www-le-admin]: React admin panel on port 3000 configured via .env, not process env var. Uncomment PORT=3000 in .env if commented. yarn dev starts Rspack build."),
        (("www-ee-admin", "www-ee-admin--"), "CWD CONTEXT [www-ee-admin]: React admin panel for Experiences on port 3001. Query the LE vault with service_filter=\"www-ee-admin\" for admin UI patterns."),
        (("svc-reporting", "svc-reporting--"), "CWD CONTEXT [svc-reporting]: Express finance reporting service on port 8088. Queries svc-order PostgreSQL directly, uses Bull queue and S3 for async CSV. yarn dev uses nodemon."),
        (("infra-le", "infra-le--"), "CWD CONTEXT [infra-le]: Pulumi infrastructure. Stacks: staging and prod only. Use le pulumi config set --secret KEY --stack staging. Use le-tunnel.sh, never le aws postgres directly."),
    ]
    normalized = cwd.replace("\\", "/")
    basename = Path(cwd).name
    for needles, context in mappings:
        if any(needle in normalized or basename.startswith(needle) for needle in needles):
            fail_state = Path(f"/tmp/worktree-setup-failed-{basename}")
            if fail_state.exists():
                reason = fail_state.read_text(encoding="utf-8", errors="ignore").strip() or "unknown"
                context += f"\nWORKTREE WARNING: yarn install failed in this worktree ({reason}). Run yarn install manually before proceeding."
            return context
    return ""


def compact_text(value, limit: int = 600) -> str:
    if value is None:
        return ""
    if isinstance(value, list):
        parts = []
        for item in value:
            if isinstance(item, dict):
                text = item.get("text") or item.get("input_text") or item.get("output_text")
                if isinstance(text, str):
                    parts.append(text)
            elif isinstance(item, str):
                parts.append(item)
        value = "\n".join(parts)
    elif not isinstance(value, str):
        value = str(value)
    value = re.sub(r"\s+", " ", value).strip()
    if len(value) > limit:
        return value[:limit] + "... [truncated]"
    return value
