import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useDispatch, useSelector } from 'react-redux';
import { setUnknownDescriptor, setShowForm, setCroppedFace } from '../redux/userSlice';
import { RootState } from '../redux/store';
import { loadModels, loadFaceMatcher, getTopExpression, descriptorToHash } from '../utils/faceUtils';
import RegisterForm from './RegisterForm';
import UnknownFaceCard from './UnknownFaceCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from './ThemeContext';
import '../style/Overlay.css';
import '../style/WebcamFeed.css';

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
  const [isVideoPaused, setIsVideoPaused] = useState(false);

  const dispatch = useDispatch();
  const showForm = useSelector((state: RootState) => state.user.showForm);
  const { theme } = useTheme();

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [emotionTimeline, setEmotionTimeline] = useState<any[]>([]);

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
    setIsVideoPaused(false);

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
    setIsVideoPaused(false);
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

    // Process emotion data for the timeline graph
    processEmotionTimeline();
    setReportVisible(true);
  };

  const processEmotionTimeline = () => {
    const timelineData: any[] = [];
    const users = Array.from(emotionLog.current.keys());
    
    // If no user is selected, pick the first one by default
    if (users.length > 0 && !selectedUser) {
      setSelectedUser(users[0]);
    }

    // Convert emotion timestamps to timeline data
    users.forEach(user => {
      const userEmotions = emotionLog.current.get(user);
      if (userEmotions) {
        let totalDuration = 0;
        Array.from(userEmotions.entries()).forEach(([emotion, duration]) => {
          totalDuration += duration;
          timelineData.push({
            user,
            emotion,
            duration: duration / 1000, // convert to seconds
            timestamp: new Date(totalDuration).toISOString().substr(11, 8)
          });
        });
      }
    });

    setEmotionTimeline(timelineData);
  };

  const getUserEmotionData = () => {
    if (!selectedUser) return [];
    
    const data: any[] = [];
    let cumulativeTime = 0;
    const userEmotions = emotionLog.current.get(selectedUser);
    
    if (userEmotions) {
      Array.from(userEmotions.entries()).forEach(([emotion, duration]) => {
        cumulativeTime += duration;
        data.push({
          time: (cumulativeTime / 1000).toFixed(1),
          emotion,
          duration: duration / 1000
        });
      });
    }
    
    return data;
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
    if (intervalRef.current || isVideoPaused) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    intervalRef.current = setInterval(async () => {
      if (isVideoPaused) return;

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

            setUnknownFaces(prev => {
              // Check if we already have a face with this hash
              const hash = descriptorToHash(detection.descriptor);
              const existingFaceIndex = prev.findIndex(face => 
                descriptorToHash(face.descriptor) === hash
              );
              
              if (existingFaceIndex === -1) {
                // If no existing face, add the new one
                return [...prev, newFace];
              } else {
                // If face exists, replace it with the new one
                const updatedFaces = [...prev];
                updatedFaces[existingFaceIndex] = newFace;
                return updatedFaces;
              }
            });
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
    if (videoRef.current) {
      videoRef.current.pause();
      setIsVideoPaused(true);
    }
    dispatch(setUnknownDescriptor(descriptor));
    dispatch(setCroppedFace(croppedImage));
    dispatch(setShowForm(true));
  };

  const handleResumeVideo = () => {
    if (videoRef.current && isVideoPaused) {
      videoRef.current.play();
      setIsVideoPaused(false);
    }
  };

  return (
    <div className="webcam-container">
      <div className="main-content">
        <div className="video-container">
          <video
            ref={videoRef}
            autoPlay
            muted
            onPlay={handleVideoPlay}
            className="video-feed"
            style={{ opacity: isVideoPaused ? 0.5 : 1 }}
          />
          <canvas ref={canvasRef} className="overlay-canvas" />
        </div>

        {unknownFaces.length > 0 && (
          <div className="unknown-faces-section">
            <h4 className="unknown-faces-title">We spotted some new faces!</h4>
            <p className="unknown-faces-subtitle">Tap a photo to help us get to know them</p>
            <div className="unknown-faces-scroll-container">
              <div className="unknown-faces-grid">
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
          </div>
        )}
      </div>

      <div className="button-container">
        <button className="control-button start-button" onClick={startVideo} disabled={isCameraOn}>
          Start Camera
        </button>
        <button className="control-button stop-button" onClick={stopVideo} disabled={!isCameraOn}>
          Stop Camera
        </button>
      </div>

      {reportVisible && emotionLog.current.size > 0 && (
        <div className="emotion-report">
          <h3 className="emotion-report-title">Emotion Timeline Report</h3>
          
          <div className="user-selector">
            <label>Select User: </label>
            <select 
              value={selectedUser || ''}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              {Array.from(emotionLog.current.keys()).map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>
          
          {selectedUser && (
            <div className="emotion-timeline">
              <h4>Emotion Timeline for {selectedUser}</h4>
              <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={getUserEmotionData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#3c4043' : '#ddd'} />
                    <XAxis 
                      dataKey="time" 
                      label={{ value: 'Time (seconds)', position: 'bottom' }} 
                      stroke={theme === 'dark' ? '#e8eaed' : '#202124'}
                    />
                    <YAxis 
                      label={{ value: 'Duration (seconds)', angle: -90, position: 'left' }} 
                      stroke={theme === 'dark' ? '#e8eaed' : '#202124'}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
                        borderColor: theme === 'dark' ? '#3c4043' : '#ddd'
                      }}
                      formatter={(value, name, props) => [
                        `${value}s`, 
                        `Emotion: ${props.payload.emotion}`,
                        `Time: ${props.payload.time}s`
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="duration" 
                      name="Emotion Duration" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <RegisterForm
          onSuccess={async () => {
            faceMatcherRef.current = await loadFaceMatcher();
            setUnknownFaces([]);
            handleResumeVideo();
          }}
          onClose={handleResumeVideo}
        />
      )}
    </div>
  );
};

export default WebcamFeed;
