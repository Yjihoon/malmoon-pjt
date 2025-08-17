import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Modal, Button, Form, Row, Col, Spinner, Card, Image, ProgressBar } from 'react-bootstrap';
import './AacItemModal.css';
import api from '../../api/axios';

const AacItemModal = ({ show, onHide, onSave, itemData, onGenerate }) => {
  const [form, setForm] = useState({ name: '', description: '', situation: '', action: '', emotion: '', status: 'PUBLIC' });
  const [creationMethod, setCreationMethod] = useState('direct');
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);

  // 업로드 진행 상태
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  const { user } = useAuth();
  const token = user?.accessToken;

  // sha256 → base64 (가능한 브라우저에서만 사용)
  const sha256Base64 = async (file) => {
    try {
      const buf = await file.arrayBuffer();
      const hash = await crypto.subtle.digest('SHA-256', buf);
      const bytes = new Uint8Array(hash);
      let bin = '';
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      return btoa(bin);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (itemData) {
      setForm({
        ...itemData,
        status: itemData.status || 'PUBLIC',
      });
      if (itemData.imageUrl) setImagePreview(itemData.imageUrl);
      setCreationMethod('direct');
      setImageFile(null);
    } else {
      setForm({ name: '', description: '', situation: '', action: '', emotion: '', status: 'PUBLIC' });
      setCreationMethod('direct');
      setImagePreview('');
      setImageFile(null);
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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // AI 이미지 생성 (기존 로직 유지)
  const handleAiGenerate = async () => {
    const { situation, action, emotion, description } = form;
    if (!situation || !action || !emotion) {
      alert('AI 이미지 생성을 위해 상황, 행동, 감정을 모두 입력해주세요.');
      return;
    }
    setIsGenerating(true);
    try {
      let generatedUrl = await onGenerate({ situation, action, emotion, description });
      if (generatedUrl && typeof generatedUrl === 'object') {
        generatedUrl = generatedUrl.previewUrl || generatedUrl.preview_url || '';
      }
      if (typeof generatedUrl !== 'string' || !generatedUrl) {
        throw new Error('유효하지 않은 미리보기 URL입니다.');
      }
      const absoluteUrl = new URL(generatedUrl, window.location.origin).toString();
      const res = await fetch(absoluteUrl);
      if (!res.ok) throw new Error('이미지 다운로드 실패');
      const blob = await res.blob();
      const pathname = new URL(absoluteUrl).pathname;
      const fallbackName = `aac_preview_${Date.now()}.png`;
      const filename = pathname.split('/').pop() || fallbackName;
      const aiImageFile = new File([blob], filename, { type: blob.type || 'image/png' });

      setImageFile(aiImageFile);
      setImagePreview(URL.createObjectURL(aiImageFile));
    } catch (err) {
      console.error('AI 이미지 생성 중 오류:', err);
      alert(err.message || 'AI 이미지 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // ✅ 최종: "추가" 버튼에서 presigned 업로드 + confirm + AAC 생성
  const handleCreateViaPresign = async () => {
    try {
      // 필수 검증
      if (!form.name || !form.description || !form.situation || !form.action) {
        alert('이름, 설명, 상황, 행동은 필수 입력 항목입니다.');
        return;
      }
      if (!imageFile) {
        alert('이미지를 선택하거나 생성해주세요.');
        return;
      }
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      setBusy(true);
      setProgress(0);

      const contentType = imageFile.type || 'application/octet-stream';
      const checksum = await sha256Base64(imageFile);

      // 1) presign 발급 (AAC 고정)
      const { data: presign } = await api.post(
        '/aacs/presign-upload',
        {
          originalFileName: imageFile.name,
          contentType,
          size: imageFile.size,
          ...(checksum ? { checksumSha256Base64: checksum } : {}),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2) S3로 PUT (진행률 표시)
      const etag = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', presign.uploadUrl, true);
        xhr.setRequestHeader('Content-Type', contentType);
        if (checksum) xhr.setRequestHeader('x-amz-checksum-sha256', checksum);
        xhr.setRequestHeader('x-amz-server-side-encryption', 'AES256');
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.getResponseHeader('ETag')); // S3 CORS에 ExposeHeaders: ETag 필요
          } else {
            reject(new Error(`S3 오류 ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('네트워크 오류'));
        xhr.send(imageFile);
      });

      // 3) 업로드 확정 + AAC 저장(서버에서 File/ AAC 모두 저장)
      const completeBody = {
        key: presign.key,
        size: imageFile.size,
        contentType,
        etag,
        name: form.name,
        situation: form.situation,
        action: form.action,
        emotion: form.emotion || null,
        description: form.description,
        status: form.status,
      };

      const { data: created } = await api.post(
        '/aacs/presign-complete',
        completeBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 미리보기 URL 있으면 갱신
      if (created?.previewUrl) setImagePreview(created.previewUrl);

      // ✅ 부모 목록 새로고침 트리거 (예전 onSave를 "리프레시 신호"로 재사용)
      if (typeof onSave === 'function') {
        onSave({ refreshed: true });
      }

      alert('AAC가 생성되었습니다.');
      onHide?.();

      // 폼 초기화(선택)
      setForm({ name: '', description: '', situation: '', action: '', emotion: '', status: 'PUBLIC' });
      setImageFile(null);
      setProgress(0);
    } catch (e) {
      console.error(e);
      alert(e.message || '업로드/생성 실패');
    } finally {
      setBusy(false);
    }
  };

  const isCreateMode = !itemData;

  return (
    <Modal show={show} onHide={onHide} centered size="lg" className="aac-item-modal">
      <Modal.Header closeButton>
        <Modal.Title>{itemData ? 'AAC 아이템 편집' : '새 AAC 아이템 추가'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {isCreateMode && (
            <Form.Group className="mb-3">
              <Form.Label>생성 방식</Form.Label>
              <div>
                <Form.Check
                  inline
                  type="radio"
                  label="AI로 생성"
                  name="creationMethod"
                  value="ai"
                  checked={creationMethod === 'ai'}
                  onChange={(e) => setCreationMethod(e.target.value)}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="직접 등록"
                  name="creationMethod"
                  value="direct"
                  checked={creationMethod === 'direct'}
                  onChange={(e) => setCreationMethod(e.target.value)}
                />
              </div>
            </Form.Group>
          )}

          {creationMethod === 'ai' && isCreateMode ? (
            <>
              <Row>
                <Col md={7}>
                  <Form.Group className="mb-3">
                    <Form.Label>핵심 설명</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      placeholder="AI에게 생성 요청할 이미지 설명"
                      value={form.description || ''}
                      onChange={handleFormChange}
                    />
                  </Form.Group>
                  <Row>
                    <Col md={7}>
                      <Form.Group className="mb-3">
                        <Form.Label>상황</Form.Label>
                        <Form.Control type="text" name="situation" value={form.situation || ''} onChange={handleFormChange} />
                      </Form.Group>
                    </Col>
                    <Col md={7}>
                      <Form.Group className="mb-3">
                        <Form.Label>행동</Form.Label>
                        <Form.Control type="text" name="action" value={form.action || ''} onChange={handleFormChange} />
                      </Form.Group>
                    </Col>
                    <Col md={7}>
                      <Form.Group className="mb-3">
                        <Form.Label>감정</Form.Label>
                        <Form.Control type="text" name="emotion" value={form.emotion || ''} onChange={handleFormChange} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button className="btn-ai-generate" onClick={handleAiGenerate} disabled={isGenerating || busy}>
                    {isGenerating ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> 생성 중...
                      </>
                    ) : (
                      'AI 이미지 생성'
                    )}
                  </Button>
                </Col>
                <Col md={5}>
                  <Form.Label>생성된 이미지</Form.Label>
                  <Card className="image-preview-card">
                    {isGenerating ? (
                      <Spinner animation="border" />
                    ) : imagePreview ? (
                      <Image src={imagePreview} fluid thumbnail />
                    ) : (
                      <div className="text-muted"> 생성된 AI 이미지 </div>
                    )}
                  </Card>
                  {busy && (
                    <div className="mt-2">
                      <ProgressBar now={progress} label={`${progress}%`} striped animated />
                    </div>
                  )}
                </Col>
              </Row>
              <hr className="my-4" />
              <Form.Group className="mb-3">
                <Form.Label>이름</Form.Label>
                <Form.Control type="text" name="name" value={form.name || ''} onChange={handleFormChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>상태</Form.Label>
                <Form.Select name="status" value={form.status || 'PUBLIC'} onChange={handleFormChange}>
                  <option value="PUBLIC">공개</option>
                  <option value="PRIVATE">비공개</option>
                </Form.Select>
              </Form.Group>
            </>
          ) : (
            <Row>
              <Col md={7}>
                <Form.Group className="mb-3">
                  <Form.Label>이름</Form.Label>
                  <Form.Control type="text" name="name" value={form.name || ''} onChange={handleFormChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>설명</Form.Label>
                  <Form.Control as="textarea" name="description" rows={2} value={form.description || ''} onChange={handleFormChange} />
                </Form.Group>
                <Row>
                  <Col md={7}>
                    <Form.Group className="mb-3">
                      <Form.Label>상황 (대분류)</Form.Label>
                      <Form.Control type="text" name="situation" value={form.situation || ''} onChange={handleFormChange} />
                    </Form.Group>
                  </Col>
                  <Col md={7}>
                    <Form.Group className="mb-3">
                      <Form.Label>행동</Form.Label>
                      <Form.Control type="text" name="action" value={form.action || ''} onChange={handleFormChange} />
                    </Form.Group>
                  </Col>
                  <Col md={7}>
                    <Form.Group className="mb-3">
                      <Form.Label>감정</Form.Label>
                      <Form.Control type="text" name="emotion" value={form.emotion || ''} onChange={handleFormChange} />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>상태</Form.Label>
                  <Form.Select name="status" value={form.status || 'PUBLIC'} onChange={handleFormChange}>
                    <option value="PUBLIC">공개</option>
                    <option value="PRIVATE">비공개</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group className="mb-3">
                  <Form.Label>이미지</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={handleFileChange} disabled={busy} />
                  {imagePreview && <Image src={imagePreview} className="mt-2" fluid thumbnail />}
                </Form.Group>
                {busy && (
                  <div className="mt-2">
                    <ProgressBar now={progress} label={`${progress}%`} striped animated />
                  </div>
                )}
              </Col>
            </Row>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button className="btn-cancel" onClick={onHide} disabled={busy}>
          취소
        </Button>
        {/* <Button className="btn-save-add" onClick={handleCreateViaPresign} disabled={busy || (!isCreateMode && !imageFile && !form.name)}>
          {busy ? '업로드 중…' : itemData ? '저장' : '추가'}
        </Button> */}
         {isCreateMode ? (
        // 생성 모드: presign → PUT → complete
        <Button
        className="btn-save-add"
        onClick={handleCreateViaPresign}
        disabled={busy}
        >
        {busy ? '업로드 중…' : '추가'}
        </Button>
    ) : (
        // 편집 모드: 아직 업데이트 API 없으면 비활성/미구현 표시(선택)
        <Button className="btn-save-add" disabled>
        저장 (곧 지원)
        </Button>
    )}
      </Modal.Footer>
    </Modal>
  );
};

export default AacItemModal;
