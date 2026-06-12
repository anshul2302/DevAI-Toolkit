from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database import Base


class PromptTemplate(Base):
    __tablename__ = "prompt_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, default="general")
    description = Column(String(500), nullable=True)
    template = Column(Text, nullable=False)
    variables = Column(Text, nullable=True)  # JSON string of variable names
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ConversionHistory(Base):
    __tablename__ = "conversion_history"

    id = Column(Integer, primary_key=True, index=True)
    tool_name = Column(String(100), nullable=False)
    input_summary = Column(String(500), nullable=True)
    output_summary = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
