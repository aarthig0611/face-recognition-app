import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { useDispatch } from 'react-redux';
import { setShowForm, setUnknownDescriptor, setCroppedFace } from '../redux/userSlice';
import { loadModels, loadFaceMatcher, getTopExpression } from '../utils/faceUtils';
import RegisterForm from './RegisterForm';
import UnknownFaceCard from './UnknownFaceCard';
import '../style/Overlay.css';
import '../style/ImageUpload.css';

interface FaceBox {
  descriptor: Float32Array;
  croppedImage: string;
}

const MAX_IMAGE_WIDTH = 800;
const MAX_IMAGE_HEIGHT = 600;

const ImageUpload: React.FC = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faceMatcherRef = useRef<faceapi.FaceMatcher | null>(null);
  const unknownHashes = useRef<Set<string>>(new Set());
  
  const [image, setImage] = useState<string | null>(null);
  const [unknownFaces, setUnknownFaces] = useState<FaceBox[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const dispatch = useDispatch();

  useEffect(() => {
    const init = async () => {
      try {
        setIsProcessing(true);
        await loadModels();
        faceMatcherRef.current = await loadFaceMatcher();
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsProcessing(false);
      }
    };
    init();
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      setImage(URL.createObjectURL(file));
      setUnknownFaces([]);
    }
  };

  const cropFace = (canvas: HTMLCanvasElement, box: faceapi.Box): string => {
    const { x, y, width, height } = box;
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = width;
    faceCanvas.height = height;
    
    const faceCtx = faceCanvas.getContext('2d');
    faceCtx?.drawImage(canvas, x, y, width, height, 0, 0, width, height);
    
    return faceCanvas.toDataURL();
  };

  const handleImageLoad = async () => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    try {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      let width = MAX_IMAGE_WIDTH;
      let height = MAX_IMAGE_HEIGHT;
      
      if (aspectRatio > 1) {
        height = width / aspectRatio;
      } else {
        width = height * aspectRatio;
      }

      img.width = width;
      img.height = height;
      canvas.width = width;
      canvas.height = height;

      const detections = await faceapi
        .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withAgeAndGender()
        .withFaceExpressions();

      const displaySize = { width, height };
      faceapi.matchDimensions(canvas, displaySize);
      const resized = faceapi.resizeResults(detections, displaySize);

      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      ctx?.drawImage(img, 0, 0, width, height);

      const newUnknownFaces: FaceBox[] = [];

      for (const result of resized) {
        const { x, y, width, height } = result.detection.box;
        const bestMatch = faceMatcherRef.current?.findBestMatch(result.descriptor) || { label: 'unknown' };

        if (ctx) {
          ctx.strokeStyle = '#4CAF50';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);
          
          ctx.font = '14px Arial';
          ctx.fillStyle = 'lime';
          ctx.fillText(bestMatch.label, x, y - 30);
          ctx.fillText(`${Math.round(result.age)} yrs | ${result.gender}`, x, y - 15);
          ctx.fillText(`Emotion: ${getTopExpression(result.expressions)}`, x, y + height + 20);
        }

        if (bestMatch.label === 'unknown') {
          const hash = Array.from(result.descriptor).map(d => d.toFixed(2)).join(',');
          if (!unknownHashes.current.has(hash)) {
            unknownHashes.current.add(hash);
            const croppedImage = cropFace(canvas, result.detection.box);
            newUnknownFaces.push({ descriptor: result.descriptor, croppedImage });
          }
        }
      }

      if (newUnknownFaces.length > 0) {
        setUnknownFaces(prev => [...prev, ...newUnknownFaces]);
      }
    } catch (error) {
      console.error('Face detection error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectFace = (descriptor: Float32Array, croppedImage: string) => {
    dispatch(setUnknownDescriptor(descriptor));
    dispatch(setCroppedFace(croppedImage));
    dispatch(setShowForm(true));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-upload-container">
      {image && (
        <div className="image-and-faces-container">
          <div className="image-preview-container">
            <div className="relative">
              <img
                ref={imageRef}
                src={image}
                alt="uploaded"
                onLoad={handleImageLoad}
                className="uploaded-image"
              />
              <canvas ref={canvasRef} className="overlay-canvas" />
            </div>
          </div>

          {unknownFaces.length > 0 && (
            <div className="unknown-faces-section">
              <h4 className="section-title">We spotted some new faces!</h4>
              <p className="section-subtitle">Tap a photo to help us get to know them</p>
              <div className="unknown-faces-grid">
                {unknownFaces.map((face, idx) => (
                  <UnknownFaceCard
                    key={idx}
                    croppedImage={face.croppedImage}
                    descriptor={face.descriptor}
                    onClick={handleSelectFace}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="upload-section">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="file-input"
        />
        <button
          onClick={triggerFileInput}
          className="upload-button"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Upload Image'}
        </button>
      </div>

      <RegisterForm onSuccess={async () => {
        faceMatcherRef.current = await loadFaceMatcher();
        setUnknownFaces([]);
        setTimeout(() => {
          if (imageRef.current) {
            handleImageLoad();
          }
        }, 300);
      }} />
    </div>
  );
};

export default ImageUpload;
