import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../api/axios';
import UserProfileModal from '../../../components/modals/UserProfileModal';

function TherapistMatchingPage() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const fetchPendingRequests = async () => {
    if (!user || !user.accessToken) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get('/schedule/pending', {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      setPendingRequests(response.data || []);
    } catch (err) {
      setError('상담 요청 목록을 불러오는 데 실패했습니다.');
      console.error('상담 요청 목록 불러오기 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, [user]);

  const handleStatusUpdate = async (scheduleId, status) => {
    try {
      await api.patch('/schedule', 
        { scheduleId, status }, 
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      setPendingRequests(prev => prev.filter(req => req.scheduleId !== scheduleId));
      alert(`요청을 성공적으로 ${status === 'ACCEPTED' ? '수락' : '거절'}했습니다.`);
    } catch (err) {
      alert('요청 처리에 실패했습니다.');
      console.error('상태 업데이트 오류:', err);
    }
  };

  const handleShowProfileModal = (client) => {
    // 백엔드에서 오는 데이터 구조에 맞춰서 userProfile을 구성해야 합니다.
    // 현재 pendingRequests의 데이터 구조를 보고 맞춰주세요.
    setSelectedClient(client); 
    setShowProfileModal(true);
  };

  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setSelectedClient(null);
  };

  if (loading) {
    return <Container className="my-5 text-center"><p>요청 목록을 불러오는 중입니다...</p></Container>;
  }

  if (error) {
    return <Container className="my-5 text-center"><Alert variant="danger">{error}</Alert></Container>;
  }

  return (
    <Container className="my-5 main-container">
      <h2 className="text-center mb-4">수신된 상담 요청</h2>
      <Row>
        <Col md={12}>
          <Card className="shadow-sm p-3 card-base">
            <Card.Body>
              {pendingRequests.length === 0 ? (
                <Alert variant="info">현재 수신된 상담 요청이 없습니다.</Alert>
              ) : (
                <div>
                  {pendingRequests.map(req => (
                    <div key={req.scheduleId} className="mb-3 card-base p-3">
                      <Row className="align-items-center">
                        <Col md={6}>
                          <h5>{req.name}님의 상담 요청</h5>
                          <p className="mb-1">이메일: {req.email}</p>
                          <p className="mb-1">연락처: {req.tel1}</p>
                          <small className="text-muted">요청일: {new Date(req.createdAt).toLocaleDateString()}</small>
                        </Col>
                        <Col md={6} className="text-md-end">
                          <Button
                            variant="info"
                            className="me-2 mb-2 mb-md-0"
                            onClick={() => handleShowProfileModal(req)}
                          >
                            요청자 정보 보기
                          </Button>
                          <Button
                            variant="success"
                            className="me-2 mb-2 mb-md-0"
                            onClick={() => handleStatusUpdate(req.scheduleId, 'ACCEPTED')}
                          >
                            수락
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleStatusUpdate(req.scheduleId, 'REJECTED')}
                          >
                            거절
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

      {selectedClient && (
        <UserProfileModal
          show={showProfileModal}
          handleClose={handleCloseProfileModal}
          userProfile={selectedClient}
        />
      )}
    </Container>
  );
}

export default TherapistMatchingPage;
