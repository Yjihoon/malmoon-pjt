// src/pages/UserAssessmentPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import './UserAssessmentPage.css';

const wordListUnder7 = [
  { filename: '01_apple.png', label: '사과', targetText: 'apple' },
  { filename: '02_book.png', label: '책', targetText: 'book' },
  { filename: '03_umbrella.png', label: '우산', targetText: 'umbrella' },
  { filename: '04_watermelon.png', label: '수박', targetText: 'watermelon' },
  { filename: '05_chick.png', label: '병아리', targetText: 'chick' },
  { filename: '06_deer.png', label: '사슴', targetText: 'deer' },
  { filename: '07_ladder.png', label: '사다리', targetText: 'ladder' },
  { filename: '08_lion.png', label: '사자', targetText: 'lion' },
  { filename: '09_tree.png', label: '나무', targetText: 'tree' },
  { filename: '10_banana.png', label: '바나나', targetText: 'banana' },
];

const wordListOver7 = [
  { filename: '11_tiger.png', label: '호랑이', targetText: 'tiger' },
  { filename: '12_elephant.png', label: '코끼리', targetText: 'elephant' },
  { filename: '13_dragonfly.png', label: '잠자리', targetText: 'dragonfly' },
  { filename: '14_peach.png', label: '복숭아', targetText: 'peach' },
  { filename: '15_motorcycle.png', label: '오토바이', targetText: 'motorcycle' },
  { filename: '16_airplane.png', label: '비행기', targetText: 'airplane' },
  { filename: '17_snail.png', label: '달팽이', targetText: 'snail' },
  { filename: '18_tomato.png', label: '토마토', targetText: 'tomato' },
  { filename: '19_sunflower.png', label: '해바라기', targetText: 'sunflower' },
  { filename: '20_rose.png', label: '장미', targetText: 'rose' },
];

function UserAssessmentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); // 0-based
  const [words, setWords] = useState([]);
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  // 진단 서버 연동 상태
  const [attemptId, setAttemptId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [finishedData, setFinishedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // 마이크 스트림 참조(정리용)
  const streamRef = useRef(null);

  useEffect(() => {
    if (!user || !user.birthDate) return;
    const age = calculateAge(user.birthDate);
    if (age <= 7) setWords(wordListUnder7);
    else setWords(wordListOver7);
  }, [user]);

  const calculateAge = (birthDateString) => {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const getAgeGroup = () => {
    if (!user || !user.birthDate) return 'PRESCHOOL';
    return calculateAge(user.birthDate) <= 7 ? 'PRESCHOOL' : 'SCHOOLAGE';
  };

  const handleStart = async () => {
    if (words.length === 0) {
      alert('출제할 문제가 없습니다.');
      return;
    }
    setErrorMsg('');

    try {
      // 초기진단 시작
      const payload = {
        childId: user?.memberId ?? user?.id ?? 0, // 프로젝트 상황에 맞게 조정
        ageGroup: getAgeGroup(),
      };
      const res = await api.post('/diagnostic/attempts/start', payload);
      setAttemptId(res.data.attemptId);
      setStarted(true);
      setCurrentIndex(0);
    } catch (err) {
      console.error(err);
      setErrorMsg('초기진단 시작에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunks, { type: mimeType });
        setAudioBlob(blob);
        setRecorded(true);

        // 스트림 정리 (마이크 빨간불 꺼지도록)
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      setRecorded(false);
    } catch (err) {
      console.error('마이크 접근 오류:', err);
      alert('마이크 권한을 허용해주세요.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const uploadCurrentItem = async () => {
    if (!attemptId) { setErrorMsg('진단 세션이 없습니다.'); return false; }
    if (!recorded || !audioBlob) { setErrorMsg('녹음 파일이 없습니다.'); return false; }
    if (audioBlob.size < 2048) { setErrorMsg('녹음이 너무 짧습니다. 다시 녹음해주세요.'); return false; }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const itemIndex = currentIndex + 1;
      const targetText = words?.[currentIndex]?.label;
      if (!targetText) { setErrorMsg('현재 문항의 targetText가 없습니다.'); setSubmitting(false); return false; }

      // 파일 준비
      const mime = audioBlob.type || 'audio/webm';
      const ext = mime.includes('webm') ? 'webm'
                : (mime.includes('mp4') || mime.includes('mpeg')) ? 'mp4'
                : 'webm';
      const file = new File([audioBlob], `item-${itemIndex}.${ext}`, { type: mime });

      // ✅ 컨트롤러가 MultipartFile "file" 로 받으므로 오직 'file' 만!
      const form = new FormData();
      form.append('file', file);
      form.append('itemIndex', itemIndex);    // 숫자 그대로 넣어도 스프링이 변환
      form.append('targetText', targetText);

      // 디버그 로그
      for (const [k, v] of form.entries()) {
        console.log('FD', k, v instanceof File ? `${v.name} (${v.type}, ${v.size}B)` : v);
      }

      // URL에 쿼리스트링 붙이지 말기 (바디로만 보냄)
      await api.post(`/diagnostic/attempts/${attemptId}/items`, form);

      setSubmitting(false);
      return true;
    } catch (err) {
      console.error('uploadCurrentItem error:', {
        status: err?.response?.status,
        data: err?.response?.data,
      });
      setSubmitting(false);
      setErrorMsg('문항 제출에 실패했습니다. 네트워크 또는 서버 상태를 확인해주세요.');
      return false;
    }
  };


  const finishAttempt = async () => {
    try {
      // ⚠️ 서버 경로가 오탈자(attemtps)라면 아래 줄을 교체:
      // const res = await api.post(`/diagnostic/attemtps/${attemptId}/finish`);
      const res = await api.post(`/diagnostic/attempts/${attemptId}/finish`);
      setFinishedData(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('진단 종료에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleNext = async () => {
    if (submitting) return;
    if (!recorded || !audioBlob) {
      alert('녹음 후 다음으로 진행해주세요.');
      return;
    }

    const ok = await uploadCurrentItem();
    if (!ok) return;

    // 다음 문항으로 이동
    const nextIndex = currentIndex + 1;
    setRecorded(false);
    setAudioBlob(null);

    if (nextIndex < words.length) {
      setCurrentIndex(nextIndex);
    } else {
      // 마지막 문항 제출 완료 → 종료 API
      await finishAttempt();
    }
  };

  const handlePlayWordAudio = (filename) => {
    const baseName = filename.split('.')[0]; // ex: '01_apple'
    const audio = new Audio(`/voice/${baseName}.mp3`);
    audio.play().catch((err) => {
      console.error('음성 재생 실패:', err);
    });
  };

  // 결과 화면 렌더
  if (finishedData) {
    return (
      <div className="assessment-page">
        <div className="assessment-result">
          <h1 className="intro-title">진단 결과</h1>
          <p className="intro-description">
            총 정확도: <b>{finishedData.accuracy}%</b>
          </p>
          <div className="result-feedback">
            <h3>피드백</h3>
            <p>{finishedData.feedbackText}</p>
          </div>

          <button className="btn-assessment" onClick={() => navigate('/')}>
            홈으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-page">
      {!started ? (
        <div className="assessment-intro">
          <h1 className="intro-title">간이언어평가</h1>
          <p className="intro-description">
            의사소통장애(Communication disorder)는 발화, 인지의 문제로 인하여 의사소통에 어려움을 겪는 상태를 말합니다.
          </p>
          <p className="intro-description">
            간이언어평가는 개인의 발화 능력과 언어적 이해 및 표현 능력의 발달 수준을 간략하게 평가하여<br />
            언어 발달 지연이나 인지능력의 이상 여부를 신속히 식별하고 추가적인 정밀 평가나 치료 개입의 필요성을 판단하는 데 중점을 둔 검사입니다.
          </p>
          <p className="intro-subtext">
            사용자의 나이에 해당되는 간이언어평가를 진행할 수 있습니다.
          </p>
          {errorMsg && <p className="error-text">{errorMsg}</p>}
          <button className="btn-assessment btn-start" onClick={handleStart}>
            시작하기
          </button>
        </div>
      ) : (
        <div className="assessment-test">
          {words.length > 0 && currentIndex < words.length ? (
            <div className="question-section">
              <img
                src={`/images/assessment/${words[currentIndex].filename}`}
                alt={words[currentIndex].label}
                className="assessment-image"
              />

              {currentIndex < 10 && (
                <button
                  className="speaker-button"
                  onClick={() => handlePlayWordAudio(words[currentIndex].filename)}
                  title="음성 듣기"
                >
                  🔊 단어 듣기
                </button>
              )}

              <p>이 그림의 이름을 말해보세요!</p>

              {!recording ? (
                <button
                  className="assessment-button start-recording-btn"
                  onClick={handleStartRecording}
                  disabled={submitting}
                >
                  녹음 시작
                </button>
              ) : (
                <button
                  className="assessment-button stop-recording-btn"
                  onClick={handleStopRecording}
                >
                  녹음 중지
                </button>
              )}

              <button
                className="assessment-button next-button"
                onClick={handleNext}
                disabled={!recorded || submitting}
              >
                {submitting ? '업로드 중…' : currentIndex === words.length - 1 ? '제출 & 종료' : '다음 문제'}
              </button>

              {errorMsg && <p className="error-text">{errorMsg}</p>}
            </div>
          ) : (
            <p>모든 문제를 완료했습니다!</p>
          )}
        </div>
      )}
    </div>
  );
}

export default UserAssessmentPage;
