import React from 'react';
import { Form, Button, Row, Col, FloatingLabel } from 'react-bootstrap';
import { FaMinusCircle, FaPlusCircle } from 'react-icons/fa'; // 아이콘 사용을 위해 react-icons 설치 필요

// react-icons 설치 (아직 안 하셨다면):
// npm install react-icons
// 또는 yarn add react-icons

function CareerHistoryInput({ careerHistory, handleCareerChange, handleAddCareer, handleRemoveCareer, errors }) {
  return (
    <Form.Group className="mb-4">
      <Form.Label>경력 사항</Form.Label>
      {careerHistory.map((career, index) => (
        <div key={index} className="mb-3 p-3 border rounded" style={{ position: 'relative' }}>
          <Row className="g-2">
            <Col md>
              <FloatingLabel controlId={`floatingInstitution-${index}`} label="기관명">
                <Form.Control
                  type="text"
                  name="institution"
                  value={career.institution || ''}
                  onChange={(e) => handleCareerChange(index, e)}
                  placeholder="기관명"
                  isInvalid={!!errors[`career[${index}].institution`]}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[`career[${index}].institution`]}
                </Form.Control.Feedback>
              </FloatingLabel>
            </Col>
            <Col md>
              <FloatingLabel controlId={`floatingRole-${index}`} label="담당 업무/직책">
                <Form.Control
                  type="text"
                  name="role"
                  value={career.role || ''}
                  onChange={(e) => handleCareerChange(index, e)}
                  placeholder="담당 업무/직책"
                  isInvalid={!!errors[`career[${index}].role`]}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[`career[${index}].role`]}
                </Form.Control.Feedback>
              </FloatingLabel>
            </Col>
          </Row>
          <Row className="g-2 mt-2">
            <Col md>
              <FloatingLabel controlId={`floatingStartDate-${index}`} label="시작일">
                <Form.Control
                  type="date"
                  name="startDate"
                  value={career.startDate || ''}
                  onChange={(e) => handleCareerChange(index, e)}
                  isInvalid={!!errors[`career[${index}].startDate`]}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[`career[${index}].startDate`]}
                </Form.Control.Feedback>
              </FloatingLabel>
            </Col>
            <Col md>
              <FloatingLabel controlId={`floatingEndDate-${index}`} label="종료일 (현재 재직 중인 경우 비워둠)">
                <Form.Control
                  type="date"
                  name="endDate"
                  value={career.endDate || ''}
                  onChange={(e) => handleCareerChange(index, e)}
                  isInvalid={!!errors[`career[${index}].endDate`]}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[`career[${index}].endDate`]}
                </Form.Control.Feedback>
              </FloatingLabel>
            </Col>
          </Row>
          {careerHistory.length > 1 && (
            <Button
              variant="link"
              className="p-0 text-danger"
              onClick={() => handleRemoveCareer(index)}
              style={{ position: 'absolute', top: '10px', right: '10px' }}
            >
              <FaMinusCircle size={20} />
            </Button>
          )}
        </div>
      ))}
      <Button variant="outline-secondary" onClick={handleAddCareer} className="mt-2">
        <FaPlusCircle className="me-2" /> 경력 추가
      </Button>
      {errors.career && (
        <Form.Text className="text-danger d-block mt-2">
          {errors.career}
        </Form.Text>
      )}
    </Form.Group>
  );
}

export default CareerHistoryInput;