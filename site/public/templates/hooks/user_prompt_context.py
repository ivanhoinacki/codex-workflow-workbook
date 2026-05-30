#!/usr/bin/env python3
from __future__ import annotations

import os
import json
import re
from pathlib import Path

from hook_lib import CODEX_HOME, context_output, cwd_from_input, deny_output, emit, load_stdin_json, log_event, service_context_for_cwd, token_log


CONFIG_PATH = CODEX_HOME / "config" / "domain-context.json"
MAX_INLINE_PROMPT_BYTES = 24000
MAX_INLINE_PROMPT_LINES = 220


def prompt_from_data(data: dict) -> str:
    for key in ("prompt", "user_prompt", "message", "input"):
        value = data.get(key)
        if isinstance(value, str):
            return value
    messages = data.get("messages")
    if isinstance(messages, list):
        parts = []
        for msg in messages:
            if isinstance(msg, dict):
                content = msg.get("content")
                if isinstance(content, str):
                    parts.append(content)
        return "\n".join(parts)
    return ""


def load_domain_config() -> dict:
    try:
        return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    except Exception as exc:
        log_event("DomainContextConfigFailed", {"path": str(CONFIG_PATH), "error": str(exc)})
        return {"domains": [], "prompt_rules": [], "cwd_prompt_rules": []}


def append_matching_rules(ctx: list[str], rules: list[dict], prompt: str, cwd: str = "") -> None:
    matched_groups: set[str] = set()
    for rule in rules:
        group = str(rule.get("exclusive_group") or "")
        if group and group in matched_groups:
            continue
        prompt_pattern = str(rule.get("prompt_pattern") or rule.get("pattern") or "")
        cwd_pattern = str(rule.get("cwd_pattern") or "")
        message = str(rule.get("message") or "")
        if not prompt_pattern or not message:
            continue
        if cwd_pattern and not re.search(cwd_pattern, cwd, re.IGNORECASE):
            continue
        if re.search(prompt_pattern, prompt, re.IGNORECASE):
            ctx.append(message)
            if group:
                matched_groups.add(group)


def main() -> None:
    data = load_stdin_json()
    prompt = prompt_from_data(data)
    if not prompt:
        return

    prompt_bytes = len(prompt.encode("utf-8"))
    prompt_lines = prompt.count("\n") + 1
    if prompt_bytes > MAX_INLINE_PROMPT_BYTES or prompt_lines > MAX_INLINE_PROMPT_LINES:
        reason = (
            "Large inline prompt blocked for token economy. Save the context in a file under the workspace "
            "and reference the absolute path instead. Suggested pattern: `please read /path/to/context.md and continue`."
        )
        token_log("hook:user-prompt-large-block", prompt_bytes)
        log_event("LargePromptBlocked", {"bytes": prompt_bytes, "lines": prompt_lines})
        emit(deny_output(reason, event_name="UserPromptSubmit"))
        return

    ctx: list[str] = []
    config = load_domain_config()
    cwd = cwd_from_input(data)

    append_matching_rules(ctx, config.get("domains", []), prompt)
    append_matching_rules(ctx, config.get("prompt_rules", []), prompt)
    append_matching_rules(ctx, config.get("cwd_prompt_rules", []), prompt, cwd)

    cwd_ctx = service_context_for_cwd(cwd)
    if cwd_ctx and cwd_ctx not in ctx:
        ctx.append(cwd_ctx)

    if ctx:
        text = "\n".join(ctx)
        token_log("hook:user-prompt-context", text)
        emit(context_output("UserPromptSubmit", text))


if __name__ == "__main__":
    main()
