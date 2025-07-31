import React, { useState, useMemo } from 'react';
import { Row, Col, Card, InputGroup, Form, Pagination, Image } from 'react-bootstrap';

const AacItemSelector = ({ aacItems, selectedItemIds, onToggleItem }) => {
    const [searchCategory, setSearchCategory] = useState('name');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) return aacItems;
        return aacItems.filter(item => {
            const itemValue = item[searchCategory] ? item[searchCategory].toLowerCase() : '';
            return itemValue.includes(searchTerm.toLowerCase());
        });
    }, [aacItems, searchTerm, searchCategory]);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <>
            <InputGroup className="mb-3">
                <Form.Select style={{flex: '0 0 120px'}} value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
                    <option value="name">이름</option>
                    <option value="situation">상황</option>
                    <option value="action">행동</option>
                    <option value="emotion">감정</option>
                </Form.Select>
                <Form.Control placeholder="선택한 기준으로 검색..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
            </InputGroup>

            {currentItems.length > 0 ? (
                <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '15px' }}>
                    <Row xs={1} sm={2} md={4} lg={5} className="g-3">
                        {currentItems.map(item => (
                            <Col key={item.id}>
                                <Card className={`h-100 text-center ${selectedItemIds.includes(item.id) ? 'border-primary' : ''}`} onClick={() => onToggleItem(item.id)} style={{ cursor: 'pointer' }}>
                                    <Card.Img variant="top" src={item.file_id || 'https://placehold.co/150x100?text=No+Image'} style={{ height: '100px', objectFit: 'cover' }} />
                                    <Card.Body className="p-2"><Card.Text style={{ fontSize: '0.8rem' }}>{item.name}</Card.Text></Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            ) : <p className="text-muted text-center">검색 결과가 없습니다.</p>}

            {totalPages > 1 && (
                <Pagination className="justify-content-center mt-3">
                    <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} />
                    <Pagination.Next onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} />
                </Pagination>
            )}
        </>
    );
};

export default AacItemSelector;
