// UserSignUp.jsx
import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import CommonSignUpForm from '../../components/signup/CommonSignUpForm';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignupPage.css'; // ✅ 동일한 스타일 사용

function UserSignUp() {
  const [formData, setFormData] = useState({
    profile_image_id: 1,
    name: '',
    nickname: '',
    birth_date: '',
    email: '',
    password: '',
    passwordConfirm: '',
    tel1: '',
    tel2: '',
    city: '',
    district: '',
    dong: '',
    detail: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (updated) => {
    setFormData((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const validate = () => {
    const err = {};
    const f = formData;

    if (!f.profile_image_id) err.profile_image_id = '프로필 이미지를 선택해주세요.';
    if (!f.name) err.name = '이름은 필수입니다.';
    if (!f.nickname) err.nickname = '닉네임은 필수입니다.';
    if (!f.birth_date) err.birth_date = '생년월일은 필수입니다.';
    if (!f.email) err.email = '이메일은 필수입니다.';
    if (!f.password || f.password.length < 6)
      err.password = '비밀번호는 6자 이상이어야 합니다.';
    if (f.password !== f.passwordConfirm)
      err.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    if (!f.tel1) err.tel1 = '전화번호는 필수입니다.';
    if (!f.city || !f.district || !f.dong) err.address = '주소를 선택해주세요.';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError('');
    setSuccess(false);

    if (!validate()) return;

    try {
      setLoading(true);
      const payload = {
        ...formData,
        role: 'user',
      };
      await axios.post('/api/v1/members', payload);
      setSuccess(true);
      navigate('/login');
    } catch (err) {
      console.error(err);
      setServerError('회원가입 실패. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page-wrapper">
      <div className="signup-form-container">
        <Form onSubmit={handleSubmit}>
          <div className="form-title">사용자 회원가입</div>

          {serverError && <Alert variant="danger">{serverError}</Alert>}
          {success && <Alert variant="success">회원가입 성공! 로그인 해주세요.</Alert>}

          <div className="form-section">
            <CommonSignUpForm
              formData={formData}
              handleChange={handleChange}
              handleAddressChange={handleAddressChange}
              errors={errors}
            />
          </div>

          <div className="button-row">
            <Button type="submit" className="btn-submit" disabled={loading}>
              {loading ? '가입 중...' : '회원가입'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default UserSignUp;
