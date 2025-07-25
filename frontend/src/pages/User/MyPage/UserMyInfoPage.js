import React, { useState, useEffect } from 'react';
import { Container, Form, Row, Col, Alert, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext'; // AuthContext에서 사용자 정보 가져오기

function UserMyInfoPage() {
  const { user } = useAuth(); // 현재 로그인한 사용자 정보
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '', // 사용자도 주소 필드가 있을 수 있음
    // 사용자 고유 정보 추가 (예: childInfo, preferences 등)
    childName: '',
    childAge: '',
    notes: '', // 기타 특이사항
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  // 컴포넌트 마운트 시 사용자 정보를 폼 데이터로 초기화
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.userEmail || '',
        phone: user.phone || '',
        address: user.address || '',
        childName: user.childName || '',
        childAge: user.childAge || '',
        notes: user.notes || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: null });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name) newErrors.name = '이름은 필수입니다.';
    if (!formData.email) newErrors.email = '이메일은 필수입니다.';
    // TODO: 이메일 형식 유효성 검사 추가
    if (!formData.phone) newErrors.phone = '휴대폰 번호는 필수입니다.';
    // TODO: 기타 사용자 정보 필드의 유효성 검사 추가

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccess(false);

    if (validateForm()) {
      setLoading(true);
      try {
        // 실제 백엔드 API 호출
        // const response = await api.put('/api/user/profile', formData);
        console.log('사용자 정보 업데이트 시도:', formData);

        // 목업: 성공 시
        setSuccess(true);
        setServerError('');
        // TODO: AuthContext의 user 정보도 업데이트 (로그인 시와 유사)
        // updateAuthUser(formData);
      } catch (err) {
        setServerError('정보 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.');
        console.error('정보 업데이트 오류:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!user) {
    return (
      <Container className="my-5 text-center">
        <Alert variant="warning">로그인 정보가 없습니다. 다시 로그인 해주세요.</Alert>
        <Button as={Link} to="/login">로그인 페이지로</Button>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Card className="p-4 shadow-sm">
        <h2 className="text-center mb-4">내 정보 수정 (사용자)</h2>

        {serverError && <Alert variant="danger">{serverError}</Alert>}
        {success && <Alert variant="success">정보가 성공적으로 업데이트되었습니다!</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridName">
              <Form.Label>이름</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                isInvalid={!!errors.name}
                readOnly // 이름은 일반적으로 수정하지 못하게 (필요시 제거)
              />
              <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} controlId="formGridEmail">
              <Form.Label>이메일 주소</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
                readOnly // 이메일은 일반적으로 수정하지 못하게
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>
          </Row>

          <Form.Group className="mb-3" controlId="formGridPhone">
            <Form.Label>휴대폰 번호</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              isInvalid={!!errors.phone}
            />
            <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formGridAddress">
            <Form.Label>주소 (선택 사항)</Form.Label>
            <Form.Control
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              isInvalid={!!errors.address}
            />
            <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
          </Form.Group>

          <hr className="my-4" />

          {/* 자녀 정보 */}
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridChildName">
              <Form.Label>자녀 이름</Form.Label>
              <Form.Control
                type="text"
                name="childName"
                value={formData.childName}
                onChange={handleChange}
                isInvalid={!!errors.childName}
              />
              <Form.Control.Feedback type="invalid">{errors.childName}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} controlId="formGridChildAge">
              <Form.Label>자녀 나이</Form.Label>
              <Form.Control
                type="number"
                name="childAge"
                value={formData.childAge}
                onChange={handleChange}
                isInvalid={!!errors.childAge}
              />
              <Form.Control.Feedback type="invalid">{errors.childAge}</Form.Control.Feedback>
            </Form.Group>
          </Row>

          <Form.Group className="mb-4" controlId="formGridNotes">
            <Form.Label>기타 특이사항</Form.Label>
            <Form.Control
              as="textarea"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              isInvalid={!!errors.notes}
            />
            <Form.Control.Feedback type="invalid">{errors.notes}</Form.Control.Feedback>
          </Form.Group>


          <Button variant="primary" type="submit" className="w-100" disabled={loading}>
            {loading ? '저장 중...' : '정보 저장'}
          </Button>
        </Form>
      </Card>
    </Container>
  );
}

export default UserMyInfoPage;