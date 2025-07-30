import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Alert, ListGroup, Modal, Form, Image, Badge, Tabs, Tab, InputGroup, Pagination, Spinner, Accordion } from 'react-bootstrap';
// import { useAuth } from '../../../contexts/AuthContext'; // 실제 환경에서는 이 주석을 해제하세요.
import { v4 as uuidv4 } from 'uuid';
// import './TherapistToolsPage.css'; // 실제 환경에서는 이 주석을 해제하세요.

// --- Mock Data and Services ---
// Mock authentication hook to simulate a logged-in therapist
const useAuth = () => ({ user: { userType: 'therapist', id: 'therapist123' } });

// --- Helper & Child Components ---

/**
 * **[수정됨]** AAC 아이템 목록 컴포넌트
 * 아코디언이 한 번에 하나만 열리도록 수정
 * @param {object[]} AAC_items - Array of AAC_item objects.
 * @param {function} onEdit - Function to handle editing an item.
 * @param {function} onDelete - Function to handle deleting an item.
 */
const AacItemList = ({ AAC_items, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSituation, setSelectedSituation] = useState(null);
    const [selectedAction, setSelectedAction] = useState(null);
    const [activeKey, setActiveKey] = useState('0'); // 아코디언의 활성 키를 상태로 관리
    const itemsPerPage = 12;

    // 상황과 행동에 대한 계층적 데이터 구조 생성
    const categories = useMemo(() => {
        const initialCategories = AAC_items.reduce((acc, item) => {
            const { situation, action } = item;
            if (!acc[situation]) {
                acc[situation] = new Set();
            }
            if (action) {
                acc[situation].add(action);
            }
            return acc;
        }, {});
        // 상황(대분류)을 가나다순으로 정렬
        return Object.keys(initialCategories).sort().reduce(
            (obj, key) => { 
                // 행동(소분류)도 가나다순으로 정렬
                obj[key] = Array.from(initialCategories[key]).sort();
                return obj;
            }, {}
        );
    }, [AAC_items]);
    
    // 컴포넌트 마운트 시 첫 번째 카테고리를 기본으로 선택
    useEffect(() => {
        const firstSituation = Object.keys(categories)[0];
        if(firstSituation) {
            setSelectedSituation(firstSituation);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categories]);


    const filteredItems = useMemo(() => {
        return AAC_items.filter(item => {
            const matchesSituation = !selectedSituation || item.situation === selectedSituation;
            const matchesAction = !selectedAction || item.action === selectedAction;
            const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSituation && matchesAction && matchesSearch;
        });
    }, [AAC_items, searchTerm, selectedSituation, selectedAction]);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // 아코디언 아이템(상황) 선택 핸들러
    const handleAccordionSelect = (eventKey) => {
        setActiveKey(eventKey); // 현재 열린 아코디언 키 업데이트
        if (eventKey !== null) {
            const situation = Object.keys(categories)[parseInt(eventKey, 10)];
            setSelectedSituation(situation);
        } else {
            setSelectedSituation(null);
        }
        setSelectedAction(null); // 상황 변경 시 행동 선택 초기화
        setCurrentPage(1);
    };
    
    // 행동 선택 핸들러
    const handleActionSelect = (action) => {
        setSelectedAction(action);
        setCurrentPage(1);
    };

    // 카테고리 필터 초기화
    const clearCategory = () => {
        setActiveKey(null); // 모든 아코디언 닫기
        setSelectedSituation(null);
        setSelectedAction(null);
        setCurrentPage(1);
    }

    return (
        <Row>
            {/* 좌측 카테고리 메뉴 */}
            <Col md={3}>
                <h5 className="mb-3">카테고리</h5>
                <Button variant="outline-secondary" size="sm" className="w-100 mb-2" onClick={clearCategory}>
                    전체 보기
                </Button>
                {/* **[수정]** alwaysOpen 속성을 제거하고 onSelect 핸들러를 사용 */}
                <Accordion activeKey={activeKey} onSelect={handleAccordionSelect}>
                    {Object.keys(categories).map((situation, index) => (
                        <Accordion.Item eventKey={index.toString()} key={situation}>
                            <Accordion.Header>
                                {situation}
                            </Accordion.Header>
                            <Accordion.Body>
                                <ListGroup variant="flush">
                                    {categories[situation].map(action => (
                                        <ListGroup.Item 
                                            key={action} 
                                            action 
                                            active={selectedSituation === situation && selectedAction === action}
                                            onClick={() => handleActionSelect(action)}
                                        >
                                            {action}
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </Col>

            {/* 우측 아이템 그리드 */}
            <Col md={9}>
                <InputGroup className="mb-3">
                    <Form.Control
                        placeholder="현재 카테고리 내에서 이름으로 검색..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
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
                        <small className="text-muted">선택한 카테고리나 검색어와 일치하는 아이템이 없습니다.</small>
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


/**
 * Component to select AAC_item for an ACC_set with advanced filtering.
 */
const AacItemSelector = ({ AAC_items, selectedItemIds, onToggleItem }) => {
    const [searchCategory, setSearchCategory] = useState('name');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) {
            return AAC_items;
        }
        return AAC_items.filter(item => {
            const itemValue = item[searchCategory] ? item[searchCategory].toLowerCase() : '';
            return itemValue.includes(searchTerm.toLowerCase());
        });
    }, [AAC_items, searchTerm, searchCategory]);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

            {currentItems.length > 0 ? (
                <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '15px' }}>
                    <Row xs={1} sm={2} md={4} lg={5} className="g-3">
                        {currentItems.map(item => (
                            <Col key={item.id}>
                                <Card className={`h-100 text-center ${selectedItemIds.includes(item.id) ? 'border-primary' : ''}`} onClick={() => onToggleItem(item.id)} style={{ cursor: 'pointer' }}>
                                    <Card.Img variant="top" src={item.file_id || 'https://placehold.co/150x100?text=No+Image'} style={{ height: '100px', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x100?text=Error'; }} />
                                    <Card.Body className="p-2"><Card.Text style={{ fontSize: '0.8rem' }}>{item.name}</Card.Text></Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
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


// --- Main Page Component ---
function TherapistToolsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Data States aligned with ERD
    const [AAC_items, setAacItems] = useState([]);
    const [ACC_sets, setAccSets] = useState([]);
    const [Filters, setFilters] = useState([]);
    const [tool_bundles, setToolBundles] = useState([]);

    // Modal Visibility States
    const [showAacItemModal, setShowAacItemModal] = useState(false);
    const [showAccSetModal, setShowAccSetModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showToolBundleModal, setShowToolBundleModal] = useState(false);

    // Form and Editing States
    const [currentAacItem, setCurrentAacItem] = useState(null);
    const [currentAccSet, setCurrentAccSet] = useState(null);
    const [currentFilter, setCurrentFilter] = useState(null);
    const [currentToolBundle, setCurrentToolBundle] = useState(null);
    const [aacCreationMethod, setAacCreationMethod] = useState('direct');
    
    // Form data states
    const [aacItemForm, setAacItemForm] = useState({ name: '', description: '', situation: '', action: '', emotion: '', file_id: '', status: 'public' });
    const [accSetForm, setAccSetForm] = useState({ name: '', description: '', aac_item_ids: [] });
    const [filterForm, setFilterForm] = useState({ name: '', file_id: '' });
    const [toolBundleForm, setToolBundleForm] = useState({ name: '', description: '', AAC_set_id: [], filter_id: [] });
    
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
                    // **[수정]** 카테고리 테스트를 위해 Mock 데이터 다양화
                    const situations = ['학교', '집', '공원', '병원'];
                    const actions = {
                        '학교': ['공부하기', '밥먹기', '운동하기', '친구와 놀기'],
                        '집': ['쉬기', '숙제하기', '간식먹기', 'TV보기'],
                        '공원': ['산책하기', '자전거타기', '그네타기'],
                        '병원': ['진료받기', '주사맞기', '기다리기']
                    };
                    const emotions = ['기쁨', '슬픔', '화남', '놀람', '평온'];
                    
                    const dummyAacItems = Array.from({ length: 40 }, (_, i) => {
                        const sit = situations[i % situations.length];
                        const act = actions[sit][i % actions[sit].length];
                        return {
                            id: `item${i + 1}`,
                            name: `${sit}에서 ${act}`,
                            situation: sit,
                            action: act,
                            emotion: emotions[i % emotions.length],
                            description: `${sit} 상황에서 ${act}를 표현하는 AAC 아이템입니다.`,
                            file_id: `https://placehold.co/150x150?text=${encodeURIComponent(act)}`,
                            therapist_id: 'therapist123',
                            created_at: new Date().toISOString(),
                            status: 'public'
                        };
                    });
                    setAacItems(dummyAacItems);
                    
                    const dummyFilters = Array.from({ length: 8 }, (_, i) => ({ 
                        id: `filter${i + 1}`,
                        therapist_id: 'therapist123',
                        name: `꾸미기 필터 ${i + 1}`,
                        created_at: new Date().toISOString(),
                        file_id: `https://placehold.co/150x150?text=Filter${i + 1}`
                    }));
                    setFilters(dummyFilters);
                    
                    const dummyAccSets = [
                        { ACC_set_id: 'set1', name: '학교 생활 묶음', therapist_id: 'therapist123', created_at: new Date().toISOString(), description: '학교에서의 다양한 활동', aac_item_ids: ['item1', 'item2', 'item3', 'item5', 'item9'] }, 
                        { ACC_set_id: 'set2', name: '집에서 묶음', therapist_id: 'therapist123', created_at: new Date().toISOString(), description: '집에서의 일상', aac_item_ids: ['item6', 'item7', 'item10'] }
                    ];
                    setAccSets(dummyAccSets);

                    const dummyToolBundles = [
                        { id: 'bundle1', filter_id: ['filter1'], AAC_set_id: ['set1'], created_at: new Date().toISOString(), name: '즐거운 학교 세트', description: '학교 묶음과 기본 필터 사용' }, 
                        { id: 'bundle2', filter_id: ['filter2', 'filter3'], AAC_set_id: ['set2'], created_at: new Date().toISOString(), name: '편안한 우리집 세트', description: '집 묶음과 여러 필터 사용' }
                    ];
                    setToolBundles(dummyToolBundles);
                } else { setError('치료사 계정으로만 접근 가능합니다.'); }
            } catch (e) { setError('데이터 로딩 중 오류가 발생했습니다.'); } finally { setLoading(false); }
        };
        fetchMockData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ... (이하 핸들러 함수들은 기존과 동일하게 유지)

    const handleFileChange = (e, formSetter) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            formSetter(prev => ({ ...prev, imageFile: file, file_id: previewUrl }));
        }
    };

    const openModal = (type, data = null) => {
        setImagePreview('');
        setAiGeneratedImage(null);
        setAiPrompt('');
        switch (type) {
            case 'AAC_item':
                setCurrentAacItem(data);
                setAacCreationMethod('direct');
                const itemData = data || { name: '', description: '', situation: '', action: '', emotion: '', file_id: '', status: 'public' };
                setAacItemForm(itemData);
                if (data && data.file_id) setImagePreview(data.file_id);
                setShowAacItemModal(true);
                break;
            case 'ACC_set':
                setCurrentAccSet(data);
                setAccSetForm(data || { name: '', description: '', aac_item_ids: [] });
                setShowAccSetModal(true);
                break;
            case 'Filter':
                setCurrentFilter(data);
                const filterData = data || { name: '', file_id: '' };
                setFilterForm(filterData);
                if (data && data.file_id) setImagePreview(data.file_id);
                setShowFilterModal(true);
                break;
            case 'tool_bundle':
                setCurrentToolBundle(data);
                setToolBundleForm(data || { name: '', description: '', AAC_set_id: [], filter_id: [] });
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

        setTimeout(() => {
            const mockImageUrl = `https://placehold.co/400x300?text=${encodeURIComponent(aiPrompt)}`;
            setAiGeneratedImage(mockImageUrl);
            setAacItemForm({
                name: `${aiPrompt} (AI 생성)`,
                description: `'${aiPrompt}' 프롬프트를 기반으로 생성된 이미지입니다.`,
                situation: 'AI 추천',
                action: 'AI 추천',
                emotion: '',
                file_id: mockImageUrl,
                status: 'public',
            });
            setIsGenerating(false);
        }, 2000);
    };

    const validateAndRun = (fields, onValid) => {
        for(const [key, value] of Object.entries(fields)) {
            if(!value) {
                alert(`필수 항목 '${key}'을(를) 모두 입력해주세요.`);
                return;
            }
        }
        onValid();
    }

    const handleAddEditAacItem = () => {
        const { name, description, situation, action } = aacItemForm;
        validateAndRun({ name, description, situation, action }, () => {
            const finalForm = { ...aacItemForm, therapist_id: user.id, created_at: new Date().toISOString() };
            delete finalForm.imageFile;
            if (currentAacItem) {
                setAacItems(prev => prev.map(t => t.id === currentAacItem.id ? {...finalForm, id: currentAacItem.id} : t));
            } else {
                setAacItems(prev => [...prev, { ...finalForm, id: uuidv4() }]);
            }
            setShowAacItemModal(false);
        });
    };

    const handleDeleteAacItem = (itemId) => {
        if (window.confirm('정말로 이 AAC 아이템을 삭제하시겠습니까?')) {
            setAacItems(prev => prev.filter(t => t.id !== itemId));
            setAccSets(prev => prev.map(s => ({ ...s, aac_item_ids: s.aac_item_ids.filter(id => id !== itemId) })));
        }
    };

    const handleAddEditAccSet = () => {
        const { name, description, aac_item_ids } = accSetForm;
        if (aac_item_ids.length === 0) {
            alert('하나 이상의 AAC 아이템을 포함해야 합니다.');
            return;
        }
        validateAndRun({ name, description }, () => {
            const finalForm = { ...accSetForm, therapist_id: user.id, created_at: new Date().toISOString() };
            if (currentAccSet) {
                setAccSets(prev => prev.map(s => s.ACC_set_id === currentAccSet.ACC_set_id ? {...finalForm, ACC_set_id: currentAccSet.ACC_set_id } : s));
            } else {
                setAccSets(prev => [...prev, { ...finalForm, ACC_set_id: uuidv4() }]);
            }
            setShowAccSetModal(false);
        });
    };

    const handleDeleteAccSet = (setId) => {
        if(window.confirm('정말로 이 AAC 묶음을 삭제하시겠습니까?')) {
            setAccSets(prev => prev.filter(s => s.ACC_set_id !== setId));
            setToolBundles(prev => prev.map(b => ({...b, AAC_set_id: b.AAC_set_id.filter(id => id !== setId)})))
        }
    };

    const handleAddEditFilter = () => {
        const { name, file_id } = filterForm;
        validateAndRun({ name, file_id }, () => {
            const finalForm = { ...filterForm, therapist_id: user.id, created_at: new Date().toISOString() };
            delete finalForm.imageFile;
            if (currentFilter) {
                setFilters(prev => prev.map(f => f.id === currentFilter.id ? {...finalForm, id: currentFilter.id} : f));
            } else {
                setFilters(prev => [...prev, { ...finalForm, id: uuidv4() }]);
            }
            setShowFilterModal(false);
        });
    };

    const handleDeleteFilter = (filterId) => {
        if(window.confirm('정말로 이 필터를 삭제하시겠습니까?')) {
            setFilters(prev => prev.filter(f => f.id !== filterId));
            setToolBundles(prev => prev.map(b => ({...b, filter_id: b.filter_id.filter(id => id !== filterId)})))
        }
    };

    const handleAddEditToolBundle = () => {
        const { name, description, AAC_set_id, filter_id } = toolBundleForm;
        if (AAC_set_id.length === 0 && filter_id.length === 0) {
            alert('하나 이상의 AAC 묶음 또는 필터를 포함해야 합니다.');
            return;
        }
        validateAndRun({ name, description }, () => {
            const finalForm = { ...toolBundleForm, created_at: new Date().toISOString() };
            if (currentToolBundle) {
                setToolBundles(prev => prev.map(b => b.id === currentToolBundle.id ? {...finalForm, id: currentToolBundle.id} : b));
            } else {
                setToolBundles(prev => [...prev, { ...finalForm, id: uuidv4() }]);
            }
            setShowToolBundleModal(false);
        });
    };

    const handleDeleteToolBundle = (bundleId) => {
        if(window.confirm('정말로 이 수업 세트를 삭제하시겠습니까?')) {
            setToolBundles(prev => prev.filter(b => b.id !== bundleId));
        }
    };

    if (loading) return <Container className="my-5 text-center"><Spinner animation="border" /> <p>로딩 중...</p></Container>;
    if (error) return <Container className="my-5 text-center"><Alert variant="danger">{error}</Alert></Container>;

    return (
    <Container fluid className="my-5 px-4"> {/* fluid와 px-4로 너비 확장 */}
        <h2 className="text-center mb-4">수업 도구 관리</h2>
        <Tabs defaultActiveKey="AAC_item" id="therapist-tools-tabs" className="mb-3" justify>
            <Tab eventKey="AAC_item" title="AAC 아이템 관리">
                <Card className="p-3"><Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <Card.Title className="mb-0">AAC 아이템 목록</Card.Title>
                      <Button variant="primary" onClick={() => openModal('AAC_item')}>
                          <i className="bi bi-plus-circle me-2"></i>새 AAC 아이템 추가
                      </Button>
                    </div>
                    <hr />
                    {/* **[수정]** 새로운 AacItemList 컴포넌트 사용 */}
                    <AacItemList AAC_items={AAC_items} onEdit={(item) => openModal('AAC_item', item)} onDelete={handleDeleteAacItem} />
                </Card.Body></Card>
            </Tab>
            
            <Tab eventKey="ACC_set" title="AAC 묶음 관리">
                    <Card className="p-3"><Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <Card.Title className="mb-0">AAC 묶음 목록</Card.Title>
                          <Button variant="primary" onClick={() => openModal('ACC_set')}>
                              <i className="bi bi-plus-circle me-2"></i>새 AAC 묶음 추가
                          </Button>
                        </div>
                        <ListGroup>{ACC_sets.map(set => (
                            <ListGroup.Item key={set.ACC_set_id}><div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <h5>{set.name}</h5><p className="text-muted mb-2">{set.description}</p>
                                    <div>
                                        {set.aac_item_ids.slice(0, 5).map(itemId => { const item = AAC_items.find(t => t.id === itemId); return item ? <Badge pill bg="info" className="me-1" key={itemId}>{item.name}</Badge> : null; })}
                                        {set.aac_item_ids.length > 5 && <Badge pill bg="secondary">+{set.aac_item_ids.length - 5}개 더</Badge>}
                                    </div>
                                </div>
                                <div className="ms-3">
                                    <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => openModal('ACC_set', set)}>편집</Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteAccSet(set.ACC_set_id)}>삭제</Button>
                                </div>
                            </div></ListGroup.Item>
                        ))}</ListGroup>
                    </Card.Body></Card>
            </Tab>

            <Tab eventKey="Filter" title="필터 관리">
                <Card className="p-3"><Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <Card.Title className="mb-0">필터 목록</Card.Title>
                      <Button variant="primary" onClick={() => openModal('Filter')}>
                          <i className="bi bi-plus-circle me-2"></i>새 필터 추가
                      </Button>
                    </div>
                    {/* **[수정]** 필터 목록을 그리드 레이아웃으로 변경 */}
                    {Filters.length > 0 ? (
                        <Row xs={2} sm={3} md={4} lg={6} className="g-3">
                            {Filters.map(filter => (
                                <Col key={filter.id}>
                                    <Card className="h-100">
                                        <Card.Img variant="top" src={filter.file_id || 'https://placehold.co/150x150?text=No+Img'} style={{ height: '120px', objectFit: 'cover' }} />
                                        <Card.Body className="p-2 text-center">
                                            <Card.Title as="h6" style={{fontSize: '0.9rem'}}>{filter.name}</Card.Title>
                                            <div className="mt-2">
                                                <Button variant="outline-secondary" size="sm" className="me-1" onClick={() => openModal('Filter', filter)}>편집</Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteFilter(filter.id)}>삭제</Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <p className="text-muted text-center">생성된 필터가 없습니다.</p>
                    )}
                </Card.Body></Card>
            </Tab>

            <Tab eventKey="tool_bundle" title="수업 세트 관리">
                <Card className="p-3"><Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <Card.Title className="mb-0">수업 세트 목록</Card.Title>
                      <Button variant="primary" onClick={() => openModal('tool_bundle')}>
                          <i className="bi bi-plus-circle me-2"></i>새 수업 세트 추가
                      </Button>
                    </div>
                    <ListGroup>{tool_bundles.map(bundle => (
                        <ListGroup.Item key={bundle.id}><div className="d-flex justify-content-between align-items-start">
                            <div>
                                <h5>{bundle.name}</h5><p className="text-muted">{bundle.description}</p>
                                <strong>포함된 AAC 묶음:</strong>
                                <div className="mb-2">{bundle.AAC_set_id.map(setId => { const set = ACC_sets.find(s => s.ACC_set_id === setId); return set ? <Badge bg="primary" className="me-1" key={setId}>{set.name}</Badge> : null; })}</div>
                                <strong>포함된 필터:</strong>
                                <div>{bundle.filter_id.map(filterId => { const filter = Filters.find(f => f.id === filterId); return filter ? <Badge bg="success" className="me-1" key={filterId}>{filter.name}</Badge> : null; })}</div>
                            </div>
                            <div className="ms-3">
                                <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => openModal('tool_bundle', bundle)}>편집</Button>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteToolBundle(bundle.id)}>삭제</Button>
                            </div>
                        </div></ListGroup.Item>
                    ))}</ListGroup>
                </Card.Body></Card>
            </Tab>
        </Tabs>
        
        {/* --- Modals (기존과 동일) --- */}
        <Modal show={showAacItemModal} onHide={() => setShowAacItemModal(false)} centered size="lg">
             <Modal.Header closeButton><Modal.Title>{currentAacItem ? 'AAC 아이템 편집' : '새 AAC 아이템 추가'}</Modal.Title></Modal.Header>
             <Modal.Body>
                 <Form>
                     {!currentAacItem && (<Form.Group className="mb-3"><Form.Label>생성 방식</Form.Label><div>
                         <Form.Check inline type="radio" label="AI로 생성" name="creationMethod" value="ai" checked={aacCreationMethod === 'ai'} onChange={(e) => setAacCreationMethod(e.target.value)} />
                         <Form.Check inline type="radio" label="직접 등록" name="creationMethod" value="direct" checked={aacCreationMethod === 'direct'} onChange={(e) => setAacCreationMethod(e.target.value)} />
                     </div></Form.Group>)}
                     
                     {aacCreationMethod === 'ai' && !currentAacItem ? (
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
                             <Row>
                                 <Col>
                                     <Form.Group className="mb-3"><Form.Label>이름</Form.Label><Form.Control type="text" value={aacItemForm.name} onChange={(e) => setAacItemForm({ ...aacItemForm, name: e.target.value })} /></Form.Group>
                                     <Form.Group className="mb-3"><Form.Label>설명</Form.Label><Form.Control as="textarea" rows={2} value={aacItemForm.description} onChange={(e) => setAacItemForm({ ...aacItemForm, description: e.target.value })} /></Form.Group>
                                     <Row>
                                         <Col><Form.Group className="mb-3"><Form.Label>상황</Form.Label><Form.Control type="text" value={aacItemForm.situation} onChange={(e) => setAacItemForm({ ...aacItemForm, situation: e.target.value })} /></Form.Group></Col>
                                         <Col><Form.Group className="mb-3"><Form.Label>행동</Form.Label><Form.Control type="text" value={aacItemForm.action} onChange={(e) => setAacItemForm({ ...aacItemForm, action: e.target.value })} /></Form.Group></Col>
                                         <Col><Form.Group className="mb-3"><Form.Label>감정 (선택)</Form.Label><Form.Control type="text" value={aacItemForm.emotion} onChange={(e) => setAacItemForm({ ...aacItemForm, emotion: e.target.value })} /></Form.Group></Col>
                                     </Row>
                                 </Col>
                             </Row>
                         </>
                     ) : (
                         <Row>
                             <Col md={8}>
                                 <Form.Group className="mb-3"><Form.Label>이름</Form.Label><Form.Control type="text" placeholder="예: 물 마시기" value={aacItemForm.name} onChange={(e) => setAacItemForm({ ...aacItemForm, name: e.target.value })} /></Form.Group>
                                 <Form.Group className="mb-3"><Form.Label>설명</Form.Label><Form.Control as="textarea" rows={2} placeholder="이 아이템에 대한 간단한 설명" value={aacItemForm.description} onChange={(e) => setAacItemForm({ ...aacItemForm, description: e.target.value })} /></Form.Group>
                                 <Row>
                                     <Col><Form.Group className="mb-3"><Form.Label>상황 (대분류)</Form.Label><Form.Control type="text" placeholder="예: 집, 학교" value={aacItemForm.situation} onChange={(e) => setAacItemForm({ ...aacItemForm, situation: e.target.value })} /></Form.Group></Col>
                                     <Col><Form.Group className="mb-3"><Form.Label>행동 (소분류)</Form.Label><Form.Control type="text" placeholder="예: 밥먹기, 공부하기" value={aacItemForm.action} onChange={(e) => setAacItemForm({ ...aacItemForm, action: e.target.value })} /></Form.Group></Col>
                                     <Col><Form.Group className="mb-3"><Form.Label>감정 (선택)</Form.Label><Form.Control type="text" placeholder="예: 기쁨" value={aacItemForm.emotion} onChange={(e) => setAacItemForm({ ...aacItemForm, emotion: e.target.value })} /></Form.Group></Col>
                                 </Row>
                                 <Form.Group className="mb-3"><Form.Label>상태</Form.Label><Form.Select value={aacItemForm.status} onChange={(e) => setAacItemForm({...aacItemForm, status: e.target.value})}><option value="public">공개</option><option value="private">비공개</option></Form.Select></Form.Group>
                             </Col>
                             <Col md={4}>
                                 <Form.Group className="mb-3"><Form.Label>이미지</Form.Label><Form.Control type="file" accept="image/*" onChange={(e) => handleFileChange(e, setAacItemForm)} />
                                     {imagePreview && <Image src={imagePreview} className="mt-2" fluid thumbnail />}
                                 </Form.Group>
                             </Col>
                         </Row>
                     )}
                 </Form>
             </Modal.Body>
             <Modal.Footer>
                 <Button variant="secondary" onClick={() => setShowAacItemModal(false)}>취소</Button>
                 <Button variant="primary" onClick={handleAddEditAacItem}>{currentAacItem ? '저장' : '추가'}</Button>
             </Modal.Footer>
        </Modal>

        <Modal show={showAccSetModal} onHide={() => setShowAccSetModal(false)} centered size="xl">
            <Modal.Header closeButton><Modal.Title>{currentAccSet ? 'AAC 묶음 편집' : '새 AAC 묶음 추가'}</Modal.Title></Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3"><Form.Label>묶음 이름</Form.Label><Form.Control type="text" value={accSetForm.name} onChange={(e) => setAccSetForm({...accSetForm, name: e.target.value})} /></Form.Group>
                <Form.Group className="mb-3"><Form.Label>설명</Form.Label><Form.Control as="textarea" value={accSetForm.description} onChange={(e) => setAccSetForm({...accSetForm, description: e.target.value})} /></Form.Group>
                <hr />
                <h5 className="mb-3">AAC 아이템 선택 ({accSetForm.aac_item_ids.length}개 선택됨)</h5>
                <AacItemSelector AAC_items={AAC_items} selectedItemIds={accSetForm.aac_item_ids} onToggleItem={(itemId) => { setAccSetForm(prev => ({ ...prev, aac_item_ids: prev.aac_item_ids.includes(itemId) ? prev.aac_item_ids.filter(id => id !== itemId) : [...prev.aac_item_ids, itemId] })); }} />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowAccSetModal(false)}>취소</Button>
                <Button variant="primary" onClick={handleAddEditAccSet}>{currentAccSet ? '저장' : '추가'}</Button>
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
                    <Col md={6}><Form.Group><Form.Label>포함할 AAC 묶음 (다중 선택 가능)</Form.Label><ListGroup style={{maxHeight: '200px', overflowY: 'auto'}}>{ACC_sets.map(set => (<ListGroup.Item key={set.ACC_set_id} action active={toolBundleForm.AAC_set_id.includes(set.ACC_set_id)} onClick={() => { setToolBundleForm(prev => ({...prev, AAC_set_id: prev.AAC_set_id.includes(set.ACC_set_id) ? prev.AAC_set_id.filter(id => id !== set.ACC_set_id) : [...prev.AAC_set_id, set.ACC_set_id]})) }}>{set.name}</ListGroup.Item>))}</ListGroup></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label>포함할 필터 (다중 선택 가능)</Form.Label><ListGroup style={{maxHeight: '200px', overflowY: 'auto'}}>{Filters.map(filter => (<ListGroup.Item key={filter.id} action active={toolBundleForm.filter_id.includes(filter.id)} onClick={() => { setToolBundleForm(prev => ({...prev, filter_id: prev.filter_id.includes(filter.id) ? prev.filter_id.filter(id => id !== filter.id) : [...prev.filter_id, filter.id]})) }}>{filter.name}</ListGroup.Item>))}</ListGroup></Form.Group></Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowToolBundleModal(false)}>취소</Button>
                <Button variant="primary" onClick={handleAddEditToolBundle}>{currentToolBundle ? '저장' : '추가'}</Button>
            </Modal.Footer>
        </Modal>
    </Container>
    );
};

export default TherapistToolsPage;
