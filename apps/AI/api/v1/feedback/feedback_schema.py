# apps/AI/api/v1/feedback/feedback_schema.py

from pydantic import BaseModel
from typing import List
from datetime import date

class SentencePair(BaseModel):
    sentence_id: int
    original: str
    stt: str

class FeedbackEvalRequest(BaseModel):
    child_id: int
    date: date
    sentences: List[SentencePair]

class FeedbackEvalResponse(BaseModel):
    accuracy: float
    feedback_text: str
