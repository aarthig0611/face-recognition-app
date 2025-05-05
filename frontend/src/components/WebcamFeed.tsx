import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useDispatch } from 'react-redux';
import { setUnknownDescriptor, setShowForm, setCroppedFace } from '../redux/userSlice';
import { loadModels, loadFaceMatcher, getTopExpression, descriptorToHash } from '../utils/faceUtils';
import RegisterForm from './RegisterForm';
import UnknownFaceCard from './UnknownFaceCard';
import '../style/Overlay.css';

interface FaceBox {
  descriptor: Float32Array;
  croppedImage: string;
}

const WebcamFeed: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceMatcherRef = useRef<faceapi.FaceMatcher | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const recentUnknownsMap = useRef<Map<string, number>>(new Map());
  const emotionLog = useRef<Map<string, Map<string, number>>>(new Map());
  const emotionTimestamps = useRef<Map<string, number>>(new Map());

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [unknownFaces, setUnknownFaces] = useState<FaceBox[]>([]);
  const [reportVisible, setReportVisible] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const init = async () => {
      await loadModels();
      faceMatcherRef.current = await loadFaceMatcher();
    };
    init();

    return () => stopVideo();
  }, []);

  const startVideo = async () => {
    if (isCameraOn) return;

    emotionLog.current.clear();
    emotionTimestamps.current.clear();
    setReportVisible(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setIsCameraOn(true);
    } catch (err) {
      console.error('Camera access denied', err);
    }
  };

  const stopVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsCameraOn(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    setUnknownFaces([]);
    recentUnknownsMap.current.clear();

    setReportVisible(true);
  };

  const cropFace = (video: HTMLVideoElement, box: faceapi.Box): string => {
    const { x, y, width, height } = box;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, x, y, width, height, 0, 0, width, height);
    }
    return canvas.toDataURL();
  };

  const handleVideoPlay = async () => {
    if (intervalRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    intervalRef.current = setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 160 }))
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withAgeAndGender()
        .withFaceExpressions();

      const resized = faceapi.resizeResults(detections, displaySize);
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      const now = Date.now();

      recentUnknownsMap.current.forEach((time, key) => {
        if (now - time > 30000) {
          recentUnknownsMap.current.delete(key);
        }
      });

      setUnknownFaces(prev =>
        prev.filter(face => recentUnknownsMap.current.has(descriptorToHash(face.descriptor)))
      );

      for (const detection of resized) {
        const { x, y, width, height } = detection.detection.box;
        const bestMatch = faceMatcherRef.current?.findBestMatch(detection.descriptor) || { label: 'unknown' };

        ctx!.strokeStyle = 'lime';
        ctx!.lineWidth = 2;
        ctx!.strokeRect(x, y, width, height);
        ctx!.font = '14px Arial';
        ctx!.fillStyle = 'lime';
        ctx!.fillText(bestMatch.label, x, y - 30);
        ctx!.fillText(`${Math.round(detection.age)} yrs | ${detection.gender}`, x, y - 15);
        ctx!.fillText(`Emotion: ${getTopExpression(detection.expressions)}`, x, y + height + 20);

        const topEmotion = getTopExpression(detection.expressions);

        if (bestMatch.label === 'unknown') {
          const hash = descriptorToHash(detection.descriptor);

          const lastSeen = recentUnknownsMap.current.get(hash);
          if (!lastSeen || now - lastSeen > 10000) {
            recentUnknownsMap.current.set(hash, now);

            const croppedImage = cropFace(video, detection.detection.box);
            const newFace = { descriptor: detection.descriptor, croppedImage };

            dispatch(setUnknownDescriptor(detection.descriptor));
            dispatch(setCroppedFace(croppedImage));
            dispatch(setShowForm(true));

            setUnknownFaces(prev => [...prev.slice(-10), newFace]);
          }
        } else {
          const user = bestMatch.label;
          const prevEmotionMap = emotionLog.current.get(user) || new Map();
          const lastSeen = emotionTimestamps.current.get(user) || now;
          const elapsed = now - lastSeen;

          prevEmotionMap.set(topEmotion, (prevEmotionMap.get(topEmotion) || 0) + elapsed);
          emotionLog.current.set(user, prevEmotionMap);
          emotionTimestamps.current.set(user, now);
        }
      }
    }, 800);
  };

  const handleSelectFace = (descriptor: Float32Array, croppedImage: string) => {
    dispatch(setUnknownDescriptor(descriptor));
    dispatch(setCroppedFace(croppedImage));
    dispatch(setShowForm(true));
  };

  return (
    <div>
      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          muted
          onPlay={handleVideoPlay}
          className="video-feed"
        />
        <canvas ref={canvasRef} className="overlay-canvas" />
      </div>

      <div style={{ marginTop: '10px' }}>
        <button onClick={startVideo} disabled={isCameraOn}>Start Camera</button>
        <button onClick={stopVideo} disabled={!isCameraOn}>Stop Camera</button>
      </div>

      {unknownFaces.length > 0 && (
        <div>
          <h4>Unknown Faces Detected</h4>
          <p>Click on a image below to register.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {unknownFaces.map((face, idx) => (
              <UnknownFaceCard
                key={idx}
                descriptor={face.descriptor}
                croppedImage={face.croppedImage}
                onClick={handleSelectFace}
              />
            ))}
          </div>
        </div>
      )}

      {reportVisible && emotionLog.current.size > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Emotion Report</h3>
          {Array.from(emotionLog.current.entries()).map(([user, emotions]) => (
            <div key={user}>
              <h4>{user}</h4>
              <ul>
                {Array.from(emotions.entries()).map(([emotion, time]) => (
                  <li key={emotion}>
                    {emotion}: {(time / 1000).toFixed(1)} seconds
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <RegisterForm onSuccess={async () => {
        faceMatcherRef.current = await loadFaceMatcher();
        setUnknownFaces([]);
      }} />
    </div>
  );
};

export default WebcamFeed;
