import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logoImage from '../../logoimage/logo.png';
import chatIcon from '../../assets/icons/chat-envelope.svg'; // ✅ 새 아이콘
import './NavBar.css';

// 아바타 경로 계산: 업로드 URL 우선, 없으면 /images/profile{n}.png + 버전 쿼리
const getAvatarSrc = (user) => {
  const ver = user?._avatarVer || 0;
  if (user?.profileImageUrl) return `${user.profileImageUrl}?v=${ver}`;
  const id = Number(user?.profile) || 1;
  return `/images/profile${id}.png?v=${ver}`;
};

// 닉네임 안전 추출(백업 체인)
const pickNickname = (u) =>
  u?.nickname ??
  u?.name ??
  (u?.email ? u.email.split('@')[0] : undefined);

function NavBar({ setCurrentCharacter, getRandomCharacter, onShowChat }) {
  const { isLoggedIn, userType, logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const handleLinkClick = useCallback(() => {
    if (setCurrentCharacter && getRandomCharacter) {
      setCurrentCharacter(getRandomCharacter);
    }
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [setCurrentCharacter, getRandomCharacter]);

  const avatarSrc = getAvatarSrc(user);
  const nickname = pickNickname(user);

  // 바깥 클릭/ESC로 프로필 드롭다운 닫기
  useEffect(() => {
    const onClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === 'Escape') setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  return (
    <header className="navbar-wrapper">
      <div className="navbar">
        {/* 로고 */}
        <Link to="/" className="logo-link" onClick={handleLinkClick}>
          <img src={logoImage} alt="말문 로고" className="logo" />
        </Link>

        {/* 가운데 메뉴(데스크톱) */}
        <nav className="menu">
          <Link to="/guide" onClick={handleLinkClick}>이용안내</Link>

          {!isLoggedIn ? (
            <>
              <Link to="/login" onClick={handleLinkClick}>로그인</Link>
              <Link to="/signup" onClick={handleLinkClick}>회원가입</Link>
            </>
          ) : (
            <>
              <Link
                to={userType === 'therapist' ? "/therapist/feedback" : "/user/mypage/matching"}
                onClick={handleLinkClick}
              >
                매칭
              </Link>
              <Link
                to={userType === 'therapist' ? "/therapist/mypage/schedule" : "/user/mypage/schedule"}
                onClick={handleLinkClick}
              >
                치료 일정
              </Link>
              {userType === 'therapist' && (
                <Link to="/therapist/mypage/tools" onClick={handleLinkClick}>수업 도구 관리</Link>
              )}
              {userType === 'user' && (
                <>
                  <Link to="/assessment" onClick={handleLinkClick}>간이 언어 평가</Link>
                  {/* ✅ 데스크톱에서는 아이콘으로 오른쪽에 따로 배치하므로 중앙 메뉴의 '채팅' 링크는 제거 */}
                </>
              )}
            </>
          )}
        </nav>

        {/* ✅ 우측 컨트롤(채팅 아이콘 + 프로필 드롭다운) */}
        <div className="right-controls">
          {isLoggedIn && (
            <button
              type="button"
              className="chat-icon-btn desktop-only"
              title="채팅"
              aria-label="채팅 열기"
              onClick={() => { onShowChat?.(); }}
            >
              <img src={chatIcon} alt="채팅 아이콘" />
            </button>
          )}

          {isLoggedIn && (
            <div
              ref={profileRef}
              className={`profile-menu desktop-only ${isProfileOpen ? 'open' : ''}`}
            >
              <button
                type="button"
                className="profile-trigger"
                aria-haspopup="menu"
                aria-expanded={isProfileOpen}
                aria-label="프로필 메뉴 열기"
                onClick={() => setIsProfileOpen((p) => !p)}
              >
                <img className="avatar" src={avatarSrc} alt="프로필 아바타" />
                {nickname && (
                  <div className="profile-greeting">
                    <div className="nickname">{nickname} 님</div>
                    <div className="welcome">환영합니다!</div>
                  </div>
                )}
                <span className="caret" aria-hidden="true">
                  {isProfileOpen ? '▲' : '▼'}
                </span>
              </button>

              <div className="profile-dropdown" role="menu">
                <Link
                  to={userType === 'therapist' ? "/therapist/mypage/info" : "/user/mypage/info"}
                  onClick={handleLinkClick}
                  className="profile-dropdown-item"
                  role="menuitem"
                >
                  내 정보
                </Link>
                <button
                  type="button"
                  className="profile-dropdown-item danger"
                  onClick={() => { logout(); handleLinkClick(); }}
                  role="menuitem"
                >
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 모바일 메뉴 아이콘 */}
        <div
          className={`menu-icon ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={toggleMobileMenu}
          role="button"
          aria-label="모바일 메뉴"
        >
          ☰
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {isMobileMenuOpen && (
        <div className="dropdown-menu-mobile">
          <Link to="/guide" onClick={handleLinkClick}>안내</Link>
          {isLoggedIn ? (
            <>
              <Link
                to={userType === 'therapist' ? "/therapist/mypage/info" : "/user/mypage/info"}
                onClick={handleLinkClick}
              >
                내 정보
              </Link>
              <Link
                to={userType === 'therapist' ? "/therapist/feedback" : "/user/mypage/matching"}
                onClick={handleLinkClick}
              >
                매칭
              </Link>
              <Link
                to={userType === 'therapist' ? "/therapist/mypage/schedule" : "/user/mypage/schedule"}
                onClick={handleLinkClick}
              >
                치료 일정
              </Link>
              {userType === 'therapist' && (
                <Link to="/therapist/mypage/tools" onClick={handleLinkClick}>수업 도구 관리</Link>
              )}
              {userType === 'user' && (
                <>
                  <Link to="/assessment" onClick={handleLinkClick}>간이 언어 평가</Link>
                  {/* ✅ 모바일에서는 메뉴 안에 '채팅' 유지 */}
                  <Link to="#" onClick={() => { onShowChat?.(); handleLinkClick(); }}>채팅</Link>
                </>
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
