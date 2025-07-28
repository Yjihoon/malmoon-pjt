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

  const dummyAllIndividualTools = [
    { id: 'aac1', type: 'AAC', name: '그림카드 세트 A', description: '다양한 사물, 동물 그림 카드 (50장)', category: '어휘', lastModified: '2025-07-20', imageUrl: 'https://via.placeholder.com/100x100?text=AAC_Card1' },
    { id: 'aac2', type: 'AAC', name: '문장 구성 보드', description: '주어-동사-목적어 연습 보드', category: '문법', lastModified: '2025-07-18', imageUrl: 'https://via.placeholder.com/100x100?text=AAC_Board' },
    { id: 'aac3', type: 'AAC', name: '단어 확장 게임', description: '유사어/반의어 연결 게임', category: '어휘', lastModified: '2025-07-23', imageUrl: 'https://via.placeholder.com/100x100?text=AAC_Game' },
    { id: 'filter1', type: 'Filter', name: '강아지 귀 필터', description: '화상 캠에 강아지 귀를 추가합니다.', category: '동물', lastModified: '2025-07-22', imageUrl: 'https://via.placeholder.com/100x100?text=Filter_Dog' },
    { id: 'filter2', type: 'Filter', name: '왕관 필터', description: '화상 캠에 반짝이는 왕관을 추가합니다.', category: '액세서리', lastModified: '2025-07-21', imageUrl: 'https://via.placeholder.com/100x100?text=Filter_Crown' },
    { id: 'filter3', type: 'Filter', name: '안경 필터', description: '다양한 디자인의 안경을 씌웁니다.', category: '의상', lastModified: '2025-07-24', imageUrl: 'https://via.placeholder.com/100x100?text=Filter_Glasses' },
  ];

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const toolsParam = queryParams.get('tools');

    if (toolsParam) {
      const ids = toolsParam.split(',');
      setSelectedToolIds(ids);
      const details = ids.map(id => dummyAllIndividualTools.find(tool => tool.id === id)).filter(Boolean);
      setSessionToolsDetails(details);
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
                <Button variant="danger" className="control-button ms-auto" onClick={endSession}>
                    <i className="bi bi-x-circle-fill"></i>
                    <span>수업 종료</span> {/* 텍스트 추가 */}
                </Button>
            </div>
          </div>
        </Col>

        {showToolPanel && (
          <Col md={3} className="tool-panel p-0">
            <Card className="h-100 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{activeToolTab === 'aac' ? 'AAC 도구' : '필터 도구'}</h5>
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