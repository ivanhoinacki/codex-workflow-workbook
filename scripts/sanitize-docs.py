#!/usr/bin/env python3
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
CHECK_PATHS = [
    ROOT / "README.md",
    ROOT / "docs",
    ROOT / "site/src",
    ROOT / "site/public/templates",
    ROOT / "scripts",
]

PRIVATE_VAULT_PARTS = ["Mobile", "Docu" + "ments", "iCloud~md~" + "obsidian", "Obsidian", "Docs"]

BLOCK_PATTERNS = [
    (re.compile("/" + "Users/"), "absolute macOS user path"),
    (re.compile("ivan" + "hoinacki", re.IGNORECASE), "personal username"),
    (
        re.compile(
            PRIVATE_VAULT_PARTS[0]
            + " "
            + PRIVATE_VAULT_PARTS[1]
            + "|"
            + PRIVATE_VAULT_PARTS[2]
            + "|"
            + PRIVATE_VAULT_PARTS[3]
            + PRIVATE_VAULT_PARTS[4]
        ),
        "personal vault path",
    ),
    (re.compile(r"xox[baprs]-", re.IGNORECASE), "Slack token"),
    (re.compile(r"(JIRA|CONFLUENCE|DD|SLACK)_(?!SITE)[A-Z_]*=(?!\"REPLACE_ME\")\"[^\"]+\""), "non-placeholder secret env var"),
    (re.compile(r"postgresql://(?!(?:USER:PASSWORD|demo:demo)@)[^\\s\"']+"), "specific PostgreSQL URL"),
]


def iter_files():
    for base in CHECK_PATHS:
        if base.is_file():
            yield base
            continue
        for path in base.rglob("*"):
            if path.is_file() and "__pycache__" not in path.parts and path.name != Path(__file__).name:
                yield path


def main() -> int:
    findings: list[str] = []

    for path in sorted(set(iter_files())):
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue

        for index, line in enumerate(text.splitlines(), start=1):
            for pattern, label in BLOCK_PATTERNS:
                if pattern.search(line):
                    rel = path.relative_to(ROOT)
                    findings.append(f"{rel}:{index}: {label}")

    if findings:
        for finding in findings:
            print(f"FAIL: {finding}")
        return 1

    print("OK: no private paths or obvious secrets found")
    return 0


if __name__ == "__main__":
    sys.exit(main())
