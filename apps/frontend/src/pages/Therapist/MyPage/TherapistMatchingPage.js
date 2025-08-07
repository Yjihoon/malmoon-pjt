import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import UserProfileModal from '../../../components/modals/UserProfileModal';
import RejectReasonModal from '../../../components/modals/RejectReasonModal';

function TherapistMatchingPage() {
  const { user } = useAuth();
  const [matchedClients, setMatchedClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 프로필 모달 관련 상태
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // 거절 사유 모달 관련 상태
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [clientToReject, setClientToReject] = useState(null);

  useEffect(() => {
    const fetchMatchedClients = async () => {
      setLoading(true);
      setError('');
      try {
        const dummyClients = [
          {
            id: 'client1',
            name: '김지아 (사용자)',
            email: 'jia.kim@example.com',
            phone: '010-1234-5678',
            childName: '김수민',
            childAge: 5,
            matchingDate: '2025-07-01',
            status: '상담 진행 중',
            assessmentResults: {
              phonologicalScore: 85,
              vocabularyScore: 70,
              notes: '김수민 어린이는 특정 발음(ㅅ, ㅈ)에서 오류를 보이며, 새로운 단어 습득에 시간이 다소 소요됩니다. 반복 학습이 필요합니다.'
            }
          },
          {
            id: 'client2',
            name: '박서준 (사용자)',
            email: 'seojun.park@example.com',
            phone: '010-9876-5432',
            childName: '박하은',
            childAge: 7,
            matchingDate: '2025-06-15',
            status: '치료 진행 중',
            assessmentResults: {
              phonologicalScore: 90,
              vocabularyScore: 80,
              notes: '박하은 어린이는 언어 이해력은 좋으나, 표현 어휘가 다소 부족합니다.'
            }
          },
          {
            id: 'client3',
            name: '이지원 (사용자)',
            email: 'jiwon.lee@example.com',
            phone: '010-1111-2222',
            childName: '이민준',
            childAge: 6,
            matchingDate: '2025-07-20',
            status: '매칭 완료',
            assessmentResults: {
              phonologicalScore: 75,
              vocabularyScore: 65,
              notes: '이민준 어린이는 발음과 어휘력 모두 평균 이하이며, 전반적인 언어 발달 지연이 관찰됩니다.'
            }
          },
        ];
        setMatchedClients(dummyClients);
      } catch (err) {
        setError('매칭된 클라이언트 정보를 불러오는 데 실패했습니다.');
        console.error('매칭 클라이언트 불러오기 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.userType === 'therapist') {
      fetchMatchedClients();
    } else {
      setLoading(false);
      setError('치료사 계정으로 로그인해야 매칭 정보를 볼 수 있습니다.');
    }
  }, [user]);

  // 프로필 모달 열기
  const handleShowProfileModal = (client) => {
    setSelectedClient(client);
    setShowProfileModal(true);
  };

  // 프로필 모달 닫기
  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setSelectedClient(null);
  };

  // 거절 모달 열기
  const handleShowRejectModal = (client) => {
    setClientToReject(client);
    setShowRejectModal(true);
  };

  // 거절 모달 닫기
  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setClientToReject(null);
  };

  // 거절 사유 제출 (실제 백엔드 연동 필요)
  const handleSubmitReject = (reason) => {
    if (clientToReject) {
      console.log(`클라이언트 ${clientToReject.name} 매칭 거절. 사유: ${reason}`);
      // 여기에서 실제 백엔드 API 호출하여 거절 처리
      // 예를 들어, 매칭된 클라이언트 목록에서 해당 클라이언트 제거
      setMatchedClients(prevClients => 
        prevClients.filter(client => client.id !== clientToReject.id)
      );
      alert(`${clientToReject.name} 님과의 매칭을 거절했습니다. (사유: ${reason})`);
    }
    handleCloseRejectModal();
  };
  
  // 수락 버튼 클릭 핸들러 (Mock)
  const handleAccept = (client) => {
    console.log(`클라이언트 ${client.name} 매칭 수락`);
    // 여기에서 실제 백엔드 API 호출하여 수락 처리
    // 예를 들어, 매칭 상태를 변경하거나 목록에서 제거 (처리 완료로 가정)
    setMatchedClients(prevClients => 
      prevClients.filter(c => c.id !== client.id)
    );
    alert(`${client.name} 님과의 매칭을 수락했습니다!`);
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

  if (!user || user.userType !== 'therapist') {
    return (
      <Container className="my-5 text-center">
        <Alert variant="warning">치료사만 접근할 수 있는 페이지입니다.</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5 main-container">
      <h2 className="text-center mb-4">나의 매칭 클라이언트
        <Link to="/therapist/mypage/manage" className="ms-3">
          <button className="btn btn-outline-primary btn-sm">관리 클라이언트 보기</button>
        </Link>
      </h2>
      <Row>
        <Col md={12}>
          <Card className="shadow-sm p-3 card-base">
            <Card.Body>
              {matchedClients.length === 0 ? (
                <Alert variant="info">현재 매칭된 클라이언트가 없습니다.</Alert>
              ) : (
                <div>
                  {matchedClients.map(client => (
                    <div key={client.id} className="mb-3 card-base">
                      <Row className="align-items-center">
                        <Col md={6}>
                          <h5>{client.name}</h5>
                          <p className="mb-1">자녀: {client.childName} ({client.childAge}세)</p>
                          <p className="mb-1">이메일: {client.email}</p>
                          <p className="mb-1">전화: {client.phone}</p>
                          <small className="text-muted">매칭일: {client.matchingDate} / 상태: {client.status}</small>
                        </Col>
                        <Col md={6} className="text-md-end">
                          <button
                            className="btn-soft-secondary me-2 mb-2 mb-md-0"
                            onClick={() => handleShowProfileModal(client)}
                          >
                            프로필 보기
                          </button>
                          <button
                            className="btn-soft-success me-2 mb-2 mb-md-0"
                            onClick={() => handleAccept(client)}
                          >
                            수락
                          </button>
                          <button
                            className="btn-soft-danger"
                            onClick={() => handleShowRejectModal(client)}
                          >
                            거절
                          </button>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* UserProfileModal 컴포넌트 추가 */}
      <UserProfileModal
        show={showProfileModal}
        handleClose={handleCloseProfileModal}
        userProfile={selectedClient}
      />

      {/* RejectReasonModal 컴포넌트 추가 */}
      <RejectReasonModal
        show={showRejectModal}
        handleClose={handleCloseRejectModal}
        handleSubmitReject={handleSubmitReject}
        clientName={clientToReject?.name || ''}
      />
    </Container>
  );
}

export default TherapistMatchingPage;