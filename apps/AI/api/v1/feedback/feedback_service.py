import os, re, json
from typing import List, Tuple
import requests
from api.v1.feedback.feedback_schema import SentencePair, WordsPair
from dotenv import load_dotenv

load_dotenv()
GMS_API_KEY = os.getenv("GMS_API_KEY")
GMS_ENDPOINT = os.getenv("GMS_FEEDBACK_URL")
MODEL = "gpt-4o-mini"

# -------- 공통 유틸 --------

def _build_messages(prompt: str):
    return [
        {
            "role": "system",
            "content": (
                "너는 아동 언어평가 전문가(언어재활사)야. "
                "반드시 요구된 출력 형식만 반환해. "
                "입력 원문을 다시 나열하지 말고, 불필요한 문장/머리말/코드블록/설명도 포함하지 마."
            ),
        },
        {"role": "user", "content": prompt},
    ]

def _call_llm(messages) -> str:
    if not GMS_API_KEY or not GMS_ENDPOINT:
        raise RuntimeError("GMS_API_KEY 또는 GMS_FEEDBACK_URL이 설정되지 않았습니다.")

    headers = {"Authorization": f"Bearer {GMS_API_KEY}", "Content-Type": "application/json"}

    # 1순위: JSON Schema로 구조화 응답을 강제
    data = {
        "model": MODEL,
        "temperature": 0.2,
        "top_p": 0.1,
        "messages": messages,
        "response_format": {
            "type": "json_schema",
            "json_schema": {
                "name": "feedback_eval",
                "schema": {
                    "type": "object",
                    "properties": {
                        "accuracy": {"type": "number"},
                        "feedback": {"type": "string"},
                    },
                    "required": ["accuracy", "feedback"],
                    "additionalProperties": False,
                },
                # structured outputs에서 종종 필요한 필드. 미지원이면 제거해도 됨.
                "strict": True,
            },
        },
        "max_tokens": 500,
    }

    # ⚠️ 만약 GMS가 json_schema를 지원하지 않으면 위 block을 아래로 교체하세요:
    # data = {
    #     "model": MODEL,
    #     "temperature": 0.2,
    #     "top_p": 0.1,
    #     "messages": messages,
    #     "response_format": {"type": "json_object"},
    #     "max_tokens": 500,
    # }

    r = requests.post(GMS_ENDPOINT, headers=headers, json=data, timeout=60)
    r.raise_for_status()
    content = r.json()["choices"][0]["message"]["content"]
    return content

def _parse_accuracy_feedback(content: str) -> Tuple[float, str]:
    """
    1) JSON 먼저 시도
    2) 실패 시 정규식 fallback:
       - '정확도: 87.5' (퍼센트 기호 허용)
       - '피드백: ...' (멀티라인)
    """
    # 코드블록 제거 (```json ... ``` 등)
    if content.strip().startswith("```"):
        content = re.sub(r"```[a-zA-Z]*\n?", "", content).rstrip("`").strip()

    # 1) JSON 파싱 우선
    try:
        obj = json.loads(content)
        acc = float(obj["accuracy"])
        fb = str(obj["feedback"]).strip()
        return _clamp_accuracy(acc), fb
    except Exception:
        pass

    # 2) 정규식 파싱
    m_acc = re.search(r"정확도\s*[:：]\s*([0-9]+(?:\.[0-9]+)?)\s*%?", content)
    if not m_acc:
        raise ValueError(f"LLM_PARSE_ERROR: accuracy not found in content: {content[:120]}...")

    acc = float(m_acc.group(1))

    m_fb = re.search(r"피드백\s*[:：]\s*(.+)", content, flags=re.S)
    if m_fb:
        fb = m_fb.group(1).strip()
    else:
        # '피드백:' 라벨이 없다면 첫 줄 이후를 모두 피드백으로 간주 (최후의 보루)
        lines = [ln.strip() for ln in content.strip().splitlines() if ln.strip()]
        fb = "\n".join(lines[1:]).strip() if len(lines) > 1 else ""

    return _clamp_accuracy(acc), fb

def _clamp_accuracy(x: float) -> float:
    if x < 0: return 0.0
    if x > 100: return 100.0
    return x

# -------- 실제 서비스 함수 --------

def generate_feedback_response(sentences: List[SentencePair]) -> Tuple[float, str]:
    """
    동화책 문장 기반 수업 피드백
    """
    # 모델에 "입력 재나열 금지"를 강하게 명시 + 형식 고정
    prompt = (
        "아동의 낭독(STT)과 원문을 비교하여 발화 정확도를 0~100으로 산출하고,"
        " 간결한 피드백을 생성하세요.\n"
        "출력은 반드시 JSON으로, 다음 키만 포함하세요:\n"
        '{"accuracy": <number>, "feedback": "<string>"}\n'
        "※ 입력 문장들을 다시 나열하지 마세요.\n\n"
        "평가 시 고려 요소(참고): 오류자음, 오류패턴, 종합 언어능력 평가.\n\n"
    )

    for s in sentences:
        # 모델이 입력을 그대로 복제하는 것을 줄이기 위해 힌트만 줌 (필요시 그대로 유지)
        prompt += f"- 원문 vs STT 쌍 제공됨\n  원문: {s.original}\n  STT: {s.stt}\n"

    messages = _build_messages(prompt)

    content = _call_llm(messages)
    try:
        accuracy, feedback = _parse_accuracy_feedback(content)
        return accuracy, feedback
    except Exception as e:
        # 디버깅에 도움되도록 일부 내용 로그로 남기기
        snippet = content[:200].replace("\n", "\\n")
        raise ValueError(f"LLM_PARSE_ERROR: {e} | content_snippet='{snippet}'")

def generate_initial_feedback_response(words: List[WordsPair]) -> Tuple[float, str]:
    """
    초기진단(단어 기반) 피드백
    """
    prompt = (
        "아동의 낭독(STT)과 목표 단어를 비교하여 발화 정확도를 0~100으로 산출하고, "
        "간결한 피드백을 생성하세요.\n"
        "출력은 반드시 JSON으로, 다음 키만 포함하세요:\n"
        '{"accuracy": <number>, "feedback": "<string>"}\n'
        "※ 입력 단어들을 다시 나열하지 마세요.\n\n"
        "평가 시 고려 요소(참고): 오류자음, 오류패턴, 종합 언어능력 평가.\n\n"
    )

    for s in words:
        prompt += f"- 단어 쌍 제공됨\n  목표: {s.targetText}\n  STT: {s.sttText}\n"

    messages = _build_messages(prompt)

    content = _call_llm(messages)
    try:
        accuracy, feedback = _parse_accuracy_feedback(content)
        return accuracy, feedback
    except Exception as e:
        snippet = content[:200].replace("\n", "\\n")
        raise ValueError(f"LLM_PARSE_ERROR: {e} | content_snippet='{snippet}'")
