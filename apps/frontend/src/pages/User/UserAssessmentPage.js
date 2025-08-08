import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './UserAssessmentPage.css';

const wordListUnder7 = [
  { filename: '01_apple.png', label: '사과' },
  { filename: '02_book.png', label: '책' },
  { filename: '03_umbrella.png', label: '우산' },
  { filename: '04_watermelon.png', label: '수박' },
  { filename: '05_chick.png', label: '병아리' },
  { filename: '06_deer.png', label: '사슴' },
  { filename: '07_ladder.png', label: '사다리' },
  { filename: '08_lion.png', label: '사자' },
  { filename: '09_tree.png', label: '나무' },
  { filename: '10_banana.png', label: '바나나' },
];

const wordListOver7 = [
  { filename: '11_tiger.png', label: '호랑이' },
  { filename: '12_elephant.png', label: '코끼리' },
  { filename: '13_dragonfly.png', label: '잠자리' },
  { filename: '14_peach.png', label: '복숭아' },
  { filename: '15_motorcycle.png', label: '오토바이' },
  { filename: '16_airplane.png', label: '비행기' },
  { filename: '17_snail.png', label: '달팽이' },
  { filename: '18_tomato.png', label: '토마토' },
  { filename: '19_sunflower.png', label: '해바라기' },
  { filename: '20_rose.png', label: '장미' },
];

function UserAssessmentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [words, setWords] = useState([]);
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  useEffect(() => {
    if (user) {
      if (!user.birthDate) {
        return;
      }
      const age = calculateAge(user.birthDate);
      if (age <= 7) {
        setWords(wordListUnder7);
      } else {
        setWords(wordListOver7);
      }
    }
  }, [user]);

  const calculateAge = (birthDateString) => {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleStart = () => {
    if (words.length === 0) {
      alert('출제할 문제가 없습니다.');
      return;
    }
    setStarted(true);
    setCurrentIndex(0);
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setRecorded(true);
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
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
    setRecorded(false);
    setAudioBlob(null);
  };

  const handlePlayWordAudio = (filename) => {
    const baseName = filename.split('.')[0]; // ex: '01_apple'
    const audio = new Audio(`/voice/${baseName}.mp3`);
    audio.play().catch((err) => {
      console.error('음성 재생 실패:', err);
    });
  };

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
        <button className="btn-assessment btn-start" onClick={handleStart}>시작하기</button>
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
              disabled={!recorded}
            >
              다음 문제
            </button>
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
