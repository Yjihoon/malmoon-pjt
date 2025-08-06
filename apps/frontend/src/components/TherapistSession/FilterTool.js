import React from 'react';
import { Button, Card, Row, Col } from 'react-bootstrap';

function FilterTool({
  backgroundImages, selectedBackgroundImage, isFilterActive,
  applyBackgroundFilter, removeBackgroundFilter, applyLensById
}) {
  return (
    <div className="p-2">
      <h6 className="text-center mb-3">배경 필터 선택</h6>
      <Row xs={2} className="g-2 text-center">
        {backgroundImages.map(image => (
          <Col key={image.id}>
            <Card onClick={() => applyBackgroundFilter(image.url)} className={`filter-thumb-card ${selectedBackgroundImage === image.url ? 'active' : ''}`}>
              <Card.Img variant="top" src={image.url} style={{height: '80px', objectFit: 'cover'}} />
              <Card.Body className="p-1"><Card.Text>{image.name}</Card.Text></Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <div className="d-grid mt-3">
        <Button variant="secondary" onClick={removeBackgroundFilter} disabled={!isFilterActive}>필터 제거</Button>
      </div>
      <hr />
      <h6 className="text-center mb-3">CameraKit 필터</h6>
      <div className="d-grid gap-2">
        <Button variant="info" onClick={() => applyLensById('80ea0b59-4a55-472f-bb63-2c679f9ad52c')}>렌즈 1</Button>
        <Button variant="info" onClick={() => applyLensById('65d183b8-6c1c-4125-af82-875e6d36b656')}>렌즈 2</Button>
      </div>
    </div>
  );
}

export default FilterTool;
