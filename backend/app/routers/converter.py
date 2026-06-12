from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.services.converter_service import docx_to_markdown, txt_to_markdown, markdown_to_html

router = APIRouter()


class MarkdownInput(BaseModel):
    markdown: str


class TextInput(BaseModel):
    text: str


@router.post("/doc-to-markdown")
async def convert_doc_to_markdown(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    content = await file.read()
    ext = file.filename.rsplit(".", 1)[-1].lower()

    if ext == "docx":
        result = docx_to_markdown(content)
    elif ext == "txt":
        result = txt_to_markdown(content.decode("utf-8", errors="replace"))
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: .{ext}. Supported: .docx, .txt")

    return {"filename": file.filename, "markdown": result}


@router.post("/markdown-to-html")
async def convert_markdown_to_html(body: MarkdownInput):
    if not body.markdown.strip():
        raise HTTPException(status_code=400, detail="Markdown content is empty")

    html = markdown_to_html(body.markdown)
    return {"html": html}


@router.post("/txt-to-markdown")
async def convert_txt_to_markdown(body: TextInput):
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="Text content is empty")

    result = txt_to_markdown(body.text)
    return {"markdown": result}
