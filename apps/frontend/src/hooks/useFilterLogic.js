import { useState, useEffect, useRef, useCallback } from 'react';
import { bootstrapCameraKit } from "@snap/camera-kit";
import { LocalVideoTrack } from 'livekit-client';

const CAMERA_KIT_API_TOKEN = "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU1hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzU0MDQ4MTI2LCJzdWIiOiJlODY4YTg4Ny1jYjVkLTQyMWEtOGE5Zi02MzlkZjExMDAyNTJ-U1RBR0lOR35hZGM0OWFjMy02NTU5LTRmNTctOWQ4Ny0yNTRjYzkwZjNhYzAifQ.EqNFYVSRYv7iEBCTBM-bxGvDEOYYernbf3ozbEhzB6g";

export function useFilterLogic(roomRef, localVideoRef, rtcStatus, isVideoOff, isLiveKitReady) {
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [useCameraKit, setUseCameraKit] = useState(false);
  const [backgroundImages, setBackgroundImages] = useState([]);
  const [selectedBackgroundImage, setSelectedBackgroundImage] = useState(null);

  const containerRef = useRef(null);
  const outputCanvasRef = useRef(null);
  const outputCKCanvasRef = useRef(null);
  const selfieSegmentationRef = useRef(null);
  const animationFrameRef = useRef(null);
  const cameraKitRef = useRef(null);
  const cameraKitSessionRef = useRef(null);
  const isManagingTracks = useRef(false);

  const isFilterActiveRef = useRef(isFilterActive);
  const selectedBackgroundImageRef = useRef(selectedBackgroundImage);

  useEffect(() => {
    isFilterActiveRef.current = isFilterActive;
    selectedBackgroundImageRef.current = selectedBackgroundImage;
  }, [isFilterActive, selectedBackgroundImage]);

  useEffect(() => {
    const fetchBackgroundImages = async () => {
      try {
        const placeholderImages = [
          { id: 1, name: '우주', url: '/bg.jpg' },
        ];
        setBackgroundImages(placeholderImages);
      } catch (error) {
        console.error("배경 이미지 로딩 실패:", error);
      }
    };
    if (rtcStatus === 'connected') fetchBackgroundImages();
  }, [rtcStatus]);

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
    if (roomRef.current && roomRef.current.localParticipant) {
      const unpublishPromises = [];
      roomRef.current.localParticipant.videoTrackPublications.forEach((publication) => {
        if (publication.track && (publication.track.name === 'canvas' || publication.track.name === 'camera-kit')) {
          unpublishPromises.push(roomRef.current.localParticipant.unpublishTrack(publication.track, true));
        }
      });
      await Promise.all(unpublishPromises);
    }
    // Ensure canvases are hidden when filters are stopped
    if (outputCanvasRef.current) outputCanvasRef.current.style.display = 'none';
    if (outputCKCanvasRef.current) outputCKCanvasRef.current.style.display = 'none';
    if (localVideoRef.current) localVideoRef.current.style.display = 'block'; // Show original video if no filter

  }, [roomRef, localVideoRef]);

  const initializeCameraKit = useCallback(async () => {
    await stopCameraKit();
    if (!cameraKitRef.current) {
        cameraKitRef.current = await bootstrapCameraKit({ apiToken: CAMERA_KIT_API_TOKEN });
    }

    if (outputCKCanvasRef.current) {
      try {
        await roomRef.current.localParticipant.unpublishTrack(
          roomRef.current.localParticipant.videoTracks[0].track,
          true
        );
      } catch (e) { console.warn("Failed to unpublish existing track:", e); }  
      if (containerRef.current && outputCKCanvasRef.current) {
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

    if (localVideoRef.current) localVideoRef.current.style.display = 'none';
    if (outputCanvasRef.current) outputCanvasRef.current.style.display = 'none';
    if (outputCKCanvasRef.current) outputCKCanvasRef.current.style.display = 'block';

  }, [stopCameraKit, roomRef, localVideoRef]);

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

  useEffect(() => {
    let isCleaningUp = false;

    const manageTracks = async () => {
      if (isManagingTracks.current) return;
      isManagingTracks.current = true;

      try {
        if (isCleaningUp) return;

        if (!isLiveKitReady) {
          await stopCameraKit();
          return;
        }

        const room = roomRef.current;
        if (!room || !room.localParticipant) return;

        if (isVideoOff) {
          await stopCameraKit();
          if (localVideoRef.current) localVideoRef.current.style.display = 'none';
          if (outputCanvasRef.current) outputCanvasRef.current.style.display = 'none';
          if (outputCKCanvasRef.current) outputCKCanvasRef.current.style.display = 'none';
          return;
        }

        const unpublishPromises = [];
        room.localParticipant.videoTrackPublications.forEach((publication) => {
          if (publication.track && (publication.track.name === 'canvas' || publication.track.name === 'camera-kit')) {
            unpublishPromises.push(room.localParticipant.unpublishTrack(publication.track, true));
          }
        });
        if (unpublishPromises.length > 0) {
          await Promise.all(unpublishPromises);
        }

        if (useCameraKit) {
          return;
        } else if (isFilterActive && selectedBackgroundImage) {
            if (selfieSegmentationRef.current) {
                selfieSegmentationRef.current.close();
                selfieSegmentationRef.current = null;
            }
            if(animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }

            const videoElement = localVideoRef.current;
            const canvasElement = outputCanvasRef.current;
            if (!videoElement || !canvasElement) return;

            const canvasCtx = canvasElement.getContext('2d');
            
            const backgroundImage = new Image();
            backgroundImage.crossOrigin = "anonymous";

            const startMediaPipe = (loadedBackgroundImage) => {
              const initializeSelfieSegmentation = async () => {
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
                    canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);
                    canvasCtx.globalCompositeOperation = 'source-out';
                    canvasCtx.drawImage(loadedBackgroundImage, 0, 0, canvasElement.width, canvasElement.height);
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
                await room.localParticipant.publishTrack(canvasVideoTrack);

                if (localVideoRef.current) localVideoRef.current.style.display = 'none';
                if (outputCanvasRef.current) outputCanvasRef.current.style.display = 'block';
                if (outputCKCanvasRef.current) outputCKCanvasRef.current.style.display = 'none';
              }

              if (!window.SelfieSegmentation) {
                const script = document.createElement('script');
                script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js";
                script.onload = initializeSelfieSegmentation;
                document.body.appendChild(script);
              } else {
                initializeSelfieSegmentation();
              }
            };

            backgroundImage.onload = () => startMediaPipe(backgroundImage);
            backgroundImage.onerror = () => console.error("Failed to load background image");
            backgroundImage.src = selectedBackgroundImage;

        } else { // No filter active, publish original video
          if (localVideoRef.current && localVideoRef.current.srcObject) {
            const originalVideoTrack = localVideoRef.current.srcObject.getVideoTracks()[0];
            if (originalVideoTrack) {
              const track = new LocalVideoTrack(originalVideoTrack, { name: 'original-video' });
              await room.localParticipant.publishTrack(track);

              if (localVideoRef.current) localVideoRef.current.style.display = 'block';
              if (outputCanvasRef.current) outputCanvasRef.current.style.display = 'none';
              if (outputCKCanvasRef.current) outputCKCanvasRef.current.style.display = 'none';
            }
          }
        }
      } finally {
        isManagingTracks.current = false;
      }
    };

    manageTracks();

    return () => {
      isCleaningUp = true;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      const room = roomRef.current;
      if (room && room.localParticipant) {
        room.localParticipant.videoTrackPublications.forEach((publication) => {
          if (publication.track && (publication.track.name === 'canvas' || publication.track.name === 'camera-kit' || publication.track.name === 'original-video')) {
            room.localParticipant.unpublishTrack(publication.track, true);
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
  }, [rtcStatus, useCameraKit, isVideoOff, roomRef, localVideoRef, stopCameraKit, isFilterActive, selectedBackgroundImage, isLiveKitReady]);


  return {
    isFilterActive, useCameraKit, backgroundImages, selectedBackgroundImage,
    containerRef, outputCanvasRef, outputCKCanvasRef,
    applyLensById, applyBackgroundFilter, removeBackgroundFilter, stopCameraKit
  };
}

