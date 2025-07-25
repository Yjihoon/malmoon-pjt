import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    setLoading(true);

    if (email === 'root@example.com' && password === 'rootpassword') {
      console.log('Mock Root Login Success!');
      await login({ userEmail: email, userType: 'therapist', name: '치료사' }); // 이름도 함께 저장
      setLoading(false);
      // 변경된 부분: 치료사 대시보드 -> 치료사 일정 페이지
      navigate('/therapist/mypage/schedule');
    } else if (email === 'user@example.com' && password === 'userpassword') {
      console.log('Mock User Login Success!');
      await login({ userEmail: email, userType: 'user', name: '사용자' }); // 이름도 함께 저장
      setLoading(false);
      // 변경된 부분: 사용자 대시보드 -> 사용자 일정 페이지
      navigate('/user/mypage/schedule');
    } else {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
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
            />
          </div>

          <button type="submit" className="btn-primary auth-submit-button" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <p className="auth-link-text">계정이 없으신가요? <Link to="/signup">회원가입</Link></p>
      </div>
    </div>
  );
}

export default LoginPage;