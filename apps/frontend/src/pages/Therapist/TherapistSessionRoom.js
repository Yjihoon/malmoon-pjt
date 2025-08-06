import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container } from 'react-bootstrap';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './TherapistSessionRoom.css';
import { useAuth } from '../../contexts/AuthContext';

import SessionRoomContent from '../../components/TherapistSession/SessionRoomContent';

import { useLiveKitSession } from '../../hooks/useLiveKitSession';
import { useFairyTaleLogic } from '../../hooks/useFairyTaleLogic';
import { useChatLogic } from '../../hooks/useChatLogic';
import { useFilterLogic } from '../../hooks/useFilterLogic';

function TherapistSessionRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showToolPanel, setShowToolPanel] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState(null);
  const [sessionTools, setSessionTools] = useState([]);
  const [selectedSentence, setSelectedSentence] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  // useLiveKitSession을 먼저 호출하여 roomRef와 localVideoRef를 얻습니다.
  const { 
    isMuted, setIsMuted, isVideoOff, setIsVideoOff, isRemoteVideoOff, setIsRemoteVideoOff,
    rtcStatus, setRtcStatus, remoteVideoTrack, remoteAudioTrack,
    localVideoRef, remoteVideoRef, remoteAudioRef, roomRef,
    chatRoomId, childId, isLiveKitReady,
    connectToLiveKit, toggleMute, endSession, 
    toggleVideo: liveKitToggleVideo // useLiveKitSession의 toggleVideo를 다른 이름으로 가져옵니다.
  } = useLiveKitSession(user, navigate, 
    (sender, message) => setChatMessages(prevMessages => [...prevMessages, { sender, message }]),
    (sentence) => setSelectedSentence(sentence)
  );

  // useFilterLogic을 호출할 때 useLiveKitSession에서 얻은 ref들을 전달합니다.
  const { 
    isFilterActive, useCameraKit, backgroundImages, selectedBackgroundImage,
    containerRef, outputCanvasRef, outputCKCanvasRef,
    applyLensById, applyBackgroundFilter, removeBackgroundFilter, stopCameraKit
  } = useFilterLogic(roomRef, localVideoRef, rtcStatus, isVideoOff, isLiveKitReady);

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
  } = useFairyTaleLogic(location, user, childId, selectedSentence, roomRef);

  const { 
    chatInput, setChatInput, sendChatMessage
  } = useChatLogic(roomRef, user, chatRoomId, setChatMessages);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tools = queryParams.get('tools')?.split(',') || [];
    setSessionTools(tools);
  }, [location.search]);

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
        containerRef={containerRef}
        outputCanvasRef={outputCanvasRef}
        outputCKCanvasRef={outputCKCanvasRef}
      />
    </Container>
  );
}

export default TherapistSessionRoom;