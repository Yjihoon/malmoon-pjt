import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // 사용자 정보 가져오기

function UserDashboardPage() {
  const { user } = useAuth(); // AuthContext에서 현재 로그인한 사용자 정보 가져오기

  return (
    <Container className="my-5 main-container">
      <h1 className="mb-4 text-center">안녕하세요, {user?.userEmail} 님!</h1>
      <p className="lead text-center mb-5">
        새로운 언어 치료 여정을 시작해보세요.
      </p>

      <Row className="g-4">
        {/* 매칭된 치료사 정보/새로운 매칭 카드 */}
        <Col md={6} lg={4}>
          <Card className="h-100 shadow-sm card-base">
            <Card.Body>
              <Card.Title className="h4">나의 치료사</Card.Title>
              <Card.Text>
                매칭된 치료사 정보를 확인하고, 새로운 치료사 매칭을 신청합니다.
              </Card.Text>
              <Link to="/user/matching" className="btn-soft-primary">
                치료사 찾기
              </Link>
            </Card.Body>
          </Card>
        </Col>

        {/* 치료 일정 카드 */}
        <Col md={6} lg={4}>
          <Card className="h-100 shadow-sm card-base">
            <Card.Body>
              <Card.Title className="h4">나의 치료 일정</Card.Title>
              <Card.Text>
                예정된 치료 일정을 확인하고, 지난 치료 기록을 볼 수 있습니다.
              </Card.Text>
              <Link to="/user/schedule" className="btn-soft-info">
                일정 확인
              </Link>
            </Card.Body>
          </Card>
        </Col>

        {/* 간이 언어 평가 카드 */}
        <Col md={6} lg={4}>
          <Card className="h-100 shadow-sm card-base">
            <Card.Body>
              <Card.Title className="h4">간이 언어 평가</Card.Title>
              <Card.Text>
                현재 언어 발달 수준을 간략하게 평가해볼 수 있습니다.
              </Card.Text>
              <Link to="/assessment" className="btn-soft-success">
                평가 시작
              </Link>
            </Card.Body>
          </Card>
        </Col>

        {/* 프로필 설정 카드 */}
        <Col md={6} lg={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title className="h4">프로필 설정</Card.Title>
              <Card.Text>
                개인 정보를 수정하고, 선호하는 치료 옵션을 설정합니다.
              </Card.Text>
              <Link to="/user/profile-settings" className="btn-soft-secondary">
                프로필 편집
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default UserDashboardPage;