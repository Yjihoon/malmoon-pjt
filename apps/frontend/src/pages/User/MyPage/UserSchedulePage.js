import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Alert, Button } from 'react-bootstrap'; // Button 추가
import { useNavigate } from 'react-router-dom'; // useNavigate 추가
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios'; // axios 추가

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
        const dummySchedules = [
          {
            id: 'u1',
            date: '2025-08-01', // 오늘 날짜 또는 가까운 미래
            time: '10:00 AM',
            therapist: '이재현 치료사',
            status: '예정',
            notes: '초기 상담 (김지아 자녀)',
          },
          {
            id: 'u2',
            date: '2025-08-02',
            time: '02:00 PM',
            therapist: '김민지 치료사',
            status: '예정',
            notes: '음운 치료 1차 세션 (박서준 자녀)',
          },
          {
            id: 'u3',
            date: '2025-07-30',
            time: '11:00 AM',
            therapist: '최수진 치료사',
            status: '완료',
            notes: '조음 치료 세션 (이지원 자녀)',
          },
        ];
        setSchedules(dummySchedules.sort((a, b) => new Date(a.date) - new Date(b.date)));
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