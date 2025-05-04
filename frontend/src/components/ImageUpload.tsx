import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { useDispatch } from 'react-redux';
import { setShowForm, setUnknownDescriptor, setCroppedFace } from '../redux/userSlice';
import { loadModels, loadFaceMatcher, getTopExpression } from '../utils/faceUtils';
import RegisterForm from './RegisterForm';
import '../style/Overlay.css';

interface FaceBox {
  descriptor: Float32Array;
  croppedImage: string;
}

const ImageUpload: React.FC = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceMatcherRef = useRef<faceapi.FaceMatcher | null>(null);
  const unknownHashes = useRef<Set<string>>(new Set());
  const [image, setImage] = useState<string | null>(null);
  const [unknownFaces, setUnknownFaces] = useState<FaceBox[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const init = async () => {
      await loadModels();
      faceMatcherRef.current = await loadFaceMatcher();
    };
    init();
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setUnknownFaces([]);
    }
  };

  const cropFace = (canvas: HTMLCanvasElement, box: faceapi.Box): string => {
    const ctx = canvas.getContext('2d');
    const { x, y, width, height } = box;

    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = width;
    faceCanvas.height = height;
    const faceCtx = faceCanvas.getContext('2d');
    if (faceCtx) {
      faceCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
    }
    return faceCanvas.toDataURL();

  };

  const handleImageLoad = async () => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
  
    const detections = await faceapi
      .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withAgeAndGender()
      .withFaceExpressions();
  
    const displaySize = { width: img.width, height: img.height };
    faceapi.matchDimensions(canvas, displaySize);
  
    const resized = faceapi.resizeResults(detections, displaySize);
  
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = displaySize.width;
    canvas.height = displaySize.height;
    ctx?.drawImage(img, 0, 0, displaySize.width, displaySize.height);
  
    for (const result of resized) {
      const { x, y, width, height } = result.detection.box;
      const bestMatch = faceMatcherRef.current?.findBestMatch(result.descriptor) || { label: 'unknown' };
  
      ctx!.strokeStyle = 'lime';
      ctx!.lineWidth = 2;
      ctx!.strokeRect(x, y, width, height);
      ctx!.font = '14px Arial';
      ctx!.fillStyle = 'blue';
      ctx!.fillText(bestMatch.toString(), x, y - 30);
      ctx!.fillText(`${Math.round(result.age)} yrs | ${result.gender}`, x, y - 15);
      ctx!.fillText(`Emotion: ${getTopExpression(result.expressions)}`, x, y + height + 20);
  
      if (bestMatch.label === 'unknown') {
        const hash = Array.from(result.descriptor).map(d => d.toFixed(2)).join(',');
        if (!unknownHashes.current.has(hash)) {
          unknownHashes.current.add(hash);
  
          const croppedImage = cropFace(canvas, result.detection.box);
  
          setUnknownFaces(prev => [...prev, {
            descriptor: result.descriptor,
            croppedImage
          }]);
        }
      }
    }
  };
  

  const handleSelectFace = (descriptor: Float32Array, croppedImage: string) => {
    dispatch(setUnknownDescriptor(descriptor));
    dispatch(setCroppedFace(croppedImage));
    dispatch(setShowForm(true));
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleUpload} />
      {image && (
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
      )}

      {unknownFaces.length > 0 && (
        <div>
          <h4>Unknown Faces Detected</h4>
          <div>
            {unknownFaces.map((face, idx) => (
              <div key={idx}>
                <img src={face.croppedImage} alt={`unknown-${idx}`} width={100} />
                <button onClick={() => handleSelectFace(face.descriptor, face.croppedImage)}>Register</button>
              </div>
            ))}
          </div>
        </div>
      )}

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
