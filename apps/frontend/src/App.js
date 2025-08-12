import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useAuth } from './contexts/AuthContext';

import './App.css';

import NavBar from './components/navigation/NavBar';
import ChatModal from './components/modals/ChatModal';
import Footer from "./components/navigation/Footer";
import ProtectedRoute from './components/common/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import SignUpPage from './pages/Auth/SignUpPage';
import GuidePage from './pages/GuidePage';
import MyInfoPage from './pages/MyInfoPage';

import TherapistMyInfoPage from './pages/Therapist/MyPage/TherapistMyInfoPage';
import TherapistSchedulePage from './pages/Therapist/MyPage/TherapistSchedulePage';
import TherapistRegisterSchedulePage from './pages/Therapist/MyPage/TherapistRegisterSchedulePage';
import TherapistMatchingPage from './pages/Therapist/MyPage/TherapistMatchingPage';
import TherapistToolsPage from './pages/Therapist/MyPage/TherapistToolsPage';

import TherapistSessionRoom from './pages/Therapist/TherapistSessionRoom';
import TherapistFeedbackPage from './pages/Therapist/MyPage/TherapistFeedbackPage';

import TherapistBookingPage from './pages/User/Booking/TherapistBookingPage';
import UserMyInfoPage from './pages/User/MyPage/UserMyInfoPage';
import UserMatchingPage from './pages/User/MyPage/UserMatchingPage';
import UserSchedulePage from './pages/User/MyPage/UserSchedulePage';
import UserSessionRoom from './pages/User/UserSessionRoom';
import UserAssessmentPage from './pages/User/UserAssessmentPage';

import UserSignUp from './pages/signup/UserSignUp';
import TherapistSignUp from './pages/signup/TherapistSignUp';

import char1 from "./logoimage/char1.png";
import char5 from "./logoimage/char2.png";
import char2 from "./logoimage/char3.png";
import char3 from "./logoimage/char4.png";
import char4 from "./logoimage/char5.png";
import char6 from "./logoimage/char6.png";

/** 캐릭터 메타(고정 id로 관리) */
const characterData = [
  { id: "bear", src: char1, bgColor: "#f3eade" },
  { id: "duck", src: char2, bgColor: "#fff9c4" },
  { id: "wolf", src: char3, bgColor: "#eceff1" },
  { id: "dog", src: char4, bgColor: "#fffde7" },
  { id: "parrot", src: char5, bgColor: "#f1f8e9" },
  { id: "penguin", src: char6, bgColor: "#e3f2fd" },
];

/** 백엔드의 프로필 숫자(id) ↔ 프론트 캐릭터 id 매핑 (순서와 무관) */
const PROFILE_MAP = {
  1: "bear",
  5: "duck",
  2: "wolf",
  3: "dog",
  4: "parrot",
  6: "penguin",
};

const getRandomCharacter = (current) => {
  let next;
  do {
    const idx = Math.floor(Math.random() * characterData.length);
    next = characterData[idx];
  } while (current && next.id === current.id);
  return next;
};

const getCharacterByProfile = (profileNumber) => {
  const key = PROFILE_MAP[profileNumber];
  return characterData.find(c => c.id === key) || characterData[0];
};

function App() {
  const { isAuthReady, user } = useAuth();

  const [showChatModal, setShowChatModal] = useState(false);
  // 비로그인(게스트) 전용 랜덤 캐릭터 상태
  const [guestCharacter, setGuestCharacter] = useState(() => getRandomCharacter());

  const isLoggedIn = !!(user && user.accessToken);

  /** 게스트 전용 setter: 로그인 시에는 무시 (NavBar에서 호출해도 로그인 중엔 영향 없음) */
  const setCharacterIfGuest = (updater) => {
    if (isLoggedIn) return; // 로그인 시에는 배경 고정
    setGuestCharacter(prev =>
      typeof updater === 'function' ? updater(prev) : updater
    );
  };

  const handleShowChatModal = () => setShowChatModal(true);
  const handleCloseChatModal = () => setShowChatModal(false);

  if (!isAuthReady) return null;

  /** 최종 캐릭터 결정:
   *  - 로그인: user.profile 기반으로 항상 고정
   *  - 비로그인: guestCharacter(랜덤)
   */
  const effectiveCharacter = isLoggedIn
    ? getCharacterByProfile(user.profile)
    : guestCharacter;

  return (
    <div
      className="App"
      style={{
        "--app-bg-color": currentCharacter.bgColor,
        "--bg-character": `url(${currentCharacter.src})`,
      }}
    >
      <NavBar setCurrentCharacter={setCurrentCharacter} getRandomCharacter={getRandomCharacter} onShowChat={handleShowChatModal} /> {/* Passed onShowChat prop */}
      <main className="content">
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/info" element={<h1>안내</h1>} />
          <Route path="/test" element={<h1>간이 언어평가</h1>} />
          <Route path="/my-info" element={<MyInfoPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/signup/user" element={<UserSignUp />} />
          <Route path="/signup/therapist" element={<TherapistSignUp />} />

          {/* 치료사 전용 보호 라우트 */}
          <Route element={<ProtectedRoute allowedRoles={['therapist']} />}>
            <Route path="/therapist/mypage/info" element={<TherapistMyInfoPage />} />
            <Route path="/therapist/mypage/matching" element={<TherapistMatchingPage />} />
            <Route path="/therapist/mypage/manage" element={<TherapistFeedbackPage />} />
            <Route path="/therapist/mypage/tools" element={<TherapistToolsPage />} />
            <Route path="/therapist/mypage/schedule" element={<TherapistSchedulePage />} />
            <Route path="/therapist/mypage/schedule/:clientId" element={<TherapistSchedulePage />} />
            <Route path="/therapist/register-schedule" element={<TherapistRegisterSchedulePage />} />
            <Route path="/therapist/profile-settings" element={<h1>치료사 프로필 설정 페이지 (구현 예정)</h1>} />
            <Route path="/session/:roomId" element={<TherapistSessionRoom />} />
            <Route path="/therapist/feedback" element={<TherapistFeedbackPage />} />
          </Route>

          {/* 사용자 전용 보호 라우트 */}
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route path="/user/mypage/info" element={<UserMyInfoPage />} />
            <Route path="/user/mypage/matching" element={<UserMatchingPage />} />
            <Route path="/user/mypage/schedule" element={<UserSchedulePage />} />
            <Route path="/user/session" element={<UserSessionRoom />} />
            <Route path="/assessment" element={<UserAssessmentPage />} />
            <Route path="/user/profile-settings" element={<h1>사용자 프로필 설정 페이지 (구현 예정)</h1>} />
            <Route path="/user/booking/:therapistId" element={<TherapistBookingPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<h1>404: 페이지를 찾을 수 없습니다.</h1>} />
        </Routes>
      </main>

      <Footer />
      <ChatModal show={showChatModal} handleClose={handleCloseChatModal} />

      {/* ✅ 항상 맨 앞에 보이는 캐릭터 오버레이 (클릭 방해 없음) */}
      <div className="character-overlay" aria-hidden="true" />
    </div>
  );
}

export default App;
