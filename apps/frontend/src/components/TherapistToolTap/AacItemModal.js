import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup, Spinner, Card, Image } from 'react-bootstrap';

// [수정] 부모로부터 onGenerate 함수를 props로 받도록 추가합니다.
const AacItemModal = ({ show, onHide, onSave, itemData, onGenerate }) => {
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
        if (creationMethod === 'direct' && (!name || !description || !situation || !action)) {
            alert('이름, 설명, 상황, 행동은 필수 입력 항목입니다.');
            return;
        }
        if (creationMethod === 'ai' && !name) {
            alert('아이템 이름은 필수 입력 항목입니다.');
            return;
        }
        onSave({ ...form, imageFile, aiGeneratedImage });
    };

    const handleAiGenerate = async () => {
        const { situation, action, emotion, description } = form;
        if (!situation || !action || !emotion) {
            alert('AI 이미지 생성을 위해 상황, 행동, 감정을 모두 입력해주세요.');
            return;
        }
        setIsGenerating(true);
        try {
            // [수정] 이제 onGenerate가 정상적으로 props로 전달되어 호출됩니다.
            const generatedUrl = await onGenerate({ situation, action, emotion, description });
            // [수정] AI 서버가 제공하는 전체 URL을 그대로 사용합니다.
            setAiGeneratedImage(generatedUrl);
        } catch (error) { 
            alert(error.message || 'AI 이미지 생성에 실패했습니다.');
        } finally {
            setIsGenerating(false);
        }
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
                            <Row>
                                <Col md={8}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>핵심 설명</Form.Label>
                                        <Form.Control 
                                            as="textarea" 
                                            rows={3} 
                                            name="description"
                                            placeholder="AI에게 생성 요청할 이미지에 대한 설명을 자유롭게 입력하세요. (예: 학교에서 즐겁게 친구들과 노는 모습)" 
                                            value={form.description || ''} 
                                            onChange={handleFormChange} 
                                        />
                                    </Form.Group>
                                    <Row>
                                        <Col><Form.Group className="mb-3"><Form.Label>상황</Form.Label><Form.Control type="text" name="situation" placeholder="예: 학교" value={form.situation || ''} onChange={handleFormChange} /></Form.Group></Col>
                                        <Col><Form.Group className="mb-3"><Form.Label>행동</Form.Label><Form.Control type="text" name="action" placeholder="예: 친구와 놀기" value={form.action || ''} onChange={handleFormChange} /></Form.Group></Col>
                                        <Col><Form.Group className="mb-3"><Form.Label>감정</Form.Label><Form.Control type="text" name="emotion" placeholder="예: 즐거움" value={form.emotion || ''} onChange={handleFormChange} /></Form.Group></Col>
                                    </Row>
                                    <Button variant="info" onClick={handleAiGenerate} disabled={isGenerating}>
                                        {isGenerating ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> 생성 중...</> : 'AI 이미지 생성'}
                                    </Button>
                                </Col>
                                <Col md={4}>
                                    <Form.Label>생성된 이미지</Form.Label>
                                    <Card className="h-100 d-flex align-items-center justify-content-center" style={{ minHeight: '150px', backgroundColor: '#f8f9fa' }}>
                                        {isGenerating ? (
                                            <Spinner animation="border" />
                                        ) : (
                                            aiGeneratedImage ? <Image src={aiGeneratedImage} fluid thumbnail /> : <div className="text-muted">AI가 이미지를 생성합니다.</div>
                                        )}
                                    </Card>
                                </Col>
                            </Row>
                            <hr className="my-4" />
                            <Form.Group className="mb-3"><Form.Label>이름</Form.Label><Form.Control type="text" name="name" placeholder="생성된 아이템의 이름 (예: 즐거운 학교생활)" value={form.name || ''} onChange={handleFormChange} /></Form.Group>
                            <Form.Group className="mb-3"><Form.Label>상태</Form.Label><Form.Select name="status" value={form.status || 'public'} onChange={handleFormChange}><option value="public">공개</option><option value="private">비공개</option></Form.Select></Form.Group>
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
