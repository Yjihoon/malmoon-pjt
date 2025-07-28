// src/pages/Therapist/MyPage/TherapistMyInfoPage.js
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Alert, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // <-- 이 줄이 추가되었습니다.
import { useAuth } from '../../../contexts/AuthContext'; // AuthContext에서 사용자 정보 가져오기

function TherapistMyInfoPage() {
  const { user } = useAuth(); // 현재 로그인한 사용자 정보
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    // 기타 치료사 고유 정보 (예: licenseNumber, specialization 등)
    licenseNumber: '',
    specialization: '',
    introduction: '', // 자기소개
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  // 컴포넌트 마운트 시 사용자 정보를 폼 데이터로 초기화
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '', // user 객체에 name 필드가 있다고 가정
        email: user.userEmail || '', // userEmail 사용
        phone: user.phone || '',
        address: user.address || '',
        licenseNumber: user.licenseNumber || '',
        specialization: user.specialization || '',
        introduction: user.introduction || '',
      });
    }
  }, [user]); // user 객체가 변경될 때마다 실행

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: null }); // 입력 시 해당 필드의 에러 초기화
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name) newErrors.name = '이름은 필수입니다.';
    if (!formData.email) newErrors.email = '이메일은 필수입니다.';
    // TODO: 이메일 형식 유효성 검사 추가
    if (!formData.phone) newErrors.phone = '휴대폰 번호는 필수입니다.';
    // TODO: 기타 치료사 정보 필드의 유효성 검사 추가

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
        // 실제 백엔드 API 호출 (예: Axios 사용)
        // const response = await api.put('/api/therapist/profile', formData);
        console.log('치료사 정보 업데이트 시도:', formData);

        // 목업: 성공 시
        setSuccess(true);
        setServerError(''); // 성공 시 기존 에러 메시지 초기화
        // TODO: AuthContext의 user 정보도 업데이트 (로그인 시와 유사)
        // updateAuthUser(formData); // AuthContext에 업데이트 함수를 추가해야 함
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
        <h2 className="text-center mb-4">내 정보 수정 (치료사)</h2>

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

          <hr className="my-4" /> {/* 구분선 */}

          {/* 치료사 고유 정보 */}
          <Form.Group className="mb-3" controlId="formGridLicenseNumber">
            <Form.Label>자격증 번호</Form.Label>
            <Form.Control
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              isInvalid={!!errors.licenseNumber}
            />
            <Form.Control.Feedback type="invalid">{errors.licenseNumber}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formGridSpecialization">
            <Form.Label>전문 분야</Form.Label>
            <Form.Control
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              isInvalid={!!errors.specialization}
            />
            <Form.Control.Feedback type="invalid">{errors.specialization}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4" controlId="formGridIntroduction">
            <Form.Label>자기소개</Form.Label>
            <Form.Control
              as="textarea"
              name="introduction"
              rows={5}
              value={formData.introduction}
              onChange={handleChange}
              isInvalid={!!errors.introduction}
            />
            <Form.Control.Feedback type="invalid">{errors.introduction}</Form.Control.Feedback>
          </Form.Group>


          <Button variant="primary" type="submit" className="w-100" disabled={loading}>
            {loading ? '저장 중...' : '정보 저장'}
          </Button>
        </Form>
      </Card>
    </Container>
  );
}

export default TherapistMyInfoPage;