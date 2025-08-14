# stt_service_minimal.py
# - 변경 사항:
#   * webrtcvad 제거 → librosa RMS(에너지) 기반 VAD로 대체 (순수 파이썬/휠 설치만으로 동작)
# - 적용 포인트(동일):
#   1) 문장 단위(0.5~3.0s) 분절 후 세그먼트별 독립 호출
#   2) 보수적 디코딩: temperature=0, task="transcribe", language="ko"
#
# 필요 패키지: librosa, soundfile, numpy, requests, python-dotenv, fastapi

import os, io, requests
import numpy as np
import soundfile as sf
import librosa
from fastapi import UploadFile, HTTPException
from dotenv import load_dotenv
from .stt_schema import TranscribeOut

load_dotenv()
GMS_URL = os.getenv("GMS_STT_URL")
GMS_API_KEY = os.getenv("GMS_API_KEY")

# -----------------------------
# 1) RMS(에너지) 기반 문장 분절 함수
# -----------------------------
def _frames_to_flags(y: np.ndarray, sr: int,
                     frame_ms: int = 25,   # 분석 프레임 25ms
                     hop_ms: int = 10,     # 홉 10ms → 시간해상도
                     dyn_db_offset: float = 6.0,  # 동적 임계치(중앙값 + 6dB)
                     floor_db: float = -50.0      # 절대 하한(소음 바닥)
                     ):
    """
    webrtcvad 대신 RMS 에너지 기반 VAD.
    - librosa.feature.rms로 프레임별 에너지 계산 → dB로 변환 후 임계치 초과 구간을 '유성'으로 간주.
    - 임계치는 '중앙값 + dyn_db_offset'와 floor_db 중 더 높은 값으로 설정(환경 적응).
    반환: (유성/무성 플래그 리스트, hop(초))
    """
    # 프레임/홉 샘플 수
    frame_len = int(sr * (frame_ms / 1000.0))
    hop_len = int(sr * (hop_ms / 1000.0))
    if frame_len % 2 == 0:
        frame_len += 1  # librosa RMS의 안정성(창 길이 홀수 권장)

    # RMS 계산 (center=True로 프레임 중앙 정렬)
    rms = librosa.feature.rms(y=y, frame_length=frame_len, hop_length=hop_len, center=True)[0]
    # 0 보호
    rms = np.maximum(rms, 1e-10)
    # dB 스케일
    rms_db = librosa.amplitude_to_db(rms, ref=1.0)

    # 동적 임계치
    median_db = float(np.median(rms_db))
    thr_db = max(median_db + dyn_db_offset, floor_db)

    flags = (rms_db > thr_db).astype(bool).tolist()
    hop_sec = hop_len / sr
    return flags, hop_sec

def _merge_flags_to_segments(flags, step_sec: float,
                             min_len: float = 0.5, max_len: float = 3.0,
                             min_silence: float = 0.2):
    """
    유성/무성 플래그를 연속 구간으로 병합해 (start_sec, end_sec) 세그먼트 리스트 생성.
    - min_len: 너무 짧은 파편(0.5s 미만) 무시
    - max_len: 너무 긴 구간(3.0s 초과)은 3초 단위로 쪼갬
    - min_silence: 다음 세그먼트로 끊어줄 침묵 최소 길이(0.2s)
    """
    segs = []
    start = None
    silence_run = 0.0

    for idx, voiced in enumerate(flags):
        t = (idx + 1) * step_sec
        if voiced:
            if start is None:
                start = idx * step_sec
            silence_run = 0.0
        else:
            if start is not None:
                silence_run += step_sec
                if silence_run >= min_silence:
                    end = t - silence_run
                    if end - start >= min_len:
                        cur = start
                        while cur < end:
                            sub_end = min(cur + max_len, end)
                            if sub_end - cur >= min_len:
                                segs.append((cur, sub_end))
                            cur = sub_end
                    start = None
                    silence_run = 0.0

    # 파일 끝까지 유성이 이어진 경우 마무리
    if start is not None:
        end = len(flags) * step_sec
        if end - start >= min_len:
            cur = start
            while cur < end:
                sub_end = min(cur + max_len, end)
                if sub_end - cur >= min_len:
                    segs.append((cur, sub_end))
                cur = sub_end
    return segs

def _slice_to_wav_bytes(y: np.ndarray, sr: int, start_sec: float, end_sec: float) -> bytes:
    """
    numpy 오디오 배열의 구간을 잘라 BytesIO에 WAV로 기록하고 바이트를 반환.
    """
    s = max(0, int(round(start_sec * sr)))
    e = min(len(y), int(round(end_sec * sr)))
    if e <= s:
        e = min(len(y), s + int(0.2 * sr))  # 안전장치: 최소 0.2s
    clip = y[s:e]
    buf = io.BytesIO()
    sf.write(buf, clip, sr, format="WAV", subtype="PCM_16")
    buf.seek(0)
    return buf.read()

# -----------------------------
# 2) 보수적 디코딩으로 STT 호출
# -----------------------------
def _call_whisper_conservative(file_bytes: bytes, filename: str, language: str):
    """
    temperature=0(결정적), task=transcribe, language="ko"로 최소 보수화.
    프록시가 지원하면 condition_on_previous_text=False도 함께 전달.
    """
    if not GMS_API_KEY:
        raise HTTPException(status_code=500, detail="GMS_API_KEY is not set")
    if not GMS_URL:
        raise HTTPException(status_code=500, detail="GMS_STT_URL is not set")

    headers = {"Authorization": f"Bearer {GMS_API_KEY}"}
    files = {"file": (filename, file_bytes, "audio/wav")}
    data = {
        "model": "whisper-1",
        "task": "transcribe",
        "language": language or "ko",
        "temperature": 0,
        # "condition_on_previous_text": False,  # 프록시 지원 시 주석 해제
        # "best_of": 1,
        # "beam_size": 1,
        # "response_format": "json",
    }
    r = requests.post(GMS_URL, headers=headers, data=data, files=files, timeout=120)
    if r.status_code != 200:
        raise HTTPException(status_code=r.status_code, detail=r.text)
    return (r.json() or {}).get("text", "") or ""

# -----------------------------
# 3) 통합 엔드포인트
# -----------------------------
async def transcribe_to_text(file: UploadFile, language: str) -> TranscribeOut:
    """
    업로드된 오디오를 16kHz mono로 정규화 → RMS 기반 VAD로 문장 분절 →
    각 세그먼트를 보수적 디코딩으로 독립 STT → 결과를 순서대로 합칩니다.
    """
    try:
        raw = await file.read()
        # 어떤 포맷(wav/flac 등)이든 읽고 mono float32로
        data, sr = sf.read(io.BytesIO(raw), dtype="float32", always_2d=False)
        if data.ndim > 1:
            data = np.mean(data, axis=1)
        if sr != 16000:
            data = librosa.resample(data, orig_sr=sr, target_sr=16000)
            sr = 16000
        y = data
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Audio decode error: {e}")

    # (1) 문장 분절 (파라미터는 상황에 맞게 조정 가능)
    flags, step_sec = _frames_to_flags(
        y, sr,
        frame_ms=25,    # 20~30ms 권장
        hop_ms=10,      # 10ms 권장
        dyn_db_offset=6.0,
        floor_db=-50.0,
    )
    segments = _merge_flags_to_segments(
        flags, step_sec,
        min_len=0.5,    # 0.5s 미만 파편 제거
        max_len=3.0,    # 3s 초과 구간 쪼개기
        min_silence=0.2 # 0.2s 이상 침묵에서 절단
    )

    # 세그먼트가 하나도 없으면(무성/너무 조용) 전체를 1회 호출(마지막 보루)
    if not segments:
        wav_bytes = _slice_to_wav_bytes(y, sr, 0.0, len(y)/sr)
        text = _call_whisper_conservative(wav_bytes, file.filename or "audio.wav", language)
        return TranscribeOut(text=text.strip())

    # (2) 세그먼트별 독립 호출
    texts = []
    for i, (st, ed) in enumerate(segments, 1):
        wav_bytes = _slice_to_wav_bytes(y, sr, st, ed)
        seg_text = _call_whisper_conservative(wav_bytes, f"seg_{i}.wav", language)
        seg_text = seg_text.strip()
        if seg_text:
            texts.append(seg_text)

    # (3) 문장 사이 공백을 하나만 두고 합치기
    joined = " ".join(texts)
    return TranscribeOut(text=joined)
