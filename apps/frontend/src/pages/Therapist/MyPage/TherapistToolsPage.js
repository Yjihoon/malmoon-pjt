import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Button, Alert, Tabs, Tab, Spinner } from 'react-bootstrap';

// 컴포넌트 import 경로
import AacItemList from '../../../components/TherapistToolTap/AacItemList';
import AacSetList from '../../../components/TherapistToolTap/AacSetList';
import FilterList from '../../../components/TherapistToolTap/FilterList';
import FilterSetList from '../../../components/TherapistToolTap/FilterSetList';
import ToolBundleList from '../../../components/TherapistToolTap/ToolBundleList';
import AacItemModal from '../../../components/TherapistToolTap/AacItemModal';
import AacSetModal from '../../../components/TherapistToolTap/AacSetModal';
import FilterModal from '../../../components/TherapistToolTap/FilterModal';
import FilterSetModal from '../../../components/TherapistToolTap/FilterSetModal';
import ToolBundleModal from '../../../components/TherapistToolTap/ToolBundleModal';
import AacItemDetailModal from '../../../components/TherapistToolTap/AacItemDetailModal';

// CSS 임포트
import './TherapistToolsPage.css';

function TherapistToolsPage() {
    // 상태 관리
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [aacItems, setAacItems] = useState([]);
    const [aacSets, setAacSets] = useState([]);
    const [filters, setFilters] = useState([]);
    const [filterSets, setFilterSets] = useState([]);
    const [toolBundles, setToolBundles] = useState([]);
    const [modalState, setModalState] = useState({ type: null, data: null });
    
    const [refreshKey, setRefreshKey] = useState(0);

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
    
    // 데이터 로드 함수들 (API 연동)
    const loadAacItems = useCallback(async (headers) => {
        const response = await fetch('/api/v1/aacs?page=0&size=1000', { headers });
        if (!response.ok) throw new Error('AAC 아이템 목록 로딩 실패');
        const data = await response.json();
        setAacItems(data.content.map(item => ({ ...item, imageUrl: item.fileUrl })));
    }, []);

    const loadAacSets = useCallback(async (headers) => {
        const response = await fetch('/api/v1/aacs/sets/my', { headers });
        if (!response.ok) throw new Error('AAC 묶음 목록 로딩 실패');
        setAacSets(await response.json());
    }, []);

    // [수정] 필터 이미지 URL을 별도로 조회하도록 로직 변경
    const loadFilters = useCallback(async (headers) => {
        // 1. 필터 기본 정보 목록 조회
        const listResponse = await fetch('/api/v1/filters', { headers });
        if (!listResponse.ok) throw new Error('필터 목록 로딩 실패');
        const listData = await listResponse.json();
        const initialFilters = listData.filters || [];

        if (initialFilters.length === 0) {
            setFilters([]);
            return;
        }
        
        // 2. 각 필터의 fileId를 사용하여 presigned URL을 비동기적으로 조회
        const filtersWithUrls = await Promise.all(initialFilters.map(async (filter) => {
            console.log(filter)
            if (filter.fileId) {
                try {
                    console.log(filter)
                    // 요청하신 /api/v1/files/{file_id}/presigned-url 경로로 이미지 URL 요청
                    const urlResponse = await fetch(`/api/v1/files/${filter.fileId}/presigned-url`, { headers });
                    if (!urlResponse.ok) {
                        console.error(`Presigned URL 요청 실패: fileId ${filter.fileId}`);
                        return { ...filter, fileUrl: '' }; // 실패 시 빈 URL
                    }
                    // 백엔드가 JSON 객체 ({ "url": "..." })를 반환한다고 가정
                    const urlData = await urlResponse.json(); 
                    return { ...filter, fileUrl: urlData.url };
                } catch (e) {
                    console.error(`Presigned URL 파싱 오류: fileId ${filter.fileId}`, e);
                    return { ...filter, fileUrl: '' }; // 오류 발생 시 빈 URL
                }
            }
            // fileId가 없는 경우
            return { ...filter, fileUrl: '' };
        }));

        setFilters(filtersWithUrls);
    }, []);


    const loadFilterSets = useCallback(async (headers) => {
        const response = await fetch('/api/v1/filters/sets/my', { headers });
        if (response.status === 404) {
            console.warn("필터 묶음 API(/api/v1/filters/sets/my)를 찾을 수 없습니다. 백엔드 서버를 확인해주세요.");
            setFilterSets([]); // 404 오류 시 빈 배열로 설정하여 앱 중단 방지
            return;
        }
        if (!response.ok) throw new Error('필터 묶음 목록 로딩 실패');
        setFilterSets(await response.json());
    }, []);

    const loadToolBundles = useCallback(async (headers) => {
        const response = await fetch('/api/v1/tool-bundles/my', { headers });
        if (!response.ok) throw new Error('수업 세트 목록 로딩 실패');
        setToolBundles(await response.json());
    }, []);

    // 페이지 초기화 (모든 데이터 로드)
    useEffect(() => {
        const initializePage = async () => {
            setLoading(true);
            setError('');
            const headers = getAuthHeader();
            if (headers) {
                try {
                    const userResponse = await fetch('/api/v1/members/me', { headers });
                    if (!userResponse.ok) throw new Error("사용자 정보 로딩 실패");
                    setCurrentUser(await userResponse.json());

                    await Promise.all([
                        loadAacItems(headers),
                        loadAacSets(headers),
                        loadFilters(headers),
                        loadFilterSets(headers),
                        loadToolBundles(headers)
                    ]);
                    
                } catch (e) {
                    setError(e.message);
                } finally {
                    setLoading(false);
                }
            }
        };
        initializePage();
    }, [getAuthHeader, refreshKey, loadAacItems, loadAacSets, loadFilters, loadFilterSets, loadToolBundles]);

    const forceRefresh = () => setRefreshKey(prevKey => prevKey + 1);
    
    const openModal = (type, data = null) => setModalState({ type, data });
    const closeModal = () => setModalState({ type: null, data: null });
    const handleViewDetails = (item) => openModal('AAC_item_detail', item);

    // 공통 API 요청 함수
    const apiRequest = async (url, method, body, isFormData = false) => {
        const headers = getAuthHeader();
        if (!headers) return;
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const options = { method, headers };
        if (body) {
            options.body = isFormData ? body : JSON.stringify(body);
        }

        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `${method} 요청 실패: ${url}`);
        }
        return response;
    };

    // 필터 핸들러 (API 연동)
    const handleSaveFilter = async (filterToSave) => {
        try {
            const formData = new FormData();
            formData.append('name', filterToSave.name);
            
            if (filterToSave.imageFile) {
                formData.append('filter', filterToSave.imageFile);
            }
            
            await apiRequest('/api/v1/filters', 'POST', formData, true);
            closeModal();
            forceRefresh();
        } catch (e) { setError(e.message); }
    };

    const handleDeleteFilter = async (filterId) => {
        if (window.confirm('정말로 이 필터를 삭제하시겠습니까?')) {
            try {
                await apiRequest(`/api/v1/filters?filterId=${filterId}`, 'DELETE');
                forceRefresh();
            } catch(e) { setError(e.message); }
        }
    };

    // --- (이하 다른 핸들러 함수들은 이전과 동일) ---

    // AAC 아이템 핸들러
    const handleSaveAacItem = async (itemToSave) => {
        try {
            const formData = new FormData();
            Object.keys(itemToSave).forEach(key => {
                if (key === 'imageFile' && itemToSave[key]) {
                    formData.append('file', itemToSave[key]);
                } else if (key !== 'imageFile' && itemToSave[key] !== null) {
                    formData.append(key, itemToSave[key]);
                }
            });
            await apiRequest('/api/v1/aacs/custom', 'POST', formData, true);
            closeModal();
            forceRefresh();
        } catch (e) { setError(e.message); }
    };

    const handleDeleteAacItem = async (itemId) => {
        if (window.confirm('정말로 이 AAC 아이템을 삭제하시겠습니까?')) {
            try {
                await apiRequest(`/api/v1/aacs/custom/${itemId}`, 'PATCH');
                forceRefresh();
            } catch(e) { setError(e.message); }
        }
    };
    
    const handleGenerateAacImage = async (promptData) => {
        const AI_SERVER_URL = 'http://localhost:8000';
        try {
            const response = await apiRequest('/api/v1/aacs/generate', 'POST', promptData);
            const result = await response.json();
            return AI_SERVER_URL + result.previewUrl;
        } catch (error) {
            throw error;
        }
    };

    // AAC 묶음 핸들러
    const handleSaveAacSet = async (set) => {
        const isEditing = !!set.id;
        const url = isEditing ? `/api/v1/aacs/sets/${set.id}` : '/api/v1/aacs/sets/create';
        const method = isEditing ? 'PATCH' : 'POST';
        const payload = { name: set.name, description: set.description, aacItemIds: set.aacItemIds };
        try {
            await apiRequest(url, method, payload);
            closeModal();
            forceRefresh();
        } catch (e) { setError(e.message); }
    };
    
    const handleDeleteAacSet = async (setId) => {
        if (window.confirm('정말로 이 AAC 묶음을 삭제하시겠습니까?')) {
            try {
                await apiRequest(`/api/v1/aacs/sets/${setId}`, 'DELETE');
                forceRefresh();
            } catch(e) { setError(e.message); }
        }
    };

    // 필터 묶음 핸들러
    const handleSaveFilterSet = async (set) => {
        const isEditing = !!set.id;
        const url = isEditing ? `/api/v1/filters/sets/${set.id}` : '/api/v1/filters/sets/create';
        const method = isEditing ? 'PATCH' : 'POST';
        const payload = { name: set.name, description: set.description, filterIds: set.filterIds };
        try {
            await apiRequest(url, method, payload);
            closeModal();
            forceRefresh();
        } catch(e) { setError(e.message); }
    };

    const handleDeleteFilterSet = async (setId) => {
        if (window.confirm('정말로 이 필터 묶음을 삭제하시겠습니까?')) {
            try {
                await apiRequest(`/api/v1/filters/sets/${setId}`, 'DELETE');
                forceRefresh();
            } catch(e) { setError(e.message); }
        }
    };

    // 수업 세트 핸들러
    const handleSaveToolBundle = async (bundle) => {
        const isEditing = !!bundle.id;
        const url = isEditing ? `/api/v1/tool-bundles/${bundle.id}` : '/api/v1/tool-bundles/create';
        const method = isEditing ? 'PATCH' : 'POST';
        const payload = { 
            name: bundle.name, 
            description: bundle.description, 
            aacSetId: bundle.aacSetId, 
            filterSetId: bundle.filterSetId 
        };
        try {
            await apiRequest(url, method, payload);
            closeModal();
            forceRefresh();
        } catch(e) { setError(e.message); }
    };

    const handleDeleteToolBundle = async (bundleId) => {
        if (window.confirm('정말로 이 수업 세트를 삭제하시겠습니까?')) {
            try {
                await apiRequest(`/api/v1/tool-bundles/${bundleId}`, 'DELETE');
                forceRefresh();
            } catch(e) { setError(e.message); }
        }
    };

    if (loading) return <Container className="my-5 text-center"><Spinner animation="border" /> <p>데이터 로딩 중...</p></Container>;

    return (
        <Container fluid className="my-5 px-4 tools-management-section">
            <h2 className="text-center mb-4">수업 도구 관리</h2>
            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
            <Tabs defaultActiveKey="AAC_item" id="therapist-tools-tabs" className="mb-3" justify>
                <Tab eventKey="AAC_item" title="AAC 아이템 관리">
                    <Card className="p-3"><Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Card.Title className="mb-0">AAC 아이템 목록</Card.Title>
                            <Button variant="primary" onClick={() => openModal('AAC_item')}>새 AAC 아이템 추가</Button>
                        </div> <hr />
                        <AacItemList aacItems={aacItems} currentUser={currentUser} onEdit={(item) => openModal('AAC_item', item)} onDelete={handleDeleteAacItem} onViewDetails={handleViewDetails} />
                    </Card.Body></Card>
                </Tab>
                <Tab eventKey="AAC_set" title="AAC 묶음 관리">
                    <Card className="p-3"><Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Card.Title className="mb-0">AAC 묶음 목록</Card.Title>
                            <Button variant="primary" onClick={() => openModal('AAC_set')}>새 AAC 묶음 추가</Button>
                        </div>
                        <AacSetList aacSets={aacSets} onEdit={(set) => openModal('AAC_set', set)} onDelete={handleDeleteAacSet} />
                    </Card.Body></Card>
                </Tab>
                <Tab eventKey="Filter" title="필터 관리">
                    <Card className="p-3"><Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Card.Title className="mb-0">필터 목록</Card.Title>
                            <Button variant="primary" onClick={() => openModal('filter')}>새 필터 추가</Button>
                        </div>
                        <FilterList filters={filters} onEdit={(filter) => openModal('filter', filter)} onDelete={handleDeleteFilter} />
                    </Card.Body></Card>
                </Tab>
                <Tab eventKey="Filter_set" title="필터 묶음 관리">
                    <Card className="p-3"><Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Card.Title className="mb-0">필터 묶음 목록</Card.Title>
                            <Button variant="primary" onClick={() => openModal('Filter_set')}>새 필터 묶음 추가</Button>
                        </div>
                        <FilterSetList filterSets={filterSets} onEdit={(set) => openModal('Filter_set', set)} onDelete={handleDeleteFilterSet} />
                    </Card.Body></Card>
                </Tab>
                <Tab eventKey="tool_bundle" title="수업 세트 관리">
                     <Card className="p-3"><Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Card.Title className="mb-0">수업 세트 목록</Card.Title>
                            <Button variant="primary" onClick={() => openModal('tool_bundle')}>새 수업 세트 추가</Button>
                        </div>
                        <ToolBundleList toolBundles={toolBundles} allAacSets={aacSets} allFilterSets={filterSets} onEdit={(bundle) => openModal('tool_bundle', bundle)} onDelete={handleDeleteToolBundle} />
                    </Card.Body></Card>
                </Tab>
            </Tabs>
            
            {/* 모달 렌더링 */}
            <AacItemDetailModal show={modalState.type === 'AAC_item_detail'} onHide={closeModal} item={modalState.data} />
            <AacItemModal show={modalState.type === 'AAC_item'} onHide={closeModal} onSave={handleSaveAacItem} itemData={modalState.data} onGenerate={handleGenerateAacImage} />
            <AacSetModal show={modalState.type === 'AAC_set'} onHide={closeModal} onSave={handleSaveAacSet} initialData={modalState.data} allAacItems={aacItems} getAuthHeader={getAuthHeader} />
            <FilterModal show={modalState.type === 'filter'} onHide={closeModal} onSave={handleSaveFilter} filterData={modalState.data} />
            <FilterSetModal show={modalState.type === 'Filter_set'} onHide={closeModal} onSave={handleSaveFilterSet} initialData={modalState.data} allFilters={filters} getAuthHeader={getAuthHeader} />
            <ToolBundleModal show={modalState.type === 'tool_bundle'} onHide={closeModal} onSave={handleSaveToolBundle} bundleData={modalState.data} allAacSets={aacSets} allFilterSets={filterSets} />
        </Container>
    );
}

export default TherapistToolsPage;
