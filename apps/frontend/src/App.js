import React, { useState, useCallback } from "react";
import {
  Route,
  Routes,
  Link,
  NavLink,
} from "react-router-dom";

import './App.css';

import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import SignUpPage from './pages/Auth/SignUpPage';
import GuidePage from './pages/GuidePage';
import MyInfoPage from './pages/MyInfoPage';



import NavBar from './components/navigation/NavBar';
import Footer from "./components/navigation/Footer";

// ProtectedRoute 컴포넌트 임포트
import ProtectedRoute from './components/common/ProtectedRoute';

// 마이페이지 - 내 정보 페이지 임포트
import TherapistMyInfoPage from './pages/Therapist/MyPage/TherapistMyInfoPage';


// 마이페이지 - 치료 일정 페이지 임포트
import TherapistSchedulePage from './pages/Therapist/MyPage/TherapistSchedulePage';


// 마이페이지 - 매칭 페이지 임포트
import TherapistMatchingPage from './pages/Therapist/MyPage/TherapistMatchingPage';
import TherapistToolsPage from './pages/Therapist/MyPage/TherapistToolsPage';
import TherapistSessionRoom from './pages/Therapist/TherapistSessionRoom';
import TherapistBookingPage from './pages/User/Booking/TherapistBookingPage';
import UserMyInfoPage from './pages/User/MyPage/UserMyInfoPage';
import UserMatchingPage from './pages/User/MyPage/UserMatchingPage';
import UserSchedulePage from './pages/User/MyPage/UserSchedulePage';


// 로고 이미지 import
import logoImage from "./logoimage/logo.png";

// 캐릭터 이미지 import
import char1 from "./logoimage/char1.png"; // 곰
import char2 from "./logoimage/char2.png"; // 오리
import char3 from "./logoimage/char3.png"; // 늑대
import char4 from "./logoimage/char4.png"; // 강아지
import char5 from "./logoimage/char5.png"; // 앵무새
import char6 from "./logoimage/char6.png"; // 펭귄

// 캐릭터 이미지와 그에 맞는 배경색을 하나의 묶음(객체)으로 관리
const characterData = [
  { id: "bear", src: char1, bgColor: "#f3eade" }, // 곰: 따뜻한 베이지
  { id: "duck", src: char2, bgColor: "#fff9c4" }, // 오리: 밝은 노랑
  { id: "wolf", src: char3, bgColor: "#eceff1" }, // 늑대: 차분한 회색
  { id: "dog", src: char4, bgColor: "#fffde7" }, // 강아지: 부드러운 크림색
  { id: "parrot", src: char5, bgColor: "#f1f8e9" }, // 앵무새: 연한 녹색
  { id: "penguin", src: char6, bgColor: "#e3f2fd" }, // 펭귄: 시원한 하늘색
];

// 현재 캐릭터와 다른 새로운 랜덤 캐릭터 객체를 선택하는 함수
const getRandomCharacter = (current) => {
  let newChar;
  do {
    const randomIndex = Math.floor(Math.random() * characterData.length);
    newChar = characterData[randomIndex];
  } while (current && newChar.id === current.id);
  return newChar;
};

function App() {
  // 메뉴 열림/닫힘 상태 관리
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 캐릭터의 이미지와 배경색 정보를 함께 상태로 관리
  const [currentCharacter, setCurrentCharacter] = useState(() =>
    getRandomCharacter()
  );

  // 햄버거 메뉴 토글 함수
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 링크 클릭 시 실행될 함수 (캐릭터 및 배경색 변경, 메뉴 닫기)
  const handleLinkClick = useCallback(() => {
    setCurrentCharacter(getRandomCharacter);

    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMenuOpen]);

  return (
        <div
          className="App"
          style={{
            "--app-bg-color": currentCharacter.bgColor,
            "--bg-character": `url(${currentCharacter.src})`,
          }}
        >
          <NavBar setCurrentCharacter={setCurrentCharacter} getRandomCharacter={getRandomCharacter} />

          <main className="content">
            <Routes>
              {/* 공개적으로 접근 가능한 라우트 */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/info" element={<h1>안내</h1>} />
              <Route path="/test" element={<h1>간이 언어평가</h1>} />
              <Route path="/my-info" element={<MyInfoPage />} />
              <Route path="/guide" element={<GuidePage />} />

              {/* 보호된 라우트 그룹 */}
              {/* 치료사만 접근 가능한 라우트 */}
              <Route element={<ProtectedRoute allowedRoles={['therapist']} />}>
                <Route path="/therapist/mypage/info" element={<TherapistMyInfoPage />} />
                <Route path="/therapist/mypage/matching" element={<TherapistMatchingPage />} />
                <Route path="/therapist/mypage/tools" element={<TherapistToolsPage />} />
                <Route path="/therapist/mypage/schedule" element={<TherapistSchedulePage />} />
                <Route path="/therapist/profile-settings" element={<h1>치료사 프로필 설정 페이지 (구현 예정)</h1>} />
                
                {/* ✨ 새로 추가: RTC 세션 룸 라우트 (치료사 전용) ✨ */}
                <Route path="/session/:roomId" element={<TherapistSessionRoom />} /> 
              </Route>

              {/* 사용자만 접근 가능한 라우트 */}
              <Route element={<ProtectedRoute allowedRoles={['user']} />}>
                <Route path="/user/mypage/info" element={<UserMyInfoPage />} />
                <Route path="/user/mypage/matching" element={<UserMatchingPage />} />
                <Route path="/user/mypage/schedule" element={<UserSchedulePage />} />
                <Route path="/assessment" element={<h1>간이 언어 평가 페이지 (구현 예정)</h1>} />
                <Route path="/user/profile-settings" element={<h1>사용자 프로필 설정 페이지 (구현 예정)</h1>} />
                <Route path="/user/booking/:therapistId" element={<TherapistBookingPage />} /> 
              </Route>

              {/* 존재하지 않는 경로 처리 (선택 사항) */}
              <Route path="*" element={<h1>404: 페이지를 찾을 수 없습니다.</h1>} />
            </Routes>
          </main>
          <Footer />
        </div>
  );
}

export default App;
