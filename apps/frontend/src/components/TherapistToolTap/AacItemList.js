import React, { useState, useMemo } from 'react';
import { Row, Col, Card, Button, InputGroup, Form, Pagination, Accordion, ListGroup } from 'react-bootstrap';

const AacItemList = ({ aacItems, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSituation, setSelectedSituation] = useState(null);
    const [selectedAction, setSelectedAction] = useState(null);
    // [수정] activeKey의 초기값을 null로 변경하여 아코디언이 닫힌 상태로 시작하도록 합니다.
    const [activeKey, setActiveKey] = useState(null); 
    const itemsPerPage = 12;

    const categories = useMemo(() => {
        if (!aacItems) return {};
        const initialCategories = aacItems.reduce((acc, item) => {
            const { situation, action } = item;
            if (!acc[situation]) acc[situation] = new Set();
            if (action) acc[situation].add(action);
            return acc;
        }, {});
        return Object.keys(initialCategories).sort().reduce((obj, key) => { 
            obj[key] = Array.from(initialCategories[key]).sort();
            return obj;
        }, {});
    }, [aacItems]);
    
    // [수정] 페이지 로드 시 첫 번째 카테고리를 강제로 열던 useEffect를 제거합니다.

    const filteredItems = useMemo(() => {
        if (!aacItems) return [];
        // [수정] '전체 보기' 상태일 때(selectedSituation이 null) 모든 아이템을 보여주도록 수정
        if (!selectedSituation) {
            return aacItems.filter(item => 
                !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return aacItems.filter(item => {
            const matchesSituation = item.situation === selectedSituation;
            const matchesAction = !selectedAction || item.action === selectedAction;
            const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSituation && matchesAction && matchesSearch;
        });
    }, [aacItems, searchTerm, selectedSituation, selectedAction]);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleAccordionSelect = (eventKey) => {
        setActiveKey(eventKey);
        const situation = eventKey ? Object.keys(categories)[parseInt(eventKey, 10)] : null;
        setSelectedSituation(situation);
        setSelectedAction(null);
        setCurrentPage(1);
    };
    
    const handleActionSelect = (action) => {
        setSelectedAction(action);
        setCurrentPage(1);
    };

    const clearCategory = () => {
        setActiveKey(null);
        setSelectedSituation(null);
        setSelectedAction(null);
        setCurrentPage(1);
    }
    
    return (
        <Row>
            <Col md={3}>
                 <h5 className="mb-3">카테고리</h5>
                 <Button variant="outline-secondary" size="sm" className="w-100 mb-2" onClick={clearCategory}>전체 보기</Button>
                 <Accordion activeKey={activeKey} onSelect={handleAccordionSelect}>
                     {Object.keys(categories).map((situation, index) => (
                         <Accordion.Item eventKey={index.toString()} key={situation}>
                             <Accordion.Header>{situation}</Accordion.Header>
                             <Accordion.Body>
                                 <ListGroup variant="flush">
                                     {categories[situation].map(action => (
                                         <ListGroup.Item key={action} action active={selectedSituation === situation && selectedAction === action} onClick={() => handleActionSelect(action)}>
                                             {action}
                                         </ListGroup.Item>
                                     ))}
                                 </ListGroup>
                             </Accordion.Body>
                         </Accordion.Item>
                     ))}
                 </Accordion>
            </Col>
            <Col md={9}>
                 <InputGroup className="mb-3">
                     <Form.Control placeholder="아이템 이름으로 검색..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}/>
                 </InputGroup>
                 {currentItems.length > 0 ? (
                     <Row xs={2} md={3} lg={4} className="g-3">
                         {currentItems.map(item => (
                             <Col key={item.id}>
                                 <Card className="h-100">
                                     <Card.Img variant="top" src={item.file_id || 'https://placehold.co/150x150?text=No+Image'} style={{ height: '120px', objectFit: 'cover' }} />
                                     <Card.Body className="p-2 d-flex flex-column">
                                         <Card.Title as="h6" className="flex-grow-1" style={{fontSize: '0.9rem'}}>{item.name}</Card.Title>
                                         <div className="mt-auto text-center">
                                             <Button variant="outline-secondary" size="sm" className="me-1" onClick={() => onEdit(item)}>편집</Button>
                                             <Button variant="outline-danger" size="sm" onClick={() => onDelete(item.id)}>삭제</Button>
                                         </div>
                                     </Card.Body>
                                 </Card>
                             </Col>
                         ))}
                     </Row>
                 ) : (
                     <div className="text-center p-5 border rounded">
                         <p className="text-muted">표시할 아이템이 없습니다.</p>
                     </div>
                 )}
                 {totalPages > 1 && (
                     <Pagination className="justify-content-center mt-4">
                        <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} />
                        {[...Array(totalPages).keys()].map(num => (
                            <Pagination.Item key={num + 1} active={num + 1 === currentPage} onClick={() => setCurrentPage(num + 1)}>
                                {num + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} />
                     </Pagination>
                 )}
            </Col>
        </Row>
    );
};

export default AacItemList;
