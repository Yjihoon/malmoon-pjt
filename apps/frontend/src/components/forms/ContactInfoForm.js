import React from 'react';
import { Form, FloatingLabel } from 'react-bootstrap';

function ContactInfoForm({ formData, handleChange, errors }) {
  return (
    <>
      <FloatingLabel controlId="floatingInputPhone" label="휴대폰 번호" className="mb-3">
        <Form.Control
          type="tel" // 전화번호 타입
          name="phone"
          placeholder="010-1234-5678"
          value={formData.phone || ''}
          onChange={handleChange}
          isInvalid={!!errors.phone}
        />
        <Form.Control.Feedback type="invalid">
          {errors.phone}
        </Form.Control.Feedback>
      </FloatingLabel>

      <FloatingLabel controlId="floatingInputAddress" label="주소 (선택 사항)" className="mb-3">
        <Form.Control
          type="text"
          name="address"
          placeholder="예: 서울시 강남구"
          value={formData.address || ''}
          onChange={handleChange}
          isInvalid={!!errors.address} // 주소가 필수라면 유효성 검사 추가
        />
        <Form.Control.Feedback type="invalid">
          {errors.address}
        </Form.Control.Feedback>
      </FloatingLabel>
    </>
  );
}

export default ContactInfoForm;