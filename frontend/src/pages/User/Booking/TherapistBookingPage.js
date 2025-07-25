import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Alert, ListGroup, Badge, Button } from 'react-bootstrap';
import './TherapistBookingPage.css';
import { useAuth } from '../../../contexts/AuthContext';

// 날짜 관련 유틸리티 함수 (간단하게 구현)
const getFormattedDate = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDayOfWeek = (date) => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
};

const getDisplayDate = (date) => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (getFormattedDate(date) === getFormattedDate(today)) {
    return '오늘';
  } else if (getFormattedDate(date) === getFormattedDate(tomorrow)) {
    return '내일';
  } else {
    return `${getDayOfWeek(date)} ${date.getMonth() + 1}/${date.getDate()}`;
  }
};


function TherapistBookingPage() {
  const { user } = useAuth();
  const { therapistId } = useParams();
  const navigate = useNavigate();

  const [therapist, setTherapist] = useState(null);
  const [availableTimesByDate, setAvailableTimesByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [datesForPicker, setDatesForPicker] = useState([]);

  useEffect(() => {
    const generateDates = () => {
      const dates = [];
      const today = new Date();
      for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date);
      }
      return dates;
    };
    setDatesForPicker(generateDates());
  }, []);

  useEffect(() => {
    const fetchTherapistAndTimes = async () => {
      setLoading(true);
      setError('');
      setBookingSuccess(false);
      try {
        const dummyTherapists = [
          {
            id: 'therapist1',
            name: '이재현 치료사',
            specialization: '음운/조음 치료',
            availableSlots: {
              '2025-08-01': [
                { id: 's1', time: '10:00 AM', booked: false },
                { id: 's2', time: '02:00 PM', booked: false },
              ],
              '2025-08-02': [
                { id: 's3', time: '11:00 AM', booked: false },
                { id: 's4', time: '03:00 PM', booked: false },
              ],
              '2025-08-03': [
                { id: 's5', time: '09:00 AM', booked: true },
                { id: 's6', time: '01:00 PM', booked: false },
              ],
              '2025-08-04': [
                { id: 's7', time: '10:00 AM', booked: false },
              ],
            }
          },
          {
            id: 'therapist2',
            name: '김민지 치료사',
            specialization: '언어 발달 지연',
            availableSlots: {
              '2025-08-05': [
                { id: 's8', time: '01:00 PM', booked: false },
                { id: 's9', time: '03:00 PM', booked: false },
              ],
              '2025-08-06': [
                { id: 's10', time: '10:00 AM', booked: false },
              ],
            }
          },
        ];

        const foundTherapist = dummyTherapists.find(t => t.id === therapistId);

        if (foundTherapist) {
          setTherapist(foundTherapist);
          const filteredSlotsByDate = {};
          for (const date in foundTherapist.availableSlots) {
            filteredSlotsByDate[date] = foundTherapist.availableSlots[date].filter(slot => !slot.booked);
          }
          setAvailableTimesByDate(filteredSlotsByDate);

          const todayFormatted = getFormattedDate(new Date());
          const firstAvailableDate = Object.keys(filteredSlotsByDate).sort().find(date => date >= todayFormatted && filteredSlotsByDate[date].length > 0) || null;
          
          setSelectedDate(firstAvailableDate || (datesForPicker.length > 0 ? getFormattedDate(datesForPicker[0]) : null));


        } else {
          setError('해당 치료사를 찾을 수 없습니다.');
        }
      } catch (err) {
        setError('치료사 정보 및 시간을 불러오는 데 실패했습니다.');
        console.error('예약 페이지 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.userType === 'user' && therapistId && datesForPicker.length > 0) {
      fetchTherapistAndTimes();
    } else if (!user || user.userType !== 'user') {
      setLoading(false);
      setError('사용자 계정으로 로그인해야 예약 페이지에 접근할 수 있습니다.');
    } else if (!therapistId) {
      setLoading(false);
      setError('올바른 치료사 정보가 전달되지 않았습니다.');
    }
  }, [user, therapistId, datesForPicker]);

  const handleDateSelect = (dateObject) => {
    setSelectedDate(getFormattedDate(dateObject));
    setSelectedTimeSlot(null);
    setBookingSuccess(false);
  };

  const handleSelectTimeSlot = (slot) => {
    setSelectedTimeSlot(slot);
    setBookingSuccess(false);
  };

  const handleBookTime = async () => {
    if (!selectedTimeSlot) {
      alert('예약할 시간을 선택해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // therapist가 null일 수 있으므로 옵셔널 체이닝 적용
      console.log(`치료사 ${therapist?.name} 님에게 ${selectedDate} ${selectedTimeSlot.time} 예약 요청`);
      
      await new Promise(resolve => setTimeout(resolve, 2000)); 

      setBookingSuccess(true);
      setSelectedTimeSlot(null);
      
      setAvailableTimesByDate(prevTimesByDate => {
        const newTimesByDate = { ...prevTimesByDate };
        if (newTimesByDate[selectedDate]) {
          newTimesByDate[selectedDate] = newTimesByDate[selectedDate].filter(
            slot => slot.id !== selectedTimeSlot.id
          );
        }
        return newTimesByDate;
      });

      // therapist가 null일 수 있으므로 옵셔널 체이닝 적용
      alert(`치료사 ${therapist?.name} 님에게 ${selectedDate} ${selectedTimeSlot.time} 예약이 완료되었습니다!`);
      
    } catch (err) {
      setError('예약 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('예약 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 렌더링 시점에 therapist 객체가 null인 경우를 대비하여 가장 먼저 처리
  if (loading) {
    return (
      <Container className="my-5 text-center">
        <p>정보를 불러오는 중입니다...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5 text-center">
        <Alert variant="danger">{error}</Alert>
        <button onClick={() => navigate('/user/mypage/matching')} className="btn-soft-secondary">매칭 페이지로 돌아가기</button>
      </Container>
    );
  }

  // 사용자 유형 검사 (ProtectedRoute가 처리하지만, 직접 접근 시를 대비)
  if (!user || user.userType !== 'user') {
    return (
      <Container className="my-5 text-center">
        <Alert variant="warning">사용자만 접근할 수 있는 페이지입니다. 로그인 해주세요.</Alert>
        <button onClick={() => navigate('/login')} className="btn-soft-primary">로그인 페이지로</button>
      </Container>
    );
  }

  // therapist 객체가 여전히 null인 경우 (예: therapistId가 유효하지 않은데, 에러 메시지가 특정되지 않았을 때)
  if (!therapist) {
    return (
      <Container className="my-5 text-center">
        <Alert variant="warning">치료사 정보를 불러오는 데 실패했거나 찾을 수 없습니다.</Alert>
        <button onClick={() => navigate('/user/mypage/matching')} className="btn-soft-secondary">매칭 페이지로 돌아가기</button>
      </Container>
    );
  }

  // 모든 예외 처리가 끝난 후, therapist 객체가 유효함을 보장
  const currentDaySlots = availableTimesByDate[selectedDate] || [];

  return (
    <Container className="my-5 main-container">
      {/* therapist?.name 사용 */}
      <h2 className="text-center mb-4">{therapist?.name} 님과 상담 예약</h2>
      <Card className="shadow-sm p-4 mb-4 card-base">
        <Card.Body>
          <Card.Title className="mb-3">치료사 정보</Card.Title>
          {/* therapist?.name, therapist?.specialization 사용 */}
          <p><strong>이름:</strong> {therapist?.name}</p>
          <p><strong>전문 분야:</strong> {therapist?.specialization}</p>
          <hr />

          <Card.Title className="mb-3">가능한 날짜 선택</Card.Title>
          <div className="date-picker-container mb-4">
            {datesForPicker.map(dateObj => {
              const formatted = getFormattedDate(dateObj);
              return (
                <div 
                  key={formatted} 
                  className={`date-item ${formatted === selectedDate ? 'selected' : ''}`}
                  onClick={() => handleDateSelect(dateObj)}
                >
                  <div className="day-text">{getDisplayDate(dateObj).split(' ')[0]}</div>
                  <div className="date-text">{getDisplayDate(dateObj).split(' ')[1] || getDisplayDate(dateObj)}</div>
                </div>
              );
            })}
          </div>

          <Card.Title className="mb-3">
            {selectedDate ? `${getFormattedDate(new Date(selectedDate))}의 가능한 시간` : '시간을 선택해주세요'}
          </Card.Title>
          
          {bookingSuccess && <Alert variant="success" className="mb-3">예약이 성공적으로 완료되었습니다!</Alert>}

          {currentDaySlots.length === 0 ? (
            <Alert variant="info">선택된 날짜에 예약 가능한 시간이 없습니다.</Alert>
          ) : (
            <div className="time-slot-grid">
              {currentDaySlots.map(slot => (
                <button
                  key={slot.id}
                  className={`time-slot-button ${selectedTimeSlot && selectedTimeSlot.id === slot.id ? 'btn-soft-primary' : 'btn-soft-secondary'}`}
                  onClick={() => handleSelectTimeSlot(slot)}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}

          <button 
            className="btn-soft-primary w-100 mt-4" 
            onClick={handleBookTime} 
            disabled={!selectedTimeSlot || loading || currentDaySlots.length === 0}
          >
            {loading ? '예약 처리 중...' : '선택한 시간으로 예약하기'}
          </button>
          {selectedTimeSlot && !loading && (
            <div className="mt-3 text-center text-muted">
              선택된 시간: {selectedDate} {selectedTimeSlot.time}
            </div>
          )}
        </Card.Body>
      </Card>
      <div className="text-center mt-3">
        <Button variant="outline-secondary" onClick={() => navigate('/user/mypage/matching')}>
          매칭 페이지로 돌아가기
        </Button>
      </div>
    </Container>
  );
}

export default TherapistBookingPage;