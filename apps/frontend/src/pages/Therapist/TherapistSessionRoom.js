import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container } from 'react-bootstrap';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './TherapistSessionRoom.css';
import { useAuth } from '../../contexts/AuthContext';
import { bootstrapCameraKit } from "@snap/camera-kit";
import { LocalVideoTrack } from 'livekit-client';

import SessionRoomContent from '../../components/TherapistSession/SessionRoomContent';

import { useLiveKitSession } from '../../hooks/useLiveKitSession';
import { useFairyTaleLogic } from '../../hooks/useFairyTaleLogic';
import { useChatLogic } from '../../hooks/useChatLogic';

const CAMERA_KIT_API_TOKEN = "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc2MyU2hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzU0MDQ4MTI2LCJzdWIiOiJlODY4YTg3Ny1jYjVkLTQyMWEtOGE5Zi02MzlkZjExMDAyNTJ-U1RBR0lOR35hZGM0OWFjMy02NTU5LTRmNTctOWQ4Ny0yNTRjYzkwZjNhYzAifQ.EqNFYVSRYv7iEBCTBM-bxGvDEYOYernbf3ozbEhzB6g";

function TherapistSessionRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // URL 쿼리 파라미터에서 clientId 추출 및 숫자로 변환
  const queryParams = new URLSearchParams(location.search);
  const clientId = parseInt(queryParams.get('clientId'), 10); 

  const [showToolPanel, setShowToolPanel] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState(null);
  const [sessionTools, setSessionTools] = useState([]);
  const [selectedSentence, setSelectedSentence] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  // 필터 관련 상태 및 Ref
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [useCameraKit, setUseCameraKit] = useState(false);
  const [backgroundImages, setBackgroundImages] = useState([]);
  const [selectedBackgroundImage, setSelectedBackgroundImage] = useState(null);

  const selfieSegmentationRef = useRef(null);
  const animationFrameRef = useRef(null);
  const cameraKitRef = useRef(null);
  const cameraKitSessionRef = useRef(null);
  const containerRef = useRef(null);

  const isFilterActiveRef = useRef(isFilterActive);
  const selectedBackgroundImageRef = useRef(selectedBackgroundImage);

  useEffect(() => {
    isFilterActiveRef.current = isFilterActive;
    selectedBackgroundImageRef.current = selectedBackgroundImage;
  }, [isFilterActive, selectedBackgroundImage]);

  // useLiveKitSession을 먼저 호출하여 roomRef와 localVideoRef를 얻습니다.
  const { 
    isMuted, setIsMuted, isVideoOff, setIsVideoOff, isRemoteVideoOff, setIsRemoteVideoOff,
    rtcStatus, setRtcStatus, remoteVideoTrack, remoteAudioTrack,
    localVideoRef, remoteVideoRef, remoteAudioRef, roomRef,
    chatRoomId, 
    isLiveKitReady,
    connectToLiveKit, toggleMute, endSession, 
    toggleVideo: liveKitToggleVideo // useLiveKitSession의 toggleVideo를 다른 이름으로 가져옵니다.
  } = useLiveKitSession(user, navigate, clientId, // clientId 전달
    (sender, message) => setChatMessages(prevMessages => [...prevMessages, { sender, message }]),
    (sentence) => setSelectedSentence(sentence)
  );

  // 필터 캔버스 Ref
  const outputCanvasRef = useRef(null);
  const outputCKCanvasRef = useRef(null);

  const stopCameraKit = useCallback(async () => {
    if (cameraKitSessionRef.current) {
      await cameraKitSessionRef.current.destroy();
      cameraKitSessionRef.current = null;
    }
    if (selfieSegmentationRef.current) {
      selfieSegmentationRef.current.close();
      selfieSegmentationRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [roomRef, localVideoRef, outputCanvasRef, outputCKCanvasRef]);

  const initializeCameraKit = useCallback(async () => {
    await stopCameraKit();
    if (!cameraKitRef.current) {
        cameraKitRef.current = await bootstrapCameraKit({ apiToken: CAMERA_KIT_API_TOKEN });
    }

    if (outputCKCanvasRef.current) {
      if (containerRef.current && outputCKCanvasRef.current && containerRef.current.contains(outputCKCanvasRef.current)) {
        containerRef.current.removeChild(outputCKCanvasRef.current);
      }
    }

    const newCanvas = document.createElement('canvas');
    outputCKCanvasRef.current = newCanvas;
    if (containerRef.current) {
      containerRef.current.appendChild(newCanvas);
    }

    const session = await cameraKitRef.current.createSession({ liveRenderTarget: newCanvas });
    cameraKitSessionRef.current = session;

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    await session.setSource(stream);
    await session.play();

    const canvasStream = newCanvas.captureStream(25);
    const videoTrack = new LocalVideoTrack(canvasStream.getVideoTracks()[0], { name: 'camera-kit' });
    await roomRef.current.localParticipant.publishTrack(videoTrack);

    if (localVideoRef.current) localVideoRef.current.style.visibility = 'hidden';
    if (outputCanvasRef.current) outputCanvasRef.current.style.visibility = 'hidden';
    if (outputCKCanvasRef.current) outputCKCanvasRef.current.style.visibility = 'visible';

  }, [stopCameraKit, roomRef, localVideoRef, outputCanvasRef, outputCKCanvasRef]);

  const removeBackgroundFilter = useCallback(() => {
    if (cameraKitSessionRef.current) {
        cameraKitSessionRef.current.pause();
    }
    setUseCameraKit(false);
    setIsFilterActive(false);
    setSelectedBackgroundImage(null);
  }, []);

  const applyLensById = useCallback(async (lensId) => {
    setUseCameraKit(true);
    setIsFilterActive(false);

    await initializeCameraKit();
    
    const lens = await cameraKitRef.current.lensRepository.loadLens(lensId, '1d348e19-0526-44d6-b5fb-cdc9f664b6bc');
    await cameraKitSessionRef.current.applyLens(lens);
  }, [initializeCameraKit]);

  const applyBackgroundFilter = useCallback((imageUrl) => {
    
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
    
  }, [removeBackgroundFilter]);

  // toggleVideo 함수를 여기서 정의하여 useFilterLogic의 stopCameraKit을 호출합니다.
  const toggleVideo = useCallback(() => {
    const newVideoOffState = !isVideoOff;
    if (newVideoOffState) {
      stopCameraKit(); // 비디오를 끌 때 필터도 중지합니다.
    }
    liveKitToggleVideo(); // LiveKit의 비디오 토글 함수를 호출합니다.
  }, [isVideoOff, stopCameraKit, liveKitToggleVideo]);

  const { 
    fairyTaleInfo, fairyTaleContent, currentFairyTalePage,
    isRecording, setIsRecording,
    handlePageChange, sendSentence, startRecording, stopRecording
  } = useFairyTaleLogic(location, user, clientId, selectedSentence, roomRef); // clientId 전달

  const { 
    chatInput, setChatInput, sendChatMessage
  } = useChatLogic(roomRef, user, chatRoomId, setChatMessages);

  useEffect(() => {
    
    let isCleaningUp = false;

    const manageTracks = async () => {
      
      

      try {
        if (isCleaningUp) {
          
          return;
        }

        if (!isLiveKitReady) {
          
          await stopCameraKit();
          return;
        }

        const room = roomRef.current;
        if (!room || !room.localParticipant) {
          
          return;
        }

        

        

        if (useCameraKit) {
          
          if (room.localParticipant) {
            const unpublishPromises = [];
            room.localParticipant.videoTrackPublications.forEach((publication) => {
              if (publication.track && publication.track.name === 'canvas') {
                unpublishPromises.push(room.localParticipant.unpublishTrack(publication.track, true));
              }
            });
            await Promise.all(unpublishPromises);
          }
          if (localVideoRef.current) localVideoRef.current.style.visibility = 'hidden';
          if (outputCanvasRef.current) outputCanvasRef.current.style.visibility = 'hidden';
          if (outputCKCanvasRef.current) outputCKCanvasRef.current.style.visibility = 'visible';
          return;
        } else if (isFilterActive && selectedBackgroundImage) {
            
            if (room.localParticipant) {
              const unpublishPromises = [];
              room.localParticipant.videoTrackPublications.forEach((publication) => {
                if (publication.track && publication.track.name === 'camera-kit') {
                  unpublishPromises.push(room.localParticipant.unpublishTrack(publication.track, true));
                }
              });
              await Promise.all(unpublishPromises);
            }
            
            

            const videoElement = localVideoRef.current;
            const canvasElement = outputCanvasRef.current;
            
            if (!videoElement || !canvasElement) {
              setTimeout(manageTracks, 100); // 100ms 후 재시도
              return;
            }
            
            

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
                backgroundImage.src = selectedBackgroundImageRef.current; // Set src here
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
            try {
              await room.localParticipant.publishTrack(canvasVideoTrack);
              
            } catch (error) {
              console.error("manageTracks: Canvas 비디오 트랙 게시 실패:", error);
            }

            if (outputCanvasRef.current) outputCanvasRef.current.style.visibility = 'visible';
            if (outputCKCanvasRef.current) outputCKCanvasRef.current.style.visibility = 'hidden';
        } else { // No filter active, ensure original video is visible and filter tracks are unpublished
          
          if (localVideoRef.current) localVideoRef.current.style.visibility = 'visible';
          if (outputCanvasRef.current) outputCanvasRef.current.style.visibility = 'hidden';
          if (outputCKCanvasRef.current) outputCKCanvasRef.current.style.visibility = 'hidden';
          // The original video track should already be published by useLiveKitSession.
          // We just need to ensure any previously published filter tracks are unpublished.
          const unpublishPromises = [];
          room.localParticipant.videoTrackPublications.forEach((publication) => {
            if (publication.track && (publication.track.name === 'canvas' || publication.track.name === 'camera-kit')) {
              
              unpublishPromises.push(room.localParticipant.unpublishTrack(publication.track, true));
            }
          });
          await Promise.all(unpublishPromises);
          
        }
      } finally {
        
      }
    };

    manageTracks();

    return () => {
      isCleaningUp = true;
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        
      }
      const room = roomRef.current;
      if (room && room.localParticipant) {
        
        room.localParticipant.videoTrackPublications.forEach((publication) => {
          if (publication.track && (publication.track.name === 'canvas' || publication.track.name === 'camera-kit')) {
            try {
              room.localParticipant.unpublishTrack(publication.track, true);
              
            } catch (error) {
              console.error(`useEffect 클린업: ${publication.track.name} 트랙 언퍼블리시 실패:`, error);
            }
          }
        });
      }
      if (selfieSegmentationRef.current) {
        
        selfieSegmentationRef.current.close();
        selfieSegmentationRef.current = null;
      }
      if (cameraKitSessionRef.current) {
        
        cameraKitSessionRef.current.destroy();
        cameraKitSessionRef.current = null;
      }
      
    };
  }, [rtcStatus, useCameraKit, isVideoOff, roomRef, stopCameraKit, isFilterActive, selectedBackgroundImage, isLiveKitReady]);

  useEffect(() => {
    const fetchBackgroundImages = async () => {
      try {
        const placeholderImages = [
          { id: 1, name: '카리나', url: '/bg.jpg' },
          { id: 2, name: '윈터', url: '/bg2.jpg' },
          { id: 3, name: '닝닝', url: '/bg3.jpg' },
          { id: 4, name: '지젤', url: '/bg4.jpg' },
        ];
        setBackgroundImages(placeholderImages);
      } catch (error) {
        console.error("배경 이미지 로딩 실패:", error);
      }
    };
    if (rtcStatus === 'connected') fetchBackgroundImages();
  }, [rtcStatus]);

  const toggleToolPanel = (toolType) => {
    setShowToolPanel(prev => prev && activeToolTab === toolType ? false : true);
    setActiveToolTab(toolType);
  };

  return (
    <Container fluid className="session-room-container">
      <SessionRoomContent
        rtcStatus={rtcStatus}
        connectToLiveKit={connectToLiveKit}
        setRtcStatus={setRtcStatus}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        remoteAudioRef={remoteAudioRef}
        isRemoteVideoOff={isRemoteVideoOff}
        isVideoOff={isVideoOff}
        remoteAudioTrack={remoteAudioTrack}
        selectedSentence={selectedSentence}
        isMuted={isMuted}
        toggleMute={toggleMute}
        toggleVideo={toggleVideo}
        activeToolTab={activeToolTab}
        toggleToolPanel={toggleToolPanel}
        fairyTaleInfo={fairyTaleInfo}
        endSession={endSession}
        showToolPanel={showToolPanel}
        setShowToolPanel={setShowToolPanel}
        chatMessages={chatMessages}
        chatInput={chatInput}
        setChatInput={setChatInput}
        sendChatMessage={sendChatMessage}
        fairyTaleContent={fairyTaleContent}
        currentFairyTalePage={currentFairyTalePage}
        setSelectedSentence={setSelectedSentence}
        handlePageChange={handlePageChange}
        sendSentence={sendSentence}
        isRecording={isRecording}
        startRecording={() => startRecording(remoteAudioTrack)}
        stopRecording={stopRecording}
        backgroundImages={backgroundImages}
        selectedBackgroundImage={selectedBackgroundImage}
        isFilterActive={isFilterActive}
        applyBackgroundFilter={applyBackgroundFilter}
        removeBackgroundFilter={removeBackgroundFilter}
        applyLensById={applyLensById}
        outputCanvasRef={outputCanvasRef}
        outputCKCanvasRef={outputCKCanvasRef}
        containerRef={containerRef}
      />
    </Container>
  );
}

export default TherapistSessionRoom;