import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap';
import api from '../../../api/axios';
import { useAuth } from '../../../contexts/AuthContext';
import './TherapistBookingPage.css';

const dayMappingToKor = {
    MONDAY: '월',
    TUESDAY: '화',
    WEDNESDAY: '수',
    THURSDAY: '목',
    FRIDAY: '금',
    SATURDAY: '토',
    SUNDAY: '일'
};

const getDayOfWeekName = (date) => {
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return dayNames[date.getDay()];
};

function TherapistBookingPage() {
    const { user } = useAuth();
    const { therapistId } = useParams();
    const navigate = useNavigate();

    const [therapistName, setTherapistName] = useState('');
    const [availableTimes, setAvailableTimes] = useState({});
    const [selectedDayTimes, setSelectedDayTimes] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAvailableTimes = async () => {
            if (!user || !user.accessToken) {
                setError('로그인이 필요합니다.');
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const response = await api.get(`/treatment-time?therapistId=${therapistId}`, {
                    headers: { Authorization: `Bearer ${user.accessToken}` }
                });
                setAvailableTimes(response.data.treatmentTimes || {});
                // 치료사 이름을 가져오는 별도 API 호출 또는 다른 방법이 필요할 수 있음
                // 우선 임시로 ID를 이름으로 사용
                setTherapistName(`치료사 ${therapistId}`); 
            } catch (err) {
                setError('예약 가능 시간을 불러오는 데 실패했습니다.');
                console.error('시간 조회 오류:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAvailableTimes();
    }, [user, therapistId]);

    const handleTimeSelect = (day, time) => {
        const newSelection = { day, time };
        const isSelected = selectedDayTimes.some(item => item.day === day && item.time === time);

        if (isSelected) {
            setSelectedDayTimes(selectedDayTimes.filter(item => !(item.day === day && item.time === time)));
        } else {
            setSelectedDayTimes([...selectedDayTimes, newSelection]);
        }
    };

    const handleBookingRequest = async () => {
        if (selectedDayTimes.length === 0) {
            alert('상담을 원하는 시간을 하나 이상 선택해주세요.');
            return;
        }

        setLoading(true);
        setError('');

        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + 13); // 2주 뒤

        const payload = {
            therapistId: parseInt(therapistId, 10),
            startDate: today.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            dayTimes: selectedDayTimes // 수정된 부분
        };

        try {
            await api.post('/schedule', payload, {
                headers: { Authorization: `Bearer ${user.accessToken}` }
            });
            alert('성공적으로 상담을 요청했습니다. 치료사의 수락을 기다려주세요.');
            navigate('/user/mypage/schedule');
        } catch (err) {
            setError(err.response?.data?.message || '상담 요청 중 오류가 발생했습니다.');
            console.error('상담 요청 오류:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Container className="my-5 text-center"><p>정보를 불러오는 중입니다...</p></Container>;
    }

    if (error) {
        return <Container className="my-5 text-center"><Alert variant="danger">{error}</Alert></Container>;
    }

    return (
        <Container className="my-5 main-container">
            <h2 className="text-center mb-4">{therapistName}님과 상담 신청</h2>
            <Card className="shadow-sm p-4 card-base">
                <Card.Body>
                    <Card.Title className="mb-4">치료사가 가능한 요일 및 시간</Card.Title>
                    {Object.keys(availableTimes).length === 0 ? (
                        <Alert variant="info">현재 예약 가능한 시간이 없습니다.</Alert>
                    ) : (
                        Object.entries(availableTimes).map(([day, times]) => (
                            times.length > 0 && (
                                <div key={day} className="mb-4">
                                    <h5>{dayMappingToKor[day]}요일</h5>
                                    <div className="time-slot-grid">
                                        {times.sort((a, b) => a - b).map(time => {
                                            const isSelected = selectedDayTimes.some(item => item.day === day && item.time === time);
                                            return (
                                                <Button
                                                    key={time}
                                                    variant={isSelected ? 'primary' : 'outline-secondary'}
                                                    onClick={() => handleTimeSelect(day, time)}
                                                    className="time-slot-button"
                                                >
                                                    {`${String(time).padStart(2, '0')}:00`}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )
                        ))
                    )}

                    <hr className="my-4" />

                    <Card.Title className="mb-3">선택한 상담 시간</Card.Title>
                    {selectedDayTimes.length === 0 ? (
                        <p className="text-muted">원하는 시간을 선택해주세요.</p>
                    ) : (
                        <ul className="list-unstyled">
                            {selectedDayTimes.map((item, index) => (
                                <li key={index} className="mb-1">
                                    <span className="badge bg-primary">{dayMappingToKor[item.day]}요일 {`${String(item.time).padStart(2, '0')}:00`}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <Button
                        variant="success"
                        size="lg"
                        className="w-100 mt-4"
                        onClick={handleBookingRequest}
                        disabled={loading || selectedDayTimes.length === 0}
                    >
                        {loading ? '요청 중...' : '상담 요청하기'}
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default TherapistBookingPage;
