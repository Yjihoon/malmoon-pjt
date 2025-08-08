import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Button, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import axios from '../../../api/axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './TherapistFeedbackPage.css'; // 새로 생성할 CSS 파일

function TherapistFeedbackPage() {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 모달 관련 상태
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientDetail, setClientDetail] = useState(null);
    const [feedbackDates, setFeedbackDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [feedbackContent, setFeedbackContent] = useState(null); // 피드백 내용

    const [modalView, setModalView] = useState('calendar'); // 'calendar' or 'feedbackDetail'

    useEffect(() => {
        const fetchClients = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get('/schedule/therapist/client', {
                    headers : {"Authorization": `Bearer ${user.accessToken}`}
                });
                setClients(response.data); // API 응답이 바로 클라이언트 리스트라고 가정
            } catch (err) {
                setError('아동 리스트를 불러오는 데 실패했습니다.');
                console.error('아동 리스트 불러오기 오류:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user && user.userType === 'therapist') {
            fetchClients();
        } else {
            setLoading(false);
            setError('치료사 계정으로 로그인해야 피드백을 볼 수 있습니다.');
        }
    }, [user]);

    // 피드백 버튼 클릭 시 모달 열기 및 데이터 로드
    const handleShowFeedbackModal = async (client) => {
        setSelectedClient(client);
        setShowFeedbackModal(true);
        setModalView('calendar'); // 항상 달력 뷰부터 시작
        setClientDetail(null); // 모달 열 때마다 초기화
        setFeedbackDates([]);
        setFeedbackContent(null); // 피드백 내용 초기화
        setSelectedDate(new Date()); // 달력 날짜 초기화

        try {
            // 클라이언트 상세 정보 불러오기
            const detailResponse = await axios.get(`/schedule/therapist/client/detail?clientId=${client.clientId}`, {
                headers : {"Authorization": `Bearer ${user.accessToken}`}
            });
            setClientDetail(detailResponse.data);

            // 피드백 날짜 불러오기
            const datesResponse = await axios.get(`/session-feedback/dates?childId=${client.clientId}`, {
                headers : {"Authorization": `Bearer ${user.accessToken}`}
            });
            setFeedbackDates(datesResponse.data.dates.map(dateStr => new Date(dateStr))); // 문자열 날짜를 Date 객체로 변환
        } catch (err) {
            console.error('클라이언트 상세 정보 또는 피드백 날짜 불러오기 오류:', err);
            setError('클라이언트 상세 정보 또는 피드백 날짜를 불러오는 데 실패했습니다.');
        }
    };

    const handleCloseFeedbackModal = () => {
        setShowFeedbackModal(false);
        setSelectedClient(null);
        setClientDetail(null);
        setFeedbackDates([]);
        setFeedbackContent(null);
        setModalView('calendar'); // 모달 닫을 때 뷰 초기화
    };

    // 달력 날짜 선택 핸들러
    const handleDateChange = async (date) => {
        setSelectedDate(date);
        setFeedbackContent(null); // 날짜 변경 시 피드백 내용 초기화

        const year = date.getFullYear();
        const month = (`0${date.getMonth() + 1}`).slice(-2);
        const day = (`0${date.getDate()}`).slice(-2);
        const dateStr = `${year}-${month}-${day}`;

        const hasFeedback = feedbackDates.some(feedbackDate =>
            feedbackDate.toDateString() === date.toDateString()
        );

        if (hasFeedback && selectedClient) {
            try {
                const feedbackResponse = await axios.get(`/session-feedback/detail?childId=${selectedClient.clientId}&date=${dateStr}`, {
                    headers : {"Authorization": `Bearer ${user.accessToken}`}
                });
                setFeedbackContent(feedbackResponse.data);
                setModalView('feedbackDetail'); // 피드백 상세 뷰로 전환
            } catch (err) {
                console.error('피드백 내용 불러오기 오류:', err);
                setError('피드백 내용을 불러오는 데 실패했습니다.');
            }
        }
    };

    const handleBackToCalendar = () => {
        setModalView('calendar');
        setFeedbackContent(null);
    };

    // 캘린더 날짜에 마커 표시 로직 (피드백이 있는 날짜 활성화)
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const hasFeedback = feedbackDates.some(feedbackDate =>
                feedbackDate.toDateString() === date.toDateString()
            );
            if (hasFeedback) {
                return (
                    <div className="dot-marker-container">
                        <span className="dot-marker feedback-marker" title="피드백 있음"></span>
                    </div>
                );
            }
        }
        return null;
    };

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const hasFeedback = feedbackDates.some(feedbackDate =>
                feedbackDate.toDateString() === date.toDateString()
            );
            return hasFeedback ? 'has-feedback' : null;
        }
        return null;
    };

    const formatMonthYear = (locale, date) => {
        return `${date.getFullYear()}년, ${date.getMonth() + 1}월`;
    };

    if (loading) {
        return (
            <Container className="my-5 text-center">
                <p>아동 리스트를 불러오는 중입니다...</p>
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
            <h2 className="text-center mb-4">아동별 피드백 조회
                <Link to="/therapist/mypage/matching" className="ms-3">
                    <Button variant="outline-primary" size="sm">매칭 요청 보기</Button>
                </Link>
            </h2>
            <Row>
                <Col md={12}>
                    <Card className="shadow-sm p-3 card-base">
                        <Card.Body>
                            {clients.length === 0 ? (
                                <Alert variant="info">현재 담당하는 아동이 없습니다.</Alert>
                            ) : (
                                <div>
                                    {clients.map(client => (
                                        <div key={client.clientId} className="mb-3 card-base matching-client-item">
                                            <Row className="align-items-center w-100">
                                                <Col md={8} className="matching-client-info">
                                                    <h5>{client.name} ({client.age}세)</h5>
                                                    <p className="mb-1">이메일: {client.email}</p>
                                                    <p className="mb-1">전화: {client.telephone}</p>
                                                </Col>
                                                <Col md={4} className="text-md-end matching-client-actions">
                                                    <Button
                                                        className="btn-soft-primary"
                                                        onClick={() => handleShowFeedbackModal(client)}
                                                    >
                                                        피드백 보기
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

            {/* 피드백 모달 */}
            <Modal show={showFeedbackModal} onHide={handleCloseFeedbackModal} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {selectedClient ? `${selectedClient.name} (${selectedClient.age}세) 피드백` : '피드백 조회'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {clientDetail ? (
                        modalView === 'calendar' ? (
                            <Row>
                                <Col md={4}>
                                    <Card className="shadow-sm p-3 mb-3">
                                        <Card.Title className="mb-3">아동 정보</Card.Title>
                                        <p><strong>이름:</strong> {clientDetail.name}</p>
                                        <p><strong>닉네임:</strong> {clientDetail.nickname}</p>
                                        <p><strong>이메일:</strong> {clientDetail.email}</p>
                                        <p><strong>생년월일:</strong> {clientDetail.birthDate}</p>
                                        <p><strong>연락처:</strong> {clientDetail.tel1}{clientDetail.tel2 ? ` / ${clientDetail.tel2}` : ''}</p>
                                        <p><strong>주소:</strong> {clientDetail.city} {clientDetail.district} {clientDetail.dong} {clientDetail.detail}</p>
                                    </Card>
                                </Col>
                                <Col md={8}>
                                    <Card className="shadow-sm p-3">
                                        <Card.Title className="mb-3">피드백 달력</Card.Title>
                                        <Calendar
                                            onChange={handleDateChange}
                                            value={selectedDate}
                                            className="react-calendar-custom"
                                            formatMonthYear={formatMonthYear}
                                            prevLabel={<i className="bi bi-chevron-left"></i>}
                                            nextLabel={<i className="bi bi-chevron-right"></i>}
                                            prev2Label={null}
                                            next2Label={null}
                                            tileContent={tileContent}
                                            tileClassName={tileClassName}
                                            locale="ko-KR"
                                        />
                                        <div className="calendar-legend mt-3">
                                            <span className="dot-marker feedback-marker me-2"></span> 피드백 있음
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        ) : (
                            <div className="feedback-content-area mt-4 p-3 border rounded">
                                {feedbackContent ? (
                                    <>
                                        <h5>{selectedDate.toLocaleDateString('ko-KR')} 피드백</h5>
                                        <p><strong>동화책 제목:</strong> {feedbackContent.storybookTitle}</p>
                                        <p><strong>정확도:</strong> {feedbackContent.accuracy}%</p>
                                        <p><strong>피드백 내용:</strong> {feedbackContent.feedbackText}</p>
                                        <Button variant="primary" onClick={handleBackToCalendar} className="mt-3">
                                            뒤로가기
                                        </Button>
                                    </>
                                ) : (
                                    <Alert variant="info" className="text-center">
                                        피드백이 없습니다.
                                    </Alert>
                                )}
                            </div>
                        )
                    ) : (
                        <div className="text-center">아동 상세 정보 및 피드백 날짜를 불러오는 중입니다...</div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseFeedbackModal}>
                        닫기
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default TherapistFeedbackPage;