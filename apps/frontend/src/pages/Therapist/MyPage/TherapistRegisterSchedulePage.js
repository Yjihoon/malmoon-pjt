import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ButtonGroup, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../api/axios';
import './TherapistRegisterSchedulePage.css';

const dayMapping = {
    '월': 'MONDAY',
    '화': 'TUESDAY',
    '수': 'WEDNESDAY',
    '목': 'THURSDAY',
    '금': 'FRIDAY',
    '토': 'SATURDAY',
    '일': 'SUNDAY'
};

const reverseDayMapping = {
    'MONDAY': '월',
    'TUESDAY': '화',
    'WEDNESDAY': '수',
    'THURSDAY': '목',
    'FRIDAY': '금',
    'SATURDAY': '토',
    'SUNDAY': '일'
};

const daysOfWeek = Object.keys(dayMapping);
const timeSlots = Array.from({ length: 10 }, (_, i) => `${String(i + 9).padStart(2, '0')}:00`);

function TherapistRegisterSchedulePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedDay, setSelectedDay] = useState('월');
    const [selectedTimes, setSelectedTimes] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [initialLoad, setInitialLoad] = useState(true);

    // 기존 치료 가능 시간 불러오기
    useEffect(() => {
        const fetchTreatmentTimes = async () => {
            if (!user || !user.accessToken || !user.memberId) {
                setError('로그인 정보가 없습니다.');
                setInitialLoad(false);
                return;
            }
            setIsLoading(true);
            setError('');
            try {
                const response = await api.get(`/treatment-time?therapistId=${user.memberId}`, {
                    headers: { Authorization: `Bearer ${user.accessToken}` }
                });
                const fetchedTimes = response.data.treatmentTimes;
                const mappedTimes = {};
                for (const dayType in fetchedTimes) {
                    const korDay = reverseDayMapping[dayType];
                    if (korDay) {
                        mappedTimes[korDay] = fetchedTimes[dayType].map(time => `${String(time).padStart(2, '0')}:00`);
                    }
                }
                setSelectedTimes(mappedTimes);
            } catch (err) {
                console.error('기존 치료 시간 불러오기 실패:', err);
                setError(err.response?.data?.message || '기존 치료 시간을 불러오는 데 실패했습니다.');
            } finally {
                setIsLoading(false);
                setInitialLoad(false);
            }
        };

        fetchTreatmentTimes();
    }, [user]);

    const handleTimeSlotClick = (time) => {
        const currentDayTimes = selectedTimes[selectedDay] || [];
        const newDayTimes = currentDayTimes.includes(time)
            ? currentDayTimes.filter(t => t !== time)
            : [...currentDayTimes, time];

        setSelectedTimes({
            ...selectedTimes,
            [selectedDay]: newDayTimes,
        });
    };

    const handleRegister = async () => {
        if (!user || !user.accessToken) {
            setError('로그인이 필요합니다.');
            return;
        }

        setIsLoading(true);
        setError('');

        const treatmentTimesPayload = {};
        Object.values(dayMapping).forEach(dayEng => {
            treatmentTimesPayload[dayEng] = [];
        });

        for (const [dayKor, times] of Object.entries(selectedTimes)) {
            const dayEng = dayMapping[dayKor];
            if (dayEng && times.length > 0) {
                treatmentTimesPayload[dayEng] = times.map(t => parseInt(t.split(':')[0])).sort((a, b) => a - b);
            }
        }

        try {
            await api.patch('/treatment-time', {
                treatmentTimes: treatmentTimesPayload
            }, {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`
                }
            });

            alert('치료 가능 시간이 성공적으로 업데이트되었습니다.');
            navigate('/therapist/mypage/schedule');

        } catch (err) {
            console.error('시간 업데이트 실패:', err);
            setError(err.response?.data?.message || '시간 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    if (initialLoad) {
        return (
            <Container fluid className="p-4 register-schedule-container">
                <Row className="justify-content-center">
                    <Col md={10}>
                        <h2 className="text-center mb-4">치료 가능 시간 등록</h2>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <p className="text-center">기존 치료 시간을 불러오는 중입니다...</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container fluid className="p-4 register-schedule-container">
            <Row className="justify-content-center">
                <Col md={10}>
                    <h2 className="text-center mb-4">치료 가능 시간 등록</h2>
                    <Card className="shadow-sm">
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            
                            <Card.Title className="mb-3">1. 요일 선택</Card.Title>
                            <ButtonGroup className="mb-4 d-flex day-selection-group">
                                {daysOfWeek.map(day => (
                                    <Button
                                        key={day}
                                        variant={selectedDay === day ? 'primary' : 'outline-primary'}
                                        onClick={() => setSelectedDay(day)}
                                    >
                                        {day}
                                    </Button>
                                ))}
                            </ButtonGroup>

                            <Card.Title className="mb-3">2. 시간 선택 ({selectedDay}요일)</Card.Title>
                            <div className="time-slot-grid mb-4">
                                {timeSlots.map(time => {
                                    const isSelected = (selectedTimes[selectedDay] || []).includes(time);
                                    return (
                                        <Button
                                            key={time}
                                            variant={isSelected ? 'success' : 'outline-secondary'}
                                            onClick={() => handleTimeSlotClick(time)}
                                        >
                                            {time}
                                        </Button>
                                    );
                                })}
                            </div>

                            <hr className="my-4" />

                            <Card.Title className="mb-3">선택된 시간 확인</Card.Title>
                            <div className="selected-times-summary mb-4">
                                {Object.keys(selectedTimes).length === 0 || Object.values(selectedTimes).every(t => t.length === 0) ? (
                                    <p className="text-muted m-0">선택된 시간이 없습니다.</p>
                                ) : (
                                    Object.entries(selectedTimes).map(([day, times]) =>
                                        times.length > 0 && (
                                            <div key={day} className="selected-day-block">
                                                <div className="selected-day-title">{day}요일</div>
                                                <div className="selected-time-chips">
                                                    {times.sort().map(time => (
                                                        <div key={time} className="selected-time-chip">{time}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    )
                                )}
                            </div>

                            <div className="text-center mt-4">
                                <Button 
                                    variant="primary" 
                                    size="lg" 
                                    onClick={handleRegister}
                                    disabled={isLoading}
                                >
                                    {isLoading ? '업데이트 중...' : '시간 업데이트'}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default TherapistRegisterSchedulePage;
