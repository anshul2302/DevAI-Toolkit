from fastapi import APIRouter
from pydantic import BaseModel
from app.services.token_service import analyze_text, optimize_context, MODEL_PRICING, CONTEXT_WINDOWS

router = APIRouter()


class TextInput(BaseModel):
    text: str


class OptimizeInput(BaseModel):
    text: str
    target_tokens: int
    model: str = "gpt-4o"


@router.post("/count")
async def count_tokens_endpoint(body: TextInput):
    if not body.text.strip():
        return {"error": "Text is empty"}
    results = analyze_text(body.text)
    return {"results": results, "char_count": len(body.text), "word_count": len(body.text.split())}


@router.post("/optimize")
async def optimize_endpoint(body: OptimizeInput):
    result = optimize_context(body.text, body.target_tokens, body.model)
    return result


@router.get("/models")
async def get_models():
    models = []
    for name in MODEL_PRICING:
        models.append({
            "name": name,
            "input_price_per_1m": MODEL_PRICING[name]["input"],
            "output_price_per_1m": MODEL_PRICING[name]["output"],
            "context_window": CONTEXT_WINDOWS.get(name, 0),
        })
    return {"models": models}
