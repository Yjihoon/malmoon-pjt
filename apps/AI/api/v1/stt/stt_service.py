import os, requests
from fastapi import UploadFile, HTTPException
from .stt_schema import TranscribeOut
from dotenv import load_dotenv

load_dotenv()

GMS_URL = "https://gms.ssafy.io/gmsapi/api.openai.com/v1/audio/transcriptions"
GMS_API_KEY = os.getenv("GMS_API_KEY")

async def transcribe_to_text(file: UploadFile, language: str) -> TranscribeOut:
    if not GMS_API_KEY:
        raise HTTPException(status_code=500, detail="GMS_API_KEY is not set")

    files = {
        "file": (file.filename, await file.read(), file.content_type or "application/octet-stream")
    }
    data = {
        "model": "whisper-1",
        "language": language,
        "response_format": "json"
    }
    headers = {"Authorization": f"Bearer {GMS_API_KEY}"}

    try:
        r = requests.post(GMS_URL, headers=headers, data=data, files=files, timeout=60)
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Proxy error: {e}")

    if r.status_code != 200:
        raise HTTPException(status_code=r.status_code, detail=r.text)

    result = r.json()
    return TranscribeOut(text=result.get("text", ""))
