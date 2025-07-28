import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

// 예시용 지역 데이터 (실제 프로젝트에서는 외부 JSON에서 import해도 됨)
const REGION_DATA = {
  '서울특별시': {
    '강남구': ['역삼동', '삼성동'],
    '서초구': ['서초동', '방배동']
  },
  '부산광역시': {
    '해운대구': ['우동', '좌동']
  },
  '경기도': {
    '성남시': ['분당동', '정자동']
  }
};

function AddressForm({ address, handleChange, errors }) {
  const cities = Object.keys(REGION_DATA);
  const districts = address.city ? Object.keys(REGION_DATA[address.city]) : [];
  const dongs = address.city && address.district
    ? REGION_DATA[address.city][address.district]
    : [];

  return (
    <>
      <Row className="g-3">
        <Col md={4}>
          <Form.Group controlId="addressCity">
            <Form.Label>시 / 도</Form.Label>
            <Form.Select
              value={address.city}
              onChange={(e) => handleChange('city', e.target.value)}
              isInvalid={!!errors.address}
            >
              <option value="">선택하세요</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="addressDistrict">
            <Form.Label>구 / 군</Form.Label>
            <Form.Select
              value={address.district}
              onChange={(e) => handleChange('district', e.target.value)}
              isInvalid={!!errors.address}
              disabled={!address.city}
            >
              <option value="">선택하세요</option>
              {districts.map((gu) => (
                <option key={gu} value={gu}>{gu}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="addressDong">
            <Form.Label>동</Form.Label>
            <Form.Select
              value={address.dong}
              onChange={(e) => handleChange('dong', e.target.value)}
              isInvalid={!!errors.address}
              disabled={!address.district}
            >
              <option value="">선택하세요</option>
              {dongs.map((dong) => (
                <option key={dong} value={dong}>{dong}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group controlId="addressDetail" className="mt-3">
        <Form.Label>상세주소</Form.Label>
        <Form.Control
          type="text"
          placeholder="상세주소 입력"
          value={address.detail || ''}
          onChange={(e) => handleChange('detail', e.target.value)}
          isInvalid={!!errors.address}
        />
        <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
      </Form.Group>
    </>
  );
}

export default AddressForm;
