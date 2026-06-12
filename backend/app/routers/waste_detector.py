from fastapi import APIRouter
from pydantic import BaseModel
from app.services.waste_service import detect_waste

router = APIRouter()


class WasteInput(BaseModel):
    transcript: str
    model: str = "gpt-4o"


@router.post("/detect")
async def detect_waste_endpoint(body: WasteInput):
    if not body.transcript.strip():
        return {"error": "Transcript is empty"}
    result = detect_waste(body.transcript, body.model)
    return result
