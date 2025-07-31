import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Alert, ListGroup, Image } from 'react-bootstrap';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './TherapistSessionRoom.css';
import { signalingService } from '../../services/signalingService';
import axios from 'axios';

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

  // 도구 및 동화책 데이터 상태
  const [sessionTools, setSessionTools] = useState([]);
  const [fairyTaleInfo, setFairyTaleInfo] = useState(null); // { title, classification, startPage, endPage }
  const [fairyTaleContent, setFairyTaleContent] = useState({}); // { pageNumber: [sentences] }
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

  // URL에서 도구 및 동화 정보 로딩
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tools = queryParams.get('tools')?.split(',') || [];
    setSessionTools(tools);

    const title = queryParams.get('fairyTaleTitle');
    const classification = queryParams.get('fairyTaleClassification');
    const startPage = queryParams.get('startPage');
    const endPage = queryParams.get('endPage');

    if (title && classification && startPage && endPage) {
      setFairyTaleInfo({
        title,
        classification,
        startPage: parseInt(startPage, 10),
        endPage: parseInt(endPage, 10),
      });
      setCurrentFairyTalePage(parseInt(startPage, 10));
    }
  }, [location.search]);

  const [isFetchingSentences, setIsFetchingSentences] = useState(false);

  // Effect to clear fairyTaleContent when fairyTaleInfo changes
  useEffect(() => {
    setFairyTaleContent({}); // Clear content when fairy tale info changes
    setSelectedSentence(''); // Clear selected sentence too
  }, [fairyTaleInfo]); // Run when fairyTaleInfo changes

  // Effect to fetch sentences
  useEffect(() => {
    if (!fairyTaleInfo || !fairyTaleInfo.title || isFetchingSentences) return;

    const fetchSentences = async (page) => {
      if (fairyTaleContent[page]) return; // Already fetched for this page

      setIsFetchingSentences(true); // Set fetching status to true
      try {
        const response = await axios.get('/api/v1/storybooks/sentences', {
          params: {
            classification: fairyTaleInfo.classification,
            title: fairyTaleInfo.title,
            page: page,
          },
        });
        setFairyTaleContent(prev => ({
          ...prev,
          [page]: Array.from(new Set(response.data.sentences.map(s => s.sentence)))
        }));
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error);
      } finally {
        setIsFetchingSentences(false); // Reset fetching status
      }
    };

    fetchSentences(currentFairyTalePage);

  }, [fairyTaleInfo, currentFairyTalePage, isFetchingSentences]); // Dependencies: only run when these change


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
      navigate('/therapist/mypage/schedule');
    }
  };

  const toggleToolPanel = (toolType) => {
      setShowToolPanel(prev => prev && activeToolTab === toolType ? false : true);
      setActiveToolTab(toolType);
  };

  const handleNextPage = () => {
    if (fairyTaleInfo && currentFairyTalePage < fairyTaleInfo.endPage) {
      setCurrentFairyTalePage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (fairyTaleInfo && currentFairyTalePage > fairyTaleInfo.startPage) {
      setCurrentFairyTalePage(prev => prev - 1);
    }
  };

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
                {fairyTaleInfo && (
                  <Button variant={activeToolTab === 'fairyTale' ? "info" : "light"} className="control-button me-3" onClick={() => toggleToolPanel('fairyTale')}>
                      <i className="bi bi-book-fill"></i>
                      <span>동화</span>
                  </Button>
                )}
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
                  {activeToolTab === 'aac' && ( <Alert variant="info" className="text-center m-2">AAC 도구 기능 구현 예정</Alert> )}
                  {activeToolTab === 'filter' && ( <Alert variant="info" className="text-center m-2">필터 도구 기능 구현 예정</Alert> )}
                  {activeToolTab === 'fairyTale' && fairyTaleInfo && (
                    <div className="p-2">
                      <h6 className="text-center mb-3">{fairyTaleInfo.title} (페이지 {currentFairyTalePage}/{fairyTaleInfo.endPage})</h6>
                      <ListGroup className="mb-3" style={{maxHeight: '400px', overflowY: 'auto'}}>
                        {fairyTaleContent[currentFairyTalePage] ? (
                          fairyTaleContent[currentFairyTalePage].map((sentence, index) => (
                            <ListGroup.Item
                              key={index}
                              action
                              onClick={() => setSelectedSentence(prev => prev === sentence ? '' : sentence)}
                              active={selectedSentence === sentence}
                              className="fairy-tale-sentence"
                            >
                              {sentence}
                            </ListGroup.Item>
                          ))
                        ) : (
                          <ListGroup.Item>페이지를 불러오는 중...</ListGroup.Item>
                        )}
                      </ListGroup>
                      <div className="d-flex justify-content-between">
                        <Button variant="outline-secondary" onClick={handlePrevPage} disabled={currentFairyTalePage <= fairyTaleInfo.startPage}>
                          이전 페이지
                        </Button>
                        <Button variant="outline-secondary" onClick={handleNextPage} disabled={currentFairyTalePage >= fairyTaleInfo.endPage}>
                          다음 페이지
                        </Button>
                      </div>
                      {selectedSentence && (
                        <Alert variant="success" className="mt-3 text-center">
                          선택된 문장: <strong>{selectedSentence}</strong>
                        </Alert>
                      )}
                    </div>
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

