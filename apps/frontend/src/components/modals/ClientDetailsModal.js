import React, { useState } from 'react';
import { Modal, Button, Row, Col, Card } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../../pages/Therapist/MyPage/TherapistSchedulePage.css';
import FeedbackDisplayModal from './FeedbackDisplayModal';

function ClientDetailsModal({ show, handleClose, clientDetails }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [feedbackForSelectedDate, setFeedbackForSelectedDate] = useState('');

  // 피드백 모달 관련 상태
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentFeedbackContent, setCurrentFeedbackContent] = useState('');
  const [currentFeedbackDate, setCurrentFeedbackDate] = useState(null);

  // 더미 피드백 데이터 (실제로는 API 호출로 가져와야 함)
  const dummyFeedbacks = {
    'client1': {
      "2025-07-01": "김수민 어린이는 7월 1일 수업에서 발음 교정에 적극적으로 참여했습니다. 특히 'ㅅ' 발음이 많이 개선되었습니다.",
      '2025-07-15': '7월 15일 수업에서는 새로운 단어 학습에 집중했습니다. 그림 카드를 활용한 학습이 효과적이었습니다.',
    },
    'client2': {
      '2025-06-15': '박하은 어린이는 6월 15일 수업에서 언어 이해력은 좋았으나, 표현 어휘 사용에 어려움을 보였습니다.',
      '2025-07-05': '7월 5일 수업에서는 문장 구성 연습을 진행했습니다. 점차 복잡한 문장도 이해하고 표현하기 시작했습니다.',
    },
    'client3': {
      '2025-07-20': '이민준 어린이는 7월 20일 첫 수업에서 다소 긴장했지만, 점차 적응하며 기본적인 발음 연습에 참여했습니다.',
    },
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const feedback = dummyFeedbacks[clientDetails.id]?.[formattedDate];

    if (feedback) {
      setCurrentFeedbackContent(feedback);
      setCurrentFeedbackDate(date);
      setShowFeedbackModal(true);
    } else {
      // 피드백이 없는 경우, 기존처럼 메시지 표시 (선택 사항)
      setFeedbackForSelectedDate('해당 날짜에 피드백이 없습니다.');
    }
  };

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
    setCurrentFeedbackContent('');
    setCurrentFeedbackDate(null);
  };

  // 캘린더 날짜에 마커 표시 로직
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0];
      const hasFeedback = dummyFeedbacks[clientDetails.id]?.[dateString];
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

  if (!clientDetails) {
    return null; // clientDetails가 없으면 렌더링하지 않음
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>클라이언트 상세 정보</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={12}>
            <Card className="mb-3">
              <Card.Header>기본 정보</Card.Header>
              <Card.Body>
                <p><strong>이름:</strong> {clientDetails.name}</p>
                <p><strong>자녀:</strong> {clientDetails.childName} ({clientDetails.childAge}세)</p>
                <p><strong>이메일:</strong> {clientDetails.email}</p>
                <p><strong>전화:</strong> {clientDetails.phone}</p>
                <p><strong>매칭일:</strong> {clientDetails.matchingDate}</p>
                <p><strong>상태:</strong> {clientDetails.status}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Card>
          <Card.Header>수업 일정 (달력)</Card.Header>
          <Card.Body>
            <Calendar
              onChange={handleDateClick}
              value={selectedDate}
              className="react-calendar-custom"
              locale="ko-KR"
              onClickDay={handleDateClick}
              tileContent={tileContent}
            />
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          닫기
        </Button>
      </Modal.Footer>
      {/* FeedbackDisplayModal 컴포넌트 추가 */}
      <FeedbackDisplayModal
        show={showFeedbackModal}
        handleClose={handleCloseFeedbackModal}
        feedbackContent={currentFeedbackContent}
        date={currentFeedbackDate}
      />
    </Modal>
  );
}

export default ClientDetailsModal;