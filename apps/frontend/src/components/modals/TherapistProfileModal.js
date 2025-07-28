import React from 'react';
import { Modal, Button, ListGroup, Card, Badge } from 'react-bootstrap';

function TherapistProfileModal({ show, handleClose, therapistProfile }) {
  if (!therapistProfile) {
    return null; // 프로필 데이터가 없으면 렌더링하지 않음
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{therapistProfile.name} 님의 상세 프로필</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card className="mb-3">
          <Card.Header as="h5">기본 정보</Card.Header>
          <ListGroup variant="flush">
            <ListGroup.Item>이름: {therapistProfile.name}</ListGroup.Item>
            <ListGroup.Item>이메일: {therapistProfile.email}</ListGroup.Item>
            <ListGroup.Item>전화: {therapistProfile.phone}</ListGroup.Item>
            <ListGroup.Item>전문 분야: {therapistProfile.specialization}</ListGroup.Item>
            <ListGroup.Item>자격증 번호: {therapistProfile.licenseNumber}</ListGroup.Item>
            <ListGroup.Item>매칭일: {therapistProfile.matchingDate}</ListGroup.Item>
            <ListGroup.Item>매칭 상태: <Badge bg={therapistProfile.status === '상담 진행 중' ? 'primary' : 'success'}>{therapistProfile.status}</Badge></ListGroup.Item>
          </ListGroup>
        </Card>

        <Card className="mb-3">
          <Card.Header as="h5">경력 정보</Card.Header>
          <Card.Body>
            <p>
              **현재는 더미 데이터입니다.** 실제로는 치료사의 상세한 경력 (학력, 주요 경력, 수상 내역, 전문 교육 등)이 여기에 표시됩니다.
              치료사 프로필에 이 데이터가 포함되어 있다고 가정합니다.
            </p>
            {/* 예시 데이터 (실제 데이터 구조에 맞춰 변경) */}
            <ListGroup variant="flush">
              <ListGroup.Item>
                **학력:** <p className="ms-3 mb-1">
                  - ABC대학교 언어치료학과 졸업 (석사)
                </p>
              </ListGroup.Item>
              <ListGroup.Item>
                **주요 경력:**
                <p className="ms-3 mb-1">
                  - XYZ 언어치료센터 (5년 근무, 책임 치료사)<br/>
                  - Happy 아동병원 언어치료실 (3년 근무)
                </p>
              </ListGroup.Item>
              <ListGroup.Item>
                **전문 분야:** <p className="ms-3 mb-1">
                  - 아동 발달 지연, 조음 음운 장애, 유창성 장애
                </p>
              </ListGroup.Item>
            </ListGroup>
            {/* 치료사 프로필 설정 페이지로 이동하는 링크 (필요 시) */}
            {/* <Button variant="link" className="p-0 mt-3">치료사 프로필 상세 보기</Button> */}
          </Card.Body>
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