import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useDispatch } from 'react-redux';
import { setUnknownDescriptor, setShowForm, setCroppedFace } from '../redux/userSlice';
import { loadModels, loadFaceMatcher, getTopExpression } from '../utils/faceUtils';
import RegisterForm from './RegisterForm';
import '../style/Overlay.css';

interface FaceBox {
  descriptor: Float32Array;
  croppedImage: string;
}

const WebcamFeed: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceMatcherRef = useRef<faceapi.FaceMatcher | null>(null);
  const unknownHashes = useRef<Set<string>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [unknownFaces, setUnknownFaces] = useState<FaceBox[]>([]);

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
    unknownHashes.current.clear();
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

      for (const detection of resized) {
        const { x, y, width, height } = detection.detection.box;
        const bestMatch = faceMatcherRef.current?.findBestMatch(detection.descriptor) || { label: 'unknown' };

        ctx!.strokeStyle = 'lime';
        ctx!.lineWidth = 2;
        ctx!.strokeRect(x, y, width, height);
        ctx!.font = '14px Arial';
        ctx!.fillStyle = 'lime';
        ctx!.fillText(bestMatch.toString(), x, y - 30);
        ctx!.fillText(`${Math.round(detection.age)} yrs | ${detection.gender}`, x, y - 15);
        ctx!.fillText(`Emotion: ${getTopExpression(detection.expressions)}`, x, y + height + 20);

        if (bestMatch.label === 'unknown') {
          const hash = Array.from(detection.descriptor).map(d => d.toFixed(2)).join(',');

          const matchWithRecentUnknowns = unknownFaces.find(face => {
            const distance = faceapi.euclideanDistance(face.descriptor, detection.descriptor);
            return distance < 0.5;
          });
          
          if (!matchWithRecentUnknowns) {
            const hash = Array.from(detection.descriptor).map(d => d.toFixed(2)).join(',');
            unknownHashes.current.add(hash);
          
            const croppedImage = cropFace(video, detection.detection.box);
            const newFace = { descriptor: detection.descriptor, croppedImage };
          
            dispatch(setUnknownDescriptor(detection.descriptor));
            dispatch(setCroppedFace(croppedImage));
            dispatch(setShowForm(true));
          
            setUnknownFaces(prev => [...prev.slice(-10), newFace]);
          }
          
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
        <canvas
          ref={canvasRef}
          className="overlay-canvas"
        />
      </div>

      <div>
        <button onClick={startVideo} disabled={isCameraOn}>Start Camera</button>
        <button onClick={stopVideo} disabled={!isCameraOn}>Stop Camera</button>
      </div>

      {unknownFaces.length > 0 && (
        <div>
          <h4>Unknown Faces Detected</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {unknownFaces.map((face, idx) => (
              <div key={idx}>
                <img src={face.croppedImage} alt={`unknown-${idx}`} width={100} />
                <button onClick={() => handleSelectFace(face.descriptor, face.croppedImage)}>Register</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <RegisterForm />
    </div>
  );
};

export default WebcamFeed;
