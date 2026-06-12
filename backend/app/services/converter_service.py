import io
import re
import markdown as md
from docx import Document


def docx_to_markdown(file_bytes: bytes) -> str:
    doc = Document(io.BytesIO(file_bytes))
    lines = []

    for para in doc.paragraphs:
        style_name = para.style.name.lower() if para.style else ""
        text = para.text.strip()
        if not text:
            lines.append("")
            continue

        if "heading 1" in style_name:
            lines.append(f"# {text}")
        elif "heading 2" in style_name:
            lines.append(f"## {text}")
        elif "heading 3" in style_name:
            lines.append(f"### {text}")
        elif "heading 4" in style_name:
            lines.append(f"#### {text}")
        elif "list bullet" in style_name:
            lines.append(f"- {text}")
        elif "list number" in style_name:
            lines.append(f"1. {text}")
        else:
            formatted = _apply_inline_formatting(para)
            lines.append(formatted)

    return "\n\n".join(lines)


def _apply_inline_formatting(para) -> str:
    parts = []
    for run in para.runs:
        text = run.text
        if not text:
            continue
        if run.bold and run.italic:
            text = f"***{text}***"
        elif run.bold:
            text = f"**{text}**"
        elif run.italic:
            text = f"*{text}*"
        if run.font.strike:
            text = f"~~{text}~~"
        parts.append(text)
    return "".join(parts) if parts else para.text


def txt_to_markdown(text: str) -> str:
    lines = text.split("\n")
    result = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            result.append("")
        else:
            result.append(stripped)
    return "\n\n".join(result)


def markdown_to_html(markdown_text: str) -> str:
    extensions = ["fenced_code", "codehilite", "tables", "toc", "nl2br"]
    html = md.markdown(markdown_text, extensions=extensions)
    styled_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #1a1a1a; }}
  h1, h2, h3 {{ border-bottom: 1px solid #eee; padding-bottom: 0.3em; }}
  code {{ background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }}
  pre {{ background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px; overflow-x: auto; }}
  pre code {{ background: none; color: inherit; padding: 0; }}
  table {{ border-collapse: collapse; width: 100%; }}
  th, td {{ border: 1px solid #ddd; padding: 8px 12px; text-align: left; }}
  th {{ background: #f8f8f8; }}
  blockquote {{ border-left: 4px solid #ddd; margin: 0; padding-left: 1rem; color: #666; }}
</style>
</head>
<body>
{html}
</body>
</html>"""
    return styled_html
