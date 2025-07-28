import React from 'react';
import { Form, FloatingLabel } from 'react-bootstrap';

function ContactInfoForm({ formData, handleChange, errors }) {
  return (
    <>
      <FloatingLabel controlId="floatingInputTel1" label="전화번호 (필수)" className="mb-3">
        <Form.Control
          type="tel"
          name="tel1"
          placeholder="010-1234-5678"
          value={formData.tel1 || ''}
          onChange={handleChange}
          isInvalid={!!errors.tel1}
        />
        <Form.Control.Feedback type="invalid">
          {errors.tel1}
        </Form.Control.Feedback>
      </FloatingLabel>

      <FloatingLabel controlId="floatingInputTel2" label="휴대폰 (선택)" className="mb-3">
        <Form.Control
          type="tel"
          name="tel2"
          placeholder="010-0000-0000"
          value={formData.tel2 || ''}
          onChange={handleChange}
          isInvalid={!!errors.tel2}
        />
        <Form.Control.Feedback type="invalid">
          {errors.tel2}
        </Form.Control.Feedback>
      </FloatingLabel>
    </>
  );
}

export default ContactInfoForm;
