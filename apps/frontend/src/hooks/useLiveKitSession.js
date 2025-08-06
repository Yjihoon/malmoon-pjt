import { useState, useEffect, useRef, useCallback } from 'react';
import { Room, RoomEvent, createLocalTracks, Track } from 'livekit-client';
import axios from 'axios';

const LIVEKIT_URL = 'wss://i13c107.p.ssafy.io:8443';

export function useLiveKitSession(user, navigate, onChatMessageReceived, onSentenceReceived) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(true);
  const [rtcStatus, setRtcStatus] = useState('disconnected');

  const [remoteVideoTrack, setRemoteVideoTrack] = useState(null);
  const [remoteAudioTrack, setRemoteAudioTrack] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const roomRef = useRef(null);

  const [chatRoomId, setChatRoomId] = useState(null);
  const [childId, setChildId] = useState(null);

  const handleRemoteTrackMuted = useCallback((trackPublication) => {
    if (trackPublication.kind === Track.Kind.Video) {
      setIsRemoteVideoOff(true);
    }
  }, []);

  const handleRemoteTrackUnmuted = useCallback((trackPublication) => {
    if (trackPublication.kind === Track.Kind.Video) {
      setIsRemoteVideoOff(false);
    }
  }, []);

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

    room.on(RoomEvent.DataReceived, (payload, participant) => {
      const decoder = new TextDecoder();
      const data = JSON.parse(decoder.decode(payload));
      if (data.type === 'chat') {
        if (onChatMessageReceived) {
          onChatMessageReceived(participant.identity, data.payload);
        }
      } else if (data.type === 'sentence') {
        if (onSentenceReceived) {
          onSentenceReceived({ sentence: data.payload, sentenceId: null });
        }
      }
    });

    try {
      const response = await axios.post('/api/v1/sessions/room', { clientId: 2 }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.accessToken}`
        }
      });
      const { token, chatRoomId: newChatRoomId } = response.data;
      
      setChatRoomId(newChatRoomId);
      setChildId(2);
    
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
  }, [user, handleRemoteTrackMuted, handleRemoteTrackUnmuted, onChatMessageReceived, onSentenceReceived]);

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

  const toggleMute = useCallback(() => roomRef.current?.localParticipant.setMicrophoneEnabled(!isMuted, { stopMicTrack: false }).then(() => setIsMuted(!isMuted)), [isMuted]);
  const toggleVideo = useCallback(() => roomRef.current?.localParticipant.setCameraEnabled(!isVideoOff).then(() => setIsVideoOff(!isVideoOff)), [isVideoOff]);

  const endSession = useCallback(async () => {
    if (window.confirm('정말로 수업을 종료하시겠습니까?')) {
      try {
        await axios.delete('/api/v1/sessions/room', {
          headers: { "Authorization": `Bearer ${user.accessToken}` }
        });

        if (roomRef.current) {
          roomRef.current.disconnect();
        }

        navigate('/therapist/mypage/schedule');

      } catch (error) {
        console.error('Failed to end session:', error);
        alert('세션 종료에 실패했습니다. 콘솔을 확인해주세요.');
        if (roomRef.current) {
          roomRef.current.disconnect();
        }
        navigate('/therapist/mypage/schedule');
      }
    }
  }, [user, navigate]);

  return {
    isMuted, setIsMuted, isVideoOff, setIsVideoOff, isRemoteVideoOff, setIsRemoteVideoOff,
    rtcStatus, setRtcStatus, remoteVideoTrack, remoteAudioTrack,
    localVideoRef, remoteVideoRef, remoteAudioRef, roomRef,
    chatRoomId, childId,
    connectToLiveKit, toggleMute, toggleVideo, endSession
  };
}