import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import CommonSignUpForm from '../../components/signup/CommonSignUpForm';
import TherapistExtraForm from '../../components/signup/TherapistExtraForm';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignupPage.css';

function TherapistSignUp() {
  const [formData, setFormData] = useState({
    profile_image_id: 1,
    name: '',
    nickname: '',
    birthDate: '', // ✅ 변경된 부분
    email: '',
    password: '',
    passwordConfirm: '',
    tel1: '',
    tel2: '',
    city: '',
    district: '',
    dong: '',
    detail: '',
    qualification_image_file: null,
    careerYears: 0,
    careerHistory: [
      {
        company: '',
        position: '',
        start_date: '',
        end_date: '',
      },
    ],
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (updated) => {
    setFormData((prev) => ({ ...prev, ...updated }));
  };

  const handleCareerChange = (index, field, value) => {
    const updated = [...formData.careerHistory];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, careerHistory: updated }));
  };

  const handleAddCareer = () => {
    setFormData((prev) => ({
      ...prev,
      careerHistory: [...prev.careerHistory, { company: '', position: '', start_date: '', end_date: '' }],
    }));
  };

  const handleRemoveCareer = (index) => {
    const updated = formData.careerHistory.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, careerHistory: updated }));
  };

  const validate = () => {
    const err = {};
    const f = formData;

    if (!f.profile_image_id) err.profile_image_id = '프로필 이미지를 선택해주세요.';
    if (!f.name) err.name = '이름은 필수입니다.';
    if (!f.nickname) err.nickname = '닉네임은 필수입니다.';
    if (!f.birthDate) err.birthDate = '생년월일은 필수입니다.'; // ✅ 변경된 부분
    if (!f.email) err.email = '이메일은 필수입니다.';
    if (!f.password || f.password.length < 6) err.password = '비밀번호는 6자 이상이어야 합니다.';
    if (f.password !== f.passwordConfirm) err.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    if (!f.tel1) err.tel1 = '전화번호는 필수입니다.';
    if (!f.city || !f.district || !f.dong) err.address = '주소를 선택해주세요.';
    if (!f.qualification_image_file) err.qualification_image_file = '자격증 이미지를 등록해주세요.';
    if (f.careerYears === '' || f.careerYears < 0) err.careerYears = '총 경력 연차를 입력해주세요.';

    f.careerHistory.forEach((career, idx) => {
      if (!career.company) err[`career-${idx}-company`] = '기관명을 입력해주세요.';
      if (!career.position) err[`career-${idx}-position`] = '직책을 입력해주세요.';
      if (!career.start_date) err[`career-${idx}-start_date`] = '시작일을 입력해주세요.';
    });

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

      const form = new FormData();
      form.append('role', 'therapist');
      for (const key in formData) {
        if (key === 'qualification_image_file') {
          if (formData.qualification_image_file) {
            form.append('qualification_image_file', formData.qualification_image_file);
          }
        } else if (key === 'careerHistory') {
          form.append('careerHistory', JSON.stringify(formData.careerHistory));
        } else {
          form.append(key, formData[key]);
        }
      }

      await axios.post('/api/v1/members', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

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
          <div className="form-title">치료사 회원가입</div>

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

          <div className="form-section">
            <TherapistExtraForm
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
              handleCareerChange={handleCareerChange}
              handleAddCareer={handleAddCareer}
              handleRemoveCareer={handleRemoveCareer}
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

export default TherapistSignUp;
