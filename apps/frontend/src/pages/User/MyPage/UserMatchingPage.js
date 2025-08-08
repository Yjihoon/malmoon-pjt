import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Alert, Button } from 'react-bootstrap';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import TherapistProfileModal from '../../../components/modals/TherapistProfileModal';

function UserMatchingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);

  useEffect(() => {
    const fetchTherapists = async () => {
      if (!user || !user.accessToken) {
        setError('로그인이 필요합니다.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const response = await api.get('/schedule/therapist', {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        });
        setTherapists(response.data || []);
      } catch (err) {
        setError('치료사 목록을 불러오는 데 실패했습니다.');
        console.error('치료사 목록 불러오기 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, [user]);

  const handleShowProfileModal = (therapist) => {
    setSelectedTherapist(therapist);
    setShowProfileModal(true);
  };

  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setSelectedTherapist(null);
  };

  const handleApply = (therapistId) => {
    navigate(`/user/booking/${therapistId}`);
  };

  if (loading) {
    return <Container className="my-5 text-center"><p>치료사 목록을 불러오는 중입니다...</p></Container>;
  }

  if (error) {
    return <Container className="my-5 text-center"><Alert variant="danger">{error}</Alert></Container>;
  }

  return (
    <Container className="my-5 main-container">
      <h2 className="text-center mb-4">등록된 치료사 목록</h2>
      <Row>
        <Col md={12}>
          <Card className="shadow-sm p-3 card-base">
            <Card.Body>
              {therapists.length === 0 ? (
                <Alert variant="info">현재 등록된 치료사가 없습니다.</Alert>
              ) : (
                <ListGroup variant="flush">
                  {therapists.map(therapist => (
                    <ListGroup.Item key={therapist.therapistId} className="mb-3 border rounded">
                      <Row className="align-items-center">
                        <Col md={6}>
                          <h5>{therapist.name}</h5>
                          <p className="mb-1">주요 치료 분야: {therapist.major}</p>
                          <p className="mb-1">이메일: {therapist.email}</p>
                          <p className="mb-1">연락처: {therapist.phone}</p>
                        </Col>
                        <Col md={6} className="text-md-end">
                          <Button 
                            variant="secondary" 
                            className="me-2 mb-2 mb-md-0"
                            onClick={() => handleShowProfileModal(therapist)}
                          >
                            프로필 보기
                          </Button>
                          <Button 
                            variant="primary"
                            onClick={() => handleApply(therapist.therapistId)}
                          >
                            상담 신청하기
                          </Button>
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

      <TherapistProfileModal
        show={showProfileModal}
        handleClose={handleCloseProfileModal}
        therapistProfile={selectedTherapist}
      />
    </Container>
  );
}

export default UserMatchingPage;
