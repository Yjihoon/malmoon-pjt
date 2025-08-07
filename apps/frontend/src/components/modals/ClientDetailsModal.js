import React from 'react';
import { Modal, Button, Card, ListGroup } from 'react-bootstrap';

function ClientDetailsModal({ show, handleClose, clientDetails }) {
  if (!clientDetails) {
    return null; // 클라이언트 데이터가 없으면 렌더링하지 않음
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{clientDetails.name} 님의 상세 정보</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card className="mb-3">
          <Card.Header>기본 정보</Card.Header>
          <ListGroup variant="flush">
            <ListGroup.Item>이름: {clientDetails.name}</ListGroup.Item>
            <ListGroup.Item>이메일: {clientDetails.email}</ListGroup.Item>
            <ListGroup.Item>전화: {clientDetails.telephone}</ListGroup.Item>
            <ListGroup.Item>나이: {clientDetails.age}세</ListGroup.Item>
          </ListGroup>
        </Card>

        <Card className="mb-3">
          <Card.Header>피드백 및 평가 정보</Card.Header>
          <Card.Body>
            <p className="text-muted">
              현재는 피드백 및 평가 정보가 제공되지 않습니다.
            </p>
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

export default ClientDetailsModal;
