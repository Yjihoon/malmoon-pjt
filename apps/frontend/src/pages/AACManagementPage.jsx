import React, { useState } from 'react';
import './AACManagementPage.css'; // 페이지 전용 스타일

const AACManagementPage = () => {
  // --- 상태(State) 관리 ---

  // 전체 AAC 카드 목록
  const [aacList, setAacList] = useState([
    { id: 1, category: '행동', text: '인사하기', image: 'https://via.placeholder.com/150/FFC0CB/000000?Text=Hello' },
    { id: 2, category: '감정', text: '슬퍼요', image: 'https://via.placeholder.com/150/ADD8E6/000000?Text=Sad' },
    { id: 3, category: '상황', text: '도와주세요', image: 'https://via.placeholder.com/150/FFD700/000000?Text=Help' },
    { id: 4, category: '행동', text: '주세요', image: 'https://via.placeholder.com/150/90EE90/000000?Text=Give' },
  ]);
  // 새로 생성할 AAC의 입력값 (카테고리, 텍스트)
  const [newAac, setNewAac] = useState({ category: '행동', text: '' });
  const [aacImageFile, setAacImageFile] = useState(null);
  const [aacAiPrompt, setAacAiPrompt] = useState('');

  // 묶음(덱) 관련 상태
  const [bundles, setBundles] = useState([]);
  const [selectedAacs, setSelectedAacs] = useState([]);
  const [selectedBundleId, setSelectedBundleId] = useState(null);

  // 필터 관련 상태
  const [filterList, setFilterList] = useState([]);
  const [newFilterName, setNewFilterName] = useState('');
  const [filterImageFile, setFilterImageFile] = useState(null);
  const [filterAiPrompt, setFilterAiPrompt] = useState('');


  // --- 이벤트 핸들러 함수 ---

  const handleAacInputChange = (e) => { const { name, value } = e.target; setNewAac({ ...newAac, [name]: value }); };
  const handleAacImageChange = (e) => { if (e.target.files && e.target.files[0]) { setAacImageFile(e.target.files[0]); } };
  const handleCreateAac = (e) => { e.preventDefault(); if (!newAac.text) { alert('내용을 입력해주세요.'); return; } const newCard = { id: Date.now(), category: newAac.category, text: newAac.text, image: aacImageFile ? URL.createObjectURL(aacImageFile) : `https://via.placeholder.com/150`, }; setAacList([newCard, ...aacList]); setNewAac({ category: newAac.category, text: '' }); setAacImageFile(null); e.target.reset(); };
  const handleDeleteAac = (id) => { if (window.confirm('정말로 이 AAC 카드를 삭제하시겠습니까?')) { setAacList(aacList.filter(aac => aac.id !== id)); } };
  const handleSelectAacForBundle = (id) => { setSelectedAacs(prev => prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]); };
  const handleCreateBundle = () => { if (selectedAacs.length === 0) { alert('묶음에 추가할 AAC 카드를 하나 이상 선택해주세요.'); return; } if (selectedAacs.length > 20) { alert('AAC 카드는 최대 20개까지만 묶을 수 있습니다.'); return; } const bundleName = prompt('생성할 묶음의 이름을 입력하세요:', `치료용 묶음 ${bundles.length + 1}`); if (bundleName) { const newBundle = { id: Date.now(), name: bundleName, aacIds: selectedAacs, }; setBundles([...bundles, newBundle]); setSelectedAacs([]); alert(`'${bundleName}' 묶음이 생성되었습니다!`); } };
  const handleCreateFilter = (e) => { e.preventDefault(); if (!newFilterName) { alert('필터 이름을 입력해주세요.'); return; } if (!filterImageFile) { alert('필터 이미지를 업로드해주세요.'); return; } const newFilter = { id: Date.now(), name: newFilterName, image: URL.createObjectURL(filterImageFile), }; setFilterList([newFilter, ...filterList]); setNewFilterName(''); setFilterImageFile(null); e.target.reset(); };
  const handleAiGeneration = (prompt) => { if (!prompt) { alert('프롬프트를 입력해주세요.'); return; } alert(`'${prompt}' 내용으로 AI 이미지 생성을 요청합니다. (현재는 기능 준비중)`); };
  const handleBundleClick = (bundleId) => {
    setSelectedBundleId(prevId => (prevId === bundleId ? null : bundleId));
  };
  
  const selectedBundleDetails = selectedBundleId
    ? bundles.find(bundle => bundle.id === selectedBundleId)
    : null;

  const cardsInSelectedBundle = selectedBundleDetails
    ? aacList.filter(aac => selectedBundleDetails.aacIds.includes(aac.id))
    : [];

  return (
    <div className="aac-management-container main-container">
      {/* --- AAC 생성 섹션 --- */}
      <section className="management-section card-base">
        <h3>✨ AAC 생성하기</h3>
        <div className="creation-area">
          <form onSubmit={handleCreateAac} className="creation-form card-base">
            <h4>직접 업로드</h4>
            <div className="form-group">
              <label>카테고리</label>
              <select name="category" value={newAac.category} onChange={handleAacInputChange}>
                <option value="행동">행동</option>
                <option value="상황">상황</option>
                <option value="감정">감정</option>
              </select>
            </div>
            <div className="form-group">
              <label>내용</label>
              <input type="text" name="text" value={newAac.text} onChange={handleAacInputChange} placeholder="내용 입력 (예: 인사하기)" required />
            </div>
            <div className="form-group">
              <label>이미지 업로드</label>
              <input type="file" accept="image/*" onChange={handleAacImageChange} />
            </div>
            <button type="submit" className="btn-soft-primary">AAC 저장</button>
          </form>
          <div className="ai-creation-form card-base">
            <h4>AI로 생성 (준비중)</h4>
            <div className="form-group">
              <label>이미지 설명 (프롬프트)</label>
              <input type="text" value={aacAiPrompt} onChange={(e) => setAacAiPrompt(e.target.value)} placeholder="예: 웃는 얼굴의 노란색 오리" />
            </div>
            <button onClick={() => handleAiGeneration(aacAiPrompt)} className="btn-soft-primary">AI로 생성하기</button>
          </div>
        </div>
      </section>

      {/* --- AAC 목록 및 묶음 생성 섹션 --- */}
      <section className="management-section card-base">
        <h3>📚 AAC 목록 (조회 및 삭제)</h3>
        <p>카드를 선택하여 하단의 버튼으로 묶음을 생성할 수 있습니다.</p>
        <div className="aac-list">
          {aacList.map(aac => (
            <div key={aac.id} className={`aac-card card-base ${selectedAacs.includes(aac.id) ? 'selected' : ''}`} onClick={() => handleSelectAacForBundle(aac.id)}>
              <input type="checkbox" className="card-checkbox" checked={selectedAacs.includes(aac.id)} readOnly />
              <img src={aac.image} alt={`${aac.text} 이미지`} />
              <div className="card-content">
                <p><strong>{aac.category}:</strong> {aac.text}</p>
              </div>
              <button className="delete-btn" onClick={(e) => { e.stopPropagation(); handleDeleteAac(aac.id); }}>X</button>
            </div>
          ))}
        </div>
        <button onClick={handleCreateBundle} className="bundle-create-btn btn-soft-primary">
          선택된 카드로 묶음 생성 ({selectedAacs.length}/20)
        </button>
      </section>
      
      {/* --- 생성된 묶음 목록 섹션 --- */}
      <section className="management-section card-base">
        <h3>🗂️ 생성된 AAC 묶음</h3>
        <p>묶음을 클릭하여 상세 내용을 확인하세요.</p>
        {bundles.length > 0 ? (
          <ul className="bundle-list">
            {bundles.map(bundle => (
              <li 
                key={bundle.id}
                onClick={() => handleBundleClick(bundle.id)}
                className={bundle.id === selectedBundleId ? 'active-bundle' : ''}
              >
                {bundle.name} ({bundle.aacIds.length}개)
              </li>
            ))}
          </ul>
        ) : (
          <p>아직 생성된 묶음이 없습니다.</p>
        )}

        {/* --- 묶음 상세 보기 섹션 --- */}
        {selectedBundleDetails && (
          <div className="bundle-details card-base">
            <h4>'{selectedBundleDetails.name}' 묶음 상세 내용</h4>
            <div className="aac-list">
              {cardsInSelectedBundle.length > 0 ? cardsInSelectedBundle.map(aac => (
                <div key={aac.id} className="aac-card-readonly card-base">
                  <img src={aac.image} alt={`${aac.text} 이미지`} />
                  <div className="card-content">
                    <p><strong>{aac.category}:</strong> {aac.text}</p>
                  </div>
                </div>
              )) : (
                <p>묶음에 포함된 카드를 찾을 수 없습니다. 원본 카드가 삭제되었을 수 있습니다.</p>
              )}
            </div>
          </div>
        )}
      </section>
      
      {/* --- [추가] 필터 관리 섹션 --- */}
      <section className="management-section card-base">
        <h3>🎨 필터 생성/관리</h3>
        <div className="creation-area">
          <form onSubmit={handleCreateFilter} className="creation-form">
            <h4>직접 업로드</h4>
            <div className="form-group">
              <label>필터 이름</label>
              <input type="text" value={newFilterName} onChange={(e) => setNewFilterName(e.target.value)} placeholder="필터 이름 입력" required />
            </div>
            <div className="form-group">
              <label>필터 이미지 업로드</label>
              <input type="file" accept="image/*" onChange={(e) => setFilterImageFile(e.target.files[0])} required />
            </div>
            <button type="submit" className="btn-soft-primary">필터 저장</button>
          </form>
          <div className="ai-creation-form">
            <h4>AI로 생성 (준비중)</h4>
            <div className="form-group">
              <label>이미지 설명 (프롬프트)</label>
              <input type="text" value={filterAiPrompt} onChange={(e) => setFilterAiPrompt(e.target.value)} placeholder="생성할 필터 프롬프트 입력" />
            </div>
            <button onClick={() => handleAiGeneration(filterAiPrompt)} className="btn-soft-primary">AI로 생성하기</button>
          </div>
        </div>
        <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eee' }} />
        <h4>저장된 필터 목록</h4>
        <div className="filter-list">
          {filterList.length > 0 ? filterList.map(filter => (
            <div key={filter.id} className="filter-item card-base">
              <img src={filter.image} alt={filter.name} />
              <span>{filter.name}</span>
            </div>
          )) : <p>저장된 필터가 없습니다.</p>}
        </div>
      </section>
    </div>
  );
};

export default AACManagementPage;
