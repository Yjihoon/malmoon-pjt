import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap';
import { useAuth } from '../../../contexts/AuthContext';
import { Link } from 'react-router-dom'; // Link 컴포넌트 임포트 추가
import api from '../../../api/axios';
import ClientDetailsModal from '../../../components/modals/ClientDetailsModal';

function TherapistUserManage() {
  const { user } = useAuth();
  const [managedClients, setManagedClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showClientDetailsModal, setShowClientDetailsModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    const fetchManagedClients = async () => {
      if (!user || !user.accessToken) {
        setError('로그인이 필요합니다.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/schedule/therapist/client', {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        setManagedClients(response.data || []);
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
                    <div key={client.clientId} className="mb-3 card-base">
                      <Row className="align-items-center">
                        <Col md={6}>
                          <h5>{client.name}</h5>
                          <p className="mb-1">이메일: {client.email}</p>
                          <p className="mb-1">전화: {client.telephone}</p>
                          <p className="mb-1">나이: {client.age}세</p>
                        </Col>
                        <Col md={6} className="text-md-end">
                          <Button
                            variant="info"
                            className="me-2 mb-2 mb-md-0"
                            onClick={() => handleViewDetails(client)}
                          >
                            상세 정보 보기
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

      <ClientDetailsModal
        show={showClientDetailsModal}
        handleClose={handleCloseClientDetailsModal}
        clientDetails={selectedClient}
      />
    </Container>
  );
}

export default TherapistUserManage;
