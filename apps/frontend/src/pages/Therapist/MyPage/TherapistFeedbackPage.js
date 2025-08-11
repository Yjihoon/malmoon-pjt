import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Alert, Button, Modal, Form, InputGroup } from 'react-bootstrap';
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

    // Feedback Modal states
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientDetail, setClientDetail] = useState(null);
    const [feedbackDates, setFeedbackDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [feedbackContent, setFeedbackContent] = useState(null);
    const [modalView, setModalView] = useState('calendar');

    // Chat Modal states
    const [showChatModal, setShowChatModal] = useState(false);
    const [chatClient, setChatClient] = useState(null);
    const [roomId, setRoomId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [chatError, setChatError] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    useEffect(() => {
        const fetchClients = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get('/schedule/therapist/client', {
                    headers : {"Authorization": `Bearer ${user.accessToken}`}
                });
                setClients(response.data);
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

    // Feedback Modal handlers
    const handleShowFeedbackModal = async (client) => {
        setSelectedClient(client);
        setShowFeedbackModal(true);
        setModalView('calendar');
        setClientDetail(null);
        setFeedbackDates([]);
        setFeedbackContent(null);
        setSelectedDate(new Date());

        try {
            const detailResponse = await axios.get(`/schedule/therapist/client/detail?clientId=${client.clientId}`, {
                headers : {"Authorization": `Bearer ${user.accessToken}`}
            });
            setClientDetail(detailResponse.data);

            const datesResponse = await axios.get(`/session-feedback/dates?childId=${client.clientId}`, {
                headers : {"Authorization": `Bearer ${user.accessToken}`}
            });
            setFeedbackDates(datesResponse.data.dates.map(dateStr => new Date(dateStr)));
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
        setModalView('calendar');
    };

    const handleDateChange = async (date) => {
        setSelectedDate(date);
        setFeedbackContent(null);

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
                setModalView('feedbackDetail');
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

    // Chat Modal handlers and logic
    const handleShowChatModal = async (client) => {
        setChatClient(client);
        setShowChatModal(true);
        setChatLoading(true);
        setChatError('');
        setMessages([]);
        setRoomId(null);

        try {
            const response = await axios.post('/chat/room', {
                roomName: `${user.name} and ${client.name}'s Chat`,
                roomType: 'ONE_TO_ONE',
                participantIds: [user.memberId, client.clientId]
            }, {
                headers: { "Authorization": `Bearer ${user.accessToken}` }
            });
            const newRoomId = response.data.roomId;
            setRoomId(newRoomId);
        } catch (err) {
            setChatError('채팅방을 만들거나 가져오는 데 실패했습니다.');
            console.error('Error creating/getting chat room:', err);
            setChatLoading(false);
        }
    };

    const handleCloseChatModal = () => {
        setShowChatModal(false);
        setChatClient(null);
        setRoomId(null);
        setMessages([]);
        setNewMessage('');
        setChatError('');
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !roomId) return;

        try {
            await axios.post('/chat/room/message', {
                roomId: roomId,
                senderId: user.memberId,
                content: newMessage,
                messageType: 'TALK',
                sendAt: new Date().toISOString()
            }, {
                headers: { "Authorization": `Bearer ${user.accessToken}` }
            });
            setNewMessage('');
            // Immediately fetch messages after sending
            const response = await axios.get(`/chat/room/${roomId}/messages`, {
                headers: { "Authorization": `Bearer ${user.accessToken}` }
            });
            setMessages(response.data);
        } catch (err) {
            setChatError('메시지 전송에 실패했습니다.');
            console.error('Error sending message:', err);
        }
    };

    useEffect(() => {
        const fetchMessages = async () => {
            if (!roomId) return;
            try {
                const response = await axios.get(`/chat/room/${roomId}/messages`, {
                    headers: { "Authorization": `Bearer ${user.accessToken}` }
                });
                setMessages(response.data);
            } catch (err) {
                // Don't show error for polling failures
                console.error('Error fetching messages:', err);
            } finally {
                setChatLoading(false);
            }
        };

        if (showChatModal && roomId) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [showChatModal, roomId, user]);


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

    const renderParsedFeedback = (text) => {
        if (!text) return <p>피드백 내용이 없습니다.</p>;

        // 마커를 기준으로 문자열을 분할합니다. 괄호 안의 정규식은 구분자(마커)도 결과 배열에 포함시킵니다.
        const parts = text.split(/(오류자음\s*:|오류패턴\s*:|종합 언어능력 평가\s*:)/).filter(p => p && p.trim());

        if (parts.length <= 1) {
            return <p>{text}</p>; // 마커가 없는 경우, 원본 텍스트를 표시합니다.
        }

        const result = {};
        // 분할된 배열을 짝지어 마커와 내용으로 구성된 객체를 생성합니다.
        for (let i = 0; i < parts.length; i += 2) {
            const marker = parts[i].replace(':', '').trim();
            const content = parts[i + 1];
            if (marker && content) {
                result[marker] = content.trim();
            }
        }

        const markersOrder = ['오류자음', '오류패턴', '종합 언어능력 평가'];
        const elements = markersOrder.map(marker => {
            if (result[marker]) {
                return (
                    <div className="feedback-sub-block" key={marker}>
                        <strong>{marker}</strong>
                        <p>{result[marker]}</p>
                    </div>
                );
            }
            return null;
        }).filter(Boolean);

        // 파싱된 요소가 있으면 표시하고, 없으면 원본 텍스트를 표시합니다.
        return elements.length > 0 ? elements : <p>{text}</p>;
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
                                                    <Button
                                                        className="btn-soft-primary ms-2"
                                                        onClick={() => handleShowChatModal(client)}
                                                    >
                                                        채팅
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

            {/* Feedback Modal */}
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
                            <div className="feedback-detail-container">
                                {feedbackContent ? (
                                    <>
                                        <div className="d-flex justify-content-center align-items-center mb-4 position-relative">
                                            <Button onClick={handleBackToCalendar} variant="light" className="position-absolute start-0 border-0 bg-transparent p-0">
                                                <i className="bi bi-arrow-left-circle" style={{ fontSize: '1.5rem', color: '#6c757d' }}></i>
                                            </Button>
                                            <h5 className="mb-0">{selectedDate.toLocaleDateString('ko-KR')} 피드백</h5>
                                        </div>

                                        <div className="feedback-block">
                                            <h6>동화책 제목</h6>
                                            <p>{feedbackContent.storybookTitle}</p>
                                        </div>

                                        <div className="feedback-block">
                                            <h6>정확도</h6>
                                            <p>{feedbackContent.accuracy}%</p>
                                        </div>

                                        <div className="feedback-block">
                                            <h6>피드백 내용</h6>
                                            {renderParsedFeedback(feedbackContent.feedbackText)}
                                        </div>
                                    </>
                                ) : (
                                    <Alert variant="info" className="text-center">
                                        해당 날짜에 피드백이 없습니다.
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

            {/* Chat Modal */}
            <Modal show={showChatModal} onHide={handleCloseChatModal} centered size="md">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {chatClient ? `${chatClient.name}님과의 채팅` : '채팅'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="chat-modal-body">
                    {chatLoading ? (
                        <div className="text-center">채팅방을 불러오는 중입니다...</div>
                    ) : chatError ? (
                        <Alert variant="danger">{chatError}</Alert>
                    ) : (
                        <div className="messages-area">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`message-bubble ${msg.senderId === user.memberId ? 'sent' : 'received'}`}
                                >
                                    <div className="message-content">{msg.content}</div>
                                    <div className="message-time">{new Date(msg.sendAt).toLocaleTimeString()}</div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Form onSubmit={handleSendMessage} className="w-100">
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="메시지를 입력하세요..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={chatLoading || !!chatError}
                            />
                            <Button variant="primary" type="submit" disabled={chatLoading || !!chatError}>
                                전송
                            </Button>
                        </InputGroup>
                    </Form>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default TherapistFeedbackPage;