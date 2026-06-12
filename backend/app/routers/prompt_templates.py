import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import PromptTemplate

router = APIRouter()


class TemplateCreate(BaseModel):
    name: str
    category: str = "general"
    description: Optional[str] = None
    template: str
    variables: Optional[list[str]] = None


class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    template: Optional[str] = None
    variables: Optional[list[str]] = None


class TemplateRender(BaseModel):
    template_id: int
    variables: dict[str, str]


@router.get("/")
async def list_templates(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(PromptTemplate)
    if category:
        query = query.filter(PromptTemplate.category == category)
    templates = query.order_by(PromptTemplate.updated_at.desc()).all()
    return {"templates": [_to_dict(t) for t in templates]}


@router.post("/")
async def create_template(body: TemplateCreate, db: Session = Depends(get_db)):
    template = PromptTemplate(
        name=body.name,
        category=body.category,
        description=body.description,
        template=body.template,
        variables=json.dumps(body.variables) if body.variables else None,
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return _to_dict(template)


@router.get("/{template_id}")
async def get_template(template_id: int, db: Session = Depends(get_db)):
    template = db.query(PromptTemplate).filter(PromptTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return _to_dict(template)


@router.put("/{template_id}")
async def update_template(template_id: int, body: TemplateUpdate, db: Session = Depends(get_db)):
    template = db.query(PromptTemplate).filter(PromptTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    if body.name is not None:
        template.name = body.name
    if body.category is not None:
        template.category = body.category
    if body.description is not None:
        template.description = body.description
    if body.template is not None:
        template.template = body.template
    if body.variables is not None:
        template.variables = json.dumps(body.variables)

    db.commit()
    db.refresh(template)
    return _to_dict(template)


@router.delete("/{template_id}")
async def delete_template(template_id: int, db: Session = Depends(get_db)):
    template = db.query(PromptTemplate).filter(PromptTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    db.delete(template)
    db.commit()
    return {"message": "Template deleted"}


@router.post("/render")
async def render_template(body: TemplateRender, db: Session = Depends(get_db)):
    template = db.query(PromptTemplate).filter(PromptTemplate.id == body.template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    rendered = template.template
    for key, value in body.variables.items():
        rendered = rendered.replace(f"{{{{{key}}}}}", value)

    return {"rendered": rendered, "template_name": template.name}


def _to_dict(template: PromptTemplate) -> dict:
    return {
        "id": template.id,
        "name": template.name,
        "category": template.category,
        "description": template.description,
        "template": template.template,
        "variables": json.loads(template.variables) if template.variables else [],
        "created_at": template.created_at.isoformat() if template.created_at else None,
        "updated_at": template.updated_at.isoformat() if template.updated_at else None,
    }
