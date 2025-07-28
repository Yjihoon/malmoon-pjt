import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, ListGroup, Modal, Form, Image, Badge, Tabs, Tab } from 'react-bootstrap';
import { useAuth } from '../../../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import './TherapistToolsPage.css'; // 페이지 전용 스타일 임포트

function TherapistToolsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allIndividualTools, setAllIndividualTools] = useState([]); // 모든 개별 도구 데이터 (AAC, Filter)
  const [allToolSets, setAllToolSets] = useState([]); // 모든 도구 묶음 (세트) 데이터

  // 모달 관련 상태
  const [showAddToolModal, setShowAddToolModal] = useState(false);
  const [showAddToolSetModal, setShowAddToolSetModal] = useState(false);
  const [currentTool, setCurrentTool] = useState(null); // 편집할 도구
  const [currentToolSet, setCurrentToolSet] = useState(null); // 편집할 도구 묶음

  // 새 도구/묶음 폼 상태
  const [newToolForm, setNewToolForm] = useState({
    type: 'AAC', // 'AAC' or 'Filter'
    name: '',
    description: '',
    category: '',
    imageUrl: '',
  });
  const [newToolSetForm, setNewToolSetForm] = useState({
    name: '',
    description: '',
    toolIds: [],
  });

  useEffect(() => {
    const fetchTools = async () => {
      setLoading(true);
      setError('');
      try {
        if (user && user.userType === 'therapist') {
          // 더미 개별 도구 데이터
          const dummyIndividualTools = [
            { id: 'aac1', type: 'AAC', name: '그림카드', description: '다양한 사물, 동물 그림 카드', category: '어휘', lastModified: '2025-07-20', imageUrl: 'https://placehold.co/100x100?text=AAC_Card1' },
            { id: 'aac2', type: 'AAC', name: '문장 구성 보드', description: '주어-동사-목적어 연습 보드', category: '문법', lastModified: '2025-07-18', imageUrl: 'https://placehold.co/100x100?text=AAC_Board' },
            { id: 'aac3', type: 'AAC', name: '단어 확장 게임', description: '유사어/반의어 연결 게임', category: '어휘', lastModified: '2025-07-23', imageUrl: 'https://placehold.co/100x100?text=AAC_Game' },
            { id: 'aac1', type: 'AACset', name: '그림카드 세트 A', description: '다양한 사물, 동물 그림 카드 (50장)', category: '어휘', lastModified: '2025-07-20', imageUrl: 'https://placehold.co/100x100?text=AAC_Card1' },
            { id: 'aac2', type: 'AACset', name: '문장 구성 보드', description: '주어-동사-목적어 연습 보드', category: '문법', lastModified: '2025-07-18', imageUrl: 'https://placehold.co/100x100?text=AAC_Board' },
            { id: 'aac3', type: 'AACset', name: '단어 확장 게임', description: '유사어/반의어 연결 게임', category: '어휘', lastModified: '2025-07-23', imageUrl: 'https://placehold.co/100x100?text=AAC_Game' },
            { id: 'filter1', type: 'Filter', name: '강아지 귀 필터', description: '화상 캠에 강아지 귀를 추가합니다.', category: '동물', lastModified: '2025-07-22', imageUrl: 'https://placehold.co/100x100?text=Filter_Dog' },
            { id: 'filter2', type: 'Filter', name: '왕관 필터', description: '화상 캠에 반짝이는 왕관을 추가합니다.', category: '액세서리', lastModified: '2025-07-21', imageUrl: 'https://placehold.co/100x100?text=Filter_Crown' },
            { id: 'filter3', type: 'Filter', name: '안경 필터', description: '다양한 디자인의 안경을 씌웁니다.', category: '의상', lastModified: '2025-07-24', imageUrl: 'https://placehold.co/100x100?text=Filter_Glasses' },
          ];
          setAllIndividualTools(dummyIndividualTools);

          // 더미 도구 묶음(세트) 데이터
          const dummyToolSets = [
            { id: 'set1', name: '초기 언어 발달 세션용', description: '그림카드와 문장 보드를 활용한 기초 세션', lastModified: '2025-07-25', toolIds: ['aac1', 'aac2', 'filter1'] },
            { id: 'set2', name: '사회성 기술 훈련용', description: '감정 표현 AAC와 상황 필터', lastModified: '2025-07-24', toolIds: ['aac3', 'filter2', 'filter3'] },
          ];
          setAllToolSets(dummyToolSets);

        } else {
          setError('치료사 계정으로 로그인해야 수업 도구를 관리할 수 있습니다.');
        }
      } catch (err) {
        setError('도구 정보를 불러오는 데 실패했습니다.');
        console.error('도구 불러오기 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, [user]);

  // 개별 도구 추가/편집 핸들러
  const handleAddEditTool = () => {
    if (currentTool) {
      // 편집
      setAllIndividualTools(prev => prev.map(tool => tool.id === currentTool.id ? { ...newToolForm, id: currentTool.id, lastModified: new Date().toISOString().slice(0, 10) } : tool));
    } else {
      // 추가
      setAllIndividualTools(prev => [...prev, { ...newToolForm, id: uuidv4(), lastModified: new Date().toISOString().slice(0, 10) }]);
    }
    setShowAddToolModal(false);
    setNewToolForm({
      type: 'AAC',
      name: '',
      description: '',
      category: '',
      imageUrl: '',
    });
    setCurrentTool(null);
  };

  // 개별 도구 삭제 핸들러
  const handleDeleteTool = (toolId) => {
    if (window.confirm('정말로 이 도구를 삭제하시겠습니까?')) {
      setAllIndividualTools(prev => prev.filter(tool => tool.id !== toolId));
      // 이 도구를 포함하는 도구 묶음에서도 제거
      setAllToolSets(prevSets => prevSets.map(set => ({ ...set, toolIds: set.toolIds.filter(id => id !== toolId) })));
    }
  };

  // 도구 묶음 추가/편집 핸들러
  const handleAddEditToolSet = () => {
    if (currentToolSet) {
      // 편집
      setAllToolSets(prev => prev.map(set => set.id === currentToolSet.id ? { ...newToolSetForm, id: currentToolSet.id, lastModified: new Date().toISOString().slice(0, 10) } : set));
    } else {
      // 추가
      setAllToolSets(prev => [...prev, { ...newToolSetForm, id: uuidv4(), lastModified: new Date().toISOString().slice(0, 10) }]);
    }
    setShowAddToolSetModal(false);
    setNewToolSetForm({
      name: '',
      description: '',
      toolIds: [],
    });
    setCurrentToolSet(null);
  };

  // 도구 묶음 삭제 핸들러
  const handleDeleteToolSet = (toolSetId) => {
    if (window.confirm('정말로 이 도구 묶음을 삭제하시겠습니까?')) {
      setAllToolSets(prev => prev.filter(set => set.id !== toolSetId));
    }
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <p>도구 정보를 불러오는 중입니다...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5 text-center">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!user || user.userType !== 'therapist') {
    return (
      <Container className="my-5 text-center">
        <Alert variant="warning">치료사만 접근할 수 있는 페이지입니다.</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5 main-container tools-management-section">
      <h2 className="text-center mb-4">수업 도구 관리</h2>

      
      
      <Tabs defaultActiveKey="aacTools" id="uncontrolled-tab-example" className="mb-3">
        <Tab eventKey="aacTools" title="AAC 도구">
          <Card className="shadow-sm p-3 mb-3 card-base">
            <Card.Body>
              <Card.Title className="mb-3">AAC 도구 목록</Card.Title>
              <Button className="btn-soft-primary mb-3" onClick={() => { setCurrentTool(null); setNewToolForm({ type: 'AAC', name: '', description: '', category: '', imageUrl: '' }); setShowAddToolModal(true); }}>새 AAC 도구 추가</Button>
              <ListGroup>
                {allIndividualTools.filter(tool => tool.type === 'AAC').length === 0 ? (
                  <ListGroup.Item className="text-muted">등록된 AAC 도구가 없습니다.</ListGroup.Item>
                ) : (
                  allIndividualTools.filter(tool => tool.type === 'AAC').map(tool => (
                  <Card key={tool.id} className="shadow-sm card-base mb-3">
                    <Card.Body>
                      <Row className="align-items-center">
                        <Col xs={8} className="d-flex align-items-center">
                          {tool.imageUrl && <Image src={tool.imageUrl} alt={tool.name} fluid roundedCircle style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }} />}
                          <div>
                            <h5>{tool.name}</h5>
                            <p className="mb-0 text-muted">{tool.description} ({tool.category})</p>
                          </div>
                        </Col>
                        <Col xs={4} className="text-end">
                          <Button variant="btn-soft-secondary" size="sm" className="me-2" onClick={() => { setCurrentTool(tool); setNewToolForm(tool); setShowAddToolModal(true); }}>편집</Button>
                          <Button variant="btn-soft-danger" size="sm" onClick={() => handleDeleteTool(tool.id)}>삭제</Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                  ))
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="aacsetTools" title="AAC 묶음">
          <Card className="shadow-sm p-3 mb-3 card-base">
            <Card.Body>
              <Card.Title className="mb-3">AAC 묶음 목록</Card.Title>
              <Button className="btn-soft-primary mb-3" onClick={() => { setCurrentTool(null); setNewToolForm({ type: 'AACset', name: '', description: '', category: '', imageUrl: '' }); setShowAddToolModal(true); }}>새 AAC 묶음 추가</Button>
              <ListGroup>
                {allIndividualTools.filter(tool => tool.type === 'AACset').length === 0 ? (
                  <ListGroup.Item className="text-muted">등록된 AAC 도구가 없습니다.</ListGroup.Item>
                ) : (
                  allIndividualTools.filter(tool => tool.type === 'AACset').map(tool => (
                  <Card key={tool.id} className="shadow-sm card-base mb-3">
                    <Card.Body>
                      <Row className="align-items-center">
                        <Col xs={8} className="d-flex align-items-center">
                          {tool.imageUrl && <Image src={tool.imageUrl} alt={tool.name} fluid roundedCircle style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }} />}
                          <div>
                            <h5>{tool.name}</h5>
                            <p className="mb-0 text-muted">{tool.description} ({tool.category})</p>
                          </div>
                        </Col>
                        <Col xs={4} className="text-end">
                          <Button variant="btn-soft-secondary" size="sm" className="me-2" onClick={() => { setCurrentTool(tool); setNewToolForm(tool); setShowAddToolModal(true); }}>편집</Button>
                          <Button variant="btn-soft-danger" size="sm" onClick={() => handleDeleteTool(tool.id)}>삭제</Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                  ))
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="filterTools" title="필터 도구">
          <Card className="shadow-sm p-3 mb-3 card-base">
            <Card.Body>
              <Card.Title className="mb-3">필터 도구 목록</Card.Title>
              <Button className="btn-soft-primary mb-3" onClick={() => { setCurrentTool(null); setNewToolForm({ type: 'Filter', name: '', description: '', category: '', imageUrl: '' }); setShowAddToolModal(true); }}>새 필터 도구 추가</Button>
              <ListGroup>
                {allIndividualTools.filter(tool => tool.type === 'Filter').length === 0 ? (
                  <ListGroup.Item className="text-muted">등록된 필터 도구가 없습니다.</ListGroup.Item>
                ) : (
                  allIndividualTools.filter(tool => tool.type === 'Filter').map(tool => (
                  <Card key={tool.id} className="shadow-sm card-base mb-3">
                    <Card.Body>
                      <Row className="align-items-center">
                        <Col xs={8} className="d-flex align-items-center">
                          {tool.imageUrl && <Image src={tool.imageUrl} alt={tool.name} fluid roundedCircle style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }} />}
                          <div>
                            <h5>{tool.name}</h5>
                            <p className="mb-0 text-muted">{tool.description} ({tool.category})</p>
                          </div>
                        </Col>
                        <Col xs={4} className="text-end">
                          <Button variant="btn-soft-secondary" size="sm" className="me-2" onClick={() => { setCurrentTool(tool); setNewToolForm(tool); setShowAddToolModal(true); }}>편집</Button>
                          <Button variant="btn-soft-danger" size="sm" onClick={() => handleDeleteTool(tool.id)}>삭제</Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                  ))
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="toolSets" title="도구 묶음">
          <Card className="shadow-sm p-3 mb-3 card-base">
            <Card.Body>
              <Card.Title className="mb-3">도구 묶음 목록</Card.Title>
              <Button className="btn-soft-primary mb-3" onClick={() => { setCurrentToolSet(null); setNewToolSetForm({ name: '', description: '', toolIds: [] }); setShowAddToolSetModal(true); }}>새 도구 묶음 추가</Button>
              <ListGroup>
                {allToolSets.length === 0 ? (
                  <ListGroup.Item className="text-muted">등록된 도구 묶음이 없습니다.</ListGroup.Item>
                ) : (
                  allToolSets.map(toolSet => (
                    <Card key={toolSet.id} className="shadow-sm card-base mb-3">
                    <Card.Body>
                      <Row className="align-items-center">
                        <Col xs={8}>
                          <h5>{toolSet.name}</h5>
                          <p className="mb-1 text-muted">{toolSet.description}</p>
                          <div>
                            {toolSet.toolIds.map(toolId => {
                              const tool = allIndividualTools.find(t => t.id === toolId);
                              return tool ? <Badge key={toolId} bg={tool.type === 'AAC' ? 'info' : 'success'} className="me-1">{tool.name}</Badge> : null;
                            })}
                          </div>
                        </Col>
                        <Col xs={4} className="text-end">
                          <Button variant="btn-soft-secondary" size="sm" className="me-2" onClick={() => { setCurrentToolSet(toolSet); setNewToolSetForm(toolSet); setShowAddToolSetModal(true); }}>편집</Button>
                          <Button variant="btn-soft-danger" size="sm" onClick={() => handleDeleteToolSet(toolSet.id)}>삭제</Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                  ))
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* 개별 도구 추가/편집 모달 */}
      <Modal show={showAddToolModal} onHide={() => setShowAddToolModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{currentTool ? '도구 편집' : '새 도구 추가'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>도구 유형</Form.Label>
              <Form.Select name="type" value={newToolForm.type} onChange={(e) => setNewToolForm({ ...newToolForm, type: e.target.value })}>
                <option value="AAC">AAC</option>
                <option value="Filter">필터</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>이름</Form.Label>
              <Form.Control type="text" name="name" value={newToolForm.name} onChange={(e) => setNewToolForm({ ...newToolForm, name: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>설명</Form.Label>
              <Form.Control as="textarea" name="description" value={newToolForm.description} onChange={(e) => setNewToolForm({ ...newToolForm, description: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>카테고리</Form.Label>
              <Form.Control type="text" name="category" value={newToolForm.category} onChange={(e) => setNewToolForm({ ...newToolForm, category: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>이미지 URL</Form.Label>
              <Form.Control type="text" name="imageUrl" value={newToolForm.imageUrl} onChange={(e) => setNewToolForm({ ...newToolForm, imageUrl: e.target.value })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddToolModal(false)}>취소</Button>
          <Button variant="primary" onClick={handleAddEditTool}>{currentTool ? '저장' : '추가'}</Button>
        </Modal.Footer>
      </Modal>

      {/* 도구 묶음 추가/편집 모달 */}
      <Modal show={showAddToolSetModal} onHide={() => setShowAddToolSetModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{currentToolSet ? '도구 묶음 편집' : '새 도구 묶음 추가'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>묶음 이름</Form.Label>
              <Form.Control type="text" name="name" value={newToolSetForm.name} onChange={(e) => setNewToolSetForm({ ...newToolSetForm, name: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>설명</Form.Label>
              <Form.Control as="textarea" name="description" value={newToolSetForm.description} onChange={(e) => setNewToolSetForm({ ...newToolSetForm, description: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>포함할 개별 도구</Form.Label>
              <ListGroup style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {allIndividualTools.map(tool => (
                  <ListGroup.Item key={tool.id} action onClick={() => {
                    setNewToolSetForm(prev => ({
                      ...prev,
                      toolIds: prev.toolIds.includes(tool.id)
                        ? prev.toolIds.filter(id => id !== tool.id)
                        : [...prev.toolIds, tool.id]
                    }));
                  }} active={newToolSetForm.toolIds.includes(tool.id)}>
                    {tool.name} ({tool.type})
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddToolSetModal(false)}>취소</Button>
          <Button variant="primary" onClick={handleAddEditToolSet}>{currentToolSet ? '저장' : '추가'}</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default TherapistToolsPage;