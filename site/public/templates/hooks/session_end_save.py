#!/usr/bin/env python3
from __future__ import annotations

import datetime as dt
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

from hook_lib import CODEX_HOME, HOOK_DIR, LE_VAULT, compact_text, load_stdin_json, log_event


MODEL = "qwen2.5-coder:14b"
OLLAMA_URL = "http://localhost:11434"
LOG = Path("/tmp/codex-session-end-save.log")


def log(message: str) -> None:
    with LOG.open("a", encoding="utf-8") as fh:
        fh.write(f"[{dt.datetime.now().strftime('%H:%M:%S')}] {message}\n")


def extract_text(content) -> str:
    return compact_text(content, 700)


def extract_context(path: Path) -> list[str]:
    messages: list[str] = []
    with path.open(encoding="utf-8", errors="ignore") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                item = json.loads(line)
            except json.JSONDecodeError:
                continue
            typ = item.get("type")
            payload = item.get("payload") if isinstance(item.get("payload"), dict) else {}

            if typ == "response_item" and payload.get("type") == "message":
                role = payload.get("role")
                if role not in ("user", "assistant"):
                    continue
                text = extract_text(payload.get("content"))
                if not text:
                    continue
                if text.startswith("<permissions instructions>") or text.startswith("<skills_instructions>"):
                    continue
                label = "USER" if role == "user" else "ASSISTANT"
                messages.append(f"{label}: {text}")
            elif typ in ("user", "assistant"):
                role = typ
                message = item.get("message")
                content = message.get("content") if isinstance(message, dict) else item.get("content")
                text = extract_text(content)
                if text and not text.startswith("<system-reminder>"):
                    label = "USER" if role == "user" else "ASSISTANT"
                    messages.append(f"{label}: {text}")
    return messages[-50:]


def ollama_available() -> bool:
    try:
        urllib.request.urlopen(f"{OLLAMA_URL}/api/tags", timeout=1).read()
        return True
    except Exception:
        return False


def call_ollama(prompt: str, max_tokens: int) -> str:
    payload = json.dumps({
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.3, "num_predict": max_tokens},
    }).encode("utf-8")
    req = urllib.request.Request(f"{OLLAMA_URL}/api/generate", data=payload, method="POST")
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=180) as response:
        data = json.loads(response.read().decode("utf-8"))
    return str(data.get("response", "")).strip()


def ensure_session_file(file_date: str) -> Path:
    session_dir = LE_VAULT / "Knowledge-Base" / "Session-Memory"
    session_dir.mkdir(parents=True, exist_ok=True)
    session_file = session_dir / f"{file_date}.md"
    if not session_file.exists():
        session_file.write_text(f"---\ndate: {file_date}\ntype: session-memory\n---\n\n# Session Memory - {file_date}\n", encoding="utf-8")
    return session_file


def already_processed(session_id: str) -> bool:
    processed = HOOK_DIR / ".processed-sessions"
    if not processed.exists():
        return False
    needle = session_id[:8]
    return any(line.strip() == needle or line.strip() == session_id for line in processed.read_text(encoding="utf-8", errors="ignore").splitlines())


def mark_processed(session_id: str) -> None:
    processed = HOOK_DIR / ".processed-sessions"
    processed.parent.mkdir(parents=True, exist_ok=True)
    with processed.open("a", encoding="utf-8") as fh:
        fh.write(session_id[:8] + "\n")


def session_id_from_path(path: Path) -> str:
    name = path.stem
    match = re.search(r"([0-9a-f]{8}-[0-9a-f-]{27,})$", name)
    if match:
        return match.group(1)
    return name[-36:]


def newest_session_file(session_id: str) -> Path | None:
    sessions_dir = CODEX_HOME / "sessions"
    if not sessions_dir.exists():
        return None
    candidates: list[tuple[float, Path]] = []
    prefix = session_id[:8] if session_id else ""
    for path in sessions_dir.rglob("*.jsonl"):
        try:
            stat = path.stat()
        except OSError:
            continue
        if stat.st_size < 2048:
            continue
        if prefix and prefix not in path.name:
            continue
        candidates.append((stat.st_mtime, path))
    if not candidates and not session_id:
        for path in sessions_dir.rglob("*.jsonl"):
            try:
                stat = path.stat()
            except OSError:
                continue
            if stat.st_size >= 2048:
                candidates.append((stat.st_mtime, path))
    if not candidates:
        return None
    candidates.sort(reverse=True, key=lambda item: item[0])
    return candidates[0][1]


def resolve_invocation() -> tuple[Path | None, str]:
    if len(sys.argv) >= 3:
        return Path(sys.argv[1]), sys.argv[2]
    data = load_stdin_json()
    transcript_value = ""
    for key in ("transcript_path", "transcript", "session_path", "path"):
        value = data.get(key)
        if isinstance(value, str) and value:
            transcript_value = value
            break
    session_id = ""
    for key in ("session_id", "thread_id", "conversation_id"):
        value = data.get(key)
        if isinstance(value, str) and value:
            session_id = value
            break
    transcript = Path(transcript_value) if transcript_value else newest_session_file(session_id)
    if transcript and not session_id:
        session_id = session_id_from_path(transcript)
    return transcript, session_id


def main() -> int:
    transcript, session_id = resolve_invocation()
    if not transcript or not session_id:
        log("Session-end save skipped: no transcript/session id")
        return 0
    log("---")
    log(f"Session-end save started: {transcript} session={session_id[:8]}")
    if already_processed(session_id):
        log("Already processed, skipping")
        return 0
    if not transcript.exists() or transcript.stat().st_size < 2048:
        log("Transcript missing or too small, skipping")
        return 0

    messages = extract_context(transcript)
    log(f"Extracted {len(messages)} messages")
    if len(messages) < 3:
        log("Too few messages, skipping")
        return 0

    file_date = dt.datetime.fromtimestamp(transcript.stat().st_mtime).strftime("%Y-%m-%d")
    context = "\n".join(messages)
    summary_prompt = f"""You are a session summarizer for the user, a senior engineer at Luxury Escapes.
Summarize this Codex conversation into a Session-Memory entry.

Rules:
- Output ONLY markdown
- Use English for all descriptions
- Be concise: max 3-5 bullets per section
- Include file paths, PR numbers, ticket numbers when mentioned
- Capture why decisions were made

Format:

## Session (brief 3-5 word topic)

### What Was Done
- bullet points

### Decisions
- decisions taken, omit if none

### Pending
- pending items, omit if none

### Modified Files
- file paths changed, omit if none

Conversation:
{context}
"""
    available = ollama_available()
    response = ""
    if available:
        try:
            response = call_ollama(summary_prompt, 1024)
        except Exception as exc:
            log(f"Ollama summary failed: {exc}")
    if not response:
        response = "## [UNPROCESSED] Session " + session_id[:8] + "\n\n_Ollama was unavailable. Raw excerpt saved for reprocessing._\n\n```\n" + "\n".join(messages[-20:]) + "\n```"

    session_file = ensure_session_file(file_date)
    with session_file.open("a", encoding="utf-8") as fh:
        fh.write("\n" + response + f"\n\n_Auto-saved at {dt.datetime.now().strftime('%H:%M')} | session {session_id[:8]}_\n\n---\n")
    log(f"Session-Memory saved to {session_file}")
    mark_processed(session_id)

    if available:
        learnings_prompt = f"""Analyze this conversation and extract ONLY concrete, reusable technical learnings.
Output exactly NO_LEARNINGS if there are none.
Use English. Each learning must include What happened, Root cause, and Fix.

Conversation:
{context}
"""
        try:
            learnings = call_ollama(learnings_prompt, 1536)
        except Exception as exc:
            log(f"Learnings extraction failed: {exc}")
            learnings = ""
        if learnings and "NO_LEARNINGS" not in learnings:
            learnings_dir = LE_VAULT / "Knowledge-Base" / "Review-Learnings"
            learnings_dir.mkdir(parents=True, exist_ok=True)
            learnings_file = learnings_dir / f"Session-{file_date}-{session_id[:8]}.md"
            if not learnings_file.exists():
                learnings_file.write_text(f"---\ndate: {file_date}\ntype: review-learning\nsource: auto-extracted\nsession: {session_id[:8]}\n---\n\n{learnings}\n\n_Auto-extracted at {dt.datetime.now().strftime('%H:%M')} from session {session_id[:8]}_\n", encoding="utf-8")
                log(f"Review-Learnings saved to {learnings_file}")

    log("Done")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
