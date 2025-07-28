import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import BasicInfoForm from './BasicInfoForm';
import ContactInfoForm from './ContactInfoForm';
import LicenseUpload from './LicenseUpload';
import CareerHistoryInput from './CareerHistoryInput';
import AddressForm from './AddressForm';
import ProfileImageUpload from './ProfileImageUpload';

function TherapistSignUpForm() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    nickname: '',
    password: '',
    passwordConfirm: '',
    birth_date: '',
    tel1: '',
    tel2: '',
    role: 'therapist',
    status: 'active',
    profileImage: null,
    address: {
      city: '',
      district: '',
      dong: '',
      detail: '',
    },
    licenseFile: null,
    careerYears: 0,
    careerHistory: [{ institution: '', role: '', startDate: '', endDate: '' }],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const handleCareerChange = (index, e) => {
    const { name, value } = e.target;
    const newHistory = [...formData.careerHistory];
    newHistory[index][name] = value;
    setFormData({ ...formData, careerHistory: newHistory });
  };

  const handleAddCareer = () => {
    setFormData({
      ...formData,
      careerHistory: [...formData.careerHistory, { institution: '', role: '', startDate: '', endDate: '' }]
    });
  };

  const handleRemoveCareer = (index) => {
    const newHistory = formData.careerHistory.filter((_, i) => i !== index);
    setFormData({ ...formData, careerHistory: newHistory });
  };

  const validateForm = () => {
    const newErrors = {};
    const f = formData;

    if (!f.email) newErrors.email = '이메일은 필수입니다.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) newErrors.email = '올바른 이메일 형식을 입력해주세요.';

    if (!f.name) newErrors.name = '이름은 필수입니다.';
    if (!f.nickname) newErrors.nickname = '닉네임은 필수입니다.';
    if (!f.birth_date) newErrors.birth_date = '생년월일은 필수입니다.';
    if (!f.tel1) newErrors.tel1 = '전화번호는 필수입니다.';
    if (!f.password) newErrors.password = '비밀번호는 필수입니다.';
    else if (f.password.length < 6) newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    if (f.password !== f.passwordConfirm) newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';

    const a = f.address;
    if (!a.city || !a.district || !a.dong || !a.detail) newErrors.address = '주소를 모두 입력해주세요.';
    if (!f.profileImage) newErrors.profileImage = '프로필 이미지를 업로드해주세요.';
    if (!f.licenseFile) newErrors.licenseFile = '자격증 파일은 필수입니다.';
    if (f.careerYears <= 0) newErrors.careerYears = '경력 연차를 입력해주세요.';

    f.careerHistory.forEach((career, index) => {
      if (!career.institution) newErrors[`career[${index}].institution`] = '기관명은 필수입니다.';
      if (!career.role) newErrors[`career[${index}].role`] = '직책은 필수입니다.';
      if (!career.startDate) newErrors[`career[${index}].startDate`] = '시작일은 필수입니다.';
      if (career.endDate && career.startDate && new Date(career.endDate) < new Date(career.startDate)) {
        newErrors[`career[${index}].endDate`] = '종료일은 시작일보다 빠를 수 없습니다.';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);
    setServerError('');

    if (!validateForm()) return;

    try {
      setLoading(true);
      const f = formData;
      const form = new FormData();

      form.append('email', f.email);
      form.append('name', f.name);
      form.append('nickname', f.nickname);
      form.append('password', f.password);
      form.append('birth_date', f.birth_date);
      form.append('tel1', f.tel1);
      form.append('tel2', f.tel2 || '');
      form.append('role', f.role);
      form.append('status', f.status);
      form.append('careerYears', f.careerYears);

      form.append('profileImage', f.profileImage);
      form.append('qualificationImage', f.licenseFile);

      form.append('address.city', f.address.city);
      form.append('address.district', f.address.district);
      form.append('address.dong', f.address.dong);
      form.append('address.detail', f.address.detail);

      form.append('careerHistory', JSON.stringify(f.careerHistory));

      const res = await axios.post('/api/v1/therapists', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('회원가입 성공:', res.data);
      setSuccess(true);
    } catch (err) {
      console.error('회원가입 실패:', err);
      setServerError('회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm">
      <h3 className="mb-4 text-center">치료사 회원가입</h3>

      {serverError && <Alert variant="danger">{serverError}</Alert>}
      {success && <Alert variant="success">회원가입 성공! 로그인해주세요.</Alert>}

      <ProfileImageUpload
        file={formData.profileImage}
        setFile={(file) => setFormData(prev => ({ ...prev, profileImage: file }))}
        error={errors.profileImage}
      />

      <BasicInfoForm formData={formData} handleChange={handleChange} errors={errors} />
      <ContactInfoForm formData={formData} handleChange={handleChange} errors={errors} />
      <AddressForm address={formData.address} handleChange={handleAddressChange} errors={errors} />

      <LicenseUpload
        formData={formData}
        handleFileChange={(e) => setFormData({ ...formData, licenseFile: e.target.files[0] })}
        handleRemoveFile={() => setFormData({ ...formData, licenseFile: null })}
        errors={errors}
      />

      <CareerHistoryInput
        careerHistory={formData.careerHistory}
        handleCareerChange={handleCareerChange}
        handleAddCareer={handleAddCareer}
        handleRemoveCareer={handleRemoveCareer}
        errors={errors}
      />

      <Form.Group className="mt-3">
        <Form.Label>총 경력 연차</Form.Label>
        <Form.Control
          type="number"
          name="careerYears"
          value={formData.careerYears}
          onChange={handleChange}
          isInvalid={!!errors.careerYears}
        />
        <Form.Control.Feedback type="invalid">
          {errors.careerYears}
        </Form.Control.Feedback>
      </Form.Group>

      <Button variant="primary" type="submit" className="w-100 mt-4" disabled={loading}>
        {loading ? '가입 중...' : '치료사 회원가입'}
      </Button>
    </Form>
  );
}

export default TherapistSignUpForm;
