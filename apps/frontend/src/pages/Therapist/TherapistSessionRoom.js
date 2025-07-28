// src/pages/Therapist/TherapistSessionRoom.js
import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, ListGroup, Image } from 'react-bootstrap';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './TherapistSessionRoom.css'; // CSS 파일을 위한 임포트

// Agora SDK 임포트 (현재는 비활성화됨)
// const AgoraRTC = window.AgoraRTC; 

function TherapistSessionRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedToolIds, setSelectedToolIds] = useState([]);
  const [sessionToolsDetails, setSessionToolsDetails] = useState([]);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [rtcStatus, setRtcStatus] = useState('disconnected'); // Agora 연결 없이 UI만 확인하기 위해 'disconnected'로 설정

  const [showToolPanel, setShowToolPanel] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState(null);

  const localPlayerRef = useRef(null);
  const remotePlayerRef = useRef(null);

  const agoraClientRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const localVideoTrackRef = useRef(null);
  const remoteUsersRef = useRef({});

  // Dummy Fairy Tale Data
  const dummyFairyTales = [
    {
      id: 'ft1',
      title: '아기 돼지 삼형제',
      totalPages: 3,
      pages: [
        {
          page: 1,
          content: [
            '옛날 옛날 아주 먼 옛날에, 아기 돼지 삼형제가 살았어요.',
            '첫째 돼지는 게을러서 지푸라기로 집을 지었어요.',
            '둘째 돼지는 조금 더 부지런해서 나무로 집을 지었죠.',
          ],
        },
        {
          page: 2,
          content: [
            '어느 날, 무서운 늑대가 나타나 첫째 돼지의 집을 후 불어 날려버렸어요.',
            '첫째 돼지는 둘째 돼지의 집으로 도망쳤어요.',
            '늑대는 다시 둘째 돼지의 집을 후 불어 날려버렸죠.',
          ],
        },
        {
          page: 3,
          content: [
            '셋째 돼지는 아주 부지런하고 똑똑해서 벽돌로 튼튼한 집을 지었어요.',
            '늑대는 셋째 돼지의 집을 아무리 불어도 날려버릴 수 없었어요.',
            '결국 늑대는 굴뚝으로 들어오려다 뜨거운 물에 빠져 도망갔답니다.',
            '아기 돼지 삼형제는 행복하게 살았어요.',
          ],
        },
      ],
    },
    {
      id: 'ft2',
      title: '흥부와 놀부',
      totalPages: 2,
      pages: [
        {
          page: 1,
          content: [
            '옛날 옛날에 흥부와 놀부 형제가 살았어요.',
            '흥부는 마음씨 착한 동생이었고, 놀부는 욕심 많은 형이었죠.',
            '어느 날 흥부가 다친 제비를 치료해주었어요.',
          ],
        },
        {
          page: 2,
          content: [
            '제비는 흥부에게 박씨를 물어다 주었고, 그 박에서 보물이 나왔어요.',
            '놀부는 이를 보고 욕심이 나서 일부러 제비를 다치게 했어요.',
            '하지만 놀부의 박에서는 도깨비가 나와 놀부를 혼내주었답니다.',
          ],
        },
      ],
    },
  ];

  const dummyAllIndividualTools = [
    { id: 'aac1', type: 'AAC', name: '그림카드 세트 A', description: '다양한 사물, 동물 그림 카드 (50장)', category: '어휘', lastModified: '2025-07-20', imageUrl: 'https://via.placeholder.com/100x100?text=AAC_Card1' },
    { id: 'aac2', type: 'AAC', name: '문장 구성 보드', description: '주어-동사-목적어 연습 보드', category: '문법', lastModified: '2025-07-18', imageUrl: 'https://via.placeholder.com/100x100?text=AAC_Board' },
    { id: 'aac3', type: 'AAC', name: '단어 확장 게임', description: '유사어/반의어 연결 게임', category: '어휘', lastModified: '2025-07-23', imageUrl: 'https://via.placeholder.com/100x100?text=AAC_Game' },
    { id: 'filter1', type: 'Filter', name: '강아지 귀 필터', description: '화상 캠에 강아지 귀를 추가합니다.', category: '동물', lastModified: '2025-07-22', imageUrl: 'https://via.placeholder.com/100x100?text=Filter_Dog' },
    { id: 'filter2', type: 'Filter', name: '왕관 필터', description: '화상 캠에 반짝이는 왕관을 추가합니다.', category: '액세서리', lastModified: '2025-07-21', imageUrl: 'https://via.placeholder.com/100x100?text=Filter_Crown' },
    { id: 'filter3', type: 'Filter', name: '안경 필터', description: '다양한 디자인의 안경을 씌웁니다.', category: '의상', lastModified: '2025-07-24', imageUrl: 'https://via.placeholder.com/100x100?text=Filter_Glasses' },
  ];

  const [selectedFairyTale, setSelectedFairyTale] = useState(null);
  const [currentFairyTalePage, setCurrentFairyTalePage] = useState(1);
  const [selectedSentence, setSelectedSentence] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const toolsParam = queryParams.get('tools');
    const fairyTaleId = queryParams.get('fairyTaleId');
    const startPage = queryParams.get('startPage');
    const endPage = queryParams.get('endPage');

    if (toolsParam) {
      const ids = toolsParam.split(',');
      setSelectedToolIds(ids);
      const details = ids.map(id => dummyAllIndividualTools.find(tool => tool.id === id)).filter(Boolean);
      setSessionToolsDetails(details);
    }

    if (fairyTaleId) {
      const foundFairyTale = dummyFairyTales.find(ft => ft.id === fairyTaleId);
      if (foundFairyTale) {
        setSelectedFairyTale(foundFairyTale);
        // Set current page to startPage if provided, otherwise 1
        setCurrentFairyTalePage(startPage ? parseInt(startPage) : 1);
      }
    }
    // Agora SDK 관련 초기화 로직 모두 주석 처리
    // return cleanup logic도 주석 처리
  }, [roomId, location.search]);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    console.log(`오디오 ${isMuted ? '음소거 해제' : '음소거'}`);
  };

  const toggleVideo = () => {
    setIsVideoOff(prev => !prev);
    console.log(`비디오 ${isVideoOff ? '켜기' : '끄기'}`);
  };

  const endSession = () => {
    if (window.confirm('정말로 수업을 종료하시겠습니까?')) {
      console.log(`RTC Session Room ${roomId} 수업 종료 (Agora 비활성 상태)`);
      setRtcStatus('disconnected');
      navigate('/therapist/mypage/schedule');
    }
  };

  const toggleToolPanel = (toolType) => {
      if (showToolPanel && activeToolTab === toolType) {
          setShowToolPanel(false);
          setActiveToolTab(null);
      } else {
          setActiveToolTab(toolType);
          setShowToolPanel(true);
      }
  };

  const aacTools = dummyAllIndividualTools.filter(tool => tool.type === 'AAC');
  const filterTools = dummyAllIndividualTools.filter(tool => tool.type === 'Filter');


  return (
    <Container fluid className="session-room-container">
      <Row className="h-100 flex-nowrap">
        <Col className={`session-main-content ${showToolPanel ? 'col-md-9' : 'col-md-12'} p-0`}>
          <div className="main-video-area">
            {/* 원격 내담자 비디오 (크게) */}
            <div 
              id="remote-player-name" 
              className="main-video-container" 
              ref={remotePlayerRef}
              // ✨ 인라인 스타일 제거 - CSS 파일에서 관리하도록 ✨
            >
              <div className="video-overlay-text">
                <i className="bi bi-person-fill" style={{ fontSize: '3em' }}></i>
                <p>내담자 비디오</p>
                <small>(캠 연결 비활성화)</small>
              </div>
            </div>

            {/* 로컬 치료사 비디오 (PIP 모드) */}
            <div 
              id="local-player-name" 
              className="pip-video-container" 
              ref={localPlayerRef}
              // ✨ 인라인 스타일 제거 - CSS 파일에서 관리하도록 ✨
            >
              {isVideoOff ? (
                <div className="text-center video-overlay-text">
                  <i className="bi bi-camera-video-off-fill" style={{ fontSize: '1.5em' }}></i>
                  <p>내 비디오 꺼짐</p>
                </div>
              ) : (
                <div className="text-center video-overlay-text">
                  <i className="bi bi-person-fill" style={{ fontSize: '1.5em' }}></i>
                  <p>내 비디오</p>
                  <small>(캠 연결 비활성화)</small>
                </div>
              )}
            </div>
          </div>

          {selectedSentence && (
            <div className="selected-sentence-display text-center p-2 mb-3" style={{ backgroundColor: '#e9ecef', borderRadius: '5px', fontSize: '1.2em', fontWeight: 'bold' }}>
              {selectedSentence}
            </div>
          )}

          <div className="control-panel">
            <div className="d-flex align-items-center justify-content-center h-100">
                <Button 
                    variant={isMuted ? "danger" : "light"} 
                    className="control-button me-3" 
                    onClick={toggleMute}
                >
                    <i className={`bi bi-mic${isMuted ? "-mute-fill" : "-fill"}`}></i>
                    <span>음소거</span> {/* 텍스트 추가 */}
                </Button>
                <Button 
                    variant={isVideoOff ? "danger" : "light"} 
                    className="control-button me-3" 
                    onClick={toggleVideo}
                >
                    <i className={`bi bi-camera-video${isVideoOff ? "-off-fill" : "-fill"}`}></i>
                    <span>캠 끄기</span> {/* 텍스트 추가 */}
                </Button>
                <Button 
                    variant={activeToolTab === 'aac' ? "primary" : "light"} 
                    className="control-button me-3" 
                    onClick={() => toggleToolPanel('aac')}
                >
                    <i className="bi bi-chat-dots-fill"></i>
                    <span>AAC</span> {/* 텍스트 수정 */}
                </Button>
                <Button 
                    variant={activeToolTab === 'filter' ? "success" : "light"} 
                    className="control-button me-3" 
                    onClick={() => toggleToolPanel('filter')}
                >
                    <i className="bi bi-stars"></i>
                    <span>필터</span> {/* 텍스트 수정 */}
                </Button>
                <Button 
                    variant={activeToolTab === 'fairyTale' ? "info" : "light"} 
                    className="control-button me-3" 
                    onClick={() => toggleToolPanel('fairyTale')}
                >
                    <i className="bi bi-book-fill"></i>
                    <span>동화</span> {/* 동화 버튼 추가 */}
                </Button>
                <Button variant="danger" className="control-button ms-auto" onClick={endSession}>
                    <i className="bi bi-x-circle-fill" style={{ fontSize: '1.5em' }}></i>
                    <span>수업 종료</span> {/* 텍스트 추가 */}
                </Button>
            </div>
          </div>
        </Col>

        {showToolPanel && (
          <Col md={3} className="tool-panel p-0">
            <Card className="h-100 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{activeToolTab === 'aac' ? 'AAC 도구' : activeToolTab === 'filter' ? '필터 도구' : '동화 도구'}</h5>
                <Button variant="light" size="sm" onClick={() => setShowToolPanel(false)}>
                  &times;
                </Button>
              </Card.Header>
              <Card.Body className="p-2">
                <ListGroup variant="flush">
                  {activeToolTab === 'aac' && (
                    aacTools.length > 0 ? (
                      aacTools.map(tool => (
                        <ListGroup.Item key={tool.id} action>
                          <div className="d-flex align-items-center">
                            <Image src={tool.imageUrl} alt={tool.name} fluid roundedCircle style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }} />
                            <div>
                              <strong>{tool.name}</strong>
                              <small className="d-block text-muted">{tool.description}</small>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))
                    ) : (
                      <Alert variant="info" className="text-center m-2">등록된 AAC 도구가 없습니다.</Alert>
                    )
                  )}
                  {activeToolTab === 'filter' && (
                    filterTools.length > 0 ? (
                      filterTools.map(tool => (
                        <ListGroup.Item key={tool.id} action>
                          <div className="d-flex align-items-center">
                            <Image src={tool.imageUrl} alt={tool.name} fluid roundedCircle style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }} />
                            <div>
                              <strong>{tool.name}</strong>
                              <small className="d-block text-muted">{tool.description}</small>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))
                    ) : (
                      <Alert variant="info" className="text-center m-2">등록된 필터 도구가 없습니다.</Alert>
                    )
                  )}
                  {activeToolTab === 'fairyTale' && (
                    selectedFairyTale ? (
                      <div className="p-2">
                        <h6 className="text-center mb-3">{selectedFairyTale.title} (페이지 {currentFairyTalePage}/{selectedFairyTale.totalPages})</h6>
                        <ListGroup className="mb-3">
                          {selectedFairyTale.pages.find(p => p.page === currentFairyTalePage)?.content.map((sentence, index) => (
                            <ListGroup.Item
                              key={index}
                              action
                              onClick={() => setSelectedSentence(prev => prev === sentence ? '' : sentence)}
                              active={selectedSentence === sentence}
                              className="fairy-tale-sentence"
                            >
                              {sentence}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                        <div className="d-flex justify-content-between">
                          <Button
                            variant="outline-secondary"
                            onClick={() => setCurrentFairyTalePage(prev => Math.max(1, prev - 1))}
                            disabled={currentFairyTalePage === 1}
                          >
                            이전 페이지
                          </Button>
                          <Button
                            variant="outline-secondary"
                            onClick={() => setCurrentFairyTalePage(prev => Math.min(selectedFairyTale.totalPages, prev + 1))}
                            disabled={currentFairyTalePage === selectedFairyTale.totalPages}
                          >
                            다음 페이지
                          </Button>
                        </div>
                        {selectedSentence && (
                          <Alert variant="success" className="mt-3 text-center">
                            선택된 문장: <strong>{selectedSentence}</strong>
                          </Alert>
                        )}
                      </div>
                    ) : (
                      <Alert variant="info" className="text-center m-2">선택된 동화가 없습니다. 수업 시작 시 동화를 선택해주세요.</Alert>
                    )
                  )}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  );
}

export default TherapistSessionRoom;