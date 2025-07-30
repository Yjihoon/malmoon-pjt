from typing import Union
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from apps.AI.api.v1.aac_create import aac_router

app = FastAPI()

# 정적 파일 서빙
app.mount("/static", StaticFiles(directory="apps/AI/static"), name="static")

# AAC 라우터 등록
app.include_router(aac_router.router, prefix="/api/v1/aacs", tags=["AAC"])

@app.get("/")
def root():
    return {"message": "AI API is running"}
