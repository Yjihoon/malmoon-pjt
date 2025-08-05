import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Button, Alert, Tabs, Tab, Spinner } from 'react-bootstrap';

import AacItemList from '../../../components/TherapistToolTap/AacItemList';
import AacSetList from '../../../components/TherapistToolTap/AacSetList';
import FilterList from '../../../components/TherapistToolTap/FilterList';
import ToolBundleList from '../../../components/TherapistToolTap/ToolBundleList';
import AacItemModal from '../../../components/TherapistToolTap/AacItemModal';
import AacSetModal from '../../../components/TherapistToolTap/AacSetModal';
import FilterModal from '../../../components/TherapistToolTap/FilterModal';
import ToolBundleModal from '../../../components/TherapistToolTap/ToolBundleModal';
import AacItemDetailModal from '../../../components/TherapistToolTap/AacItemDetailModal';

import './TherapistToolsPage.css';

function TherapistToolsPage() {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [aacItems, setAacItems] = useState([]);
    const [aacSets, setAacSets] = useState([]);
    
    const [filters, setFilters] = useState([]);
    const [toolBundles, setToolBundles] = useState([]);

    const [modalState, setModalState] = useState({ type: null, data: null });

    const getAuthHeader = useCallback(() => {
        const storedUserString = localStorage.getItem('currentUser');
        const storedUser = storedUserString ? JSON.parse(storedUserString) : null;
        const token = storedUser?.accessToken;
        
        if (!token) {
            setError("로그인이 필요합니다. 로그인 페이지로 이동해주세요.");
            setLoading(false);
            return null;
        }
        return { 'Authorization': `Bearer ${token}` };
    }, []);
    
    const loadAacItems = useCallback(async () => {
        const headers = getAuthHeader();
        if (!headers) return;
        try {
            const response = await fetch('/api/v1/aacs?page=0&size=1000', { headers });
            if (response.status === 401) throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
            if (!response.ok) throw new Error('AAC 아이템을 불러오는데 실패했습니다.');
            const data = await response.json();
            // --- [콘솔 로그 추가] ---
            console.log("[TherapistToolsPage] API로부터 받은 AAC 아이템 데이터:", data.content);
            // ------------------------
            setAacItems(data.content);
        } catch (e) {
            setError(e.message);
        }
    }, [getAuthHeader]);

    const loadAacSets = useCallback(async () => {
        const headers = getAuthHeader();
        if (!headers) return;
        try {
            const response = await fetch('/api/v1/aacs/sets/my', { headers });
            if (response.status === 401) throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
            if (!response.ok) throw new Error('AAC 묶음을 불러오는데 실패했습니다.');
            const data = await response.json();
            const mappedData = data.map(set => ({ ...set, ACC_set_id: set.id }));
            setAacSets(mappedData);
        } catch (e) {
            setError(e.message);
        }
    }, [getAuthHeader]);

    const loadMockData = () => {
        try {
            const dummyFilters = Array.from({ length: 8 }, (_, i) => ({ id: `filter${i + 1}`, therapist_id: 'therapist123', name: `꾸미기 필터 ${i + 1}`, created_at: new Date().toISOString(), file_id: `https://placehold.co/150x150?text=Filter${i + 1}` }));
            setFilters(dummyFilters);
            const dummyToolBundles = [ { id: 'bundle1', filter_id: ['filter1'], AAC_set_id: ['set1'], created_at: new Date().toISOString(), name: '즐거운 학교 세트', description: '학교 묶음과 기본 필터 사용' }, { id: 'bundle2', filter_id: ['filter2', 'filter3'], AAC_set_id: ['set2'], created_at: new Date().toISOString(), name: '편안한 우리집 세트', description: '집 묶음과 여러 필터 사용' } ];
            setToolBundles(dummyToolBundles);
        } catch (e) { setError('더미 데이터 로딩 중 오류가 발생했습니다.'); } 
    };

    useEffect(() => {
        const initializePage = async () => {
            setLoading(true);
            const headers = getAuthHeader();
            if (headers) {
                try {
                    const response = await fetch('/api/v1/members/me', { headers });
                    if (response.status === 401) {
                        throw new Error("인증 정보가 유효하지 않습니다. 다시 로그인해주세요.");
                    }
                    if (!response.ok) {
                        throw new Error("사용자 정보를 불러오는데 실패했습니다.");
                    }
                    const userData = await response.json();
                    setCurrentUser(userData);
                    
                    await Promise.all([loadAacItems(), loadAacSets()]);
                    loadMockData();

                } catch (e) {
                    setError(e.message);
                } finally {
                    setLoading(false);
                }
            }
        };
        initializePage();
    }, [getAuthHeader, loadAacItems, loadAacSets]);
    
    const openModal = (type, data = null) => setModalState({ type, data });
    const closeModal = () => setModalState({ type: null, data: null });

    const handleViewDetails = (item) => {
        openModal('AAC_item_detail', item);
    };

    const handleGenerateAacImage = async (promptData) => {
        const headers = { ...getAuthHeader(), 'Content-Type': 'application/json' };
        if (!headers['Authorization']) return;
        
        const AI_SERVER_URL = 'http://localhost:8000';
        try {
            const response = await fetch('/api/v1/aacs/generate', { 
                method: 'POST',
                headers: headers,
                body: JSON.stringify(promptData),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'AI 이미지 생성 요청에 실패했습니다.' }));
                throw new Error(errorData.message);
            }
            const result = await response.json();
            return AI_SERVER_URL + result.previewUrl; 
        } catch (error) {
            console.error("AI image generation failed:", error);
            throw error;
        }
    };

    const handleSaveAacItem = async (itemToSave) => {
        const headers = getAuthHeader();
        if (!headers) return;

        try {
            if (itemToSave.aiGeneratedImage) {
                const payload = {
                    name: itemToSave.name,
                    situation: itemToSave.situation,
                    action: itemToSave.action,
                    emotion: itemToSave.emotion,
                    description: itemToSave.description,
                    status: itemToSave.status.toUpperCase(),
                    imagePath: itemToSave.aiGeneratedImage.replace('http://localhost:8000', '')
                };
                const response = await fetch('/api/v1/aacs/confirm', {
                    method: 'POST',
                    headers: { ...headers, 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) throw new Error('AAC 아이템 확정에 실패했습니다.');
            } 
            else if (itemToSave.imageFile) {
                const formData = new FormData();
                formData.append('name', itemToSave.name);
                formData.append('description', itemToSave.description);
                formData.append('situation', itemToSave.situation);
                formData.append('action', itemToSave.action);
                formData.append('emotion', itemToSave.emotion);
                formData.append('status', itemToSave.status.toUpperCase());
                formData.append('file', itemToSave.imageFile);

                const response = await fetch('/api/v1/aacs/custom', {
                    method: 'POST',
                    headers: headers,
                    body: formData
                });
                if (!response.ok) throw new Error('AAC 아이템 저장에 실패했습니다.');
            }
            
            closeModal();
            await loadAacItems();
        } catch (e) {
            setError(e.message);
        }
    };

    const handleDeleteAacItem = async (itemId) => {
        if (window.confirm('정말로 이 AAC 아이템을 삭제하시겠습니까?')) {
            const headers = getAuthHeader();
            if (!headers) return;
            try {
                const response = await fetch(`/api/v1/aacs/custom/${itemId}`, {
                    method: 'PATCH',
                    headers: headers
                });
                if (!response.ok) throw new Error('AAC 아이템 삭제에 실패했습니다.');
                await loadAacItems();
            } catch(e) {
                setError(e.message);
            }
        }
    };

    const handleSaveAacSet = async (set) => {
        const headers = { ...getAuthHeader(), 'Content-Type': 'application/json' };
        if (!headers['Authorization']) return;

        const isEditing = !!set.id;
        const url = isEditing ? `/api/v1/aacs/sets/${set.id}` : '/api/v1/aacs/sets/create';
        const method = isEditing ? 'PATCH' : 'POST';
        
        const payload = {
            name: set.name,
            description: set.description,
            aacItemIds: set.aac_item_ids 
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`AAC 묶음 ${isEditing ? '수정' : '저장'}에 실패했습니다.`);
            
            closeModal();
            await loadAacSets();
        } catch (e) {
            setError(e.message);
        }
    };
    
    const handleDeleteAacSet = async (setId) => {
        if (window.confirm('정말로 이 AAC 묶음을 삭제하시겠습니까?')) {
            const headers = getAuthHeader();
            if (!headers) return;
            try {
                const response = await fetch(`/api/v1/aacs/sets/${setId}`, {
                    method: 'DELETE',
                    headers: headers
                });
                if (!response.ok) throw new Error('AAC 묶음 삭제에 실패했습니다.');
                await loadAacSets();
            } catch(e) {
                setError(e.message);
            }
        }
    };

    const handleSaveFilter = (filterToSave) => { console.log("Saving Filter:", filterToSave); closeModal(); };
    const handleDeleteFilter = (filterId) => { if (window.confirm('정말로 이 필터를 삭제하시겠습니까?')) console.log("Deleting Filter:", filterId); };
    const handleSaveToolBundle = (bundle) => { console.log("Saving Tool Bundle:", bundle); closeModal(); };
    const handleDeleteToolBundle = (bundleId) => { if (window.confirm('정말로 이 수업 세트를 삭제하시겠습니까?')) console.log("Deleting Tool Bundle:", bundleId); };

    if (loading) return <Container className="my-5 text-center"><Spinner animation="border" /> <p>로딩 중...</p></Container>;
    if (error) return <Container className="my-5"><Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert></Container>;

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
                        <AacItemList 
                            aacItems={aacItems} 
                            onEdit={(item) => openModal('AAC_item', item)} 
                            onDelete={handleDeleteAacItem}
                            onViewDetails={handleViewDetails}
                            currentUser={currentUser} 
                        />
                    </Card.Body></Card>
                </Tab>
                <Tab eventKey="AAC_set" title="AAC 묶음 관리">
                    <Card className="p-3"><Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Card.Title className="mb-0">AAC 묶음 목록</Card.Title>
                            <Button variant="primary" onClick={() => openModal('AAC_set')}>새 AAC 묶음 추가</Button>
                        </div>
                        <AacSetList 
                            aacSets={aacSets} 
                            onEdit={(set) => openModal('AAC_set', set)} 
                            onDelete={handleDeleteAacSet} 
                        />
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
            
            <AacItemDetailModal
                show={modalState.type === 'AAC_item_detail'}
                onHide={closeModal}
                item={modalState.data}
            />
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
