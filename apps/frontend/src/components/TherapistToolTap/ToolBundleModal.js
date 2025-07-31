import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, ListGroup } from 'react-bootstrap';

const ToolBundleModal = ({ show, onHide, onSave, bundleData, allAacSets, allFilters }) => {
    const [form, setForm] = useState({ name: '', description: '', AAC_set_id: [], filter_id: [] });

    useEffect(() => {
        if (bundleData) {
            setForm(bundleData);
        } else {
            setForm({ name: '', description: '', AAC_set_id: [], filter_id: [] });
        }
    }, [bundleData, show]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (type, id) => {
        setForm(prev => {
            const currentIds = prev[type] || [];
            const newIds = currentIds.includes(id)
                ? currentIds.filter(currentId => currentId !== id)
                : [...currentIds, id];
            return { ...prev, [type]: newIds };
        });
    };
    
    const handleSaveClick = () => {
        if (!form.name || !form.description) {
            alert('세트 이름과 설명은 필수입니다.');
            return;
        }
        if ((form.AAC_set_id || []).length === 0 && (form.filter_id || []).length === 0) {
            alert('하나 이상의 AAC 묶음 또는 필터를 포함해야 합니다.');
            return;
        }
        onSave(form);
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{bundleData ? '수업 세트 편집' : '새 수업 세트 추가'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>세트 이름</Form.Label>
                    <Form.Control type="text" name="name" value={form.name || ''} onChange={handleFormChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>설명</Form.Label>
                    <Form.Control as="textarea" name="description" value={form.description || ''} onChange={handleFormChange} />
                </Form.Group>
                <Row>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>포함할 AAC 묶음</Form.Label>
                            <ListGroup style={{maxHeight: '200px', overflowY: 'auto'}}>
                                {allAacSets.map(set => (
                                    <ListGroup.Item key={set.ACC_set_id} action active={(form.AAC_set_id || []).includes(set.ACC_set_id)} onClick={() => handleToggle('AAC_set_id', set.ACC_set_id)}>
                                        {set.name}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>포함할 필터</Form.Label>
                            <ListGroup style={{maxHeight: '200px', overflowY: 'auto'}}>
                                {allFilters.map(filter => (
                                    <ListGroup.Item key={filter.id} action active={(form.filter_id || []).includes(filter.id)} onClick={() => handleToggle('filter_id', filter.id)}>
                                        {filter.name}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Form.Group>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>취소</Button>
                <Button variant="primary" onClick={handleSaveClick}>{bundleData ? '저장' : '추가'}</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ToolBundleModal;
