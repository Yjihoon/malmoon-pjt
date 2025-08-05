import os
from typing import BinaryIO
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()  # .env 읽기 (없어도 동작)

# OpenAI SDK 클라이언트
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def transcribe_with_openai_whisper1(file_obj: BinaryIO, filename: str) -> str:
    """
    OpenAI whisper-1 모델로 STT 수행. file_obj는 바이너리 스트림(UploadFile.file 등).
    반환값: 추출된 텍스트(plain string)
    """
    # 업로드 포인터를 처음으로 이동
    try:
        file_obj.seek(0)
    except Exception:
        pass

    # OpenAI SDK는 file-like object를 받아들임
    # model="whisper-1" 로 전사
    result = client.audio.transcriptions.create(
        model="whisper-1",
        file=(filename, file_obj),  # (name, file-like) 형태로 전달
        language="ko",            # 확실히 한국어면 지정 가능 (선택)
        # prompt="동화 낭독 맥락",   # 도메인 힌트 제공 (선택)
        temperature=0.0,          # 보수적 전사 (선택)
        # response_format="json",   # 기본 json, 텍스트만 원하면 아래 main.py에서 가공
    )
    # SDK v1은 result.text에 전사 텍스트가 들어있음
    return result.text or ""
