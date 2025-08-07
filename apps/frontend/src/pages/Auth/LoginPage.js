import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './AuthPages.css';

import { useAuth } from '../../contexts/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ✅ 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    // ✅ 비밀번호 유효성 검사 (6자 이상)
    if (password.trim().length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post(`/auth/login`, {
        email,
        password,
      });

      const { accessToken, memberId } = res.data; // 여기 수정함

      // 로그인 상태 저장
      await login({ userEmail: email, accessToken, memberId }); // 여기 수정함

      // 홈 또는 마이페이지 등으로 이동
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-form-card section-container">
        <h2>로그인</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">이메일 주소</label>
            <input
              type="email"
              id="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={30}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              maxLength={30}
            />
          </div>

          <button type="submit" className="btn-primary auth-submit-button" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <p className="auth-link-text">
          계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
