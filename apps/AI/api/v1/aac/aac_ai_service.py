import base64
import requests
import os
import json
from uuid import uuid4
from pathlib import Path
from dotenv import load_dotenv
from .dto.aac_create_req import AacImageRequest

load_dotenv()

# 🔑 Gemini 호출 URL 및 키
GEMINI_IMAGE_API_URL = os.getenv("GEMINI_IMAGE_API_URL")
GMS_API_KEY = os.getenv("GMS_API_KEY")

# 📁 임시 저장 경로
TEMP_IMAGE_DIR = Path("apps/AI/static/temp")
TEMP_IMAGE_DIR.mkdir(parents=True, exist_ok=True)


def generate_preview_image(req: AacImageRequest) -> str:
    prompt = build_prompt(req)
    print(f"📨 프롬프트: {prompt}")

    response_json = call_gemini_image_api(prompt)

    # 🧠 Text + Image 응답 처리
    result = extract_gemini_image_and_text(response_json)
    base64_data = result["image_base64"]

    # 📦 임시 파일 저장
    filename = f"{uuid4().hex}.png"
    temp_path = TEMP_IMAGE_DIR / filename
    with open(temp_path, "wb") as f:
        f.write(base64.b64decode(base64_data))

    print(f"✅ 생성된 임시 파일 경로: {temp_path}")
    return f"/static/temp/{filename}"


def build_prompt(req: AacImageRequest) -> str:
    """
    요청 객체를 바탕으로 Gemini에 전달할 텍스트 프롬프트 생성
    """
    situation = req.situation
    action = req.action
    emotion = req.emotion or "neutral"
    reason = req.reason

    base_prompt = (
        f"Create a simple 2D emoji-style illustration in a clear AAC symbol format. "
        f"The background should visually represent the '{situation}' situation. "
        f"A person should be shown clearly performing the action '{action}', "
        f"with a facial expression that conveys the '{emotion}' emotion. "
        "Use soft outlines, flat and clean colors, and a consistent illustration style inspired by Korean AAC symbols. "
        "Avoid speech bubbles or text. The image should be intuitive and optimized for use in a real-time WebRTC speech therapy interface."
    )

    if reason:
        base_prompt += f" Additional context: {reason}."

    return base_prompt


def call_gemini_image_api(prompt: str) -> dict:
    """
    Gemini API 호출
    """
    headers = {"Content-Type": "application/json"}
    params = {"key": GMS_API_KEY}

    body = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "responseModalities": ["Text", "Image"]
        }
    }

    response = requests.post(GEMINI_IMAGE_API_URL, headers=headers, params=params, json=body)
    try:
        response.raise_for_status()
        print("📦 Gemini 응답 수신 완료")
        return response.json()
    except requests.exceptions.HTTPError as e:
        print(f"❌ Gemini API 호출 중 예외 발생: {e}")
        print(f"📩 응답 내용: {response.text}")
        raise


def extract_gemini_image_and_text(response_json: dict) -> dict:
    """
    Gemini 응답에서 텍스트와 이미지(base64)를 추출합니다.
    예외 발생 시 전체 응답을 출력하여 디버깅에 도움이 되도록 합니다.
    """
    candidates = response_json.get("candidates")
    if not candidates or "content" not in candidates[0]:
        print("⚠️ Gemini 응답에 'candidates.content' 구조가 없습니다. 전체 응답:\n", json.dumps(response_json, indent=2, ensure_ascii=False))
        raise ValueError("Gemini 응답에 'candidates[0].content' 필드가 없습니다.")

    parts = candidates[0]["content"].get("parts", [])
    if not parts:
        print("⚠️ 'candidates[0].content'에 'parts'가 없습니다. 전체 응답:\n", json.dumps(response_json, indent=2, ensure_ascii=False))
        raise ValueError("Gemini 응답에 'parts' 필드가 없습니다.")

    text_output = None
    image_base64 = None

    for part in parts:
        if "text" in part:
            text_output = part["text"]
        if "inlineData" in part and "data" in part["inlineData"]:
            image_base64 = part["inlineData"]["data"]

    if image_base64 is None:
        print("⚠️ 이미지 데이터가 없습니다. 전체 응답:\n", json.dumps(response_json, indent=2, ensure_ascii=False))
        raise ValueError("Gemini 응답에 이미지 데이터가 없습니다.")

    return {
        "text": text_output,
        "image_base64": image_base64
    }
