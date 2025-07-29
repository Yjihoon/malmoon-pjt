import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, ButtonGroup } from 'react-bootstrap';
import './TherapistRegisterSchedulePage.css'; // CSS 파일 임포트

const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];
const timeSlots = Array.from({ length: 12 }, (_, i) => `${String(i + 9).padStart(2, '0')}:00`); // 09:00 to 20:00

function TherapistRegisterSchedulePage() {
    const [selectedDay, setSelectedDay] = useState('월'); // 기본 선택 요일
    const [selectedTimes, setSelectedTimes] = useState({}); // { '월': ['09:00', '10:00'], '화': ['14:00'] }

    // 시간 선택/해제 핸들러
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

    // 등록 버튼 핸들러
    const handleRegister = () => {
        console.log('등록된 시간:', selectedTimes);
        alert('선택된 시간이 콘솔에 기록되었습니다.');
    };

    return (
        <Container fluid className="p-4 register-schedule-container">
            <Row className="justify-content-center">
                <Col md={10}>
                    <h2 className="text-center mb-4">치료 가능 시간 등록</h2>
                    <Card className="shadow-sm">
                        <Card.Body>
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
                            <div className="selected-times-summary">
                                {Object.keys(selectedTimes).length === 0 ? (
                                    <p className="text-muted m-0">선택된 시간이 없습니다.</p>
                                ) : (
                                    <ul>
                                        {Object.entries(selectedTimes).map(([day, times]) =>
                                            times.length > 0 && (
                                                <li key={day}>
                                                    <strong>{day}요일:</strong> {times.sort().join(', ')}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                )}
                            </div>

                            <div className="text-center mt-4">
                                <Button variant="primary" size="lg" onClick={handleRegister}>
                                    등록하기
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