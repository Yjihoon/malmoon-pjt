import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // 사용자 정보 가져오기


function TherapistDashboardPage() {
  const { user } = useAuth(); // AuthContext에서 현재 로그인한 사용자 정보 가져오기 (이메일, 타입 등)

  return (
    <div className="page-container main-container">
      <h1 className="text-center">안녕하세요, {user?.userEmail} 치료사님!</h1> {/* user?.userEmail로 안전하게 접근 */}
      <p className="lead text-center">
        치료사님의 활동을 한눈에 확인하고 관리하세요.
      </p>

      <div className="dashboard-grid">
        {/* 매칭 관리 카드 */}
        <section className="section-container card-base">
          <h3>매칭 관리</h3>
          <p>
            새로운 매칭 요청을 확인하고, 매칭 상태를 관리할 수 있습니다.
          </p>
          <Link to="/therapist/mypage/matching" className="btn-soft-primary">
            매칭 보기
          </Link>
        </section>

        {/* 치료 일정 카드 */}
        <section className="section-container card-base">
          <h3>치료 일정</h3>
          <p>
            예정된 치료 일정을 확인하고, 새로운 일정을 추가/관리합니다.
          </p>
          <Link to="/therapist/mypage/schedule" className="btn-soft-info">
            일정 관리
          </Link>
        </section>

        {/* 수업 도구 관리 카드 */}
        <section className="section-container card-base">
          <h3>수업 도구 관리</h3>
          <p>
            언어 치료에 필요한 다양한 도구들을 업로드하고 관리할 수 있습니다.
          </p>
          <Link to="/manage-aac" className="btn-soft-primary">
            도구 관리
          </Link>
        </section>

        {/* 프로필 설정 카드 */}
        <section className="section-container card-base">
          <h3>프로필 설정</h3>
          <p>
            치료사 프로필 정보를 수정하고, 공개 여부를 설정합니다.
          </p>
          <Link to="/therapist/profile-settings" className="btn-soft-secondary">
            프로필 편집
          </Link>
        </section>
      </div>
    </div>
  );
}

export default TherapistDashboardPage;