import os
import requests
from dotenv import load_dotenv
from typing import List, Tuple
from apps.AI.api.v1.feedback.feedback_schema import SentencePair

load_dotenv()
GMS_API_KEY = os.getenv("GMS_API_KEY")
GMS_ENDPOINT = os.getenv("GMS_FEEDBACK_URL")
MODEL = "gpt-4o-mini"

def generate_feedback_response(sentences: List[SentencePair]) -> Tuple[float, str]:
    prompt = (
        "다음은 아동이 동화책 문장을 읽은 결과입니다.\n"
        "원문과 음성 인식 결과(STT)를 비교하여 발화 정확도를 0~100 사이의 숫자로 정량화하고, "
        "피드백을 다음과 같은 형식으로 아이의 발화와 원문을 근거로 들어 작성해주세요.\n"
        
        "오류자음:\n"
        "오류패턴:\n"
        "종합 언어능력 평가:\n\n"
        
        "출력 형식은 다음과 같아야 합니다:\n"
        "정확도: 87.5\n"
        "피드백: ~~~\n\n"
    )

    for s in sentences:
        prompt += f"- 원문: {s.original}\n  아동이 읽은 글(STT) : {s.stt}\n"

    messages = [
        {"role": "system", "content": "너는 아동 언어평가 전문가, 언어재활사야. 발음과 문장의 정확성을 평가하고 피드백을 작성해줘."},
        {"role": "user", "content": prompt}
    ]

    headers = {
        "Authorization": f"Bearer {GMS_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": MODEL,
        "messages": messages
    }

    response = requests.post(GMS_ENDPOINT, headers=headers, json=data)
    response.raise_for_status()
    content = response.json()["choices"][0]["message"]["content"]

    # 예시 응답: "정확도: 88.5\n피드백: 몇몇 단어의 발음이 부정확했습니다..."
    accuracy_line, feedback_line = content.strip().split("\n", 1)
    accuracy = float(accuracy_line.replace("정확도:", "").strip())
    feedback = feedback_line.replace("피드백:", "").strip()

    return accuracy, feedback