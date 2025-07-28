import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Alert, ListGroup, Modal, Form, Image, Badge, Tabs, Tab, InputGroup, Pagination, Spinner } from 'react-bootstrap';
// import { useAuth } from '../../../contexts/AuthContext'; // 실제 환경에서는 이 주석을 해제하세요.
import { v4 as uuidv4 } from 'uuid';
// import './TherapistToolsPage.css'; // 실제 환경에서는 이 주석을 해제하세요.

// --- Mock Data and Services ---
const useAuth = () => ({ user: { userType: 'therapist', id: 'therapist123' } });

// --- Helper & Child Components ---

// 1. Main AAC Tool List Component with Search and Pagination
const AacToolList = ({ aacTools, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const toolsPerPage = 20;

    const filteredTools = useMemo(() =>
        aacTools.filter(tool =>
            tool.name.toLowerCase().includes(searchTerm.toLowerCase())
        ), [aacTools, searchTerm]
    );

    const totalPages = Math.ceil(filteredTools.length / toolsPerPage);
    const currentTools = filteredTools.slice((currentPage - 1) * toolsPerPage, currentPage * toolsPerPage);

    return (
        <>
            <InputGroup className="mb-3">
                <Form.Control
                    placeholder="AAC 도구 이름으로 검색..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                />
            </InputGroup>
            <ListGroup>
                {currentTools.length > 0 ? currentTools.map(tool => (
                    <ListGroup.Item key={tool.id} className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <Image src={tool.imageUrl || 'https://placehold.co/100x100?text=No+Image'} style={{ width: '50px', height: '50px', objectFit: 'cover' }} rounded className="me-3" />
                            <div>
                                <strong>{tool.name}</strong>
                                <small className="d-block text-muted">{tool.description}</small>
                            </div>
                        </div>
                        <div>
                            <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => onEdit(tool)}>편집</Button>
                            <Button variant="outline-danger" size="sm" onClick={() => onDelete(tool.id)}>삭제</Button>
                        </div>
                    </ListGroup.Item>
                )) : <p className="text-muted text-center">표시할 도구가 없습니다.</p>}
            </ListGroup>
            {totalPages > 1 && (
                <Pagination className="justify-content-center mt-3">
                    <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} />
                    {[...Array(totalPages).keys()].map(num => (
                        <Pagination.Item key={num + 1} active={num + 1 === currentPage} onClick={() => setCurrentPage(num + 1)}>
                            {num + 1}
                        </Pagination.Item>
                    ))}
                    <Pagination.Next onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} />
                </Pagination>
            )}
        </>
    );
};

// 2. AAC Tool Selector for Sets with Advanced Filtering
const AacToolSelector = ({ aacTools, selectedToolIds, onToggleTool }) => {
    const [searchCategory, setSearchCategory] = useState('name');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const toolsPerPage = 20;

    const filteredTools = useMemo(() => {
        if (!searchTerm.trim()) {
            return aacTools;
        }
        return aacTools.filter(tool => {
            const toolValue = tool[searchCategory] ? tool[searchCategory].toLowerCase() : '';
            return toolValue.includes(searchTerm.toLowerCase());
        });
    }, [aacTools, searchTerm, searchCategory]);

    const totalPages = Math.ceil(filteredTools.length / toolsPerPage);
    const currentTools = filteredTools.slice((currentPage - 1) * toolsPerPage, currentPage * toolsPerPage);

    return (
        <>
            <InputGroup className="mb-3">
                <Form.Select 
                    style={{flex: '0 0 120px'}}
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                >
                    <option value="name">이름</option>
                    <option value="situation">상황</option>
                    <option value="action">행동</option>
                    <option value="emotion">감정</option>
                </Form.Select>
                <Form.Control
                    placeholder="선택한 기준으로 검색..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                />
            </InputGroup>

            {currentTools.length > 0 ? (
                <Row xs={1} sm={2} md={4} lg={5} className="g-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {currentTools.map(tool => (
                        <Col key={tool.id}>
                            <Card className={`h-100 text-center ${selectedToolIds.includes(tool.id) ? 'border-primary' : ''}`} onClick={() => onToggleTool(tool.id)} style={{ cursor: 'pointer' }}>
                                <Card.Img variant="top" src={tool.imageUrl || 'https://placehold.co/150x100?text=No+Image'} style={{ height: '100px', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x100?text=Error'; }} />
                                <Card.Body className="p-2"><Card.Text style={{ fontSize: '0.8rem' }}>{tool.name}</Card.Text></Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
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


// --- Main Component ---
function TherapistToolsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Data States
  const [aacTools, setAacTools] = useState([]);
  const [aacSets, setAacSets] = useState([]);
  const [filters, setFilters] = useState([]);
  const [toolBundles, setToolBundles] = useState([]);

  // Modal States
  const [showAacToolModal, setShowAacToolModal] = useState(false);
  const [showAacSetModal, setShowAacSetModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showToolBundleModal, setShowToolBundleModal] = useState(false);

  // Form & Edit States
  const [currentAacTool, setCurrentAacTool] = useState(null);
  const [currentAacSet, setCurrentAacSet] = useState(null);
  const [currentFilter, setCurrentFilter] = useState(null);
  const [currentToolBundle, setCurrentToolBundle] = useState(null);
  const [aacCreationMethod, setAacCreationMethod] = useState('direct');
  const [aacToolForm, setAacToolForm] = useState({ name: '', description: '', situation: '', action: '', emotion: '', imageUrl: '', status: 'public' });
  const [aacSetForm, setAacSetForm] = useState({ name: '', description: '', toolIds: [] });
  const [filterForm, setFilterForm] = useState({ name: '', imageUrl: '' });
  const [toolBundleForm, setToolBundleForm] = useState({ name: '', description: '', aacSetIds: [], filterIds: [] });
  const [imagePreview, setImagePreview] = useState('');

  // AI Generation States
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGeneratedImage, setAiGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchMockData = () => {
        setLoading(true);
        try {
            if (user && user.userType === 'therapist') {
                const dummyAacTools = Array.from({ length: 25 }, (_, i) => ({
                    id: `tool${i + 1}`, name: `도구 ${i + 1}`, description: `설명 ${i + 1}`, situation: '일상', action: '놀기', emotion: i % 2 === 0 ? '기쁨' : '행복',
                    imageUrl: `https://placehold.co/150x100?text=Tool${i + 1}`, status: 'public'
                }));
                setAacTools(dummyAacTools);
                const dummyFilters = Array.from({ length: 5 }, (_, i) => ({ id: `filter${i + 1}`, name: `필터 ${i + 1}`, imageUrl: `https://placehold.co/100x100?text=Filter${i + 1}` }));
                setFilters(dummyFilters);
                const dummyAacSets = [{ id: 'set1', name: '기본 과일 묶음', description: '사과, 바나나, 딸기', toolIds: ['tool1', 'tool2', 'tool3'] }, { id: 'set2', name: '탈것 묶음', description: '자동차, 비행기, 배', toolIds: ['tool4', 'tool5', 'tool6'] }];
                setAacSets(dummyAacSets);
                const dummyToolBundles = [{ id: 'bundle1', name: '과일가게 놀이 세트', description: '과일 묶음과 기본 필터 사용', aacSetIds: ['set1'], filterIds: ['filter1'] }, { id: 'bundle2', name: '교통수단 배우기', description: '탈것 묶음과 여러 필터 사용', aacSetIds: ['set2'], filterIds: ['filter2', 'filter3'] }];
                setToolBundles(dummyToolBundles);
            } else { setError('치료사 계정으로만 접근 가능합니다.'); }
        } catch (e) { setError('데이터 로딩 중 오류가 발생했습니다.'); } finally { setLoading(false); }
    };
    fetchMockData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e, formSetter) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      formSetter(prev => ({ ...prev, imageFile: file, imageUrl: previewUrl }));
    }
  };

  const openModal = (type, item = null) => {
    setImagePreview('');
    setAiGeneratedImage(null);
    setAiPrompt('');
    switch (type) {
        case 'aacTool':
            setCurrentAacTool(item);
            setAacCreationMethod('direct');
            const toolData = item || { name: '', description: '', situation: '', action: '', emotion: '', imageUrl: '', status: 'public' };
            setAacToolForm(toolData);
            if (item && item.imageUrl) setImagePreview(item.imageUrl);
            setShowAacToolModal(true);
            break;
        case 'aacSet':
            setCurrentAacSet(item);
            setAacSetForm(item || { name: '', description: '', toolIds: [] });
            setShowAacSetModal(true);
            break;
        case 'filter':
            setCurrentFilter(item);
            const filterData = item || { name: '', imageUrl: '' };
            setFilterForm(filterData);
            if (item && item.imageUrl) setImagePreview(item.imageUrl);
            setShowFilterModal(true);
            break;
        case 'toolBundle':
            setCurrentToolBundle(item);
            setToolBundleForm(item || { name: '', description: '', aacSetIds: [], filterIds: [] });
            setShowToolBundleModal(true);
            break;
        default: break;
    }
  };
  
  const handleAiGenerate = async () => {
      if (!aiPrompt) {
          alert('프롬프트를 입력해주세요.');
          return;
      }
      setIsGenerating(true);
      setAiGeneratedImage(null);

      // Simulate API call
      setTimeout(() => {
          const mockImageUrl = `https://placehold.co/400x300?text=${encodeURIComponent(aiPrompt)}`;
          setAiGeneratedImage(mockImageUrl);
          setAacToolForm({
              name: `${aiPrompt} (AI 생성)`,
              description: `'${aiPrompt}' 프롬프트를 기반으로 생성된 이미지입니다.`,
              situation: 'AI 추천',
              action: 'AI 추천',
              emotion: '',
              imageUrl: mockImageUrl,
              status: 'public',
          });
          setIsGenerating(false);
      }, 2000);
  };

  // --- Validation and CRUD Handlers ---
  const validateAndRun = (fields, onValid) => {
      for(const [key, value] of Object.entries(fields)) {
          if(!value) {
              alert('필수 항목을 모두 입력해주세요.');
              return;
          }
      }
      onValid();
  }

  const handleAddEditAacTool = () => {
    const { name, description, situation, action } = aacToolForm;
    validateAndRun({ name, description, situation, action }, () => {
        const finalForm = { ...aacToolForm };
        delete finalForm.imageFile;
        if (currentAacTool) {
            setAacTools(prev => prev.map(t => t.id === currentAacTool.id ? finalForm : t));
        } else {
            setAacTools(prev => [...prev, { ...finalForm, id: uuidv4() }]);
        }
        setShowAacToolModal(false);
    });
  };

  const handleDeleteAacTool = (toolId) => {
    if (window.confirm('정말로 이 AAC 도구를 삭제하시겠습니까?')) {
        setAacTools(prev => prev.filter(t => t.id !== toolId));
        setAacSets(prev => prev.map(s => ({ ...s, toolIds: s.toolIds.filter(id => id !== toolId) })));
    }
  };

  const handleAddEditAacSet = () => {
    const { name, description, toolIds } = aacSetForm;
    if (toolIds.length === 0) {
        alert('하나 이상의 AAC 도구를 포함해야 합니다.');
        return;
    }
    validateAndRun({ name, description }, () => {
        if (currentAacSet) {
            setAacSets(prev => prev.map(s => s.id === currentAacSet.id ? aacSetForm : s));
        } else {
            setAacSets(prev => [...prev, { ...aacSetForm, id: uuidv4() }]);
        }
        setShowAacSetModal(false);
    });
  };

  const handleDeleteAacSet = (setId) => {
      if(window.confirm('정말로 이 AAC 묶음을 삭제하시겠습니까?')) {
          setAacSets(prev => prev.filter(s => s.id !== setId));
          setToolBundles(prev => prev.map(b => ({...b, aacSetIds: b.aacSetIds.filter(id => id !== setId)})))
      }
  };

  const handleAddEditFilter = () => {
    const { name, imageUrl } = filterForm;
    validateAndRun({ name, imageUrl }, () => {
        const finalForm = { ...filterForm };
        delete finalForm.imageFile;
        if (currentFilter) {
            setFilters(prev => prev.map(f => f.id === currentFilter.id ? finalForm : f));
        } else {
            setFilters(prev => [...prev, { ...finalForm, id: uuidv4() }]);
        }
        setShowFilterModal(false);
    });
  };

  const handleDeleteFilter = (filterId) => {
      if(window.confirm('정말로 이 필터를 삭제하시겠습니까?')) {
          setFilters(prev => prev.filter(f => f.id !== filterId));
          setToolBundles(prev => prev.map(b => ({...b, filterIds: b.filterIds.filter(id => id !== filterId)})))
      }
  };

  const handleAddEditToolBundle = () => {
    const { name, description, aacSetIds, filterIds } = toolBundleForm;
    if (aacSetIds.length === 0 && filterIds.length === 0) {
        alert('하나 이상의 AAC 묶음 또는 필터를 포함해야 합니다.');
        return;
    }
    validateAndRun({ name, description }, () => {
        if (currentToolBundle) {
            setToolBundles(prev => prev.map(b => b.id === currentToolBundle.id ? toolBundleForm : b));
        } else {
            setToolBundles(prev => [...prev, { ...toolBundleForm, id: uuidv4() }]);
        }
        setShowToolBundleModal(false);
    });
  };

  const handleDeleteToolBundle = (bundleId) => {
      if(window.confirm('정말로 이 수업 세트를 삭제하시겠습니까?')) {
          setToolBundles(prev => prev.filter(b => b.id !== bundleId));
      }
  };

  if (loading) return <Container className="my-5 text-center"><p>로딩 중...</p></Container>;
  if (error) return <Container className="my-5 text-center"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">수업 도구 관리</h2>
      <Tabs defaultActiveKey="aacTools" className="mb-3">
        <Tab eventKey="aacTools" title="AAC 도구">
          <Card className="p-3"><Card.Body>
              <Card.Title className="mb-3">AAC 도구 목록</Card.Title>
              <Button className="btn-soft-primary mb-3" onClick={() => openModal('aacTool')}>새 AAC 도구 추가</Button>
              <AacToolList aacTools={aacTools} onEdit={(tool) => openModal('aacTool', tool)} onDelete={handleDeleteAacTool} />
          </Card.Body></Card>
        </Tab>
        <Tab eventKey="aacSets" title="AAC 묶음">
             <Card className="p-3"><Card.Body>
                <Card.Title className="mb-3">AAC 묶음 목록</Card.Title>
                <Button className="btn-soft-primary mb-3" onClick={() => openModal('aacSet')}>새 AAC 묶음 추가</Button>
                <ListGroup>{aacSets.map(set => (
                    <ListGroup.Item key={set.id}><div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h5>{set.name}</h5><p className="text-muted">{set.description}</p>
                            <div>
                                {set.toolIds.slice(0, 5).map(toolId => { const tool = aacTools.find(t => t.id === toolId); return tool ? <Badge pill bg="info" className="me-1" key={toolId}>{tool.name}</Badge> : null; })}
                                {set.toolIds.length > 5 && <Badge pill bg="secondary">+{set.toolIds.length - 5}개 더</Badge>}
                            </div>
                        </div>
                        <div>
                            <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => openModal('aacSet', set)}>편집</Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDeleteAacSet(set.id)}>삭제</Button>
                        </div>
                    </div></ListGroup.Item>
                ))}</ListGroup>
            </Card.Body></Card>
        </Tab>
        <Tab eventKey="filters" title="필터">
            <Card className="p-3"><Card.Body>
                <Card.Title className="mb-3">필터 목록</Card.Title>
                <Button className="btn-soft-primary mb-3" onClick={() => openModal('filter')}>새 필터 추가</Button>
                <ListGroup>{filters.map(filter => (
                    <ListGroup.Item key={filter.id} className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <Image src={filter.imageUrl || 'https://placehold.co/100x100?text=No+Image'} style={{ width: '50px', height: '50px', objectFit: 'cover' }} rounded className="me-3" />
                            <strong>{filter.name}</strong>
                        </div>
                        <div>
                            <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => openModal('filter', filter)}>편집</Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDeleteFilter(filter.id)}>삭제</Button>
                        </div>
                    </ListGroup.Item>
                ))}</ListGroup>
            </Card.Body></Card>
        </Tab>
        <Tab eventKey="toolBundles" title="수업 세트">
            <Card className="p-3"><Card.Body>
                <Card.Title className="mb-3">수업 세트 목록</Card.Title>
                <Button className="btn-soft-primary mb-3" onClick={() => openModal('toolBundle')}>새 수업 세트 추가</Button>
                <ListGroup>{toolBundles.map(bundle => (
                     <ListGroup.Item key={bundle.id}><div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h5>{bundle.name}</h5><p className="text-muted">{bundle.description}</p>
                            <strong>포함된 AAC 묶음:</strong>
                            <div className="mb-2">{bundle.aacSetIds.map(setId => { const set = aacSets.find(s => s.id === setId); return set ? <Badge bg="primary" className="me-1" key={setId}>{set.name}</Badge> : null; })}</div>
                            <strong>포함된 필터:</strong>
                            <div>{bundle.filterIds.map(filterId => { const filter = filters.find(f => f.id === filterId); return filter ? <Badge bg="success" className="me-1" key={filterId}>{filter.name}</Badge> : null; })}</div>
                        </div>
                        <div>
                            <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => openModal('toolBundle', bundle)}>편집</Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDeleteToolBundle(bundle.id)}>삭제</Button>
                        </div>
                    </div></ListGroup.Item>
                ))}</ListGroup>
            </Card.Body></Card>
        </Tab>
      </Tabs>
      
      {/* --- Modals --- */}
      <Modal show={showAacToolModal} onHide={() => setShowAacToolModal(false)} centered size="lg">
          <Modal.Header closeButton><Modal.Title>{currentAacTool ? 'AAC 도구 편집' : '새 AAC 도구 추가'}</Modal.Title></Modal.Header>
          <Modal.Body>
              <Form>
                  {!currentAacTool && (<Form.Group className="mb-3"><Form.Label>생성 방식</Form.Label><div>
                        <Form.Check inline type="radio" label="AI로 생성" name="creationMethod" value="ai" checked={aacCreationMethod === 'ai'} onChange={(e) => setAacCreationMethod(e.target.value)} />
                        <Form.Check inline type="radio" label="직접 등록" name="creationMethod" value="direct" checked={aacCreationMethod === 'direct'} onChange={(e) => setAacCreationMethod(e.target.value)} />
                  </div></Form.Group>)}
                  
                  {aacCreationMethod === 'ai' && !currentAacTool ? (
                      <>
                          <InputGroup className="mb-3">
                              <Form.Control placeholder="예: 공원에서 행복하게 웃는 아이" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} />
                              <Button variant="outline-primary" onClick={handleAiGenerate} disabled={isGenerating}>
                                  {isGenerating ? <Spinner as="span" animation="border" size="sm" /> : '이미지 생성'}
                              </Button>
                          </InputGroup>
                          <Card className="text-center p-3" style={{minHeight: '200px'}}>
                              {isGenerating && <Spinner animation="border" />}
                              {aiGeneratedImage && <Image src={aiGeneratedImage} fluid />}
                              {!isGenerating && !aiGeneratedImage && <span className="text-muted">생성된 이미지가 여기에 표시됩니다.</span>}
                          </Card>
                          <hr/>
                          <p className="text-muted">AI 생성 결과가 아래에 자동으로 입력됩니다. 수정이 가능합니다.</p>
                          {/* Form fields will be populated after generation */}
                          <Row>
                              <Col md={8}>
                                <Form.Group className="mb-3"><Form.Label>이름</Form.Label><Form.Control type="text" value={aacToolForm.name} onChange={(e) => setAacToolForm({ ...aacToolForm, name: e.target.value })} /></Form.Group>
                                <Form.Group className="mb-3"><Form.Label>설명</Form.Label><Form.Control as="textarea" rows={2} value={aacToolForm.description} onChange={(e) => setAacToolForm({ ...aacToolForm, description: e.target.value })} /></Form.Group>
                                <Row>
                                    <Col><Form.Group className="mb-3"><Form.Label>상황</Form.Label><Form.Control type="text" value={aacToolForm.situation} onChange={(e) => setAacToolForm({ ...aacToolForm, situation: e.target.value })} /></Form.Group></Col>
                                    <Col><Form.Group className="mb-3"><Form.Label>행동</Form.Label><Form.Control type="text" value={aacToolForm.action} onChange={(e) => setAacToolForm({ ...aacToolForm, action: e.target.value })} /></Form.Group></Col>
                                    <Col><Form.Group className="mb-3"><Form.Label>감정 (선택)</Form.Label><Form.Control type="text" value={aacToolForm.emotion} onChange={(e) => setAacToolForm({ ...aacToolForm, emotion: e.target.value })} /></Form.Group></Col>
                                </Row>
                              </Col>
                          </Row>
                      </>
                  ) : (
                      <Row>
                          <Col md={8}>
                              <Form.Group className="mb-3"><Form.Label>이름</Form.Label><Form.Control type="text" value={aacToolForm.name} onChange={(e) => setAacToolForm({ ...aacToolForm, name: e.target.value })} /></Form.Group>
                              <Form.Group className="mb-3"><Form.Label>설명</Form.Label><Form.Control as="textarea" rows={2} value={aacToolForm.description} onChange={(e) => setAacToolForm({ ...aacToolForm, description: e.target.value })} /></Form.Group>
                              <Row>
                                  <Col><Form.Group className="mb-3"><Form.Label>상황</Form.Label><Form.Control type="text" value={aacToolForm.situation} onChange={(e) => setAacToolForm({ ...aacToolForm, situation: e.target.value })} /></Form.Group></Col>
                                  <Col><Form.Group className="mb-3"><Form.Label>행동</Form.Label><Form.Control type="text" value={aacToolForm.action} onChange={(e) => setAacToolForm({ ...aacToolForm, action: e.target.value })} /></Form.Group></Col>
                                  <Col><Form.Group className="mb-3"><Form.Label>감정 (선택)</Form.Label><Form.Control type="text" value={aacToolForm.emotion} onChange={(e) => setAacToolForm({ ...aacToolForm, emotion: e.target.value })} /></Form.Group></Col>
                              </Row>
                               <Form.Group className="mb-3"><Form.Label>상태</Form.Label><Form.Select value={aacToolForm.status} onChange={(e) => setAacToolForm({...aacToolForm, status: e.target.value})}><option value="public">공개</option><option value="private">비공개</option></Form.Select></Form.Group>
                          </Col>
                          <Col md={4}>
                              <Form.Group className="mb-3"><Form.Label>이미지</Form.Label><Form.Control type="file" accept="image/*" onChange={(e) => handleFileChange(e, setAacToolForm)} />
                                  {imagePreview && <Image src={imagePreview} className="mt-2" fluid thumbnail />}
                              </Form.Group>
                          </Col>
                      </Row>
                  )}
              </Form>
          </Modal.Body>
          <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAacToolModal(false)}>취소</Button>
              <Button variant="primary" onClick={handleAddEditAacTool}>{currentAacTool ? '저장' : '추가'}</Button>
          </Modal.Footer>
      </Modal>

      <Modal show={showAacSetModal} onHide={() => setShowAacSetModal(false)} centered size="xl">
          <Modal.Header closeButton><Modal.Title>{currentAacSet ? 'AAC 묶음 편집' : '새 AAC 묶음 추가'}</Modal.Title></Modal.Header>
          <Modal.Body>
              <Form.Group className="mb-3"><Form.Label>묶음 이름</Form.Label><Form.Control type="text" value={aacSetForm.name} onChange={(e) => setAacSetForm({...aacSetForm, name: e.target.value})} /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>설명</Form.Label><Form.Control as="textarea" value={aacSetForm.description} onChange={(e) => setAacSetForm({...aacSetForm, description: e.target.value})} /></Form.Group>
              <hr />
              <AacToolSelector aacTools={aacTools} selectedToolIds={aacSetForm.toolIds} onToggleTool={(toolId) => { setAacSetForm(prev => ({ ...prev, toolIds: prev.toolIds.includes(toolId) ? prev.toolIds.filter(id => id !== toolId) : [...prev.toolIds, toolId] })); }} />
          </Modal.Body>
          <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAacSetModal(false)}>취소</Button>
              <Button variant="primary" onClick={handleAddEditAacSet}>{currentAacSet ? '저장' : '추가'}</Button>
          </Modal.Footer>
      </Modal>

      <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)} centered>
          <Modal.Header closeButton><Modal.Title>{currentFilter ? '필터 편집' : '새 필터 추가'}</Modal.Title></Modal.Header>
          <Modal.Body>
              <Form.Group className="mb-3"><Form.Label>필터 이름</Form.Label><Form.Control type="text" value={filterForm.name} onChange={(e) => setFilterForm({...filterForm, name: e.target.value})} /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>이미지</Form.Label><Form.Control type="file" accept="image/*" onChange={(e) => handleFileChange(e, setFilterForm)} />{imagePreview && <Image src={imagePreview} className="mt-2" fluid thumbnail />}</Form.Group>
          </Modal.Body>
          <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowFilterModal(false)}>취소</Button>
              <Button variant="primary" onClick={handleAddEditFilter}>{currentFilter ? '저장' : '추가'}</Button>
          </Modal.Footer>
      </Modal>

      <Modal show={showToolBundleModal} onHide={() => setShowToolBundleModal(false)} centered size="lg">
          <Modal.Header closeButton><Modal.Title>{currentToolBundle ? '수업 세트 편집' : '새 수업 세트 추가'}</Modal.Title></Modal.Header>
          <Modal.Body>
              <Form.Group className="mb-3"><Form.Label>세트 이름</Form.Label><Form.Control type="text" value={toolBundleForm.name} onChange={(e) => setToolBundleForm({...toolBundleForm, name: e.target.value})} /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>설명</Form.Label><Form.Control as="textarea" value={toolBundleForm.description} onChange={(e) => setToolBundleForm({...toolBundleForm, description: e.target.value})} /></Form.Group>
              <Row>
                  <Col md={6}><Form.Group><Form.Label>포함할 AAC 묶음 (다중 선택 가능)</Form.Label><ListGroup style={{maxHeight: '200px', overflowY: 'auto'}}>{aacSets.map(set => (<ListGroup.Item key={set.id} action active={toolBundleForm.aacSetIds.includes(set.id)} onClick={() => { setToolBundleForm(prev => ({...prev, aacSetIds: prev.aacSetIds.includes(set.id) ? prev.aacSetIds.filter(id => id !== set.id) : [...prev.aacSetIds, set.id]})) }}>{set.name}</ListGroup.Item>))}</ListGroup></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label>포함할 필터 (다중 선택 가능)</Form.Label><ListGroup style={{maxHeight: '200px', overflowY: 'auto'}}>{filters.map(filter => (<ListGroup.Item key={filter.id} action active={toolBundleForm.filterIds.includes(filter.id)} onClick={() => { setToolBundleForm(prev => ({...prev, filterIds: prev.filterIds.includes(filter.id) ? prev.filterIds.filter(id => id !== filter.id) : [...prev.filterIds, filter.id]})) }}>{filter.name}</ListGroup.Item>))}</ListGroup></Form.Group></Col>
              </Row>
          </Modal.Body>
          <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowToolBundleModal(false)}>취소</Button>
              <Button variant="primary" onClick={handleAddEditToolBundle}>{currentToolBundle ? '저장' : '추가'}</Button>
          </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default TherapistToolsPage;
