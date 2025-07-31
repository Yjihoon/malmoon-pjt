import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import AacItemSelector from './AacItemSelector'; // [수정] AacSetList 대신 AacItemSelector를 사용

const AacSetModal = ({ show, onHide, onSave, initialData, allAacItems }) => {
    const [form, setForm] = useState({ name: '', description: '', aac_item_ids: [] });

    useEffect(() => {
        if (initialData) {
            setForm(initialData);
        } else {
            setForm({ name: '', description: '', aac_item_ids: [] });
        }
    }, [initialData, show]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleItem = (itemId) => {
        setForm(prev => {
            const newIds = (prev.aac_item_ids || []).includes(itemId)
                ? (prev.aac_item_ids || []).filter(id => id !== itemId)
                : [...(prev.aac_item_ids || []), itemId];
            return { ...prev, aac_item_ids: newIds };
        });
    };

    const handleSaveClick = () => {
        if (!form.name || !form.description) {
            alert('묶음 이름과 설명은 필수입니다.');
            return;
        }
        if ((form.aac_item_ids || []).length === 0) {
            alert('하나 이상의 AAC 아이템을 선택해야 합니다.');
            return;
        }
        onSave(form);
    };

    return (
        <Modal show={show} onHide={onHide} centered size="xl">
            <Modal.Header closeButton>
                <Modal.Title>{initialData ? 'AAC 묶음 편집' : '새 AAC 묶음 추가'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3"><Form.Label>묶음 이름</Form.Label><Form.Control type="text" name="name" value={form.name || ''} onChange={handleFormChange} /></Form.Group>
                <Form.Group className="mb-3"><Form.Label>설명</Form.Label><Form.Control as="textarea" name="description" value={form.description || ''} onChange={handleFormChange} /></Form.Group>
                <hr />
                <h5 className="mb-3">AAC 아이템 선택 ({(form.aac_item_ids || []).length}개 선택됨)</h5>
                <AacItemSelector
                    aacItems={allAacItems}
                    selectedItemIds={form.aac_item_ids || []}
                    onToggleItem={handleToggleItem}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>취소</Button>
                <Button variant="primary" onClick={handleSaveClick}>{initialData ? '저장' : '추가'}</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AacSetModal;
