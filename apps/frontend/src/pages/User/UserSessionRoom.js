import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import './UserSessionRoom.css';
import axios from 'axios';
import { Room, RoomEvent, createLocalTracks, RemoteParticipant, Track } from 'livekit-client';
import { useAuth } from '../../contexts/AuthContext';

const LIVEKIT_URL = 'wss://i13c107.p.ssafy.io:8443';

function UserSessionRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, isAuthReady } = useAuth();
  const { bookingId } = location.state || {};

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(true);
  const [rtcStatus, setRtcStatus] = useState('disconnected');
  const [receivedSentence, setReceivedSentence] = useState('');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const roomRef = useRef(null);

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
    if (!user || !user.accessToken) { // bookingId는 백엔드에 전달되지 않으므로 token만 확인
      alert("로그인이 필요하거나 세션 연결에 필요한 정보가 부족합니다. 예약 페이지로 돌아갑니다.");
      navigate('/user/mypage/schedule');
      return;
    }

    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });

    roomRef.current = room;

    room.on(RoomEvent.Connected, () => setRtcStatus('connected'));
    room.on(RoomEvent.Disconnected, () => setRtcStatus('disconnected'));

    room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      if (track.kind === 'video' && remoteVideoRef.current) {
        track.attach(remoteVideoRef.current);
        setIsRemoteVideoOff(false);

        // Attach mute/unmute listeners
        participant.on(RoomEvent.TrackMuted, handleRemoteTrackMuted);
        participant.on(RoomEvent.TrackUnmuted, handleRemoteTrackUnmuted);
      }
    });

    room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
      if (track.kind === 'video') {
        track.detach();
        setIsRemoteVideoOff(true);
        participant.off(RoomEvent.TrackMuted, handleRemoteTrackMuted);
        participant.off(RoomEvent.TrackUnmuted, handleRemoteTrackUnmuted);
      }
    });

    room.on(RoomEvent.DataReceived, (payload, participant, kind) => {
      const decoder = new TextDecoder();
      const data = JSON.parse(decoder.decode(payload));
      if (data.type === 'sentence') {
        setReceivedSentence(data.payload);
      }
    });

    try {
      const response = await axios.post('/api/v1/sessions/join', { bookingId }, {
        headers: {
          "Authorization": `Bearer ${user.accessToken}`,
          "Content-Type": "application/json"
        }
      });
      const livekitToken = response.data.token;

      await room.connect(LIVEKIT_URL, livekitToken);

      const localTracks = await createLocalTracks({ audio: true, video: true });
      for (const track of localTracks) {
        if (track.kind === 'video' && localVideoRef.current) {
          track.attach(localVideoRef.current);
        }
        await room.localParticipant.publishTrack(track);
      }
    } catch (error) {
      console.error('LiveKit 연결 실패:', error); // 추가된 부분
      setRtcStatus('error');
      alert('세션에 연결할 수 없습니다. 치료사가 아직 세션을 시작하지 않았거나, 오류가 발생했습니다. 콘솔을 확인해주세요.');
      navigate(-1);
    }
  }, [user, bookingId, navigate]);

  useEffect(() => {
    console.log('UserSessionRoom useEffect - isAuthReady:', isAuthReady, 'user:', user);
    if (isAuthReady && user && user.accessToken) { // token 대신 user.accessToken 사용
      connectToLiveKit();
    } else if (isAuthReady && (!user || !user.accessToken)) { // token 대신 user.accessToken 사용
      // isAuthReady가 true인데 user나 user.accessToken이 없으면 로그인 필요 메시지
      alert("로그인이 필요하거나 세션 연결에 필요한 정보가 부족합니다. 예약 페이지로 돌아갑니다.");
      navigate('/user/mypage/schedule');
    }

    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, [connectToLiveKit, isAuthReady, user, navigate]);

  const toggleMute = async () => {
    if (roomRef.current?.localParticipant) {
      const newMutedState = !isMuted;
      await roomRef.current.localParticipant.setMicrophoneEnabled(!newMutedState);
      setIsMuted(newMutedState);
    }
  };

  const toggleVideo = async () => {
    if (roomRef.current?.localParticipant) {
      const newVideoOffState = !isVideoOff;
      await roomRef.current.localParticipant.setCameraEnabled(!newVideoOffState);
      setIsVideoOff(newVideoOffState);
    }
  };

  const endSession = () => {
    if (window.confirm('정말로 세션을 종료하시겠습니까?')) {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
      navigate('/user/mypage/schedule');
    }
  };

  return (
    <Container fluid className="session-room-container">
      <Row className="h-100">
        <Col className="session-main-content p-0">
          <div className="main-video-area">
            <div className="main-video-container">
              <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
              {isRemoteVideoOff && (
                <div className="video-overlay-text">
                  <i className="bi bi-camera-video-off-fill" style={{ fontSize: '3em' }}></i>
                  <p>치료사 카메라 꺼짐</p>
                </div>
              )}
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

          {receivedSentence && (
            <div className="received-sentence-display">
              {receivedSentence}
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
                <Button variant="light" className="control-button me-3" onClick={() => alert('채팅 기능은 준비 중입니다.')}>
                    <i className="bi bi-chat-right-text-fill"></i>
                    <span>채팅</span>
                </Button>
                <Button variant="danger" className="control-button ms-auto" onClick={endSession}>
                    <i className="bi bi-x-circle-fill" style={{ fontSize: '1.5em' }}></i>
                    <span>나가기</span>
                </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default UserSessionRoom;
