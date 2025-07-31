import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Image } from 'react-bootstrap';

const FilterModal = ({ show, onHide, onSave, filterData }) => {
    const [form, setForm] = useState({ name: '' });
    const [imagePreview, setImagePreview] = useState('');
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        if (filterData) {
            setForm({ name: filterData.name });
            if (filterData.file_id) setImagePreview(filterData.file_id);
        } else {
            setForm({ name: '' });
        }
        if (!show) {
            setImagePreview('');
            setImageFile(null);
        }
    }, [filterData, show]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            setImageFile(file);
        }
    };
    
    const handleSaveClick = () => {
        if (!form.name || (!imageFile && !filterData)) {
            alert('필터 이름과 이미지는 필수입니다.');
            return;
        }
        onSave({ ...form, imageFile, id: filterData?.id });
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{filterData ? '필터 편집' : '새 필터 추가'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>필터 이름</Form.Label>
                    <Form.Control type="text" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>이미지</Form.Label>
                    <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
                    {imagePreview && <Image src={imagePreview} className="mt-2" fluid thumbnail />}
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>취소</Button>
                <Button variant="primary" onClick={handleSaveClick}>{filterData ? '저장' : '추가'}</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default FilterModal;
