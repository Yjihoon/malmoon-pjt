import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// JWT 파싱 함수
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('❌ Failed to parse JWT:', e);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // ✅ 인증 로딩 상태
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('❌ Failed to parse user from localStorage:', e);
        localStorage.removeItem('currentUser');
      }
    }
    setIsAuthReady(true); // ✅ 초기화 완료 표시
  }, []);

  const login = async ({ userEmail, accessToken }) => {
    const decoded = parseJwt(accessToken);
    const rawType = decoded?.userType || decoded?.role || null;

    let userType;
    if (rawType === 'ROLE_CLIENT') userType = 'user';
    else if (rawType === 'ROLE_THERAPIST') userType = 'therapist';
    else userType = rawType?.toLowerCase();

    const userData = {
      userEmail,
      accessToken,
      userType,
    };

    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        userType: user?.userType || null,
        login,
        logout,
        isAuthReady, // ✅ 추가
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
