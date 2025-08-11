# apps/AI/api/v1/feedback/feedback_schema.py

from pydantic import BaseModel
from typing import List
from datetime import date

# Spring boot에서 동화책 읽기 피드백 요청 올 때 받을 데이터 (카멜케이스)
class SentencePair(BaseModel):
    sentenceId: int
    original: str
    stt: str

class FeedbackEvalRequest(BaseModel):
    childId: int
    date: date
    sentences: List[SentencePair]

# FastAPI에서 Spring boot로 응답해줄 때 줄 데이터
class FeedbackEvalResponse(BaseModel):
    accuracy: float
    feedbackText: str

# spring boot에서 초기진단 데이터 보낼 때 받을 데이터
class WordsPair(BaseModel):
    itemIndex: int
    targetText: str
    sttText: str

class InitialEvalRequest(BaseModel):
    words: List[WordsPair]

