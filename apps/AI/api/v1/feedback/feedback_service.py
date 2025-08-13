import os, re, json
from typing import List, Tuple, Dict, Any
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
                "한국어로, 존댓말(~합니다) 체로 명료하게 설명해. "
                "학부모와 교사가 이해하기 쉬운 일상어로 쓰고, "
                "전문 용어를 써야 한다면 반드시 쉬운 표현으로 풀어 설명해(예: '끝소리가 잘 들리지 않습니다'). "
                "반드시 요구된 출력 형식(JSON Schema)만 반환해. "
                "평가와 예시는 오직 [데이터]에 주어진 원문/발화 텍스트만 근거로 삼아. "
                "새로운 예시나 임의 문장을 만들어 내지 마. "
                "전체 문장을 그대로 복사/붙여넣기 하지 말고, 인용이 필요하면 6글자 이내의 짧은 부분만 따옴표로 표시해. "
                "불필요한 머리말/코드블록/라벨을 덧붙이지 마."
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
                        "accuracy": {"type": "number"},                                     # 0~100
                        "evaluation": {"type": "string"},                                   # 1. 언어능력 평가
                        "strengths": {"type": "array", "items": {"type": "string"}},        # 2. 강점
                        "improvements": {"type": "array", "items": {"type": "string"}},     # 3. 개선 필요 영역
                        "recommendations": {"type": "array", "items": {"type": "string"}},  # 4. 제안사항
                    },
                      "required": ["accuracy", "evaluation", "strengths", "improvements", "recommendations"],
                    "additionalProperties": False,
                },
                # structured outputs에서 종종 필요한 필드. 미지원이면 제거해도 됨.
                "strict": True,
            },
        },
        "max_tokens": 900,
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

    r = requests.post(GMS_ENDPOINT, headers=headers, json=data, timeout=120)
    r.raise_for_status()
    content = r.json()["choices"][0]["message"]["content"]
    return content

# ✅ 새 파서: 보고서(JSON) 파싱 → dict
def _parse_feedback_report(content: str) -> Dict[str, Any]:
    # 코드블록 제거
    if content.strip().startswith("```"):
        content = re.sub(r"```[a-zA-Z]*\n?", "", content).rstrip("`").strip()

    # 1) JSON 시도
    try:
        obj = json.loads(content)
        # 필수 키 검증 및 정규화
        acc = _clamp_accuracy(float(obj["accuracy"]))
        evaluation = str(obj.get("evaluation", "")).strip()
        strengths = [str(x).strip() for x in obj.get("strengths", []) if str(x).strip()]
        improvements = [str(x).strip() for x in obj.get("improvements", []) if str(x).strip()]
        recommendations = [str(x).strip() for x in obj.get("recommendations", []) if str(x).strip()]

        return {
            "accuracy": acc,
            "evaluation": evaluation,
            "strengths": strengths,
            "improvements": improvements,
            "recommendations": recommendations,
        }
    except Exception:
        pass

    # 2) (최후수단) 레거시 포맷 정규식 파싱
    # - 정확도: "정확도: 87.5"
    # - 본문: '언어능력 평가/강점/개선 필요 영역/제안사항'은 없다면 통째로 feedback로 간주
    #   👉 이 경우 기존 인터페이스 유지 위해 strengths/improvements/recommendations는 빈 리스트
    m_acc = re.search(r"정확도\s*[:：]\s*([0-9]+(?:\.[0-9]+)?)\s*%?", content)
    acc = _clamp_accuracy(float(m_acc.group(1))) if m_acc else 0.0
    body = re.sub(r"^.*?피드백\s*[:：]\s*", "", content, flags=re.S) if "피드백" in content else content
    body = body.strip()

    return {
        "accuracy": acc,
        "evaluation": body,  # 섹션을 못 나눴을 때 전체를 평가문으로 둠
        "strengths": [],
        "improvements": [],
        "recommendations": [],
    }

def _compose_report_text(report: Dict[str, Any]) -> str:
    """
    보고서 dict -> 단일 문자열. (기존 Tuple[float, str] 인터페이스 유지용)
    """
    evaluation = report.get("evaluation", "").strip()

    def _bullets(items):
        return "\n".join(f"- {it}" for it in items) if items else "- (자료 부족)"

    strengths = _bullets(report.get("strengths", []))
    improvements = _bullets(report.get("improvements", []))
    recommendations = _bullets(report.get("recommendations", []))

    return (
        "1. 언어능력 평가\n\n"
        f"{evaluation}\n\n"
        "2. 강점\n\n"
        f"{strengths}\n\n"
        "3. 개선 필요 영역\n\n"
        f"{improvements}\n\n"
        "4. 제안사항\n\n"
        f"{recommendations}"
    )

def _clamp_accuracy(x: float) -> float:
    if x < 0: return 0.0
    if x > 100: return 100.0
    return x

# -------- 프롬프트 템플릿 --------

def _prompt_for_sentences(sentences: List[SentencePair], extra_context: str = "") -> str:
    """
    동화책 문장 기반 수업 평가 프롬프트
    - 실제 원문/발화 텍스트를 [데이터] 섹션에 태그로 포함
    - '새 예시 금지', '짧은 부분 인용만 허용'을 강하게 고정
    - 언어능력 평가는 300자 내외 + 근거 예시(문장쌍 번호와 짧은 인용) 1~2줄
    """
    prompt = (
        "아동의 낭독(STT)과 원문(정답)을 비교하여 0~100의 발화 정확도를 산출하고, "
        "다음 4개 섹션으로 보고서를 작성합니다. "
        "부모/교사가 바로 실천할 수 있는 제안을 포함합니다.\n\n"
        "[평가 기준]\n"
        "- 정확도 산출(0~100, 소수점 허용)\n"
        "- 언어능력 평가: 수용/표현의 균형, 발음의 또렷함, 문법 사용, 어휘 선택, 문맥 이해를 쉬운 표현으로 종합합니다. "
        "‘언어능력 평가’는 300자 내외(±15%)로 작성하고, 끝에 '근거 예시:' 1~2줄을 덧붙입니다.\n"
        "- 근거는 오직 [데이터]의 문장쌍에서만 발췌합니다. 새로운 예시를 만들지 않습니다. "
        "전체 문장을 그대로 복사하지 말고, 최대 6글자 이내의 짧은 부분만 따옴표로 인용합니다. "
        "근거는 문장쌍 번호를 함께 표기합니다(예: #1 '안녕'→'앙녕').\n"
        "- 강점/개선 필요/제안사항은 모두 일상어로 구체적으로 서술합니다.\n\n"
        "[출력 형식(JSON)]\n"
        '{'
        '"accuracy": <number>, '
        '"evaluation": "<string>", '
        '"strengths": ["<string>", "..."], '
        '"improvements": ["<string>", "..."], '
        '"recommendations": ["<string>", "..."]'
        '}\n\n'
        "[데이터]\n"
    )

    # 실제 텍스트를 태그로 제공 (모델이 참조할 수 있도록)
    for idx, s in enumerate(sentences, 1):
        prompt += (
            f"<PAIR index=\"{idx}\">\n"
            f"  <ORIG>{s.original}</ORIG>\n"
            f"  <STT>{s.stt}</STT>\n"
            f"</PAIR>\n"
        )

    if extra_context:
        prompt += f"\n[추가 문맥]\n{extra_context}\n"

    return prompt


def _prompt_for_words(words: List[WordsPair], extra_context: str = "") -> str:
    """
    초기진단(단어) 평가 프롬프트
    - 실제 목표/발화 텍스트를 [데이터] 섹션에 태그로 포함
    - '새 예시 금지', '짧은 부분 인용만 허용'을 강하게 고정
    - 언어능력 평가는 300자 내외 + 근거 예시(문항 번호와 짧은 인용) 1~2줄
    """
    prompt = (
        "아동의 단어 발화(STT)와 목표 단어를 비교하여 0~100의 발화 정확도를 산출하고, "
        "다음 4개 석션으로 보고서를 작성합니다. "
        "입력 텍스트를 그대로 전부 나열하지 않습니다.\n\n"
        "[평가 기준]\n"
        "- 정확도 산출(0~100)\n"
        "- 언어능력 평가: 발음의 또렷함, 소리 빠짐 여부, 소리 바뀜 경향, 단어 떠올리기의 수월함 등을 쉬운 표현으로 종합합니다. "
        "‘언어능력 평가’는 300자 내외(±15%)로 작성하고, 끝에 '근거 예시:' 1~2줄을 덧붙입니다.\n"
        "- 근거는 오직 [데이터]의 단어쌍에서만 발췌합니다. 새로운 예시를 만들지 않습니다. "
        "전체 단어를 그대로 복사하지 말고, 최대 6글자 이내의 짧은 부분만 따옴표로 인용합니다. "
        "근거는 문항 번호를 함께 표기합니다(예: #2 '사과'→'사가').\n"
        "- 강점/개선 필요/제안사항은 모두 일상어로 구체적으로 씁니다.\n\n"
        "[출력 형식(JSON)]\n"
        '{'
        '"accuracy": <number>, '
        '"evaluation": "<string>", '
        '"strengths": ["<string>", "..."], '
        '"improvements": ["<string>", "..."], '
        '"recommendations": ["<string>", "..."]'
        '}\n\n'
        "[데이터]\n"
    )

    for idx, w in enumerate(words, 1):
        prompt += (
            f"<ITEM index=\"{idx}\">\n"
            f"  <TARGET>{w.targetText}</TARGET>\n"
            f"  <STT>{w.sttText}</STT>\n"
            f"</ITEM>\n"
        )

    if extra_context:
        prompt += f"\n[추가 문맥]\n{extra_context}\n"

    return prompt


# -------- 실제 서비스 함수 --------
# (기존 인터페이스 유지: Tuple[float, str])

def generate_feedback_response(sentences: List[SentencePair]) -> Tuple[float, str]:
    """
    동화책 문장 기반 수업 피드백
    - 반환: (정확도, 보고서 본문 문자열)
    """
    prompt = _prompt_for_sentences(
        sentences,
        # 필요시 설문 요약/나이 등 추가 문맥 전달 가능
        extra_context=(
            "설문 결과 요약 예: 수용언어는 또래 수준, 표현언어에서 어미 표현과 단어 인출이 어려움으로 보고됨."
        ),
    )
    messages = _build_messages(prompt)
    content = _call_llm(messages)

    try:
        report = _parse_feedback_report(content)
        accuracy = float(report["accuracy"])
        feedback_text = _compose_report_text(report)  # 4섹션을 단일 문자열로 합치기
        return accuracy, feedback_text
    except Exception as e:
        snippet = content[:200].replace("\n", "\\n")
        raise ValueError(f"LLM_PARSE_ERROR: {e} | content_snippet='{snippet}'")

def generate_initial_feedback_response(words: List[WordsPair]) -> Tuple[float, str]:
    """
    초기진단(단어 기반) 피드백
    - 반환: (정확도, 보고서 본문 문자열)
    """
    prompt = _prompt_for_words(
        words,
        extra_context=(
            "초기진단 문항은 10개이며, 단어 인출·음운 오류·오류패턴 관찰에 중점을 둔다."
        ),
    )
    messages = _build_messages(prompt)
    content = _call_llm(messages)

    try:
        report = _parse_feedback_report(content)
        accuracy = float(report["accuracy"])
        feedback_text = _compose_report_text(report)
        return accuracy, feedback_text
    except Exception as e:
        snippet = content[:200].replace("\n", "\\n")
        raise ValueError(f"LLM_PARSE_ERROR: {e} | content_snippet='{snippet}'")