import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Alert, Button } from 'react-bootstrap'; // Button 추가
import { useNavigate } from 'react-router-dom'; // useNavigate 추가
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../api/axios'; // axios 인스턴스, 기본 baseURL 세팅

function UserSchedulePage() {
  const { user, token } = useAuth();
  const navigate = useNavigate(); // useNavigate 훅 사용
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      setError('');
      try {
        // Mock 데이터 (실제 API 호출로 대체 필요)
        try {
          const response = await api.get('/schedule/me/today', {
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
            },
          });
          const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
          const fetchedSchedules = response.data.map(schedule => ({
            id: schedule.therapistId, // 임시로 therapistId를 id로 사용
            date: today,
            time: `${String(schedule.time).padStart(2, '0')}:00 AM`, // 백엔드 time이 정수라고 가정
            therapist: schedule.therapistName,
            status: '예정', // 백엔드에서 상태 정보가 없으므로 '예정'으로 고정
            notes: '', // 백엔드에서 notes 정보가 없으므로 빈 값
          }));
          setSchedules(fetchedSchedules.sort((a, b) => new Date(a.date) - new Date(b.date)));
        } catch (err) {
          setError('일정 정보를 불러오는 데 실패했습니다.');
          console.error('Failed to fetch schedules:', err);
        }
      } catch (err) {
        setError('일정 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSchedules();
    } else {
      setLoading(false);
      setError('로그인이 필요합니다.');
    }
  }, [user]);

  const handleStartSession = (scheduleId) => {
    navigate('/user/session', { state: { bookingId: scheduleId } });
  };

  if (loading) {
    return <Container className="my-5 text-center"><p>일정 정보를 불러오는 중입니다...</p></Container>;
  }

  if (error) {
    return <Container className="my-5 text-center"><Alert variant="danger">{error}</Alert></Container>;
  }

  return (
    <Container className="my-5 main-container">
      <h2 className="text-center mb-4">나의 치료 예약/일정</h2>
      <Row>
        <Col md={12}>
          <Card className="shadow-sm p-3 card-base">
            <Card.Body>
              <Card.Title className="mb-3">다가오는 예약 ({schedules.filter(s => s.status === '예정').length}건)</Card.Title>
              {schedules.length === 0 ? (
                <Alert variant="info">예정된 예약이 없습니다.</Alert>
              ) : (
                <ListGroup variant="flush">
                  {schedules.map(schedule => (
                    <ListGroup.Item key={schedule.id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5>{schedule.date} {schedule.time}</h5>
                        <p className="mb-1">**{schedule.therapist}**님과 {schedule.notes}</p>
                        <small className={schedule.status === '예정' ? 'text-primary' : 'text-success'}>
                          상태: {schedule.status}
                        </small>
                      </div>
                      {schedule.status === '예정' && (
                        <Button variant="success" onClick={() => handleStartSession(schedule.id)}>
                          수업 시작
                        </Button>
                      )}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default UserSchedulePage;