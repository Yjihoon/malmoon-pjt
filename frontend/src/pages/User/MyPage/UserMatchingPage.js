import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Alert } from 'react-bootstrap';
import { useAuth } from '../../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import TherapistProfileModal from '../../../components/modals/TherapistProfileModal';

function UserMatchingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matchedTherapists, setMatchedTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 모달 관련 상태
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);

  useEffect(() => {
    const fetchMatchedTherapists = async () => {
      setLoading(true);
      setError('');
      try {
        const dummyTherapists = [
          {
            id: 'therapist1',
            name: '이재현 치료사',
            email: 'jh.lee@example.com',
            phone: '010-1234-0001',
            specialization: '음운/조음 치료',
            licenseNumber: 'LTC-12345',
            matchingDate: '2025-07-01',
            status: '치료 진행 중',
            education: '- ABC대학교 언어치료학과 졸업 (석사)',
            experience: '- XYZ 언어치료센터 (5년 근무, 책임 치료사)\n- Happy 아동병원 언어치료실 (3년 근무)',
            expertise: '- 아동 발달 지연, 조음 음운 장애, 유창성 장애'
          },
          {
            id: 'therapist2',
            name: '김민지 치료사',
            email: 'mj.kim@example.com',
            phone: '010-5678-0002',
            specialization: '언어 발달 지연',
            licenseNumber: 'LTC-67890',
            matchingDate: '2025-06-15',
            status: '상담 진행 중',
            education: '- 가나다대학교 언어치료학과 졸업 (학사)',
            experience: '- 꿈나무 언어치료센터 (4년 근무)',
            expertise: '- 언어 발달 지연, 학습 부진'
          },
        ];
        setMatchedTherapists(dummyTherapists);
      } catch (err) {
        setError('매칭된 치료사 정보를 불러오는 데 실패했습니다.');
        console.error('매칭 치료사 불러오기 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.userType === 'user') {
      fetchMatchedTherapists();
    } else {
      setLoading(false);
      setError('사용자 계정으로 로그인해야 매칭 정보를 볼 수 있습니다.');
    }
  }, [user]);

  // 프로필 모달 열기
  const handleShowProfileModal = (therapist) => {
    setSelectedTherapist(therapist);
    setShowProfileModal(true);
  };

  // 프로필 모달 닫기
  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setSelectedTherapist(null);
  };

  // 신청하기 버튼 클릭 핸들러
  const handleApply = (therapistId) => {
    navigate(`/user/booking/${therapistId}`); // 예약 페이지로 이동하며 치료사 ID 전달
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <p>매칭 정보를 불러오는 중입니다...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5 text-center">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!user || user.userType !== 'user') {
    return (
      <Container className="my-5 text-center">
        <Alert variant="warning">사용자만 접근할 수 있는 페이지입니다.</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5 main-container">
      <h2 className="text-center mb-4">나의 매칭 치료사</h2>
      <Row>
        <Col md={12}>
          <Card className="shadow-sm p-3 card-base">
            <Card.Body>
              {matchedTherapists.length === 0 ? (
                <Alert variant="info">현재 매칭된 치료사가 없습니다.</Alert>
              ) : (
                <ListGroup variant="flush">
                  {matchedTherapists.map(therapist => (
                    <ListGroup.Item key={therapist.id} className="mb-3 border rounded">
                      <Row className="align-items-center">
                        <Col md={6}>
                          <h5>{therapist.name}</h5>
                          <p className="mb-1">전문 분야: {therapist.specialization}</p>
                          <p className="mb-1">이메일: {therapist.email}</p>
                          <p className="mb-1">전화: {therapist.phone}</p>
                          <small className="text-muted">매칭일: {therapist.matchingDate} / 상태: {therapist.status}</small>
                        </Col>
                        <Col md={6} className="text-md-end">
                          <button 
                            className="btn-soft-secondary me-2 mb-2 mb-md-0"
                            onClick={() => handleShowProfileModal(therapist)}
                          >
                            프로필 보기
                          </button>
                          <button 
                            className="btn-soft-primary"
                            onClick={() => handleApply(therapist.id)}
                          >
                            신청하기
                          </button>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* TherapistProfileModal 컴포넌트 추가 */}
      <TherapistProfileModal
        show={showProfileModal}
        handleClose={handleCloseProfileModal}
        therapistProfile={selectedTherapist}
      />
    </Container>
  );
}

export default UserMatchingPage;