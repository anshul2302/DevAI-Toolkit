import os
import json
import yaml
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class FileTreeInput(BaseModel):
    path: str
    max_depth: int = 3
    exclude_patterns: Optional[list[str]] = None


class FormatInput(BaseModel):
    content: str
    from_format: str  # json, yaml, xml
    to_format: str    # json, yaml


class SystemPromptInput(BaseModel):
    role: str
    expertise: list[str]
    tone: str = "professional"
    constraints: Optional[list[str]] = None
    output_format: Optional[str] = None
    examples: Optional[list[str]] = None


@router.post("/tree")
async def generate_file_tree(body: FileTreeInput):
    path = body.path
    if not os.path.isdir(path):
        raise HTTPException(status_code=400, detail=f"Directory not found: {path}")

    exclude = set(body.exclude_patterns or [
        "node_modules", ".git", "__pycache__", ".venv", "venv",
        "dist", "build", ".next", ".cache", "*.pyc",
    ])

    tree_lines = []
    _build_tree(path, "", body.max_depth, 0, exclude, tree_lines)
    tree_text = "\n".join(tree_lines)

    return {"tree": tree_text, "root": os.path.basename(path)}


@router.post("/format")
async def format_data(body: FormatInput):
    try:
        if body.from_format == "json":
            data = json.loads(body.content)
        elif body.from_format == "yaml":
            data = yaml.safe_load(body.content)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported input format: {body.from_format}")

        if body.to_format == "json":
            result = json.dumps(data, indent=2, ensure_ascii=False)
        elif body.to_format == "yaml":
            result = yaml.dump(data, default_flow_style=False, allow_unicode=True)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported output format: {body.to_format}")

        return {"formatted": result, "from": body.from_format, "to": body.to_format}
    except (json.JSONDecodeError, yaml.YAMLError) as e:
        raise HTTPException(status_code=400, detail=f"Parse error: {str(e)}")


@router.post("/system-prompt")
async def build_system_prompt(body: SystemPromptInput):
    parts = [f"You are a {body.role}."]

    if body.expertise:
        parts.append(f"You have deep expertise in: {', '.join(body.expertise)}.")

    tone_map = {
        "professional": "Maintain a professional and clear tone.",
        "casual": "Use a casual, friendly tone.",
        "academic": "Use an academic and precise tone with proper citations.",
        "concise": "Be extremely concise — use minimal words to convey maximum meaning.",
        "teaching": "Explain concepts as a patient teacher would, using analogies and examples.",
    }
    parts.append(tone_map.get(body.tone, f"Maintain a {body.tone} tone."))

    if body.constraints:
        parts.append("\nConstraints:")
        for c in body.constraints:
            parts.append(f"- {c}")

    if body.output_format:
        parts.append(f"\nAlways format your output as: {body.output_format}")

    if body.examples:
        parts.append("\nExamples of good responses:")
        for ex in body.examples:
            parts.append(f"- {ex}")

    prompt = "\n".join(parts)
    return {"system_prompt": prompt}


def _build_tree(path: str, prefix: str, max_depth: int, current_depth: int, exclude: set, lines: list):
    if current_depth > max_depth:
        return

    try:
        entries = sorted(os.listdir(path))
    except PermissionError:
        return

    dirs = []
    files = []
    for entry in entries:
        if entry in exclude or any(entry.endswith(pat.replace("*", "")) for pat in exclude if "*" in pat):
            continue
        full_path = os.path.join(path, entry)
        if os.path.isdir(full_path):
            dirs.append(entry)
        else:
            files.append(entry)

    items = dirs + files
    for i, item in enumerate(items):
        is_last = i == len(items) - 1
        connector = "└── " if is_last else "├── "
        full_path = os.path.join(path, item)

        if os.path.isdir(full_path):
            lines.append(f"{prefix}{connector}{item}/")
            next_prefix = prefix + ("    " if is_last else "│   ")
            _build_tree(full_path, next_prefix, max_depth, current_depth + 1, exclude, lines)
        else:
            lines.append(f"{prefix}{connector}{item}")
