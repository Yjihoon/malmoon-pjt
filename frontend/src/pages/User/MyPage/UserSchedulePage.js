import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Alert } from 'react-bootstrap';
import { useAuth } from '../../../contexts/AuthContext';

function UserSchedulePage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 실제 백엔드 연동 시 여기에 사용자 일정을 가져오는 API 호출 로직을 추가합니다.
    const fetchSchedules = async () => {
      setLoading(true);
      setError('');
      try {
        // Mock 데이터
        const dummySchedules = [
          {
            id: 'u1',
            date: '2025-07-28',
            time: '10:00 AM',
            therapist: '이재현 치료사',
            status: '예정',
            notes: '초기 상담 (김지아 자녀)',
          },
          {
            id: 'u2',
            date: '2025-07-29',
            time: '02:00 PM',
            therapist: '김민지 치료사',
            status: '예정',
            notes: '음운 치료 1차 세션 (박서준 자녀)',
          },
          {
            id: 'u3',
            date: '2025-07-25', // 오늘 날짜
            time: '11:00 AM',
            therapist: '최수진 치료사',
            status: '완료',
            notes: '조음 치료 세션 (이지원 자녀)',
          },
        ];

        // 실제 API 호출 시:
        // const response = await api.get(`/api/user/${user.id}/schedules`);
        // setSchedules(response.data);

        // 목업 데이터 설정
        setSchedules(dummySchedules.sort((a, b) => new Date(a.date) - new Date(b.date)));
      } catch (err) {
        setError('일정 정보를 불러오는 데 실패했습니다.');
        console.error('일정 불러오기 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.userType === 'user') {
      fetchSchedules();
    } else {
      setLoading(false);
      setError('사용자 계정으로 로그인해야 일정을 볼 수 있습니다.');
    }
  }, [user]);

  const handleCancelReservation = (scheduleId) => {
    // 예약 취소 로직 (실제 백엔드 연동 필요)
    console.log(`예약 ${scheduleId} 취소 요청`);
    // UI 업데이트 (예: schedules.filter)
    setSchedules(schedules.filter(schedule => schedule.id !== scheduleId));
    alert(`예약 ${scheduleId}이(가) 취소되었습니다. (Mock)`);
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <p>일정 정보를 불러오는 중입니다...</p>
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
                        <button 
                          className="btn-soft-danger" 
                          onClick={() => handleCancelReservation(schedule.id)}
                        >
                          예약 취소
                        </button>
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