#!/usr/bin/env python3
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
SITE = ROOT / "site"

ALLOWED_UNMAPPED_DOCS = {
    "Implementation-Plan.md",
    "Current-Handoff.md",
    "Site-Implementation-Plan.md",
    "Site-Journey-Model.md",
    "UX-Reference-Codex-Training-Room.md",
    "16-github-pages-workbook.md",
}


def fail(message: str):
    print(f"FAIL: {message}")
    return 1


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def strip_fenced_code(markdown: str) -> str:
    without_fences = re.sub(r"```[\s\S]*?```", "", markdown)
    return re.sub(r"`[^`\n]+`", "", without_fences)


def source_paths_from_journey_map() -> list[str]:
    journey_map = read(SITE / "src/content/journeyMap.ts")
    return [
        match.group(1)
        for match in re.finditer(
            r"page\(\s*'[^']+',\s*'[^']+',\s*'([^']+\.md)'",
            journey_map,
            re.MULTILINE,
        )
    ]


def main() -> int:
    errors: list[str] = []

    sources = source_paths_from_journey_map()
    docs_from_map = [src for src in sources if (DOCS / src).exists()]

    for src in sources:
        candidate = DOCS / src
        if not candidate.exists() and src.endswith(".md"):
            # Some question text contains SKILL.md. It is not a sourcePath.
            if "/" in src or src.startswith(("00-", "01-", "02-", "03-", "04-", "05-", "06-", "07-", "08-", "09-", "10-", "11-", "12-", "13-", "14-", "15-", "16-")):
                errors.append(f"missing mapped doc: {src}")

    for doc in sorted(DOCS.glob("*.md")):
        if doc.name not in docs_from_map and doc.name not in ALLOWED_UNMAPPED_DOCS:
            errors.append(f"unmapped doc: {doc.name}")

        text = read(doc)
        if not text.startswith("---\n"):
            errors.append(f"missing frontmatter: {doc.name}")

        for href in re.findall(r"\]\((templates/[^)]+)\)", text):
            if not (SITE / "public" / href).exists():
                errors.append(f"missing template link in {doc.name}: {href}")

        for wikilink in re.findall(r"\[\[([^\]|]+)", strip_fenced_code(text)):
            target = f"{wikilink}.md" if not wikilink.endswith(".md") else wikilink
            if not (DOCS / target).exists():
                title_target = "-".join(wikilink.lower().split()) + ".md"
                if not (DOCS / title_target).exists():
                    errors.append(f"unresolved wikilink in {doc.name}: [[{wikilink}]]")

    if errors:
        for error in errors:
            print(f"FAIL: {error}")
        return 1

    print(f"OK: {len(docs_from_map)} mapped docs validated")
    return 0


if __name__ == "__main__":
    sys.exit(main())
