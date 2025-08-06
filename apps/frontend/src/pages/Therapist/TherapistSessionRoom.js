import React, { useState, useEffect, useRef } from 'react';
import { Container } from 'react-bootstrap';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './TherapistSessionRoom.css';
import { useAuth } from '../../contexts/AuthContext';

import SessionRoomContent from '../../components/TherapistSession/SessionRoomContent';

import { useLiveKitSession } from '../../hooks/useLiveKitSession';
import { useFairyTaleLogic } from '../../hooks/useFairyTaleLogic';
import { useChatLogic } from '../../hooks/useChatLogic';

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

  const { 
    isMuted, setIsMuted, isVideoOff, setIsVideoOff, isRemoteVideoOff, setIsRemoteVideoOff,
    rtcStatus, setRtcStatus, remoteVideoTrack, remoteAudioTrack,
    localVideoRef, remoteVideoRef, remoteAudioRef, roomRef,
    chatRoomId, childId,
    connectToLiveKit, toggleMute, toggleVideo, endSession
  } = useLiveKitSession(user, navigate, 
    (sender, message) => setChatMessages(prevMessages => [...prevMessages, { sender, message }]),
    (sentence) => setSelectedSentence(sentence)
  );

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
      />
    </Container>
  );
}

export default TherapistSessionRoom;