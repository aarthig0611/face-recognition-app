const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const canvas = require('canvas');
const faceapi = require('@vladmandic/face-api');
const multer = require('multer');
const upload = multer();

const app = express();
const PORT = 5000;

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODELS_PATH = path.join(__dirname, 'models');
const IMAGES_PATH = path.join(__dirname, 'labeled_images');
const OUTPUT_PATH = path.join(__dirname, 'descriptors.json');

let labeledDescriptors = [];
const knownUnknowns = new Set();

const hashDescriptor = (descriptor) => {
  return descriptor.map(d => Number(d).toFixed(2)).join(',');
};

async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
}

async function createLabeledDescriptors() {
  const labels = fs.readdirSync(IMAGES_PATH).filter(name => {
    const fullPath = path.join(IMAGES_PATH, name);
    return fs.statSync(fullPath).isDirectory();
  });

  const allDescriptors = [];

  for (const label of labels) {
    const descriptors = [];
    const labelFolder = path.join(IMAGES_PATH, label);
    const files = fs.readdirSync(labelFolder);

    for (const file of files) {
      if (file.endsWith('.json')) continue;
      const imgPath = path.join(labelFolder, file);
      const img = await canvas.loadImage(imgPath);
      const detection = await faceapi
        .detectSingleFace(img)
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
  console.log(`✅ Descriptors saved to ${OUTPUT_PATH}`);
}

const loadLabeledImages = async () => {
  const labels = fs.readdirSync(IMAGES_PATH).filter(name => {
    const fullPath = path.join(IMAGES_PATH, name);
    return fs.statSync(fullPath).isDirectory();
  });

  const descriptors = [];

  for (const label of labels) {
    const labelFolder = path.join(IMAGES_PATH, label);
    const files = fs.readdirSync(labelFolder);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const raw = fs.readFileSync(path.join(labelFolder, file));
        const json = JSON.parse(raw);
        if (json.descriptor) {
          const descriptor = new Float32Array(json.descriptor);
          descriptors.push(new faceapi.LabeledFaceDescriptors(label, [descriptor]));
        }
      } else {
        const imgPath = path.join(labelFolder, file);
        const img = await canvas.loadImage(imgPath);
        const detection = await faceapi
          .detectSingleFace(img)
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

app.get('/descriptors', async (req, res) => {
  if (labeledDescriptors.length === 0) {
    await loadModels();
    labeledDescriptors = await loadLabeledImages();
  }

  const serialized = labeledDescriptors.map(ld => ({
    label: ld.label,
    descriptors: ld.descriptors.map(d => Array.from(d)),
  }));

  res.json(serialized);
});

app.post('/register', upload.none(), async (req, res) => {
  const { name, descriptor, imageBase64 } = req.body;

  if (!name || !descriptor) {
    return res.status(400).json({ error: 'Missing name or descriptor' });
  }

  const descriptorArray = JSON.parse(descriptor);
  const labelPath = path.join(IMAGES_PATH, name);
  if (!fs.existsSync(labelPath)) fs.mkdirSync(labelPath);

  const hash = hashDescriptor(descriptorArray);
  if (knownUnknowns.has(hash)) {
    return res.status(409).json({ error: 'Already processed this unknown face' });
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
});

app.use('/models', express.static(MODELS_PATH));

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
