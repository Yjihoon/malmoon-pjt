import React from 'react';
import { Form, Col, Row, Button } from 'react-bootstrap';

function LicenseUpload({ formData, handleFileChange, handleRemoveFile, errors }) {
  // 실제 사용 시 formData.licenseFiles는 파일 객체의 배열이 될 수 있습니다.
  // 여기서는 간단히 파일 이름만 표시합니다.
  const displayFileName = formData.licenseFile ? formData.licenseFile.name : '선택된 파일 없음';

  return (
    <Form.Group as={Row} className="mb-3" controlId="formFileLicense">
      <Form.Label column sm="3">
        자격증 파일
      </Form.Label>
      <Col sm="9">
        <div className="d-flex align-items-center">
          <Form.Control
            type="file"
            name="licenseFile"
            onChange={handleFileChange}
            isInvalid={!!errors.licenseFile}
            accept=".pdf, .jpg, .jpeg, .png" // 허용 파일 확장자
          />
          {formData.licenseFile && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleRemoveFile}
              className="ms-2"
            >
              삭제
            </Button>
          )}
        </div>
        {errors.licenseFile && (
          <Form.Control.Feedback type="invalid" className="d-block">
            {errors.licenseFile}
          </Form.Control.Feedback>
        )}
        <Form.Text className="text-muted">
          자격증 사본 (PDF, JPG, PNG 파일)을 업로드해주세요.
        </Form.Text>
      </Col>
    </Form.Group>
  );
}

export default LicenseUpload;