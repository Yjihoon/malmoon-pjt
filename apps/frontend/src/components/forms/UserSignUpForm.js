import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import BasicInfoForm from './BasicInfoForm';
import ContactInfoForm from './ContactInfoForm';

function UserSignUpForm() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    address: '', // 사용자는 주소 선택 사항
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    let newErrors = {};
    // 기본 정보 유효성 검사
    if (!formData.email) newErrors.email = '이메일은 필수입니다.';
    if (!formData.name) newErrors.name = '이름은 필수입니다.';
    if (!formData.password) newErrors.password = '비밀번호는 필수입니다.';
    else if (formData.password.length < 6) newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    if (formData.password !== formData.passwordConfirm) newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';

    // 연락처 유효성 검사
    if (!formData.phone) newErrors.phone = '휴대폰 번호는 필수입니다.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccess(false);

    if (validateForm()) {
      setLoading(true);
      // 실제 서버 통신 로직 (예: Axios 사용)
      try {
        // const response = await api.post('/api/user/signup', formData); // 백엔드 API 호출
        console.log('사용자 회원가입 데이터:', formData);
        // 성공 시
        setSuccess(true);
        // 폼 데이터 초기화 또는 로그인 페이지로 리다이렉트
      } catch (err) {
        setServerError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
        console.error('회원가입 오류:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm">
      <h3 className="mb-4 text-center">사용자 회원가입</h3>

      {serverError && <Alert variant="danger">{serverError}</Alert>}
      {success && <Alert variant="success">회원가입이 성공적으로 완료되었습니다! 로그인해주세요.</Alert>}

      <BasicInfoForm formData={formData} handleChange={handleChange} errors={errors} />
      <ContactInfoForm formData={formData} handleChange={handleChange} errors={errors} />

      <Button variant="primary" type="submit" className="w-100 mt-4" disabled={loading}>
        {loading ? '가입 중...' : '사용자 회원가입'}
      </Button>
    </Form>
  );
}

export default UserSignUpForm;