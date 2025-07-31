import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup, Spinner, Card, Image } from 'react-bootstrap';

const AacItemModal = ({ show, onHide, onSave, itemData }) => {
    const [form, setForm] = useState({ name: '', description: '', situation: '', action: '', emotion: '', status: 'public' });
    const [creationMethod, setCreationMethod] = useState('direct');
    const [imagePreview, setImagePreview] = useState('');
    const [imageFile, setImageFile] = useState(null);
    
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiGeneratedImage, setAiGeneratedImage] = useState(null);

    useEffect(() => {
        if (itemData) {
            setForm(itemData);
            if (itemData.file_id) setImagePreview(itemData.file_id);
            setCreationMethod('direct');
        } else {
            setForm({ name: '', description: '', situation: '', action: '', emotion: '', status: 'public' });
        }
        if (!show) {
            setImagePreview('');
            setImageFile(null);
            setAiPrompt('');
            setAiGeneratedImage(null);
            setCreationMethod('direct');
        }
    }, [itemData, show]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            setImageFile(file);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveClick = () => {
        const { name, description, situation, action } = form;
        if (!name || !description || !situation || !action) {
            alert('이름, 설명, 상황, 행동은 필수 입력 항목입니다.');
            return;
        }
        onSave({ ...form, imageFile });
    };

    const handleAiGenerate = () => {
        // 📞 API CALL: AI 이미지 생성 API 호출
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{itemData ? 'AAC 아이템 편집' : '새 AAC 아이템 추가'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {!itemData && (
                        <Form.Group className="mb-3">
                            <Form.Label>생성 방식</Form.Label>
                            <div>
                                <Form.Check inline type="radio" label="AI로 생성" name="creationMethod" value="ai" checked={creationMethod === 'ai'} onChange={(e) => setCreationMethod(e.target.value)} />
                                <Form.Check inline type="radio" label="직접 등록" name="creationMethod" value="direct" checked={creationMethod === 'direct'} onChange={(e) => setCreationMethod(e.target.value)} />
                            </div>
                        </Form.Group>
                    )}
                    
                    {creationMethod === 'ai' && !itemData ? (
                        <>
                            {/* AI 생성 UI */}
                        </>
                    ) : (
                        <Row>
                            <Col md={8}>
                                <Form.Group className="mb-3"><Form.Label>이름</Form.Label><Form.Control type="text" name="name" placeholder="예: 물 마시기" value={form.name || ''} onChange={handleFormChange} /></Form.Group>
                                <Form.Group className="mb-3"><Form.Label>설명</Form.Label><Form.Control as="textarea" name="description" rows={2} placeholder="이 아이템에 대한 간단한 설명" value={form.description || ''} onChange={handleFormChange} /></Form.Group>
                                <Row>
                                    <Col><Form.Group className="mb-3"><Form.Label>상황 (대분류)</Form.Label><Form.Control type="text" name="situation" placeholder="예: 집, 학교" value={form.situation || ''} onChange={handleFormChange} /></Form.Group></Col>
                                    <Col><Form.Group className="mb-3"><Form.Label>행동 (소분류)</Form.Label><Form.Control type="text" name="action" placeholder="예: 밥먹기, 공부하기" value={form.action || ''} onChange={handleFormChange} /></Form.Group></Col>
                                    <Col><Form.Group className="mb-3"><Form.Label>감정 (선택)</Form.Label><Form.Control type="text" name="emotion" placeholder="예: 기쁨" value={form.emotion || ''} onChange={handleFormChange} /></Form.Group></Col>
                                </Row>
                                <Form.Group className="mb-3"><Form.Label>상태</Form.Label><Form.Select name="status" value={form.status || 'public'} onChange={handleFormChange}><option value="public">공개</option><option value="private">비공개</option></Form.Select></Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>이미지</Form.Label>
                                    <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
                                    {imagePreview && <Image src={imagePreview} className="mt-2" fluid thumbnail />}
                                </Form.Group>
                            </Col>
                        </Row>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>취소</Button>
                <Button variant="primary" onClick={handleSaveClick}>
                    {itemData ? '저장' : '추가'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AacItemModal;
