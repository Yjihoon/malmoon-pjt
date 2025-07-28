import React from 'react';
import { Form, FloatingLabel } from 'react-bootstrap';

// props로 formData (객체), handleChange (함수), errors (객체)를 받습니다.
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
          isInvalid={!!errors.email} // 에러가 있으면 빨간색 테두리
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