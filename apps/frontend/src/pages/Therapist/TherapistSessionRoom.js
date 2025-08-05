import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Alert, ListGroup } from 'react-bootstrap';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './TherapistSessionRoom.css';
import axios from 'axios';
import { Room, RoomEvent, createLocalTracks, RemoteParticipant, Track } from 'livekit-client';
import { useAuth } from '../../contexts/AuthContext';

const LIVEKIT_URL = 'wss://i13c107.p.ssafy.io:8443';

function TherapistSessionRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(true);
  const [rtcStatus, setRtcStatus] = useState('disconnected');
  const [showToolPanel, setShowToolPanel] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState(null);

  const [remoteVideoTrack, setRemoteVideoTrack] = useState(null);
  const [remoteAudioTrack, setRemoteAudioTrack] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const roomRef = useRef(null);

  const [sessionTools, setSessionTools] = useState([]);
  const [fairyTaleInfo, setFairyTaleInfo] = useState(null);
  const [fairyTaleContent, setFairyTaleContent] = useState({});
  const [currentFairyTalePage, setCurrentFairyTalePage] = useState(1);
  const [selectedSentence, setSelectedSentence] = useState('');
  const [isFetchingSentences, setIsFetchingSentences] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const handleRemoteTrackMuted = (trackPublication, participant) => {
    if (trackPublication.kind === Track.Kind.Video) {
      setIsRemoteVideoOff(true);
    }
  };

  const handleRemoteTrackUnmuted = (trackPublication, participant) => {
    if (trackPublication.kind === Track.Kind.Video) {
      setIsRemoteVideoOff(false);
    }
  };

  const connectToLiveKit = useCallback(async () => {
    if (!user) return;

    setRtcStatus('connecting');

    const room = new Room({ adaptiveStream: true, dynacast: true });
    roomRef.current = room;

    room.on(RoomEvent.Connected, () => setRtcStatus('connected'));
    room.on(RoomEvent.Disconnected, () => setRtcStatus('disconnected'));

    room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      if (track.kind === 'video') {
        setRemoteVideoTrack(track);
        setIsRemoteVideoOff(false);
        participant.on(RoomEvent.TrackMuted, handleRemoteTrackMuted);
        participant.on(RoomEvent.TrackUnmuted, handleRemoteTrackUnmuted);
      } else if (track.kind === 'audio') {
        setRemoteAudioTrack(track);
      }
    });

    room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
      if (track.kind === 'video') {
        track.detach();
        setRemoteVideoTrack(null);
        setIsRemoteVideoOff(true);
        participant.off(RoomEvent.TrackMuted, handleRemoteTrackMuted);
        participant.off(RoomEvent.TrackUnmuted, handleRemoteTrackUnmuted);
      } else if (track.kind === 'audio') {
        track.detach();
        setRemoteAudioTrack(null);
      }
    });

    room.on(RoomEvent.DataReceived, (payload, participant) => {
      const decoder = new TextDecoder();
      const data = JSON.parse(decoder.decode(payload));
      if (data.type === 'chat') {
        setChatMessages(prevMessages => [...prevMessages, { sender: participant.identity, message: data.payload }]);
      } else if (data.type === 'sentence') {
        setSelectedSentence(data.payload);
      }
    });

    try {
      const response = await axios.post('/api/v1/sessions/room', { clientId: 2 }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.accessToken}`
        }
      });
      const token = response.data.token;

      await room.connect(LIVEKIT_URL, token);

      const localTracks = await createLocalTracks({ audio: true, video: true });
      for (const track of localTracks) {
        if (track.kind === 'video' && localVideoRef.current) {
          track.attach(localVideoRef.current);
        }
        await room.localParticipant.publishTrack(track);
      }
    } catch (error) {
      console.error('LiveKit 연결 실패:', error);
      setRtcStatus('error');
      alert('LiveKit 연결에 실패했습니다. 콘솔을 확인해주세요.');
    }
  }, [user]);

  useEffect(() => {
    return () => roomRef.current?.disconnect();
  }, []);

  useEffect(() => {
    if (remoteVideoTrack && remoteVideoRef.current) {
      remoteVideoTrack.attach(remoteVideoRef.current);
    }
    return () => {
      if (remoteVideoTrack) {
        remoteVideoTrack.detach();
      }
    };
  }, [remoteVideoTrack]);

  useEffect(() => {
    if (remoteAudioTrack && remoteAudioRef.current) {
      remoteAudioTrack.attach(remoteAudioRef.current);
    }
    return () => {
      if (remoteAudioTrack) {
        remoteAudioTrack.detach();
      }
    };
  }, [remoteAudioTrack]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tools = queryParams.get('tools')?.split(',') || [];
    setSessionTools(tools);

    const title = queryParams.get('fairyTaleTitle');
    if (title) {
      setFairyTaleInfo({
        title,
        classification: queryParams.get('fairyTaleClassification'),
        startPage: parseInt(queryParams.get('startPage'), 10),
        endPage: parseInt(queryParams.get('endPage'), 10),
      });
      setCurrentFairyTalePage(parseInt(queryParams.get('startPage'), 10));
    }
  }, [location.search]);

  useEffect(() => {
    if (!fairyTaleInfo || !fairyTaleInfo.title) return;

    const fetchSentences = async (page) => {
      if (fairyTaleContent[page]) return;
      setIsFetchingSentences(true);
      try {
        const response = await axios.get('/api/v1/storybooks/sentences', {
          params: { ...fairyTaleInfo, page },
        });
        setFairyTaleContent(prev => ({ ...prev, [page]: [...new Set(response.data.sentences.map(s => s.sentence))] }));
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error);
      } finally {
        setIsFetchingSentences(false);
      }
    };

    fetchSentences(currentFairyTalePage);
  }, [fairyTaleInfo, currentFairyTalePage]);

  const toggleMute = () => roomRef.current?.localParticipant.setMicrophoneEnabled(!isMuted, { stopMicTrack: false }).then(() => setIsMuted(!isMuted));
  const toggleVideo = () => roomRef.current?.localParticipant.setCameraEnabled(!isVideoOff).then(() => setIsVideoOff(!isVideoOff));

  const endSession = () => {
    if (window.confirm('정말로 수업을 종료하시겠습니까?')) {
      navigate('/therapist/mypage/schedule');
    }
  };

  const toggleToolPanel = (toolType) => {
    setShowToolPanel(prev => prev && activeToolTab === toolType ? false : true);
    setActiveToolTab(toolType);
  };

  const handlePageChange = (newPage) => {
    if (fairyTaleInfo && newPage >= fairyTaleInfo.startPage && newPage <= fairyTaleInfo.endPage) {
      setCurrentFairyTalePage(newPage);
    }
  };

  const sendSentence = async () => {
    if (roomRef.current && selectedSentence) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify({ type: 'sentence', payload: selectedSentence }));
        await roomRef.current.localParticipant.publishData(data, { reliable: true });
        alert('문장을 전송했습니다.');
      } catch (error) {
        console.error('Failed to send sentence:', error);
        alert('문장 전송에 실패했습니다.');
      }
    }
  };

  const sendChatMessage = async () => {
    if (roomRef.current && chatInput.trim() !== '') {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify({ type: 'chat', payload: chatInput }));
        await roomRef.current.localParticipant.publishData(data, { reliable: true });
        setChatMessages(prevMessages => [...prevMessages, { sender: '나', message: chatInput }]);
        setChatInput('');
      } catch (error) {
        console.error('Failed to send chat message:', error);
        alert('채팅 메시지 전송에 실패했습니다.');
      }
    }
  };

  const renderContent = () => {
    switch (rtcStatus) {
      case 'disconnected':
        return (
          <div className="join-container">
            <h2 className="mb-4">수업을 시작할 준비가 되셨나요?</h2>
            <Button variant="primary" size="lg" onClick={connectToLiveKit}>
              <i className="bi bi-box-arrow-in-right me-2"></i>수업 시작하기
            </Button>
          </div>
        );
      case 'connecting':
        return (
          <div className="join-container">
            <h2 className="mb-4">수업 세션에 연결 중입니다...</h2>
            <p>잠시만 기다려주세요.</p>
          </div>
        );
      case 'error':
        return (
          <div className="join-container">
            <Alert variant="danger">
              <Alert.Heading>연결 오류</Alert.Heading>
              <p>세션에 연결하지 못했습니다. 네트워크 상태를 확인하시거나 잠시 후 다시 시도해주세요.</p>
            </Alert>
            <Button variant="primary" onClick={() => setRtcStatus('disconnected')}>
              다시 시도
            </Button>
          </div>
        );
      case 'connected':
        return (
          <>
            {remoteAudioTrack && <audio ref={remoteAudioRef} autoPlay />}
            <Row className="h-100 flex-nowrap">
              <Col className={`session-main-content ${showToolPanel ? 'col-md-9' : 'col-md-12'} p-0`}>
                <div className="main-video-area">
                  <div className="main-video-container">
                    <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
                    {isRemoteVideoOff && (
                      <div className="video-overlay-text">
                        <i className="bi bi-camera-video-off-fill" style={{ fontSize: '3em' }}></i>
                        <p>사용자 카메라 꺼짐</p>
                      </div>
                    )}
                  </div>

                  <div className="pip-video-container">
                    <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
                    {isVideoOff && (
                      <div className="text-center video-overlay-text">
                        <i className="bi bi-camera-video-off-fill" style={{ fontSize: '1.5em' }}></i>
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
                      <Button variant={activeToolTab === 'chat' ? "warning" : "light"} className="control-button me-3" onClick={() => toggleToolPanel('chat')}>
                          <i className="bi bi-chat-right-text-fill"></i>
                          <span>채팅</span>
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
                      <h5 className="mb-0">{activeToolTab === 'aac' ? 'AAC 도구' : activeToolTab === 'filter' ? '필터 도구' : activeToolTab === 'chat' ? '' : '동화 도구'}</h5>
                      <Button variant="light" size="sm" onClick={() => setShowToolPanel(false)}>&times;</Button>
                    </Card.Header>
                    <Card.Body className="p-2">
                      {activeToolTab === 'aac' && ( <Alert variant="info" className="text-center m-2">AAC 도구 기능 구현 예정</Alert> )}
                      {activeToolTab === 'filter' && ( <Alert variant="info" className="text-center m-2">필터 도구 기능 구현 예정</Alert> )}
                      {activeToolTab === 'chat' && (
                        <div className="chat-panel d-flex flex-column h-100">
                          <div className="chat-messages flex-grow-1 overflow-auto p-2">
                            {chatMessages.map((msg, index) => (
                              <div key={index} className={`chat-message ${msg.sender === '나' ? 'my-message' : 'other-message'}`}>
                                <strong>{msg.sender}:</strong> {msg.message}
                              </div>
                            ))}
                          </div>
                          <div className="chat-input-area p-2 border-top">
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="메시지를 입력하세요..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    sendChatMessage();
                                  }
                                }}
                              />
                              <Button variant="primary" onClick={sendChatMessage}>
                                전송
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      {activeToolTab === 'fairyTale' && fairyTaleInfo && (
                        <ListGroup variant="flush">
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
                              <Button variant="outline-secondary" onClick={() => handlePageChange(currentFairyTalePage - 1)} disabled={currentFairyTalePage <= fairyTaleInfo.startPage}>
                                이전 페이지
                              </Button>
                              <Button variant="outline-secondary" onClick={() => handlePageChange(currentFairyTalePage + 1)} disabled={currentFairyTalePage >= fairyTaleInfo.endPage}>
                                다음 페이지
                              </Button>
                            </div>
                            {selectedSentence && (
                              <div className="mt-3">
                                <Alert variant="success" className="text-center">
                                  선택된 문장: <strong>{selectedSentence}</strong>
                                </Alert>
                                <div className="d-grid">
                                  <Button variant="primary" onClick={sendSentence}>
                                    <i className="bi bi-send-fill me-2"></i>선택한 문장 전송
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </ListGroup>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Container fluid className="session-room-container">
      {renderContent()}
    </Container>
  );
}

export default TherapistSessionRoom;
