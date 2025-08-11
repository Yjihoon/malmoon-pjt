import React from 'react';
import { Modal, Button, ListGroup, Card, Row, Col, Image } from 'react-bootstrap';
import './TherapistProfileModal.css'; // CSS 파일 임포트
import defaultImage from '../../assets/therapist.png'; // 기본 이미지 임포트

function TherapistProfileModal({ show, handleClose, therapistProfile }) {
  if (!therapistProfile) {
    return null; // 프로필 데이터가 없으면 렌더링하지 않음
  }

  // 프로필 이미지 동적 선택
  let profileImage;
  if (therapistProfile.profile && therapistProfile.profile >= 1 && therapistProfile.profile <= 6) {
    try {
      profileImage = require(`../../logoimage/char${therapistProfile.profile}.png`);
    } catch (e) {
      profileImage = defaultImage; // 이미지가 없는 경우 기본 이미지 사용
    }
  } else {
    profileImage = defaultImage;
  }


  // 날짜 포맷 변경 함수 (YYYY-MM-DD)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered className="therapist-profile-modal">
      <Modal.Header closeButton>
        <Modal.Title>치료사 상세 프로필</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="profile-container">
          <Image 
            src={profileImage} 
            className="profile-image" 
            alt={`${therapistProfile.name}님의 프로필 사진`}
            onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
          />
          <div className="profile-info">
            <h4>{therapistProfile.name}</h4>
            <p>{therapistProfile.email}</p>
            <p>{therapistProfile.telephone}</p>
          </div>
        </div>

        <Row>
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header as="h5">기본 정보</Card.Header>
              <ListGroup variant="flush">
                <ListGroup.Item><strong>생년월일:</strong> {formatDate(therapistProfile.birthDate)}</ListGroup.Item>
                <ListGroup.Item><strong>총 경력:</strong> {therapistProfile.careerYears}년</ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header as="h5">주소</Card.Header>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  {therapistProfile.address ? 
                    `${therapistProfile.address.sido} ${therapistProfile.address.gugun}` 
                    : '주소 정보 없음'}
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>

        <Card>
          <Card.Header as="h5">경력 정보</Card.Header>
          <ListGroup variant="flush">
            {therapistProfile.careers && therapistProfile.careers.length > 0 ? (
              therapistProfile.careers.map((career, index) => (
                <ListGroup.Item key={index} className="career-item">
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">{career.company}</h6>
                    <small>{formatDate(career.startDate)} ~ {formatDate(career.endDate)}</small>
                  </div>
                  <p className="mb-1">{career.position}</p>
                </ListGroup.Item>
              ))
            ) : (
              <ListGroup.Item>경력 정보가 없습니다.</ListGroup.Item>
            )}
          </ListGroup>
        </Card>

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default TherapistProfileModal;
