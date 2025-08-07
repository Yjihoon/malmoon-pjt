import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap';
import { useAuth } from '../../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import ClientDetailsModal from '../../../components/modals/ClientDetailsModal';

function TherapistUserManage() {
  const { user } = useAuth();
  const [managedClients, setManagedClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 클라이언트 상세 모달 관련 상태
  const [showClientDetailsModal, setShowClientDetailsModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    const fetchManagedClients = async () => {
      setLoading(true);
      setError('');
      try {
        // 더미 데이터 (TherapistMatchingPage.js와 유사하게 구성)
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
            },
            feedback: '수업 참여도가 높고, 발음 교정에 적극적입니다. 부모님과의 소통도 원활합니다.'
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
            },
            feedback: '꾸준히 발전하고 있으며, 특히 어휘력 향상에 집중하고 있습니다. 숙제 이행률이 좋습니다.'
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
            },
            feedback: '초기 단계로, 기본적인 발음 연습과 어휘 확장에 집중하고 있습니다. 부모님의 적극적인 협조가 필요합니다.'
          },
        ];
        setManagedClients(dummyClients);
      } catch (err) {
        setError('관리 클라이언트 정보를 불러오는 데 실패했습니다.');
        console.error('관리 클라이언트 불러오기 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.userType === 'therapist') {
      fetchManagedClients();
    } else {
      setLoading(false);
      setError('치료사 계정으로 로그인해야 클라이언트 관리 정보를 볼 수 있습니다.');
    }
  }, [user]);

  const handleViewDetails = (client) => {
    setSelectedClient(client);
    setShowClientDetailsModal(true);
  };

  // 클라이언트 상세 모달 닫기
  const handleCloseClientDetailsModal = () => {
    setShowClientDetailsModal(false);
    setSelectedClient(null);
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <p>클라이언트 정보를 불러오는 중입니다...</p>
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
      <h2 className="text-center mb-4">나의 관리 클라이언트
        <Link to="/therapist/mypage/matching" className="ms-3">
          <Button variant="outline-primary" size="sm">매칭 요청 보기</Button>
        </Link>
      </h2>
      <Row>
        <Col md={12}>
          <Card className="shadow-sm p-3 card-base">
            <Card.Body>
              {managedClients.length === 0 ? (
                <Alert variant="info">현재 관리 중인 클라이언트가 없습니다.</Alert>
              ) : (
                <div>
                  {managedClients.map(client => (
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
                          <Button
                            variant="info" // Bootstrap variant
                            className="me-2 mb-2 mb-md-0"
                            onClick={() => handleViewDetails(client)}
                          >
                            상세 정보/피드백 보기
                          </Button>
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

      {/* ClientDetailsModal 컴포넌트 추가 */}
      <ClientDetailsModal
        show={showClientDetailsModal}
        handleClose={handleCloseClientDetailsModal}
        clientDetails={selectedClient}
      />
    </Container>
  );
}

export default TherapistUserManage;
