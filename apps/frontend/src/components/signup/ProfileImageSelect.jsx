import React, { useState } from 'react';
import { Form, Image, Row, Col, Button, Modal } from 'react-bootstrap';

const PROFILE_IMAGES = [
  { id: 1, src: '/images/profile1.png', label: '말곰이' },
  { id: 2, src: '/images/profile2.png', label: '말랑이' },
  { id: 3, src: '/images/profile3.png', label: '말뭉이' },
  { id: 4, src: '/images/profile4.png', label: '말랭이' },
  { id: 5, src: '/images/profile5.png', label: '우주최강자규덕' },
  { id: 6, src: '/images/profile6.png', label: '말펭이' },
];

function ProfileImageSelect({ value, onChange, error }) {
  const [showModal, setShowModal] = useState(false);

  const numericValue = Number(value); // 강제 숫자 변환
  const selected = PROFILE_IMAGES.find((img) => img.id === numericValue) || PROFILE_IMAGES[0];

  const handleSelect = (id) => {
    onChange(id); // formData 업데이트 요청
    setShowModal(false); // 모달 닫기
  };

  return (
    <Form.Group controlId="profileImageId" className="mb-4 text-center">
      <Form.Label>프로필 캐릭터</Form.Label>
      <div>
        <Image
          src={selected.src}
          alt={selected.label}
          roundedCircle
          width={100}
          height={100}
          style={{ border: '3px solid #007bff', padding: 2 }}
        />
        <div className="mt-2 mb-3">{selected.label}</div>

        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => setShowModal(true)}
        >
          캐릭터 이미지 교체하기
        </Button>
      </div>

      {error && <div className="text-danger small mt-2">{error}</div>}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>캐릭터 선택</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            {PROFILE_IMAGES.map((img) => (
              <Col key={img.id} xs={6} md={4} className="text-center mb-3">
                <Image
                  src={img.src}
                  alt={img.label}
                  roundedCircle
                  width={80}
                  height={80}
                  style={{
                    border: numericValue === img.id ? '3px solid #007bff' : '2px solid #ccc',
                    padding: 2,
                  }}
                />
                <div className="small mt-1">{img.label}</div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="mt-1"
                  onClick={() => handleSelect(img.id)}
                >
                  선택
                </Button>
              </Col>
            ))}
          </Row>
        </Modal.Body>
      </Modal>
    </Form.Group>
  );
}

export default ProfileImageSelect;
