// frontend/src/pages/Therapist/TherapistSessionRoom.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Alert, ListGroup, Image } from 'react-bootstrap';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './TherapistSessionRoom.css';
import { signalingService } from '../../services/signalingService';

// STUN 서버 설정
const pcConfig = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

function TherapistSessionRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [rtcStatus, setRtcStatus] = useState('disconnected');

  const [showToolPanel, setShowToolPanel] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const pcRef = useRef(null); // RTCPeerConnection 참조

  // 더미 데이터
  const dummyFairyTales = [
    {
      id: 'ft1',
      title: '아기 돼지 삼형제',
      totalPages: 3,
      pages: [
        { page: 1, content: ['옛날 옛날 아주 먼 옛날에, 아기 돼지 삼형제가 살았어요.', '첫째 돼지는 게을러서 지푸라기로 집을 지었어요.', '둘째 돼지는 조금 더 부지런해서 나무로 집을 지었죠.'] },
        { page: 2, content: ['어느 날, 무서운 늑대가 나타나 첫째 돼지의 집을 후 불어 날려버렸어요.', '첫째 돼지는 둘째 돼지의 집으로 도망쳤어요.', '늑대는 다시 둘째 돼지의 집을 후 불어 날려버렸죠.'] },
        { page: 3, content: ['셋째 돼지는 아주 부지런하고 똑똑해서 벽돌로 튼튼한 집을 지었어요.', '늑대는 셋째 돼지의 집을 아무리 불어도 날려버릴 수 없었어요.', '결국 늑대는 굴뚝으로 들어오려다 뜨거운 물에 빠져 도망갔답니다.', '아기 돼지 삼형제는 행복하게 살았어요.'] },
      ],
    },
  ];
  const dummyAllIndividualTools = [
    { id: 'aac1', type: 'AAC', name: '그림카드 세트 A', description: '다양한 사물, 동물 그림 카드 (50장)', category: '어휘', lastModified: '2025-07-20', imageUrl: 'https://via.placeholder.com/100x100?text=AAC_Card1' },
    { id: 'filter1', type: 'Filter', name: '강아지 귀 필터', description: '화상 캠에 강아지 귀를 추가합니다.', category: '동물', lastModified: '2025-07-22', imageUrl: 'https://via.placeholder.com/100x100?text=Filter_Dog' },
  ];

  const [selectedFairyTale, setSelectedFairyTale] = useState(null);
  const [currentFairyTalePage, setCurrentFairyTalePage] = useState(1);
  const [selectedSentence, setSelectedSentence] = useState('');

  const createPeerConnection = useCallback(() => {
    try {
      const pc = new RTCPeerConnection(pcConfig);

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('ICE 후보 전송 중');
          signalingService.send('candidate', event.candidate);
        }
      };

      pc.ontrack = (event) => {
        console.log('원격 트랙 수신');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log(`ICE 연결 상태 변경: ${pc.iceConnectionState}`);
        if(pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
            setRtcStatus('connected');
        }
      };

      console.log('RTCPeerConnection 생성됨');
      return pc;
    } catch (error) {
      console.error('PeerConnection 생성 실패.', error);
      return null;
    }
  }, []);

  const handleSignalingMessage = useCallback(async (message) => {
    if (!pcRef.current) {
      console.error("PeerConnection이 초기화되지 않았습니다!");
      return;
    }
  
    const { type, data } = message;
    console.log(`시그널링 메시지 수신: ${type}`);
  
    try {
      if (type === 'offer') {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        signalingService.send('answer', answer);
      } else if (type === 'answer') {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data));
      } else if (type === 'candidate') {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(data));
      }
    } catch (error) {
      console.error('시그널링 메시지 처리 오류:', error);
    }
  }, []);

  // 미디어 및 시그널링 초기화
  useEffect(() => {
    signalingService.connect(roomId);
    signalingService.onMessage = handleSignalingMessage;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        console.log("사용자 미디어 스트림 확보");
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        localStreamRef.current = stream;

        // PeerConnection 초기화
        pcRef.current = createPeerConnection();
        if (pcRef.current && localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => {
            pcRef.current.addTrack(track, localStreamRef.current);
          });
        }
      })
      .catch(error => {
        console.error("미디어 장치 접근 오류.", error);
        setRtcStatus('error');
        alert("카메라와 마이크 접근에 실패했습니다. 권한을 확인해주세요.");
      });

    return () => {
      signalingService.disconnect();
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [roomId, createPeerConnection, handleSignalingMessage]);

  // URL에서 도구 및 동화 로딩을 위한 효과
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const fairyTaleId = queryParams.get('fairyTaleId');
    if (fairyTaleId) {
      const foundFairyTale = dummyFairyTales.find(ft => ft.id === fairyTaleId);
      if (foundFairyTale) {
        setSelectedFairyTale(foundFairyTale);
        setCurrentFairyTalePage(queryParams.get('startPage') ? parseInt(queryParams.get('startPage'), 10) : 1);
      }
    }
  }, [location.search]);

  const startCall = async () => {
    if (pcRef.current) {
      try {
        console.log("오퍼 생성 중...");
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        signalingService.send('offer', offer);
      } catch (error) {
        console.error("오퍼 생성 오류:", error);
      }
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const newMutedState = !isMuted;
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !newMutedState;
      });
      setIsMuted(newMutedState);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const newVideoOffState = !isVideoOff;
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !newVideoOffState;
      });
      setIsVideoOff(newVideoOffState);
    }
  };

  const endSession = () => {
    if (window.confirm('정말로 수업을 종료하시겠습니까?')) {
      // 정리는 useEffect 반환 함수에서 처리됩니다.
      navigate('/therapist/mypage/schedule');
    }
  };

  const toggleToolPanel = (toolType) => {
      setShowToolPanel(prev => prev && activeToolTab === toolType ? false : true);
      setActiveToolTab(toolType);
  };

  const aacTools = dummyAllIndividualTools.filter(tool => tool.type === 'AAC');
  const filterTools = dummyAllIndividualTools.filter(tool => tool.type === 'Filter');

  return (
    <Container fluid className="session-room-container">
      <Row className="h-100 flex-nowrap">
        <Col className={`session-main-content ${showToolPanel ? 'col-md-9' : 'col-md-12'} p-0`}>
          <div className="main-video-area">
            <div className="main-video-container">
              <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
              <div className="video-overlay-text">
                <i className="bi bi-person-fill" style={{ fontSize: '3em' }}></i>
                <p>내담자 화면</p>
                {rtcStatus !== 'connected' && <small>(연결 대기중...)</small>}
              </div>
            </div>

            <div className="pip-video-container">
              <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
              {isVideoOff && (
                <div className="text-center video-overlay-text">
                  <i className="bi bi-camera-video-off-fill" style={{ fontSize: '1.5em' }}></i>
                  <p>내 비디오 꺼짐</p>
                </div>
              )}
            </div>
          </div>

          {selectedSentence && (
            <div className="selected-sentence-display text-center p-2 mb-3">
              {selectedSentence}
            </div>
          )}

          <div className="control-panel">
            <div className="d-flex align-items-center justify-content-center h-100">
                <Button variant="info" className="control-button me-3" onClick={startCall}>
                    <i className="bi bi-telephone-outbound-fill"></i>
                    <span>연결 시작</span>
                </Button>
                <Button variant={isMuted ? "danger" : "light"} className="control-button me-3" onClick={toggleMute}>
                    <i className={`bi bi-mic${isMuted ? "-mute-fill" : "-fill"}`}></i>
                    <span>음소거</span>
                </Button>
                <Button variant={isVideoOff ? "danger" : "light"} className="control-button me-3" onClick={toggleVideo}>
                    <i className={`bi bi-camera-video${isVideoOff ? "-off-fill" : "-fill"}`}></i>
                    <span>캠 끄기</span>
                </Button>
                <Button variant={activeToolTab === 'aac' ? "primary" : "light"} className="control-button me-3" onClick={() => toggleToolPanel('aac')}>
                    <i className="bi bi-chat-dots-fill"></i>
                    <span>AAC</span>
                </Button>
                <Button variant={activeToolTab === 'filter' ? "success" : "light"} className="control-button me-3" onClick={() => toggleToolPanel('filter')}>
                    <i className="bi bi-stars"></i>
                    <span>필터</span>
                </Button>
                <Button variant={activeToolTab === 'fairyTale' ? "info" : "light"} className="control-button me-3" onClick={() => toggleToolPanel('fairyTale')}>
                    <i className="bi bi-book-fill"></i>
                    <span>동화</span>
                </Button>
                <Button variant="danger" className="control-button ms-auto" onClick={endSession}>
                    <i className="bi bi-x-circle-fill" style={{ fontSize: '1.5em' }}></i>
                    <span>수업 종료</span>
                </Button>
            </div>
          </div>
        </Col>

        {showToolPanel && (
          <Col md={3} className="tool-panel p-0">
            <Card className="h-100 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{activeToolTab === 'aac' ? 'AAC 도구' : activeToolTab === 'filter' ? '필터 도구' : '동화 도구'}</h5>
                <Button variant="light" size="sm" onClick={() => setShowToolPanel(false)}>&times;</Button>
              </Card.Header>
              <Card.Body className="p-2">
                <ListGroup variant="flush">
                  {activeToolTab === 'aac' && ( aacTools.length > 0 ? aacTools.map(tool => ( <ListGroup.Item key={tool.id} action> <div className="d-flex align-items-center"> <Image src={tool.imageUrl} alt={tool.name} fluid roundedCircle style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }} /> <div> <strong>{tool.name}</strong> <small className="d-block text-muted">{tool.description}</small> </div> </div> </ListGroup.Item> )) : <Alert variant="info" className="text-center m-2">등록된 AAC 도구가 없습니다.</Alert> )}
                  {activeToolTab === 'filter' && ( filterTools.length > 0 ? filterTools.map(tool => ( <ListGroup.Item key={tool.id} action> <div className="d-flex align-items-center"> <Image src={tool.imageUrl} alt={tool.name} fluid roundedCircle style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }} /> <div> <strong>{tool.name}</strong> <small className="d-block text-muted">{tool.description}</small> </div> </div> </ListGroup.Item> )) : <Alert variant="info" className="text-center m-2">등록된 필터 도구가 없습니다.</Alert> )}
                  {activeToolTab === 'fairyTale' && ( selectedFairyTale ? ( <div className="p-2"> <h6 className="text-center mb-3">{selectedFairyTale.title} (페이지 {currentFairyTalePage}/{selectedFairyTale.totalPages})</h6> <ListGroup className="mb-3"> {selectedFairyTale.pages.find(p => p.page === currentFairyTalePage)?.content.map((sentence, index) => ( <ListGroup.Item key={index} action onClick={() => setSelectedSentence(prev => prev === sentence ? '' : sentence)} active={selectedSentence === sentence} className="fairy-tale-sentence"> {sentence} </ListGroup.Item> ))} </ListGroup> <div className="d-flex justify-content-between"> <Button variant="outline-secondary" onClick={() => setCurrentFairyTalePage(prev => Math.max(1, prev - 1))} disabled={currentFairyTalePage === 1}> 이전 페이지 </Button> <Button variant="outline-secondary" onClick={() => setCurrentFairyTalePage(prev => Math.min(selectedFairyTale.totalPages, prev + 1))} disabled={currentFairyTalePage === selectedFairyTale.totalPages}> 다음 페이지 </Button> </div> {selectedSentence && ( <Alert variant="success" className="mt-3 text-center"> 선택된 문장: <strong>{selectedSentence}</strong> </Alert> )} </div> ) : ( <Alert variant="info" className="text-center m-2">선택된 동화가 없습니다. 수업 시작 시 동화를 선택해주세요.</Alert> ) )}
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
