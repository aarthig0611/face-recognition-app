import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useDispatch, useSelector } from 'react-redux';
import { setUnknownDescriptor, setShowForm, setCroppedFace } from '../redux/userSlice';
import { RootState } from '../redux/store';
import { loadModels, loadFaceMatcher, getTopExpression, descriptorToHash } from '../utils/faceUtils';
import RegisterForm from './RegisterForm';
import UnknownFaceCard from './UnknownFaceCard';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useTheme } from './ThemeContext';
import '../style/Overlay.css';
import '../style/WebcamFeed.css';
import { motion } from 'framer-motion';

interface FaceBox {
  descriptor: Float32Array;
  croppedImage: string;
}

interface EmotionData {
  name: string;
  value: number;
  duration: number;
  rank: number;
}

// Define the color scheme type
type ColorSchemeType = 'vibrant' | 'pastel' | 'professional';

// Define the color schemes with proper typing
const colorSchemes: Record<ColorSchemeType, string[]> = {
  vibrant: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', 
    '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71'
  ],
  pastel: [
    '#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFB3FF',
    '#B3FFB3', '#B3FFFF', '#FFB3FF', '#FFD9B3', '#D9B3FF'
  ],
  professional: [
    '#2C3E50', '#E74C3C', '#3498DB', '#2ECC71', '#F1C40F',
    '#1ABC9C', '#E67E22', '#34495E', '#9B59B6', '#16A085'
  ]
};

const CustomTooltip: React.FC<{ active?: boolean; payload?: Array<{ payload: EmotionData }>; theme: string }> = ({ active, payload, theme }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p className="tooltip-title">{data.name}</p>
        <p className="tooltip-text">Percentage: {data.value.toFixed(1)}%</p>
        <p className="tooltip-text">Duration: {data.duration.toFixed(1)}s</p>
        <p className="tooltip-text">Rank: #{data.rank}</p>
      </div>
    );
  }
  return null;
};

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
  const [colorScheme, setColorScheme] = useState<ColorSchemeType>('vibrant');

  const [showPopup, setShowPopup] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

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
    
    // Only show popup if there's emotion data
    if (emotionLog.current.size > 0) {
      setShowPopup(true);
    }
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

  const getUserEmotionData = (): EmotionData[] => {
    if (!selectedUser) return [];
    
    const userEmotions = emotionLog.current.get(selectedUser);
    if (!userEmotions) return [];

    const totalDuration = Array.from(userEmotions.values()).reduce((sum, duration) => sum + duration, 0);
    
    const data = Array.from(userEmotions.entries())
      .map(([emotion, duration]) => ({
        name: emotion,
        value: (duration / totalDuration) * 100,
        duration: duration / 1000,
        rawDuration: duration
      }))
      .sort((a, b) => b.value - a.value)
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }));

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

            setUnknownFaces(prev => [...prev.slice(-9), newFace]);
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

  const scrollToReport = () => {
    reportRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowPopup(false);
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
            className={`video-feed ${isVideoPaused ? 'paused' : ''}`}
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

      {showPopup && reportVisible && emotionLog.current.size > 0 && (
        <div className="popup-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20 
            }}
            className="analysis-popup"
          >
            <button
              onClick={() => setShowPopup(false)}
              className="popup-close-button"
            >
              ×
            </button>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="popup-title">
                Thanks for choosing FaceRec! 🎉
              </h3>
              
              <div className="popup-content">
                <p className="popup-description">
                  We've completed a detailed analysis of the emotions detected during your session.
                </p>
                <ul className="feature-list">
                  <li className="feature-item">✓ Real-time emotion tracking</li>
                  <li className="feature-item">✓ Detailed emotion distribution</li>
                  <li className="feature-item">✓ Duration analysis</li>
                  <li className="feature-item">✓ Interactive visualization</li>
                </ul>
              </div>

              <button
                onClick={scrollToReport}
                className="view-report-button"
              >
                View Detailed Report
              </button>
            </motion.div>
          </motion.div>
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
      
      <div className='emotion-report-container'>
        {reportVisible && emotionLog.current.size > 0 && (
          <div className="emotion-report" ref={reportRef}>
            <h3 className="emotion-report-title">The Story of Your Emotions</h3>
            
            <div className="user-selector">
              <label>Dive into Emotions of: </label>
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
                <div className="emotion-chart-align">
                  <h4>Emotions at a Glance: {selectedUser}</h4>
                  <motion.div 
                    className="chart-container"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <Pie
                          data={getUserEmotionData()}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius="100%"
                          animationBegin={0}
                          animationDuration={1000}
                          animationEasing="ease-out"
                        >
                          {getUserEmotionData().map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={colorSchemes[colorScheme][index % colorSchemes[colorScheme].length]}
                              stroke={theme === 'dark' ? '#1e1e1e' : '#fff'}
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip theme={theme} />} />
                        <Legend 
                          align="center"
                          verticalAlign="bottom"
                          layout="horizontal"
                          formatter={(value: string, entry: any, index: number) => (
                            <span className="legend-text">
                              {value} ({getUserEmotionData()[index].value.toFixed(1)}%)
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </motion.div>
                  <div className="color-scheme-selector">
                    <label>Selected Theme: </label>
                    <select 
                      value={colorScheme}
                      onChange={(e) => setColorScheme(e.target.value as ColorSchemeType)}
                    >
                      <option value="vibrant">Vibrant</option>
                      <option value="pastel">Pastel</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>
                </div>

                <div className="emotion-statistics">
                  <h5>Behind the Feelings</h5>
                  <div className="emotion-statistics-grid">
                    {getUserEmotionData().map(emotion => (
                      <div key={emotion.name} className="emotion-stat-item">
                        <strong>{emotion.name}</strong>
                        <p>Duration: {emotion.duration.toFixed(1)}s</p>
                        <p>Percentage: {emotion.value.toFixed(1)}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebcamFeed;
