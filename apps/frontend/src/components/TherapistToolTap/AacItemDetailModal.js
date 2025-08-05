import React from 'react';
import { Modal, Image, Badge, ListGroup } from 'react-bootstrap';

const AacItemDetailModal = ({ show, onHide, item }) => {
  if (!item) {
    return null;
  }

  // [수정 및 로그 추가] 잘못된 중복 URL과 한글/공백 문제를 해결하고 경로를 확인하는 함수
  const getCorrectUrl = (url) => {
    // --- [콘솔 로그 추가] ---
    console.log(`[AacItemDetailModal - ${item.name}] 원본 URL:`, url);
    // ------------------------

    if (!url || typeof url !== 'string') {
      return null;
    }
    let correctedUrl = url;
    // URL이 'https://'로 여러 번 시작하는 경우, 마지막 'https://' 부분만 사용
    if ((url.match(/https:\/\//g) || []).length > 1) {
      const lastIndex = url.lastIndexOf('https://');
      correctedUrl = url.substring(lastIndex);
    }
    
    const finalUrl = encodeURI(correctedUrl);
    // --- [콘솔 로그 추가] ---
    console.log(`[AacItemDetailModal - ${item.name}] 최종 URL:`, finalUrl);
    // ------------------------
    return finalUrl;
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{item.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <Image src={getCorrectUrl(item.fileId) || "https://placehold.co/300x300?text=No+Image"} fluid rounded className="mb-3" />
        <p className="text-muted">{item.description}</p>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>상황:</strong> <Badge bg="primary">{item.situation}</Badge>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>행동:</strong> <Badge bg="info">{item.action}</Badge>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>감정:</strong> <Badge bg="success">{item.emotion || 'N/A'}</Badge>
          </ListGroup.Item>
           <ListGroup.Item>
            <strong>상태:</strong> <Badge bg="secondary">{item.status}</Badge>
          </ListGroup.Item>
        </ListGroup>
      </Modal.Body>
    </Modal>
  );
};

export default AacItemDetailModal;
