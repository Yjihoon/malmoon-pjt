import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Alert, Button, Modal, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import axios from '../../../api/axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './TherapistFeedbackPage.css';

/* === 캐릭터 이미지 매핑 === */
import penguinImg from '../../../logoimage/penguin.png';
import bearImg    from '../../../logoimage/bear.png';
import duckImg    from '../../../logoimage/duck.png';
import wolfImg    from '../../../logoimage/wolf.png';
import puppyImg   from '../../../logoimage/puppy.png';
import parrotImg  from '../../../logoimage/parrot.png';
import defaultAvatar from '../../../assets/therapist.png'; // 없으면 기본 이미지

const CHARACTER_IMAGES = {
  1: bearImg,    // 말곰이
  2: wolfImg,    // 말랑이
  3: puppyImg,   // 말뭉이
  4: parrotImg,  // 말랭이
  5: duckImg,    // 규덕
  6: penguinImg, // 말펭이
};

/* 다양한 응답 필드/중첩을 커버 + 0/1-베이스 + 문자열명 보정 */
const readFrom = (obj, keys) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null) return v;
  }
  return undefined;
};

const resolveProfileId = (obj) => {
  let raw = readFrom(obj, [
    'profile',
    'profileId',
    'profile_id',
    'profileImageId',
    'profile_image_id',
    'profile_image',
    'characterId',
    'character_id',
    'childProfile',
    'child_profile',
    'childProfileId',
    'avatarIndex',
  ]);

  if (raw === undefined) {
    const nests = [obj?.member, obj?.client, obj?.child, obj?.user];
    for (const nest of nests) {
      raw = readFrom(nest ?? {}, [
        'profile',
        'profileId',
        'profile_id',
        'profileImageId',
        'profile_image_id',
        'profile_image',
        'characterId',
        'character_id',
        'childProfile',
        'child_profile',
        'childProfileId',
        'avatarIndex',
      ]);
      if (raw !== undefined) break;
    }
  }

  // 문자열 보정: "PENGUIN", "char-3", "profile:2" 등
  if (typeof raw === 'string') {
    const lower = raw.toLowerCase();
    if (/\d+/.test(lower)) {
      const m = lower.match(/\d+/);
      const n = Number(m?.[0]);
      if (Number.isFinite(n)) {
        if (n >= 1 && n <= 6) return n;
        if (n >= 0 && n <= 5) return n + 1;
      }
    }
    if (lower.includes('bear')) return 1;
    if (lower.includes('wolf')) return 2;
    if (lower.includes('puppy') || lower.includes('dog')) return 3;
    if (lower.includes('parrot')) return 4;
    if (lower.includes('duck')) return 5;
    if (lower.includes('penguin')) return 6;
  }

  const n = Number(raw);
  if (Number.isFinite(n)) {
    if (n >= 1 && n <= 6) return n;     // 1~6 그대로
    if (n >= 0 && n <= 5) return n + 1; // 0~5 → 1~6 보정
  }
  return 1; // 안전 기본값(곰)
};

const getCharImg = (obj) => CHARACTER_IMAGES[resolveProfileId(obj)] || defaultAvatar;

function TherapistFeedbackPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [clientDetailMap, setClientDetailMap] = useState({}); // { [clientId]: detail }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Feedback Modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetail, setClientDetail] = useState(null);
  const [feedbackDates, setFeedbackDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [feedbackContent, setFeedbackContent] = useState(null);
  const [modalView, setModalView] = useState('calendar');

  // Chat Modal
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatClient, setChatClient] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  // 1) 리스트 불러오기
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get('/schedule/therapist/client', {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        const list = response.data || [];
        setClients(list);

        // 2) 각 아동 상세에서 프로필만 추출해 map 구성 (동시에 요청)
        const detailMap = {};
        const tasks = list.map((c) =>
          axios
            .get(`/schedule/therapist/client/detail?clientId=${c.clientId}`, {
              headers: { Authorization: `Bearer ${user.accessToken}` },
            })
            .then((res) => {
              detailMap[c.clientId] = res.data || {};
            })
            .catch(() => {
              // 실패해도 무시하고 진행 (곰 기본값)
            })
        );
        await Promise.allSettled(tasks);
        setClientDetailMap(detailMap);
      } catch (err) {
        setError('아동 리스트를 불러오는 데 실패했습니다.');
        console.error(err);
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
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      setClientDetail(detailResponse.data);

      const datesResponse = await axios.get(`/session-feedback/dates?childId=${client.clientId}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      setFeedbackDates((datesResponse.data?.dates || []).map((s) => new Date(s)));
    } catch (err) {
      console.error(err);
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

    const y = date.getFullYear();
    const m = (`0${date.getMonth() + 1}`).slice(-2);
    const d = (`0${date.getDate()}`).slice(-2);
    const dateStr = `${y}-${m}-${d}`;

    const hasFeedback = feedbackDates.some((fd) => fd.toDateString() === date.toDateString());
    if (hasFeedback && selectedClient) {
      try {
        const res = await axios.get(
          `/session-feedback/detail?childId=${selectedClient.clientId}&date=${dateStr}`,
          { headers: { Authorization: `Bearer ${user.accessToken}` } }
        );
        setFeedbackContent(res.data);
        setModalView('feedbackDetail');
      } catch (err) {
        console.error(err);
        setError('피드백 내용을 불러오는 데 실패했습니다.');
      }
    }
  };

  const handleBackToCalendar = () => {
    setModalView('calendar');
    setFeedbackContent(null);
  };

  // Chat
  const handleShowChatModal = async (client) => {
    setChatClient(client);
    setShowChatModal(true);
    setChatLoading(true);
    setChatError('');
    setMessages([]);
    setRoomId(null);

    try {
      const response = await axios.post(
        '/chat/room',
        {
          roomName: `${user.name} and ${client.name}'s Chat`,
          roomType: 'ONE_TO_ONE',
          participantIds: [user.memberId, client.clientId],
        },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      setRoomId(response.data.roomId);
    } catch (err) {
      console.error(err);
      setChatError('채팅방을 만들거나 가져오는 데 실패했습니다.');
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
      await axios.post(
        '/chat/room/message',
        { roomId, senderId: user.memberId, content: newMessage, messageType: 'TALK', sendAt: new Date().toISOString() },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      setNewMessage('');
      const response = await axios.get(`/chat/room/${roomId}/messages`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      setMessages(response.data);
    } catch (err) {
      console.error(err);
      setChatError('메시지 전송에 실패했습니다.');
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!roomId) return;
      try {
        const response = await axios.get(`/chat/room/${roomId}/messages`, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        setMessages(response.data);
      } catch (err) {
        console.error(err);
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
      const hasFeedback = feedbackDates.some((fd) => fd.toDateString() === date.toDateString());
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
      const hasFeedback = feedbackDates.some((fd) => fd.toDateString() === date.toDateString());
      return hasFeedback ? 'has-feedback' : null;
    }
    return null;
  };

  const formatMonthYear = (locale, date) => `${date.getFullYear()}년, ${date.getMonth() + 1}월`;

  const renderParsedFeedback = (text) => {
    if (!text) return <p>피드백 내용이 없습니다.</p>;
    const parts = text.split(/(오류자음\s*:|오류패턴\s*:|종합 언어능력 평가\s*:)/).filter((p) => p && p.trim());
    if (parts.length <= 1) return <p>{text}</p>;

    const result = {};
    for (let i = 0; i < parts.length; i += 2) {
      const marker = parts[i].replace(':', '').trim();
      const content = parts[i + 1];
      if (marker && content) result[marker] = content.trim();
    }

    const order = ['오류자음', '오류패턴', '종합 언어능력 평가'];
    const elements = order
      .map((m) =>
        result[m] ? (
          <div className="feedback-sub-block" key={m}>
            <strong>{m}</strong>
            <p>{result[m]}</p>
          </div>
        ) : null
      )
      .filter(Boolean);

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
      <div className="page-inner">
        <div className="page-header">
          <h2 className="page-title">아동별 피드백 조회</h2>
            <Button
            as={Link}
            to="/therapist/mypage/matching"
            size="sm"
            className="btn-soft-primary no-hover-btn page-header-btn"
            >
            매칭 요청 보기
            </Button>
        </div>

        <Row>
          <Col md={12}>
            <Card className="shadow-sm p-3 card-base no-lift">
              <Card.Body>
                {clients.length === 0 ? (
                  <Alert variant="info">현재 담당하는 아동이 없습니다.</Alert>
                ) : (
                  <div>
                    {clients.map((client) => {
                      const avatarSource = clientDetailMap[client.clientId] || client; // 상세가 있으면 그걸 우선 사용
                      return (
                        <div key={client.clientId} className="mb-3 card-base matching-client-item no-lift">
                          <Row className="align-items-center w-100">
                            <Col md={8} className="matching-client-info">
                              <div className="client-row">
                                <img
                                  src={getCharImg(avatarSource)}
                                  alt="아동 캐릭터"
                                  className="avatar"
                                  draggable={false}
                                />
                                <div className="client-text">
                                  <h5>
                                    {client.name} ({client.age}세)
                                  </h5>
                                  <p className="mb-1">이메일: {client.email}</p>
                                  <p className="mb-1">전화: {client.telephone}</p>
                                </div>
                              </div>
                            </Col>
                            <Col md={4} className="text-md-end matching-client-actions">
                              <Button className="btn-soft-primary no-hover-btn" onClick={() => handleShowFeedbackModal(client)}>
                                피드백 보기
                              </Button>
                              <Button className="btn-soft-primary ms-2 no-hover-btn" onClick={() => handleShowChatModal(client)}>
                                채팅
                              </Button>
                            </Col>
                          </Row>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Feedback Modal */}
      <Modal show={showFeedbackModal} onHide={handleCloseFeedbackModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedClient ? `${selectedClient.name} (${selectedClient.age}세) 피드백` : '피드백 조회'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {clientDetail ? (
            modalView === 'calendar' ? (
              <Row>
                <Col md={4}>
                  <Card className="shadow-sm p-3 mb-3 no-lift">
                    <div className="child-header">
                      <img
                        src={getCharImg(clientDetail)}
                        alt="아동 캐릭터"
                        className="avatar avatar-lg"
                        draggable={false}
                      />
                      <div className="child-header-text">
                        <div className="child-name">{clientDetail.name}</div>
                        <div className="child-meta">
                          {clientDetail.nickname ? `${clientDetail.nickname} · ` : ''}{selectedClient?.age}세
                        </div>
                      </div>
                    </div>
                    <hr className="soft-divider" />
                    <Card.Title className="mb-3">아동 정보</Card.Title>
                    <p><strong>이메일:</strong> {clientDetail.email}</p>
                    <p><strong>생년월일:</strong> {clientDetail.birthDate}</p>
                    <p><strong>연락처:</strong> {clientDetail.tel1}{clientDetail.tel2 ? ` / ${clientDetail.tel2}` : ''}</p>
                    <p><strong>주소:</strong> {clientDetail.city} {clientDetail.district} {clientDetail.dong} {clientDetail.detail}</p>
                  </Card>
                </Col>
                <Col md={8}>
                  <Card className="shadow-sm p-3 no-lift">
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
                      <Button
                        onClick={handleBackToCalendar}
                        variant="light"
                        className="position-absolute start-0 border-0 bg-transparent p-0 no-hover-btn"
                      >
                        <i className="bi bi-arrow-left-circle" style={{ fontSize: '1.5rem', color: '#6c757d' }}></i>
                      </Button>
                      <h5 className="mb-0">{selectedDate.toLocaleDateString('ko-KR')} 피드백</h5>
                    </div>

                    <div className="feedback-block no-lift">
                      <h6>동화책 제목</h6>
                      <p>{feedbackContent.storybookTitle}</p>
                    </div>

                    <div className="feedback-block no-lift">
                      <h6>정확도</h6>
                      <p>{feedbackContent.accuracy}%</p>
                    </div>

                    <div className="feedback-block no-lift">
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
          <Button variant="secondary" onClick={handleCloseFeedbackModal} className="no-hover-btn">
            닫기
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Chat Modal */}
      <Modal show={showChatModal} onHide={handleCloseChatModal} centered size="md">
        <Modal.Header closeButton>
          <Modal.Title>{chatClient ? `${chatClient.name}님과의 채팅` : '채팅'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="chat-modal-body">
          {chatLoading ? (
            <div className="text-center">채팅방을 불러오는 중입니다...</div>
          ) : chatError ? (
            <Alert variant="danger">{chatError}</Alert>
          ) : (
            <div className="messages-area">
              {messages.map((msg, i) => (
                <div key={i} className={`message-bubble ${msg.senderId === user.memberId ? 'sent' : 'received'}`}>
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
              <Button variant="primary" type="submit" disabled={chatLoading || !!chatError} className="no-hover-btn">
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
