import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './TherapistSessionRoom.css';
import { useAuth } from '../../contexts/AuthContext';
import { bootstrapCameraKit } from "@snap/camera-kit";
import { LocalVideoTrack } from 'livekit-client';
import api from '../../api/axios';

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
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const clientId = parseInt(queryParams.get('clientId'), 10);

  const [showToolPanel, setShowToolPanel] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState(null);
  const [sessionTools, setSessionTools] = useState([]);
  const [resolvedAacIds, setResolvedAacIds] = useState([]); // Resolved individual AAC IDs
  const [resolvedFilterIds, setResolvedFilterIds] = useState([]); // Resolved individual Filter IDs
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

  const [allToolBundles, setAllToolBundles] = useState([]); // 모든 도구 묶음 저장
  const [allAacs, setAllAacs] = useState([]); // 모든 개별 AAC 저장
  const [allFilters, setAllFilters] = useState([]); // 모든 개별 필터 저장

  // 모든 정적 도구 데이터를 한 번만 불러오는 useEffect
  useEffect(() => {
    const fetchAllStaticToolData = async () => {
      if (!user || !user.accessToken) return;

      if (allToolBundles.length > 0 && allAacs.length > 0 && allFilters.length > 0) {
          return;
      }

      try {
        const toolBundlesResponse = await api.get('/tool-bundles/my', {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        setAllToolBundles(toolBundlesResponse.data || []);

        const aacResponse = await api.get('/aacs', {
          headers: { Authorization: `Bearer ${user.accessToken}` },
          params: { page: 0, size: 100 }
        });
        setAllAacs(aacResponse.data.content.map(item => ({ ...item, imageUrl: item.fileUrl })) || []);

        const filterResponse = await api.get('/filters', {
          headers: { Authorization: `Bearer ${user.accessToken}` },
          params: { page: 0, size: 100 }
        });
        setAllFilters(filterResponse.data.filters.map(item => ({ ...item, imageUrl: item.fileUrl })) || []);

      } catch (error) {
        console.error('Error fetching all static tool data:', error);
      }
    };

    fetchAllStaticToolData();
  }, [user, allToolBundles.length, allAacs.length, allFilters.length]);

  // URL에서 도구 파싱 및 초기 선택 도구 결정 (정적 데이터 로드 후 실행)
  useEffect(() => {
    const parseAndResolveSelectedTools = async () => {
      if (!user || !user.accessToken || allToolBundles.length === 0 || allAacs.length === 0 || allFilters.length === 0) {
          return;
      }

      const toolsParam = queryParams.get('tools');
      const selectedToolIds = toolsParam ? toolsParam.split(',').map(id => id.trim()) : [];

      let initialAacIds = [];
      let initialFilterIds = [];

      try {
        for (const toolId of selectedToolIds) {
          const bundle = allToolBundles.find(b => String(b.toolBundleId) === toolId);
          if (bundle) {
            const bundleDetailsResponse = await api.get(`/tool-bundles/${toolId}`, {
              headers: { Authorization: `Bearer ${user.accessToken}` },
            });
            const bundleDetails = bundleDetailsResponse.data;

            if (bundleDetails.aacSetId) {
              const aacSetContentResponse = await api.get(`/aacs/sets/my/${bundleDetails.aacSetId}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
              });
              const aacsInSet = aacSetContentResponse.data;
              initialAacIds = [...new Set([...initialAacIds, ...aacsInSet.map(item => String(item.id))])];
            }

            if (bundleDetails.filterSetId) {
              const filterSetContentResponse = await api.get(`/filters/sets/my/${bundleDetails.filterSetId}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
              });
              const filtersInSet = filterSetContentResponse.data;
              initialFilterIds = [...new Set([...initialFilterIds, ...filtersInSet.map(item => String(item.filterId))])];
            }
          } else {
            if (allAacs.some(aac => String(aac.id) === toolId)) {
              initialAacIds.push(toolId);
            }
            else if (allFilters.some(filter => String(filter.filterId) === toolId)) {
              initialFilterIds.push(toolId);
            }
          }
        }
        setResolvedAacIds(initialAacIds);
        setResolvedFilterIds(initialFilterIds);

      } catch (error) {
        console.error('Error parsing or resolving initial tool data:', error);
        setResolvedAacIds([]);
        setResolvedFilterIds([]);
      }
    };

    parseAndResolveSelectedTools();
  }, [location.search, user, queryParams, allToolBundles, allAacs, allFilters]);

  const {
    isMuted, setIsMuted, isVideoOff, setIsVideoOff, isRemoteVideoOff, setIsRemoteVideoOff,
    rtcStatus, setRtcStatus, remoteVideoTrack, remoteAudioTrack,
    localVideoRef, remoteVideoRef, remoteAudioRef, roomRef,
    chatRoomId,
    isLiveKitReady,
    connectToLiveKit, toggleMute, endSession,
    toggleVideo: liveKitToggleVideo,
    finalChosenAacByClient
  } = useLiveKitSession(user, navigate, clientId,
    (sender, message) => setChatMessages(prevMessages => [...prevMessages, { sender, message }]),
    (sentence) => setSelectedSentence(sentence)
  );

  const handleSendAacToLiveKit = useCallback(async (aacs) => {
    if (!roomRef.current || !roomRef.current.localParticipant) {
      console.warn("LiveKit room not ready to send AAC data.");
      return;
    }
    try {
      const payload = JSON.stringify({
        type: 'AAC_OPTIONS',
        data: aacs.map(aac => ({ id: aac.id, name: aac.name, imageUrl: aac.imageUrl }))
      });
      await roomRef.current.localParticipant.publishData(new TextEncoder().encode(payload), {
        reliable: true,
        topic: 'aac-options'
      });
      console.log("AAC options sent via LiveKit data channel:", aacs);
    } catch (error) {
      console.error("Failed to send AAC options via LiveKit:", error);
    }
  }, [roomRef]);

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
  }, []);

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

  }, [stopCameraKit, roomRef]);

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

  const toggleVideo = useCallback(() => {
    const newVideoOffState = !isVideoOff;
    if (newVideoOffState) {
      stopCameraKit();
    }
    liveKitToggleVideo();
  }, [isVideoOff, stopCameraKit, liveKitToggleVideo]);

  const {
    fairyTaleInfo, fairyTaleContent, currentFairyTalePage,
    isRecording, setIsRecording,
    handlePageChange, sendSentence, startRecording, stopRecording
  } = useFairyTaleLogic(location, user, clientId, selectedSentence, roomRef);

  const {
    chatInput, setChatInput, sendChatMessage
  } = useChatLogic(roomRef, user, chatRoomId, setChatMessages);

  // --- START: 최종 수정된 필터 로직 ---
  useEffect(() => {
    let isCleaningUp = false;
    // createObjectURL로 생성된 임시 URL을 관리하기 위한 변수
    let objectUrl = null;

    const unpublishAndHide = async (trackNamesToUnpublish, visibleVideo, hiddenCanvas1, hiddenCanvas2) => {
      if (!roomRef.current || !roomRef.current.localParticipant) return;
      const unpublishPromises = [];
      roomRef.current.localParticipant.videoTrackPublications.forEach((publication) => {
        if (publication.track && trackNamesToUnpublish.includes(publication.track.name)) {
          unpublishPromises.push(roomRef.current.localParticipant.unpublishTrack(publication.track, true));
        }
      });
      await Promise.all(unpublishPromises);

      if (visibleVideo) visibleVideo.style.visibility = 'visible';
      if (hiddenCanvas1) hiddenCanvas1.style.visibility = 'hidden';
      if (hiddenCanvas2) hiddenCanvas2.style.visibility = 'hidden';
    };

    const manageTracks = async () => {
      if (isCleaningUp || !isLiveKitReady || !roomRef.current || !roomRef.current.localParticipant) {
        await stopCameraKit();
        return;
      }

      if (useCameraKit) {
        await unpublishAndHide(['canvas'], null, localVideoRef.current, outputCanvasRef.current);
        if (outputCKCanvasRef.current) outputCKCanvasRef.current.style.visibility = 'visible';
        return;
      }

      if (isFilterActive && selectedBackgroundImage) {
        await unpublishAndHide(['camera-kit'], null, localVideoRef.current, null);
        const videoElement = localVideoRef.current;
        const canvasElement = outputCanvasRef.current;
        if (!videoElement || !canvasElement) return;

        const canvasCtx = canvasElement.getContext('2d');
        
        // fetch를 사용하여 URL 변경 없이 캐시를 무시하고 이미지를 로드하는 함수
        const loadImageWithFetch = (url) => {
          return new Promise(async (resolve, reject) => {
            try {
              // cache: 'reload' 옵션으로 브라우저 캐시를 무시하고 새로 요청
              const response = await fetch(url, { cache: 'reload' });
              if (!response.ok) {
                // response.status와 함께 에러를 던져서 원인을 명확히 함
                throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
              }
              const blob = await response.blob();
              
              // 메모리 누수 방지를 위해 이전 objectUrl 해제
              if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
              }
              // blob으로부터 새로운 임시 URL 생성
              objectUrl = URL.createObjectURL(blob);

              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = (err) => reject(err);
              img.src = objectUrl;

            } catch (error) {
              reject(error);
            }
          });
        };

        try {
          const backgroundImage = await loadImageWithFetch(selectedBackgroundImageRef.current);

          if (!selfieSegmentationRef.current) {
            const selfieSegmentation = new window.SelfieSegmentation({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}` });
            selfieSegmentation.setOptions({ modelSelection: 1, selfieMode: false });
            selfieSegmentationRef.current = selfieSegmentation;

            selfieSegmentation.onResults((results) => {
              if (isCleaningUp || !isFilterActiveRef.current) return;
              canvasElement.width = videoElement.videoWidth;
              canvasElement.height = videoElement.videoHeight;
              canvasCtx.save();
              canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
              canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);
              canvasCtx.globalCompositeOperation = 'source-out';
              canvasCtx.drawImage(backgroundImage, 0, 0, canvasElement.width, canvasElement.height);
              canvasCtx.globalCompositeOperation = 'destination-atop';
              canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
              canvasCtx.restore();
            });
          }

          const animate = async () => {
            if (isCleaningUp || !isFilterActiveRef.current) {
              if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
              animationFrameRef.current = null;
              return;
            }
            if (videoElement.readyState >= 4) {
              await selfieSegmentationRef.current.send({ image: videoElement });
            }
            animationFrameRef.current = requestAnimationFrame(animate);
          };
          animate();

          const canvasStream = canvasElement.captureStream(25);
          const canvasVideoTrack = new LocalVideoTrack(canvasStream.getVideoTracks()[0], { name: 'canvas' });
          await roomRef.current.localParticipant.publishTrack(canvasVideoTrack);

          if (outputCanvasRef.current) outputCanvasRef.current.style.visibility = 'visible';
          if (outputCKCanvasRef.current) outputCKCanvasRef.current.style.visibility = 'hidden';

        } catch (error) {
          console.error("배경 이미지 로드에 실패하여 필터를 중단합니다.", error);
          setIsFilterActive(false);
          setSelectedBackgroundImage(null);
          await unpublishAndHide(['canvas', 'camera-kit'], localVideoRef.current, outputCanvasRef.current, outputCKCanvasRef.current);
        }
      } else {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        if (selfieSegmentationRef.current) {
            selfieSegmentationRef.current.close();
            selfieSegmentationRef.current = null;
        }
        await unpublishAndHide(['canvas', 'camera-kit'], localVideoRef.current, outputCanvasRef.current, outputCKCanvasRef.current);
      }
    };

    manageTracks();

    return () => {
      isCleaningUp = true;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      stopCameraKit();
      if (selfieSegmentationRef.current) {
          selfieSegmentationRef.current.close();
          selfieSegmentationRef.current = null;
      }
      // 컴포넌트가 사라질 때 메모리 누수 방지
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [rtcStatus, useCameraKit, isVideoOff, stopCameraKit, isFilterActive, selectedBackgroundImage, isLiveKitReady]);
  // --- END: 최종 수정된 필터 로직 ---


  useEffect(() => {
    const fetchBackgroundImages = async () => {
      const backendOrigin = 'http://localhost:8080';
      setBackgroundImages(allFilters.map(filter => ({
        id: filter.filterId,
        name: filter.name,
        url: filter.imageUrl && !filter.imageUrl.startsWith('http') ? `${backendOrigin}${filter.imageUrl}` : filter.imageUrl,
      })));
    };
    if (rtcStatus === 'connected' && allFilters.length > 0) fetchBackgroundImages();
  }, [rtcStatus, allFilters]);

  const toggleToolPanel = (toolType) => {
    setShowToolPanel(prev => prev && activeToolTab === toolType ? false : true);
    setActiveToolTab(toolType);
  };

  const filteredAacs = useMemo(() => {
    return allAacs.filter(aac => resolvedAacIds.includes(String(aac.id)));
  }, [allAacs, resolvedAacIds]);

  const filteredFilters = useMemo(() => {
    return allFilters.filter(filter => resolvedFilterIds.includes(String(filter.filterId)));
  }, [allFilters, resolvedFilterIds]);

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
        endSession={() => endSession(fairyTaleInfo?.title, currentFairyTalePage)}
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
        // --- FIX START ---
        // '조회'된 AAC 목록은 allAacs prop으로 전달하고,
        // '초기 선택'은 빈 배열로 설정하여 아무것도 선택되지 않은 상태로 시작합니다.
        initialSelectedAacIds={[]}
        // --- FIX END ---
        initialSelectedFilterIds={resolvedFilterIds}
        allAacs={filteredAacs}
        allFilters={filteredFilters}
        availableAacs={allAacs} // 전체 AAC 목록을 전달
        onSendAac={handleSendAacToLiveKit}
        finalChosenAacByClient={finalChosenAacByClient}
        roomRef={roomRef}
      />
    </Container>
  );
}

export default TherapistSessionRoom;