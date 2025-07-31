import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Tabs, Tab, Spinner } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';

// --- 컴포넌트 Import ---
import AacItemList from '../../../components/TherapistToolTap/AacItemList';
import AacSetList from '../../../components/TherapistToolTap/AacSetList';
import FilterList from '../../../components/TherapistToolTap/FilterList';
import ToolBundleList from '../../../components/TherapistToolTap/ToolBundleList';
import AacItemModal from '../../../components/TherapistToolTap/AacItemModal';
import AacSetModal from '../../../components/TherapistToolTap/AacSetModal';
import FilterModal from '../../../components/TherapistToolTap/FilterModal';
import ToolBundleModal from '../../../components/TherapistToolTap/ToolBundleModal';

// --- CSS Import ---
import './TherapistToolsPage.css';

// Mock authentication hook
const useAuth = () => ({ user: { userType: 'therapist', id: 'therapist123' } });

function TherapistToolsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- 데이터 상태 ---
    const [aacItems, setAacItems] = useState([]);
    const [aacSets, setAacSets] = useState([]);
    const [filters, setFilters] = useState([]);
    const [toolBundles, setToolBundles] = useState([]);

    // --- 모달 관리 상태 ---
    const [modalState, setModalState] = useState({ type: null, data: null });

    // ========================================================================
    // 💧 더미 데이터 생성 부분 (DUMMY DATA GENERATION)
    // ========================================================================
    const loadMockData = () => {
        setLoading(true);
        try {
            if (user && user.userType === 'therapist') {
                const situations = ['학교', '집', '공원', '병원'];
                const actions = { '학교': ['공부하기', '밥먹기', '운동하기', '친구와 놀기'], '집': ['쉬기', '숙제하기', '간식먹기', 'TV보기'], '공원': ['산책하기', '자전거타기', '그네타기'], '병원': ['진료받기', '주사맞기', '기다리기'] };
                const emotions = ['기쁨', '슬픔', '화남', '놀람', '평온'];
                const dummyAacItems = Array.from({ length: 40 }, (_, i) => {
                    const sit = situations[i % situations.length];
                    const act = actions[sit][i % actions[sit].length];
                    return { id: `item${i + 1}`, name: `${sit}에서 ${act}`, situation: sit, action: act, emotion: emotions[i % emotions.length], description: `${sit} 상황에서 ${act}를 표현하는 AAC 아이템입니다.`, file_id: `https://placehold.co/150x150?text=${encodeURIComponent(act)}`, therapist_id: 'therapist123', created_at: new Date().toISOString(), status: 'public' };
                });
                setAacItems(dummyAacItems);

                const dummyFilters = Array.from({ length: 8 }, (_, i) => ({ id: `filter${i + 1}`, therapist_id: 'therapist123', name: `꾸미기 필터 ${i + 1}`, created_at: new Date().toISOString(), file_id: `https://placehold.co/150x150?text=Filter${i + 1}` }));
                setFilters(dummyFilters);

                const dummyAacSets = [ { ACC_set_id: 'set1', name: '학교 생활 묶음', therapist_id: 'therapist123', created_at: new Date().toISOString(), description: '학교에서의 다양한 활동', aac_item_ids: ['item1', 'item2', 'item3', 'item5', 'item9'] }, { ACC_set_id: 'set2', name: '집에서 묶음', therapist_id: 'therapist123', created_at: new Date().toISOString(), description: '집에서의 일상', aac_item_ids: ['item6', 'item7', 'item10'] } ];
                setAacSets(dummyAacSets);

                const dummyToolBundles = [ { id: 'bundle1', filter_id: ['filter1'], AAC_set_id: ['set1'], created_at: new Date().toISOString(), name: '즐거운 학교 세트', description: '학교 묶음과 기본 필터 사용' }, { id: 'bundle2', filter_id: ['filter2', 'filter3'], AAC_set_id: ['set2'], created_at: new Date().toISOString(), name: '편안한 우리집 세트', description: '집 묶음과 여러 필터 사용' } ];
                setToolBundles(dummyToolBundles);
            } else { setError('치료사 계정으로만 접근 가능합니다.'); }
        } catch (e) { setError('데이터 로딩 중 오류가 발생했습니다.'); } finally { setLoading(false); }
    };
    // ========================================================================
    // 💧 더미 데이터 생성 부분 끝
    // ========================================================================

    useEffect(() => {
        loadMockData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openModal = (type, data = null) => setModalState({ type, data });
    const closeModal = () => setModalState({ type: null, data: null });

    // --- [수정] AI 이미지 생성을 위한 핸들러 ---
    const handleGenerateAacImage = async (promptData) => {
        console.log("AI 이미지 생성을 요청합니다:", promptData);
        
        // [수정] AI 서버의 주소를 여기에 정의합니다.
        const AI_SERVER_URL = 'http://localhost:8000';

        try {
            // 1. Spring 백엔드에 이미지 생성을 요청합니다.
            const response = await fetch('/api/v1/aacs/generate', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(promptData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'AI 이미지 생성 요청에 실패했습니다.' }));
                throw new Error(errorData.message);
            }

            const result = await response.json();
            
            // 2. [핵심 수정] 백엔드로부터 받은 부분 경로(result.previewUrl) 앞에
            //    AI 서버 주소를 붙여 완전한 URL을 만듭니다.
            const fullImageUrl = AI_SERVER_URL + result.previewUrl;
            console.log("생성된 전체 이미지 URL:", fullImageUrl);
            
            // 3. 완전한 URL을 Modal 컴포넌트로 반환합니다.
            return fullImageUrl; 
        } catch (error) {
            console.error("AI image generation failed:", error);
            throw error;
        }
    };

    // --- CRUD 핸들러 ---
    const handleSaveAacItem = (itemToSave) => { console.log("Saving AAC Item:", itemToSave); closeModal(); };
    const handleDeleteAacItem = (itemId) => { if (window.confirm('정말로 이 AAC 아이템을 삭제하시겠습니까?')) console.log("Deleting AAC Item:", itemId); };
    const handleSaveAacSet = (set) => { console.log("Saving AAC Set:", set); closeModal(); };
    const handleDeleteAacSet = (setId) => { if (window.confirm('정말로 이 AAC 묶음을 삭제하시겠습니까?')) console.log("Deleting AAC Set:", setId); };
    const handleSaveFilter = (filterToSave) => { console.log("Saving Filter:", filterToSave); closeModal(); };
    const handleDeleteFilter = (filterId) => { if (window.confirm('정말로 이 필터를 삭제하시겠습니까?')) console.log("Deleting Filter:", filterId); };
    const handleSaveToolBundle = (bundle) => { console.log("Saving Tool Bundle:", bundle); closeModal(); };
    const handleDeleteToolBundle = (bundleId) => { if (window.confirm('정말로 이 수업 세트를 삭제하시겠습니까?')) console.log("Deleting Tool Bundle:", bundleId); };

    if (loading) return <Container className="my-5 text-center"><Spinner animation="border" /> <p>로딩 중...</p></Container>;
    if (error) return <Container className="my-5 text-center"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <Container fluid className="my-5 px-4 tools-management-section">
            <h2 className="text-center mb-4">수업 도구 관리</h2>
            <Tabs defaultActiveKey="AAC_item" id="therapist-tools-tabs" className="mb-3" justify>
                <Tab eventKey="AAC_item" title="AAC 아이템 관리">
                    <Card className="p-3"><Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Card.Title className="mb-0">AAC 아이템 목록</Card.Title>
                            <Button variant="primary" onClick={() => openModal('AAC_item')}>새 AAC 아이템 추가</Button>
                        </div> <hr />
                        <AacItemList aacItems={aacItems} onEdit={(item) => openModal('AAC_item', item)} onDelete={handleDeleteAacItem} />
                    </Card.Body></Card>
                </Tab>
                <Tab eventKey="AAC_set" title="AAC 묶음 관리">
                    <Card className="p-3"><Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Card.Title className="mb-0">AAC 묶음 목록</Card.Title>
                            <Button variant="primary" onClick={() => openModal('AAC_set')}>새 AAC 묶음 추가</Button>
                        </div>
                        <AacSetList aacSets={aacSets} aacItems={aacItems} onEdit={(set) => openModal('AAC_set', set)} onDelete={handleDeleteAacSet} />
                    </Card.Body></Card>
                </Tab>
                <Tab eventKey="Filter" title="필터 관리">
                    <Card className="p-3"><Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Card.Title className="mb-0">필터 목록</Card.Title>
                            <Button variant="primary" onClick={() => openModal('Filter')}>새 필터 추가</Button>
                        </div>
                        <FilterList filters={filters} onEdit={(filter) => openModal('Filter', filter)} onDelete={handleDeleteFilter} />
                    </Card.Body></Card>
                </Tab>
                <Tab eventKey="tool_bundle" title="수업 세트 관리">
                     <Card className="p-3"><Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Card.Title className="mb-0">수업 세트 목록</Card.Title>
                            <Button variant="primary" onClick={() => openModal('tool_bundle')}>새 수업 세트 추가</Button>
                        </div>
                        <ToolBundleList toolBundles={toolBundles} aacSets={aacSets} filters={filters} onEdit={(bundle) => openModal('tool_bundle', bundle)} onDelete={handleDeleteToolBundle} />
                    </Card.Body></Card>
                </Tab>
            </Tabs>
            
            <AacItemModal 
                show={modalState.type === 'AAC_item'} 
                onHide={closeModal} 
                onSave={handleSaveAacItem} 
                itemData={modalState.data}
                onGenerate={handleGenerateAacImage} 
            />
            <AacSetModal 
                show={modalState.type === 'AAC_set'} 
                onHide={closeModal} 
                onSave={handleSaveAacSet} 
                initialData={modalState.data} 
                allAacItems={aacItems} 
            />
            <FilterModal 
                show={modalState.type === 'Filter'} 
                onHide={closeModal} 
                onSave={handleSaveFilter} 
                filterData={modalState.data} 
            />
            <ToolBundleModal 
                show={modalState.type === 'tool_bundle'} 
                onHide={closeModal} 
                onSave={handleSaveToolBundle} 
                bundleData={modalState.data} 
                allAacSets={aacSets} 
                allFilters={filters} 
            />
        </Container>
    );
}

export default TherapistToolsPage;
