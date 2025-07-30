import React from 'react';
import { Form, FloatingLabel, Button } from 'react-bootstrap';
import ProfileImageSelect from './ProfileImageSelect';
import AddressSelector from './AddressSelector';

function CommonSignUpForm({
  formData,
  handleChange,
  handleAddressChange,
  errors,
  duplicateCheckProps, // ✅ 이메일 중복 확인 관련 props 전달받음
}) {
  const {
    checkEmail,
    checking,
    isDuplicate,
    message,
  } = duplicateCheckProps || {};

  // ✅ 오늘 날짜를 YYYY-MM-DD 형식으로 가져옴
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <ProfileImageSelect
        value={formData.profile_image_id || 1}
        onChange={(value) => handleChange({ target: { name: 'profile_image_id', value } })}
        error={errors.profile_image_id}
      />

      {/* 이름 */}
      <FloatingLabel label="이름" className="mb-3">
        <Form.Control
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          isInvalid={!!errors.name}
        />
        <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
      </FloatingLabel>

      {/* 닉네임 */}
      <FloatingLabel label="닉네임" className="mb-3">
        <Form.Control
          name="nickname"
          value={formData.nickname || ''}
          onChange={handleChange}
          isInvalid={!!errors.nickname}
        />
        <Form.Control.Feedback type="invalid">{errors.nickname}</Form.Control.Feedback>
      </FloatingLabel>

      {/* 생년월일 */}
      <FloatingLabel label="생년월일" className="mb-3">
        <Form.Control
          type="date"
          name="birthDate"
          value={formData.birthDate || ''}
          onChange={handleChange}
          isInvalid={!!errors.birthDate}
          min="1900-01-01"
          max={today}
        />
        <Form.Control.Feedback type="invalid">{errors.birthDate}</Form.Control.Feedback>
      </FloatingLabel>

      {/* 이메일 */}
      <div className="mb-3 d-flex gap-2">
        <FloatingLabel label="이메일" className="flex-grow-1">
          <Form.Control
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            isInvalid={!!errors.email}
          />
          <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
        </FloatingLabel>
        <Button
          variant="outline-secondary"
          disabled={checking || !formData.email}
          onClick={() => checkEmail(formData.email)}
        >
          {checking ? '확인 중...' : '중복 확인'}
        </Button>
      </div>
      {message && (
        <div className={`mb-3 ${isDuplicate ? 'text-danger' : 'text-success'}`}>
          {message}
        </div>
      )}

      {/* 비밀번호 */}
      <FloatingLabel label="비밀번호" className="mb-3">
        <Form.Control
          type="password"
          name="password"
          value={formData.password || ''}
          onChange={handleChange}
          isInvalid={!!errors.password}
        />
        <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
      </FloatingLabel>

      {/* 비밀번호 확인 */}
      <FloatingLabel label="비밀번호 확인" className="mb-3">
        <Form.Control
          type="password"
          name="passwordConfirm"
          value={formData.passwordConfirm || ''}
          onChange={handleChange}
          isInvalid={!!errors.passwordConfirm}
        />
        <Form.Control.Feedback type="invalid">{errors.passwordConfirm}</Form.Control.Feedback>
      </FloatingLabel>

      {/* 전화번호1 */}
      <FloatingLabel label="전화번호 1" className="mb-3">
        <Form.Control
          name="tel1"
          value={formData.tel1 || ''}
          onChange={handleChange}
          isInvalid={!!errors.tel1}
        />
        <Form.Control.Feedback type="invalid">{errors.tel1}</Form.Control.Feedback>
      </FloatingLabel>

      {/* 전화번호2 */}
      <FloatingLabel label="전화번호 2 (선택)" className="mb-3">
        <Form.Control
          name="tel2"
          value={formData.tel2 || ''}
          onChange={handleChange}
        />
      </FloatingLabel>

      {/* 주소 */}
      <AddressSelector
        address={{
          city: formData.city || '',
          district: formData.district || '',
          dong: formData.dong || '',
          detail: formData.detail || '',
        }}
        onChange={handleAddressChange}
        error={errors.address}
      />
    </>
  );
}

export default CommonSignUpForm;
