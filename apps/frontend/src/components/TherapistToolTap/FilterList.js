import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';

const FilterList = ({ filters, onEdit, onDelete }) => {
    if (!filters || filters.length === 0) {
        return <p className="text-muted text-center">생성된 필터가 없습니다.</p>;
    }

    return (
        <Row xs={2} sm={3} md={4} lg={6} className="g-3">
            {filters.map(filter => (
                <Col key={filter.filterId}>
                    <Card className="h-100">
                        {/* fileId 대신 fileUrl을 사용하도록 수정 */}
                        <Card.Img variant="top" src={filter.fileUrl || 'https://placehold.co/150x150?text=No+Img'} style={{ height: '120px', objectFit: 'cover' }} />
                        <Card.Body className="p-2 text-center">
                            <Card.Title as="h6" style={{fontSize: '0.9rem'}}>{filter.name}</Card.Title>
                            <div className="mt-2">
                                <Button variant="outline-secondary" size="sm" className="me-1" onClick={() => onEdit(filter)}>편집</Button>
                                {/* filter.id 대신 filter.filterId를 사용하도록 수정 */}
                                <Button variant="outline-danger" size="sm" onClick={() => onDelete(filter.filterId)}>삭제</Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default FilterList;
