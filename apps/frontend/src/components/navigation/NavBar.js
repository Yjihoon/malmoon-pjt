import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logoImage from '../../logoimage/logo.png';
import './NavBar.css';

function NavBar({ setCurrentCharacter, getRandomCharacter }) {
  const { isLoggedIn, userType, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const handleLinkClick = useCallback(() => {
    if (setCurrentCharacter && getRandomCharacter) {
      setCurrentCharacter(getRandomCharacter);
    }
    setIsMobileMenuOpen(false);
  }, [setCurrentCharacter, getRandomCharacter]);

  return (
    <header className="navbar-wrapper">
      <div className="navbar">
        <Link to="/" className="logo-link" onClick={handleLinkClick}>
          <img src={logoImage} alt="말문 로고" className="logo" />
        </Link>

        <nav className="menu">
          <Link to="/guide" onClick={handleLinkClick}>이용안내</Link>

          {isLoggedIn ? (
            <>
              {/* 로그인 시 모든 메뉴를 항상 펼쳐서 보여줌 */}
              <Link to={userType === 'therapist' ? "/therapist/mypage/info" : "/user/mypage/info"} onClick={handleLinkClick}>내 정보</Link>
              <Link to={userType === 'therapist' ? "/therapist/mypage/matching" : "/user/mypage/matching"} onClick={handleLinkClick}>매칭</Link>
              <Link to={userType === 'therapist' ? "/therapist/mypage/schedule" : "/user/mypage/schedule"} onClick={handleLinkClick}>치료 일정</Link>
              {userType === 'therapist' && (
                <Link to="/therapist/mypage/tools" onClick={handleLinkClick}>수업 도구 관리</Link>
              )}
              {userType === 'user' && (
                <Link to="/assessment" onClick={handleLinkClick}>간이 언어 평가</Link>
              )}
              <Link to="#" onClick={() => { logout(); handleLinkClick(); }}>로그아웃</Link>
            </>
          ) : (
            <>
              <Link to="/login" onClick={handleLinkClick}>로그인</Link>
              <Link to="/signup" onClick={handleLinkClick}>회원가입</Link>
            </>
          )}
        </nav>

        <div className="menu-icon" onClick={toggleMobileMenu}>
          ☰
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="dropdown-menu-mobile">
          <Link to="/guide" onClick={handleLinkClick}>안내</Link>
          {isLoggedIn ? (
            <>
              <Link to={userType === 'therapist' ? "/therapist/mypage/info" : "/user/mypage/info"} onClick={handleLinkClick}>내 정보</Link>
              <Link to={userType === 'therapist' ? "/therapist/mypage/matching" : "/user/mypage/matching"} onClick={handleLinkClick}>매칭</Link>
              <Link to={userType === 'therapist' ? "/therapist/mypage/schedule" : "/user/mypage/schedule"} onClick={handleLinkClick}>치료 일정</Link>
              {userType === 'therapist' && (
                <Link to="/therapist/mypage/tools" onClick={handleLinkClick}>수업 도구 관리</Link>
              )}
              {userType === 'user' && (
                <Link to="/assessment" onClick={handleLinkClick}>간이 언어 평가</Link>
              )}
              <Link to="#" onClick={() => { logout(); handleLinkClick(); }}>로그아웃</Link>
            </>
          ) : (
            <>
              <Link to="/login" onClick={handleLinkClick}>로그인</Link>
              <Link to="/signup" onClick={handleLinkClick}>회원가입</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export default NavBar;
