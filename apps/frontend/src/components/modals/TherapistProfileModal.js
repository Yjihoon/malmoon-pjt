import React from 'react';
import { Modal, Button, ListGroup, Card, Row, Col, Image } from 'react-bootstrap';
import './TherapistProfileModal.css';
import defaultImage from '../../assets/therapist.png';

/* ✅ 캐릭터 이미지: 프로젝트 경로에 맞게 필요시 수정 */
import penguinImg from '../../logoimage/penguin.png';
import bearImg    from '../../logoimage/bear.png';
import duckImg    from '../../logoimage/duck.png';
import wolfImg    from '../../logoimage/wolf.png';
import puppyImg   from '../../logoimage/puppy.png';
import parrotImg  from '../../logoimage/parrot.png';

const CHARACTER_IMAGES = {
  6: penguinImg, // 말펭이
  1: bearImg,    // 말곰이
  5: duckImg,    // 규덕
  2: wolfImg,    // 말랑이
  3: puppyImg,   // 말뭉이
  4: parrotImg,  // 말랭이
};

// 매칭 페이지와 동일: 0-based/1-based 모두 보정
const getProfileId = (t) => {
  const raw =
    t?.profile ??
    t?.profileImageId ??
    t?.profile_image_id ??
    t?.profileCharacterId;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  if (n >= 1 && n <= 6) return n;     // 1~6 그대로
  return 0;                           // 파일 PK 등 매핑 불가
};

// 날짜 포맷 (YYYY-MM-DD → YYYY년 M월 D일)
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return ''; // 잘못된 날짜 방어
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

function TherapistProfileModal({ show, handleClose, therapistProfile }) {
  if (!therapistProfile) return null;

  // ✅ URL 우선 → 매핑 이미지 → 폴백(이니셜/기본 이미지)
  const id = getProfileId(therapistProfile);
  const resolvedImg =
    therapistProfile?.profileImageUrl || CHARACTER_IMAGES[id] || null;

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered className="therapist-profile-modal">
      <Modal.Header closeButton>
        <Modal.Title>치료사 상세 프로필</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="profile-container">
          {resolvedImg ? (
            <Image
              src={resolvedImg}
              className="profile-image"
              alt={`${therapistProfile.name || '치료사'}님의 프로필 사진`}
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultImage; }}
            />
          ) : (
            <>
              {/* 이미지가 전혀 없으면 기본 이미지 or 이니셜 표시 중 택1 */}
              <Image
                src={defaultImage}
                className="profile-image"
                alt="기본 프로필"
              />
              {/* 이니셜 버전을 쓰고 싶으면 위 Image 대신 아래 블록 사용 */}
              {false && (
                <div className="profile-initial">
                  {therapistProfile?.name?.[0] ?? '치'}
                </div>
              )}
            </>
          )}

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
                <ListGroup.Item>
                  <strong>생년월일:</strong> {formatDate(therapistProfile.birthDate)}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>총 경력:</strong> {therapistProfile.careerYears}년
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="mb-3">
              <Card.Header as="h5">주소</Card.Header>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  {therapistProfile.address
                    ? `${therapistProfile.address.sido} ${therapistProfile.address.gugun}`
                    : '주소 정보 없음'}
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>

        <Card>
          <Card.Header as="h5">경력 정보</Card.Header>
          <ListGroup variant="flush">
            {Array.isArray(therapistProfile.careers) && therapistProfile.careers.length > 0 ? (
              therapistProfile.careers.map((career, index) => (
                <ListGroup.Item key={index} className="career-item">
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">{career.company}</h6>
                    <small>
                      {formatDate(career.startDate)} ~ {formatDate(career.endDate)}
                    </small>
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
