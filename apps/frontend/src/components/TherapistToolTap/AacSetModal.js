import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import AacItemSelector from './AacItemSelector';

const AacSetModal = ({ show, onHide, onSave, initialData, allAacItems, getAuthHeader }) => {
    const [form, setForm] = useState({ name: '', description: '', aac_item_ids: [] });
    const [loadingDetails, setLoadingDetails] = useState(false);

    const fetchSetDetails = useCallback(async (setId) => {
        if (typeof getAuthHeader !== 'function') return;
        const headers = getAuthHeader();
        if (!headers) return;
        
        setLoadingDetails(true);
        try {
            const response = await fetch(`/api/v1/aacs/sets/my/${setId}`, { headers });
            if (!response.ok) {
                throw new Error('묶음 상세 정보를 불러오는데 실패했습니다.');
            }
            const itemsInSet = await response.json();
            const itemIds = itemsInSet.map(item => item.id);
            setForm(prev => ({ ...prev, aac_item_ids: itemIds }));
        } catch (error) {
            alert(error.message);
        } finally {
            setLoadingDetails(false);
        }
    }, [getAuthHeader]);

    useEffect(() => {
        if (show) {
            if (initialData) {
                setForm({
                    id: initialData.id,
                    name: initialData.name,
                    description: initialData.description,
                    aac_item_ids: []
                });
                fetchSetDetails(initialData.id);
            } else {
                setForm({ name: '', description: '', aac_item_ids: [] });
            }
        }
    }, [initialData, show, fetchSetDetails]);

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
                {loadingDetails ? (
                    <div className="text-center"><Spinner animation="border" /> <p>묶음 정보를 불러오는 중...</p></div>
                ) : (
                    <>
                        <Form.Group className="mb-3"><Form.Label>묶음 이름</Form.Label><Form.Control type="text" name="name" value={form.name || ''} onChange={handleFormChange} /></Form.Group>
                        <Form.Group className="mb-3"><Form.Label>설명</Form.Label><Form.Control as="textarea" name="description" value={form.description || ''} onChange={handleFormChange} /></Form.Group>
                        <hr />
                        <h5 className="mb-3">AAC 아이템 선택 ({(form.aac_item_ids || []).length}개 선택됨)</h5>
                        <AacItemSelector
                            aacItems={allAacItems}
                            selectedItemIds={form.aac_item_ids || []}
                            onToggleItem={handleToggleItem}
                        />
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>취소</Button>
                <Button variant="primary" onClick={handleSaveClick}>{initialData ? '저장' : '추가'}</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AacSetModal;
