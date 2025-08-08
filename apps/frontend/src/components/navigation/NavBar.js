import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logoImage from '../../logoimage/logo.png'; // frontend 경로에 맞게 수정
import './NavBar.css';

function NavBar({ setCurrentCharacter, getRandomCharacter }) {
  const { isLoggedIn, userType, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDesktopDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  /*
  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);
  */

  // 링크 클릭 시 실행될 함수 (캐릭터 및 배경색 변경, 메뉴 닫기)
  const handleLinkClick = useCallback(() => {
    if (setCurrentCharacter && getRandomCharacter) {
      setCurrentCharacter(getRandomCharacter);
    }
    setIsDropdownOpen(false); // Close desktop dropdown
    setIsMobileMenuOpen(false); // Close mobile menu
  }, [setCurrentCharacter, getRandomCharacter]);

  return (
    <header className="navbar-wrapper">
      <div className="navbar">
        <Link to="/" className="logo-link" onClick={handleLinkClick}>
          <img src={logoImage} alt="말문 로고" className="logo" />
        </Link>

        <nav className="menu">
          <Link to="/guide" onClick={handleLinkClick}>안내</Link>
          {isLoggedIn ? (
            <>
              {/* 로그인 시 마이페이지 드롭다운과 로그아웃 버튼 */}
              <div className="dropdown" ref={dropdownRef}>
                <button type="button" className="dropdown-toggle" onClick={toggleDesktopDropdown} aria-expanded={isDropdownOpen}>
                  마이페이지
                </button>
                {isDropdownOpen && (
                  <div className="dropdown-menu" style={{ display: 'flex' }}>
                    <Link to={userType === 'therapist' ? "/therapist/mypage/info" : "/user/mypage/info"} onClick={handleLinkClick}>내 정보</Link>
                    <Link to={userType === 'therapist' ? "/therapist/mypage/manage" : "/user/mypage/matching"} onClick={handleLinkClick}>매칭</Link>
                    <Link to={userType === 'therapist' ? "/therapist/mypage/schedule" : "/user/mypage/schedule"} onClick={handleLinkClick}>치료 일정</Link>
                    {userType === 'therapist' && (
                      <Link to="/therapist/mypage/tools" onClick={handleLinkClick}>수업 도구 관리</Link>
                    )}
                    {userType === 'user' && (
                      <Link to="/assessment" onClick={handleLinkClick}>간이 언어 평가</Link>
                    )}
                    <div className="dropdown-divider"></div>
                    <Link to="#" onClick={() => { logout(); handleLinkClick(); }}>로그아웃</Link>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* 로그아웃 시 로그인 및 회원가입 버튼 */}
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
              <Link to={userType === 'therapist' ? "/therapist/mypage/manage" : "/user/mypage/matching"} onClick={handleLinkClick}>매칭</Link>
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