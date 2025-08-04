from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import PlainTextResponse, JSONResponse
from stt_openai import transcribe_with_openai_whisper1

app = FastAPI(title="STT API (OpenAI whisper-1)")

# FastAPI 서버 정상 작동중인지 확인하기 위한 경로
@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/stt", response_class=PlainTextResponse)
async def stt(file: UploadFile = File(...)):
    """
    Spring Boot에서 multipart/form-data로 전송된 음성 파일을 받아
    OpenAI whisper-1로 전사하고, 텍스트(plain text)로 반환.
    """
    try:
        # FastAPI UploadFile은 비동기 파일 객체. 동기 함수에 넘기려면 .file 사용
        text = transcribe_with_openai_whisper1(file.file, file.filename)
        return text.strip()
    except Exception as e:
        # 필요시 상세 로그 출력 후 500 반환
        raise HTTPException(status_code=500, detail=f"STT error: {str(e)}")

# # JSON 응답이 필요하면 아래 엔드포인트를 대신 사용해도 됨.
# @app.post("/stt_json")
# async def stt_json(file: UploadFile = File(...)):
#     try:
#         text = transcribe_with_openai_whisper1(file.file, file.filename)
#         return JSONResponse(content={"text": text})
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"STT error: {str(e)}")
