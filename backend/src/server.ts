import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import * as canvas from 'canvas';
import * as faceapi from '@vladmandic/face-api';
import multer from 'multer';

const upload = multer();
const app = express();
const PORT = 5002;

const { Canvas, Image, ImageData } = canvas as any;
faceapi.env.monkeyPatch({
  Canvas: Canvas as any,
  Image: Image as any,
  ImageData: ImageData as any,
});

const MODELS_PATH = path.join(__dirname, '../models');
const IMAGES_PATH = path.join(__dirname, '../labeled_images');
const OUTPUT_PATH = path.join(__dirname, '../descriptors.json');

let labeledDescriptors: faceapi.LabeledFaceDescriptors[] = [];
const knownUnknowns = new Set<string>();

const hashDescriptor = (descriptor: number[]): string => {
  return descriptor.map(d => Number(d).toFixed(2)).join(',');
};

async function loadModels(): Promise<void> {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
}

async function createLabeledDescriptors(): Promise<void> {
  const labels = fs.readdirSync(IMAGES_PATH).filter(name =>
    fs.statSync(path.join(IMAGES_PATH, name)).isDirectory()
  );

  const allDescriptors: { label: string; descriptors: number[][] }[] = [];

  for (const label of labels) {
    const descriptors: number[][] = [];
    const labelFolder = path.join(IMAGES_PATH, label);
    const files = fs.readdirSync(labelFolder);

    for (const file of files) {
      if (file.endsWith('.json')) continue;
      const imgPath = path.join(labelFolder, file);
      const img = await canvas.loadImage(imgPath);
      const detection = await faceapi
        .detectSingleFace(img as any)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        descriptors.push(Array.from(detection.descriptor));
      }
    }

    if (descriptors.length > 0) {
      allDescriptors.push({ label, descriptors });
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allDescriptors, null, 2));
  console.log(`Descriptors saved to ${OUTPUT_PATH}`);
}

const loadLabeledImages = async (): Promise<faceapi.LabeledFaceDescriptors[]> => {
  const labels = fs.readdirSync(IMAGES_PATH).filter(name =>
    fs.statSync(path.join(IMAGES_PATH, name)).isDirectory()
  );

  const descriptors: faceapi.LabeledFaceDescriptors[] = [];

  for (const label of labels) {
    const labelFolder = path.join(IMAGES_PATH, label);
    const files = fs.readdirSync(labelFolder);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const raw = fs.readFileSync(path.join(labelFolder, file), 'utf-8');
        const json = JSON.parse(raw);
        if (json.descriptor) {
          const descriptor = new Float32Array(json.descriptor);
          descriptors.push(new faceapi.LabeledFaceDescriptors(label, [descriptor]));
        }
      } else {
        const imgPath = path.join(labelFolder, file);
        const img = await canvas.loadImage(imgPath);
        const detection = await faceapi
          .detectSingleFace(img as any)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          descriptors.push(new faceapi.LabeledFaceDescriptors(label, [detection.descriptor]));
          break;
        }
      }
    }
  }

  return descriptors;
};

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/descriptors', async (req: Request, res: Response): Promise<void> => {
  try {
    if (labeledDescriptors.length === 0) {
      await loadModels();
      labeledDescriptors = await loadLabeledImages();
    }

    const serialized = labeledDescriptors.map(ld => ({
      label: ld.label,
      descriptors: ld.descriptors.map(d => Array.from(d)),
    }));

    res.json(serialized);
  } catch (error) {
    console.error('Error loading descriptors:', error);
    res.status(500).json({ error: 'Failed to load descriptors' });
  }
});

app.post('/register', upload.none(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, descriptor, imageBase64 } = req.body;

    if (!name || !descriptor) {
      res.status(400).json({ error: 'Missing name or descriptor' });
      return;
    }

    const descriptorArray: number[] = JSON.parse(descriptor);
    const labelPath = path.join(IMAGES_PATH, name);
    if (!fs.existsSync(labelPath)) fs.mkdirSync(labelPath);

    const hash = hashDescriptor(descriptorArray);
    if (knownUnknowns.has(hash)) {
      res.status(409).json({ error: 'Already processed this unknown face' });
      return;
    }

    const timestamp = Date.now();
    const descriptorPath = path.join(labelPath, `${timestamp}.json`);
    fs.writeFileSync(descriptorPath, JSON.stringify({ descriptor: descriptorArray }));

    if (imageBase64 && imageBase64.startsWith('data:image')) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const imagePath = path.join(labelPath, `${timestamp}.png`);
      fs.writeFileSync(imagePath, buffer);
    }

    knownUnknowns.add(hash);
    labeledDescriptors = [];

    res.json({ message: 'User registered' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.use('/models', express.static(MODELS_PATH));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
