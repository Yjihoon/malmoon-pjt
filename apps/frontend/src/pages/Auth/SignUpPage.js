import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AuthPages.css'; // 공통 인증 페이지 CSS 파일

// 새로 생성된 폼 컴포넌트 임포트
import TherapistSignUpForm from '../../components/forms/TherapistSignUpForm';
import UserSignUpForm from '../../components/forms/UserSignUpForm';

function SignUpPage() {
  const [userType, setUserType] = useState(null); // 'therapist' 또는 'user'

  const handleUserTypeSelect = (type) => {
    setUserType(type);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-form-card section-container">
        <h2 className="text-center mb-4">회원가입</h2>
        {!userType ? (
          <div className="signup-type-selection">
            <button
              className="btn-primary type-button"
              onClick={() => handleUserTypeSelect('therapist')}
            >
              치료사로 가입
            </button>
            <button
              className="btn-secondary type-button"
              onClick={() => handleUserTypeSelect('user')}
            >
              사용자로 가입
            </button>
          </div>
        ) : (
          <>
            {userType === 'therapist' ? (
              <TherapistSignUpForm />
            ) : (
              <UserSignUpForm />
            )}
            <div className="text-center mt-3">
              <button className="back-button" onClick={() => setUserType(null)}>
                &larr; 다시 선택하기
              </button>
            </div>
          </>
        )}
        <p className="auth-link-text text-center mt-4">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;