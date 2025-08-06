import { bootstrapCameraKit } from "@snap/camera-kit";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Alert, ListGroup } from 'react-bootstrap';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './TherapistSessionRoom.css';
import axios from 'axios';
import { Room, RoomEvent, createLocalTracks, RemoteParticipant, Track, LocalVideoTrack } from 'livekit-client';
import { useAuth } from '../../contexts/AuthContext';

const LIVEKIT_URL = 'wss://i13c107.p.ssafy.io:8443';
const CAMERA_KIT_API_TOKEN = "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzU0MDQ4MTI2LCJzdWIiOiJlODY4YTg3Ny1jYjVkLTQyMWEtOGE5Zi02MzlkZjExMDAyNTJ-U1RBR0lOR35hZGM0OWFjMy02NTU5LTRmNTctOWQ4Ny0yNTRjYzkwZjNhYzAifQ.EqNFYVSRYv7iEBCTBM-bxGvDEYOYernbf3ozbEhzB6g";

function TherapistSessionRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(true);
  const [rtcStatus, setRtcStatus] = useState('disconnected');
  const [showToolPanel, setShowToolPanel] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState(null);

  const [remoteVideoTrack, setRemoteVideoTrack] = useState(null);
  const [remoteAudioTrack, setRemoteAudioTrack] = useState(null);

  const containerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const roomRef = useRef(null);
  const outputCanvasRef = useRef(null);
  const outputCKCanvasRef = useRef(null);
  const selfieSegmentationRef = useRef(null);
  const animationFrameRef = useRef(null);
  const cameraKitRef = useRef(null);
  const cameraKitSessionRef = useRef(null);

  const [isFilterActive, setIsFilterActive] = useState(false);
  const [useCameraKit, setUseCameraKit] = useState(false);
  const [backgroundImages, setBackgroundImages] = useState([]);
  const [selectedBackgroundImage, setSelectedBackgroundImage] = useState(null);

  const isFilterActiveRef = useRef(isFilterActive);
  const selectedBackgroundImageRef = useRef(selectedBackgroundImage);

  useEffect(() => {
    isFilterActiveRef.current = isFilterActive;
    selectedBackgroundImageRef.current = selectedBackgroundImage;
  }, [isFilterActive, selectedBackgroundImage]);

  const [sessionTools, setSessionTools] = useState([]);
  const [fairyTaleInfo, setFairyTaleInfo] = useState(null);
  const [fairyTaleContent, setFairyTaleContent] = useState({});
  const [currentFairyTalePage, setCurrentFairyTalePage] = useState(1);
  const [selectedSentence, setSelectedSentence] = useState('');
  const [isFetchingSentences, setIsFetchingSentences] = useState(false);

  const [isLiveKitReady, setIsLiveKitReady] = useState(false);

  const connectToLiveKit = useCallback(async () => {
    if (!user) return;
    setRtcStatus('connecting');
    const room = new Room({ adaptiveStream: true, dynacast: true });
    roomRef.current = room;

    setRtcStatus('connected')
    // room.on(RoomEvent.Connected, () => setRtcStatus('connected'));
    // room.on(RoomEvent.Disconnected, () => {
    //     setRtcStatus('disconnected');
    //     setIsLiveKitReady(false);
    // });

    room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      if (track.kind === 'video') {
        setRemoteVideoTrack(track);
        if (remoteVideoRef.current) track.attach(remoteVideoRef.current);
      } else if (track.kind === 'audio') {
        setRemoteAudioTrack(track);
        if (remoteAudioRef.current) track.attach(remoteAudioRef.current);
      }
    });

    room.on(RoomEvent.TrackUnsubscribed, (track) => track.detach());

    try {
      const response = await axios.post('/api/v1/sessions/room', { clientId: 2 }, {
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.accessToken}` }
      });
      const token = response.data.token;
      await room.connect(LIVEKIT_URL, token);

      const tracks = await createLocalTracks({ audio: true, video: true });
      for (const track of tracks) {
        if (track.kind === 'audio') {
          await room.localParticipant.publishTrack(track);
        } else if (track.kind === 'video') {
          if (localVideoRef.current) {
            track.attach(localVideoRef.current);
            await room.localParticipant.publishTrack(track);
          }
        }
      }
      console.log(room.localParticipant);
      setIsLiveKitReady(true);
    } catch (error) {
      console.error('LiveKit 연결 실패:', error);
      setRtcStatus('error');
      alert('LiveKit 연결에 실패했습니다. 콘솔을 확인해주세요.');
    }
  }, [user]);

  useEffect(() => {
    return () => {
      roomRef.current?.disconnect();
      if (cameraKitSessionRef.current) {
        cameraKitSessionRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (remoteVideoTrack && remoteVideoRef.current) {
      remoteVideoTrack.attach(remoteVideoRef.current);
    }
    return () => remoteVideoTrack?.detach();
  }, [remoteVideoTrack]);

  useEffect(() => {
    const fetchBackgroundImages = async () => {
      try {
        const placeholderImages = [
          { id: 1, name: '우주', url: '/bg.jpg' },
          { id: 2, name: '바다', url: 'https://storage.googleapis.com/storage.surim.org/backgrounds/ocean.jpg' },
          { id: 3, name: '숲', url: 'https://storage.googleapis.com/storage.surim.org/backgrounds/forest.jpg' },
          { id: 4, name: '교실', url: 'https://storage.googleapis.com/storage.surim.org/backgrounds/classroom.jpg' },
        ];
        setBackgroundImages(placeholderImages);
      } catch (error) {
        console.error("배경 이미지 로딩 실패:", error);
      }
    };
    if (rtcStatus === 'connected') fetchBackgroundImages();
  }, [rtcStatus]);

  useEffect(() => {
    if (!isLiveKitReady) return;

    const room = roomRef.current;
    if (!room || !room.localParticipant) return;

    if (useCameraKit) {
        if (selfieSegmentationRef.current) {
            selfieSegmentationRef.current.close();
            selfieSegmentationRef.current = null;
        }
        if(animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        room.localParticipant.videoTrackPublications.forEach(async (publication) => {
            if (publication.track && publication.track.name === 'canvas') {
                await room.localParticipant.unpublishTrack(publication.track, true);
            }
        });
        return;
    } else {
        if (cameraKitSessionRef.current) {
            cameraKitSessionRef.current.pause();
        }
        room.localParticipant.videoTrackPublications.forEach(async (publication) => {
            if (publication.track && publication.track.name === 'camera-kit') {
                await room.localParticipant.unpublishTrack(publication.track, true);
            }
        });
    }

    const videoElement = localVideoRef.current;
    const canvasElement = outputCanvasRef.current;
    if (!videoElement || !canvasElement) return;

    let isCleaningUp = false;
    const canvasCtx = canvasElement.getContext('2d');
    const backgroundImage = new Image();
    backgroundImage.crossOrigin = "anonymous";

    const selfieSegmentation = new window.SelfieSegmentation({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}` });
    selfieSegmentationRef.current = selfieSegmentation;
    selfieSegmentation.setOptions({ modelSelection: 1, selfieMode: false });

    selfieSegmentation.onResults((results) => {
      if (isCleaningUp || !canvasElement || !videoElement) return;
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      if (isFilterActiveRef.current && selectedBackgroundImageRef.current) {
        backgroundImage.src = selectedBackgroundImageRef.current;
        canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.globalCompositeOperation = 'source-out';
        canvasCtx.drawImage(backgroundImage, 0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.globalCompositeOperation = 'destination-atop';
        canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
      } else {
        canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
      }
      canvasCtx.restore();
    });

    const animate = async () => {
        if (isCleaningUp) return;
        if (videoElement && videoElement.readyState >= 4) {
            try {
                await selfieSegmentation.send({ image: videoElement });
            } catch (error) {
                console.error("MediaPipe send() failed:", error);
                isCleaningUp = true;
            }
        }
        if (!isCleaningUp) {
            animationFrameRef.current = requestAnimationFrame(animate);
        }
    };
    animate();

    const canvasStream = canvasElement.captureStream(25);
    const canvasVideoTrack = new LocalVideoTrack(canvasStream.getVideoTracks()[0], { name: 'canvas' });
    room.localParticipant.publishTrack(canvasVideoTrack);

    // return () => {
    //   isCleaningUp = true;
    //   if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    //   if (room.localParticipant) {
    //     room.localParticipant.unpublishTrack(canvasVideoTrack, true);
    //   }
    //   if (selfieSegmentationRef.current) {
    //     selfieSegmentationRef.current.close();
    //     selfieSegmentationRef.current = null;
    //   }
    // };
  }, [rtcStatus, isLiveKitReady, useCameraKit, isFilterActive, selectedBackgroundImage]);

const stopCameraKit = async () => {
  if (cameraKitSessionRef.current) {
    await cameraKitSessionRef.current.destroy(); // 세션 정리
    cameraKitSessionRef.current = null;
  }
};

  const initializeCameraKit = async () => {
    await stopCameraKit();
    if (!cameraKitRef.current) {
        cameraKitRef.current = await bootstrapCameraKit({ apiToken: CAMERA_KIT_API_TOKEN });
    }

    if (outputCKCanvasRef.current) {
      try {
        // LiveKit 트랙 언퍼블리시
        await roomRef.current.localParticipant.unpublishTrack(
          roomRef.current.localParticipant.videoTracks[0].track,
          true
        );
      } catch {}  
      containerRef.current.removeChild(outputCKCanvasRef.current);
    }

    // ———— (B) 새 canvas 생성 & ref 갱신 ————
    const newCanvas = document.createElement('canvas');
    outputCKCanvasRef.current = newCanvas;
    containerRef.current.appendChild(newCanvas);

    // const liveRenderTarget = outputCKCanvasRef.current;
    const session = await cameraKitRef.current.createSession({ liveRenderTarget: newCanvas });
    cameraKitSessionRef.current = session;

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    await session.setSource(stream);
    await session.play();

    // const room = roomRef.current;
    // if (room && room.localParticipant && room.localParticipant.videoTracks) {
    //     const localParticipant = room.localParticipant;
    //     localParticipant.videoTracks.forEach(async (publication) => {
    //         if (publication.track) {
    //             await localParticipant.unpublishTrack(publication.track, true);
    //         }
    //     });

        const canvasStream = newCanvas.captureStream(25);
        const videoTrack = new LocalVideoTrack(canvasStream.getVideoTracks()[0], { name: 'camera-kit' });
        await roomRef.current.localParticipant.publishTrack(videoTrack);
    //}
  };

  const applyLensById = async (lensId) => {
    console.log("아아아아아아아앙아아앙아아아앙아아아");
    setUseCameraKit(true);
    setIsFilterActive(false);

    await initializeCameraKit();
    
    const lens = await cameraKitRef.current.lensRepository.loadLens(lensId, '1d348e19-0526-44d6-b5fb-cdc9f664b6bc');
    await cameraKitSessionRef.current.applyLens(lens);
  };

  const applyBackgroundFilter = (imageUrl) => {
    if (cameraKitSessionRef.current) {
        cameraKitSessionRef.current.pause();
    }
    if (!imageUrl) {
      removeBackgroundFilter();
      return;
    }
    setUseCameraKit(false);
    setIsFilterActive(true);
    setSelectedBackgroundImage(imageUrl);
  };

  const removeBackgroundFilter = () => {
    if (cameraKitSessionRef.current) {
        cameraKitSessionRef.current.pause();
    }
    setUseCameraKit(false);
    setIsFilterActive(false);
    setSelectedBackgroundImage(null);
  };

  const toggleMute = () => roomRef.current?.localParticipant.setMicrophoneEnabled(!isMuted, { stopMicTrack: false }).then(() => setIsMuted(!isMuted));
  const toggleVideo = () => {
      const newVideoOffState = !isVideoOff;
      if (newVideoOffState) {
          if (cameraKitSessionRef.current) {
              cameraKitSessionRef.current.destroy();
              cameraKitSessionRef.current = null;
          }
          setUseCameraKit(false);
      }
      roomRef.current?.localParticipant.setCameraEnabled(!newVideoOffState).then(() => setIsVideoOff(!newVideoOffState));
  }
  const endSession = () => { if (window.confirm('정말로 수업을 종료하시겠습니까?')) { navigate('/therapist/mypage/schedule'); } };
  const toggleToolPanel = (toolType) => { setShowToolPanel(prev => prev && activeToolTab === toolType ? false : true); setActiveToolTab(toolType); };
  const handlePageChange = (newPage) => { if (fairyTaleInfo && newPage >= fairyTaleInfo.startPage && newPage <= fairyTaleInfo.endPage) { setCurrentFairyTalePage(newPage); } };
  const sendSentence = async () => { if (roomRef.current && selectedSentence) { try { const encoder = new TextEncoder(); const data = encoder.encode(JSON.stringify({ type: 'sentence', payload: selectedSentence })); await roomRef.current.localParticipant.publishData(data, { reliable: true }); alert('문장을 전송했습니다.'); } catch (error) { console.error('Failed to send sentence:', error); alert('문장 전송에 실패했습니다.'); } } };

  const renderContent = () => {
    switch (rtcStatus) {
      case 'disconnected': return (<div className="join-container"><h2 className="mb-4">수업을 시작할 준비가 되셨나요?</h2><Button variant="primary" size="lg" onClick={connectToLiveKit}><i className="bi bi-box-arrow-in-right me-2"></i>수업 시작하기</Button></div>);
      case 'connecting': return (<div className="join-container"><h2 className="mb-4">수업 세션에 연결 중입니다...</h2><p>잠시만 기다려주세요.</p></div>);
      case 'error': return (<div className="join-container"><Alert variant="danger"><Alert.Heading>연결 오류</Alert.Heading><p>세션에 연결하지 못했습니다. 네트워크 상태를 확인하시거나 잠시 후 다시 시도해주세요.</p></Alert><Button variant="primary" onClick={() => setRtcStatus('disconnected')}>다시 시도</Button></div>);
      case 'connected': return (
          <>
            {remoteAudioTrack && <audio ref={remoteAudioRef} autoPlay />}
            <Row className="h-100 flex-nowrap">
              <Col className={`session-main-content ${showToolPanel ? 'col-md-9' : 'col-md-12'} p-0`}>
                <div className="main-video-area">
                  <div className="main-video-container">
                    <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
                    {isRemoteVideoOff && (<div className="video-overlay-text"><i className="bi bi-camera-video-off-fill" style={{ fontSize: '3em' }}></i><p>사용자 카메라 꺼짐</p></div>)}
                  </div>
                  <div ref={containerRef} className="pip-video-container">
                    <video ref={localVideoRef} autoPlay playsInline muted style={{ display: 'none' }} />
                    <canvas ref={outputCanvasRef} className="local-video" />
                    <canvas ref={outputCKCanvasRef} className="local-video" />
                    {isVideoOff && (<div className="text-center video-overlay-text"><i className="bi bi-camera-video-off-fill" style={{ fontSize: '1.5em' }}></i></div>)}
                  </div>
                </div>
                {selectedSentence && (<div className="selected-sentence-display text-center p-2 mb-3">{selectedSentence}</div>)}
                <div className="control-panel">
                  <div className="d-flex align-items-center justify-content-center h-100">
                      <Button variant={isMuted ? "danger" : "light"} className="control-button me-3" onClick={toggleMute}><i className={`bi bi-mic${isMuted ? "-mute-fill" : "-fill"}`}></i><span>음소거</span></Button>
                      <Button variant={isVideoOff ? "danger" : "light"} className="control-button me-3" onClick={toggleVideo}><i className={`bi bi-camera-video${isVideoOff ? "-off-fill" : "-fill"}`}></i><span>캠 끄기</span></Button>
                      <Button variant={activeToolTab === 'aac' ? "primary" : "light"} className="control-button me-3" onClick={() => toggleToolPanel('aac')}><i className="bi bi-chat-dots-fill"></i><span>AAC</span></Button>
                      <Button variant={activeToolTab === 'filter' ? "success" : "light"} className="control-button me-3" onClick={() => toggleToolPanel('filter')}><i className="bi bi-stars"></i><span>필터</span></Button>
                      {fairyTaleInfo && (<Button variant={activeToolTab === 'fairyTale' ? "info" : "light"} className="control-button me-3" onClick={() => toggleToolPanel('fairyTale')}><i className="bi bi-book-fill"></i><span>동화</span></Button>)}
                      <Button variant={activeToolTab === 'chat' ? "warning" : "light"} className="control-button me-3" onClick={() => toggleToolPanel('chat')}><i className="bi bi-chat-right-text-fill"></i><span>채팅</span></Button>
                      <Button variant="danger" className="control-button ms-auto" onClick={endSession}><i className="bi bi-x-circle-fill" style={{ fontSize: '1.5em' }}></i><span>수업 종료</span></Button>
                  </div>
                </div>
              </Col>

              {showToolPanel && (
                <Col md={3} className="tool-panel p-0">
                  <Card className="h-100 shadow-sm">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">{activeToolTab === 'aac' ? 'AAC 도구' : activeToolTab === 'filter' ? '필터 도구' : activeToolTab === 'chat' ? '채팅' : '동화 도구'}</h5>
                      <Button variant="light" size="sm" onClick={() => setShowToolPanel(false)}>&times;</Button>
                    </Card.Header>
                    <Card.Body className="p-2">
                      {activeToolTab === 'aac' && ( <Alert variant="info" className="text-center m-2">AAC 도구 기능 구현 예정</Alert> )}
                      {activeToolTab === 'chat' && ( <Alert variant="warning" className="text-center m-2">채팅 기능 구현 예정</Alert> )}
                      {activeToolTab === 'filter' && (
                        <div className="p-2">
                          <h6 className="text-center mb-3">배경 필터 선택</h6>
                          <Row xs={2} className="g-2 text-center">
                            {backgroundImages.map(image => (
                              <Col key={image.id}>
                                <Card onClick={() => applyBackgroundFilter(image.url)} className={`filter-thumb-card ${selectedBackgroundImage === image.url ? 'active' : ''}`}>
                                  <Card.Img variant="top" src={image.url} style={{height: '80px', objectFit: 'cover'}} />
                                  <Card.Body className="p-1"><Card.Text>{image.name}</Card.Text></Card.Body>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                          <div className="d-grid mt-3">
                            <Button variant="secondary" onClick={removeBackgroundFilter} disabled={!isFilterActive}>필터 제거</Button>
                          </div>
                          <hr />
                          <h6 className="text-center mb-3">CameraKit 필터</h6>
                          <div className="d-grid gap-2">
                            <Button variant="info" onClick={() => applyLensById('80ea0b59-4a55-472f-bb63-2c679f9ad52c')}>렌즈 1</Button>
                            <Button variant="info" onClick={() => applyLensById('65d183b8-6c1c-4125-af82-875e6d36b656')}>렌즈 2</Button>
                          </div>
                        </div>
                      )}
                      {activeToolTab === 'fairyTale' && fairyTaleInfo && (
                          <div className="p-2">
                            <h6 className="text-center mb-3">{fairyTaleInfo.title} (페이지 {currentFairyTalePage}/{fairyTaleInfo.endPage})</h6>
                            <ListGroup className="mb-3" style={{maxHeight: '400px', overflowY: 'auto'}}>
                              {fairyTaleContent[currentFairyTalePage] ? ( fairyTaleContent[currentFairyTalePage].map((sentence, index) => (<ListGroup.Item key={index} action onClick={() => setSelectedSentence(prev => prev === sentence ? '' : sentence)} active={selectedSentence === sentence} className="fairy-tale-sentence">{sentence}</ListGroup.Item>))) : (<ListGroup.Item>페이지를 불러오는 중...</ListGroup.Item>)}
                            </ListGroup>
                            <div className="d-flex justify-content-between">
                              <Button variant="outline-secondary" onClick={() => handlePageChange(currentFairyTalePage - 1)} disabled={currentFairyTalePage <= fairyTaleInfo.startPage}>이전 페이지</Button>
                              <Button variant="outline-secondary" onClick={() => handlePageChange(currentFairyTalePage + 1)} disabled={currentFairyTalePage >= fairyTaleInfo.endPage}>다음 페이지</Button>
                            </div>
                            {selectedSentence && (<div className="mt-3"><Alert variant="success" className="text-center">선택된 문장: <strong>{selectedSentence}</strong></Alert><div className="d-grid"><Button variant="primary" onClick={sendSentence}><i className="bi bi-send-fill me-2"></i>선택한 문장 전송</Button></div></div>)}
                          </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row>
          </>
        );
      default: return null;
    }
  };

  return (
    <Container fluid className="session-room-container">
      {renderContent()}
    </Container>
  );
}

export default TherapistSessionRoom;