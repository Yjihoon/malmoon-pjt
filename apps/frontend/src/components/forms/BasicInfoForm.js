import React from 'react';
import { Form, FloatingLabel } from 'react-bootstrap';

// props로 formData, handleChange, errors 받음
function BasicInfoForm({ formData, handleChange, errors }) {
  return (
    <>
      <FloatingLabel controlId="floatingInputEmail" label="이메일 주소" className="mb-3">
        <Form.Control
          type="email"
          name="email"
          placeholder="name@example.com"
          value={formData.email || ''}
          onChange={handleChange}
          isInvalid={!!errors.email}
        />
        <Form.Control.Feedback type="invalid">
          {errors.email}
        </Form.Control.Feedback>
      </FloatingLabel>

      <FloatingLabel controlId="floatingInputName" label="이름" className="mb-3">
        <Form.Control
          type="text"
          name="name"
          placeholder="이름을 입력하세요"
          value={formData.name || ''}
          onChange={handleChange}
          isInvalid={!!errors.name}
        />
        <Form.Control.Feedback type="invalid">
          {errors.name}
        </Form.Control.Feedback>
      </FloatingLabel>

      <FloatingLabel controlId="floatingNickname" label="닉네임" className="mb-3">
        <Form.Control
          type="text"
          name="nickname"
          placeholder="닉네임을 입력하세요"
          value={formData.nickname || ''}
          onChange={handleChange}
          isInvalid={!!errors.nickname}
        />
        <Form.Control.Feedback type="invalid">
          {errors.nickname}
        </Form.Control.Feedback>
      </FloatingLabel>

      <FloatingLabel controlId="floatingBirthDate" label="생년월일" className="mb-3">
        <Form.Control
          type="date"
          name="birth_date"
          placeholder="YYYY-MM-DD"
          value={formData.birth_date || ''}
          onChange={handleChange}
          isInvalid={!!errors.birth_date}
        />
        <Form.Control.Feedback type="invalid">
          {errors.birth_date}
        </Form.Control.Feedback>
      </FloatingLabel>

      <FloatingLabel controlId="floatingPassword" label="비밀번호" className="mb-3">
        <Form.Control
          type="password"
          name="password"
          placeholder="비밀번호"
          value={formData.password || ''}
          onChange={handleChange}
          isInvalid={!!errors.password}
        />
        <Form.Control.Feedback type="invalid">
          {errors.password}
        </Form.Control.Feedback>
      </FloatingLabel>

      <FloatingLabel controlId="floatingPasswordConfirm" label="비밀번호 확인" className="mb-3">
        <Form.Control
          type="password"
          name="passwordConfirm"
          placeholder="비밀번호 확인"
          value={formData.passwordConfirm || ''}
          onChange={handleChange}
          isInvalid={!!errors.passwordConfirm}
        />
        <Form.Control.Feedback type="invalid">
          {errors.passwordConfirm}
        </Form.Control.Feedback>
      </FloatingLabel>
    </>
  );
}

export default BasicInfoForm;
