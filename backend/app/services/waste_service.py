import re
from app.services.token_service import count_tokens


def detect_waste(transcript: str, model: str = "gpt-4o") -> dict:
    lines = transcript.strip().split("\n")
    total_tokens = count_tokens(transcript, model)

    issues = []
    waste_tokens = 0

    # Detect repeated content
    seen_lines = {}
    for i, line in enumerate(lines):
        stripped = line.strip().lower()
        if len(stripped) < 5:
            continue
        if stripped in seen_lines:
            tokens = count_tokens(line, model)
            waste_tokens += tokens
            issues.append({
                "type": "duplicate",
                "line": i + 1,
                "original_line": seen_lines[stripped] + 1,
                "text": line.strip()[:100],
                "wasted_tokens": tokens,
                "suggestion": "Remove duplicate content — already present at line " + str(seen_lines[stripped] + 1),
            })
        else:
            seen_lines[stripped] = i

    # Detect excessive politeness / filler phrases
    filler_patterns = [
        (r"\b(please|kindly)\b.*\b(help|assist|provide)\b", "Unnecessary polite filler"),
        (r"\bthank you\b|\bthanks\b", "Gratitude tokens (unnecessary for AI)"),
        (r"\bsorry\b.*\b(but|if)\b", "Apologetic filler"),
        (r"\bI hope this (helps|makes sense)\b", "Filler phrase"),
        (r"\bAs an AI language model\b", "AI self-reference (prompt engineering issue)"),
        (r"\bsure,?\s*(I can|let me|here)\b", "Verbose agreement prefix"),
        (r"\bAbsolutely!?\s*", "Unnecessary affirmation"),
    ]

    for i, line in enumerate(lines):
        for pattern, desc in filler_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                tokens = count_tokens(line, model)
                waste_tokens += tokens
                issues.append({
                    "type": "filler",
                    "line": i + 1,
                    "text": line.strip()[:100],
                    "wasted_tokens": tokens,
                    "suggestion": f"{desc} — consider removing or rephrasing",
                })
                break

    # Detect overly long lines (potential verbosity)
    for i, line in enumerate(lines):
        tokens = count_tokens(line, model)
        if tokens > 200:
            issues.append({
                "type": "verbose",
                "line": i + 1,
                "text": line.strip()[:100] + "...",
                "wasted_tokens": max(0, tokens - 100),
                "suggestion": "Consider condensing this long passage",
            })
            waste_tokens += max(0, tokens - 100)

    # Detect re-stating of instructions
    instruction_keywords = ["you are", "your task is", "you should", "your role is"]
    instruction_lines = []
    for i, line in enumerate(lines):
        lower = line.lower()
        if any(kw in lower for kw in instruction_keywords):
            instruction_lines.append(i)

    if len(instruction_lines) > 1:
        for idx in instruction_lines[1:]:
            tokens = count_tokens(lines[idx], model)
            waste_tokens += tokens
            issues.append({
                "type": "repeated_instruction",
                "line": idx + 1,
                "text": lines[idx].strip()[:100],
                "wasted_tokens": tokens,
                "suggestion": "Instructions appear to be restated — consolidate into a single instruction block",
            })

    efficiency_score = max(0, round(100 - (waste_tokens / max(total_tokens, 1)) * 100, 1))

    return {
        "total_tokens": total_tokens,
        "waste_tokens": waste_tokens,
        "efficiency_score": efficiency_score,
        "issue_count": len(issues),
        "issues": issues,
        "summary": _generate_summary(issues, waste_tokens, total_tokens),
    }


def _generate_summary(issues: list, waste_tokens: int, total_tokens: int) -> str:
    if not issues:
        return "No significant waste detected. The transcript appears well-optimized."

    type_counts = {}
    for issue in issues:
        t = issue["type"]
        type_counts[t] = type_counts.get(t, 0) + 1

    parts = [f"Found {len(issues)} issue(s) wasting ~{waste_tokens} tokens ({round(waste_tokens/max(total_tokens,1)*100,1)}% of total)."]
    for t, count in type_counts.items():
        label = {"duplicate": "Duplicates", "filler": "Filler phrases", "verbose": "Verbose passages", "repeated_instruction": "Repeated instructions"}.get(t, t)
        parts.append(f"  - {label}: {count}")

    return "\n".join(parts)
