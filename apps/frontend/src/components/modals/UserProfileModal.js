import React from 'react';
import { Modal, Button, ListGroup, Card, Badge } from 'react-bootstrap';

function UserProfileModal({ show, handleClose, userProfile }) {
  if (!userProfile) {
    return null; // 프로필 데이터가 없으면 렌더링하지 않음
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{userProfile.name} 님의 상세 프로필</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card className="mb-3">
          <Card.Header as="h5">기본 정보</Card.Header>
          <ListGroup variant="flush">
            <ListGroup.Item>이름: {userProfile.name}</ListGroup.Item>
            <ListGroup.Item>이메일: {userProfile.email}</ListGroup.Item>
            <ListGroup.Item>전화: {userProfile.phone}</ListGroup.Item>
            <ListGroup.Item>자녀 이름: {userProfile.childName}</ListGroup.Item>
            <ListGroup.Item>자녀 나이: {userProfile.childAge}세</ListGroup.Item>
            <ListGroup.Item>매칭일: {userProfile.matchingDate}</ListGroup.Item>
            <ListGroup.Item>매칭 상태: <Badge bg={userProfile.status === '상담 진행 중' ? 'primary' : 'success'}>{userProfile.status}</Badge></ListGroup.Item>
          </ListGroup>
        </Card>

        <Card className="mb-3">
          <Card.Header as="h5">간이 언어 평가 정보</Card.Header>
          <Card.Body>
            <p>
              **현재는 더미 데이터입니다.** 실제로는 사용자가 진행한 간이 언어 평가 결과 (예: 점수, 평가 내용, 그래프 등)가 여기에 표시됩니다.
              사용자 프로필에 이 데이터가 포함되어 있다고 가정합니다.
            </p>
            {/* 예시 데이터 (실제 데이터 구조에 맞춰 변경) */}
            <ListGroup variant="flush">
              <ListGroup.Item>
                **음운 발달 점수:** <Badge bg="info">85점</Badge> (평균 대비 높음)
              </ListGroup.Item>
              <ListGroup.Item>
                **어휘력 점수:** <Badge bg="info">70점</Badge> (보통)
              </ListGroup.Item>
              <ListGroup.Item>
                **주요 특이사항:**
                <p className="mt-2">"김수민 어린이는 특정 발음(ㅅ, ㅈ)에서 오류를 보이며, 새로운 단어 습득에 시간이 다소 소요됩니다. 반복 학습이 필요합니다."</p>
              </ListGroup.Item>
            </ListGroup>
            {/* 실제 간이 언어 평가 페이지로 이동하는 링크 (필요 시) */}
            {/* <Button variant="link" className="p-0 mt-3">간이 언어 평가 전체 보고서 보기</Button> */}
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

export default UserProfileModal;