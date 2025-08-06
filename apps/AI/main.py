from typing import Union
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from apps.AI.api.v1.aac_create import aac_router
from apps.AI.api.v1.stt.stt_router import router as stt_router

from dotenv import load_dotenv
from pathlib import Path

# 환경변수 로딩
load_dotenv()

app = FastAPI()

# 정적 파일 서빙
app.mount("/static", StaticFiles(directory="apps/AI/static"), name="static")

# AAC 라우터 등록
app.include_router(aac_router.router, prefix="/api/v1/aacs", tags=["AAC"])
app.include_router(stt_router, prefix="/api/v1/stt", tags=["STT"])

@app.get("/")
def root():
    return {"message": "AI API is running"}

