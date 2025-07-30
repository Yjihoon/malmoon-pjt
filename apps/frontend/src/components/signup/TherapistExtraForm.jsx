import React from 'react';
import { Form, Button } from 'react-bootstrap';

function TherapistExtraForm({
  formData,
  setFormData,
  handleChange,
  handleCareerChange,
  handleAddCareer,
  handleRemoveCareer,
  errors,
}) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      qualification_image_file: file,
    }));

    // ✅ 파일 선택 시 에러 제거
    if (errors.qualification_image_file) {
      errors.qualification_image_file = undefined;
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <h5 className="mt-4 mb-3 text-start">치료사 추가 정보</h5>

      {/* 자격증 업로드 */}
      <Form.Group className="mb-3 text-start">
        <Form.Label>자격증 이미지 업로드</Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          isInvalid={!!errors.qualification_image_file}
        />
        <Form.Control.Feedback type="invalid">
          {errors.qualification_image_file}
        </Form.Control.Feedback>
      </Form.Group>

      {/* 총 경력 연차 */}
      <Form.Group className="mb-4 text-start">
        <Form.Label>총 경력 연차</Form.Label>
        <Form.Control
          type="number"
          name="careerYears"
          min="0"
          value={formData.careerYears || ''}
          onChange={handleChange}
          isInvalid={!!errors.careerYears}
        />
        <Form.Control.Feedback type="invalid">
          {errors.careerYears}
        </Form.Control.Feedback>
      </Form.Group>

      {/* 경력 리스트 */}
      <div className="mb-3">
        <h6 className="mb-2 text-start">경력사항</h6>
        {formData.careerHistory.map((career, index) => (
          <div key={index} className="career-item mb-4 p-3 border rounded">
            {/* 기관명 / 직책 */}
            <div className="career-row mb-2 d-flex">
              <Form.Group className="flex-grow-1 me-2">
                <Form.Label>기관명</Form.Label>
                <Form.Control
                  type="text"
                  value={career.company || ''}
                  onChange={(e) =>
                    handleCareerChange(index, 'company', e.target.value)
                  }
                  isInvalid={!!errors[`career-${index}-company`]}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[`career-${index}-company`]}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="flex-grow-1">
                <Form.Label>직책</Form.Label>
                <Form.Control
                  type="text"
                  value={career.position || ''}
                  onChange={(e) =>
                    handleCareerChange(index, 'position', e.target.value)
                  }
                  isInvalid={!!errors[`career-${index}-position`]}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[`career-${index}-position`]}
                </Form.Control.Feedback>
              </Form.Group>
            </div>

            {/* 시작일 / 종료일 */}
            <div className="career-row mb-2 d-flex align-items-end">
              <Form.Group className="me-2">
                <Form.Label>시작일</Form.Label>
                <Form.Control
                  type="date"
                  value={career.start_date || ''}
                  max={today}
                  onChange={(e) =>
                    handleCareerChange(index, 'start_date', e.target.value)
                  }
                  isInvalid={!!errors[`career-${index}-start_date`]}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[`career-${index}-start_date`]}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="me-3">
                <Form.Label>종료일</Form.Label>
                <Form.Control
                  type="date"
                  value={career.end_date || ''}
                  max={today}
                  onChange={(e) =>
                    handleCareerChange(index, 'end_date', e.target.value)
                  }
                />
              </Form.Group>

              {/* 삭제 버튼 */}
              {formData.careerHistory.length > 1 && (
                <div>
                  <Button
                    variant="outline-danger"
                    onClick={() => handleRemoveCareer(index)}
                  >
                    삭제
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 추가 버튼 */}
      <div className="text-start">
        <Button variant="outline-primary" onClick={handleAddCareer}>
          + 경력 추가
        </Button>
      </div>
    </>
  );
}

export default TherapistExtraForm;
