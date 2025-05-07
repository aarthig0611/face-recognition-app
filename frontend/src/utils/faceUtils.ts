import * as faceapi from 'face-api.js';

export const loadModels = async () => {
  const MODEL_URL = 'facerec-h6anfaccc5fzgke2.westus-01.azurewebsites.net/models';
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
  ]);
};

export const loadFaceMatcher = async () => {
  const res = await fetch('facerec-h6anfaccc5fzgke2.westus-01.azurewebsites.net/descriptors');
  const data = await res.json();

  const labeled = data.map((person: any) => {
    const descriptors = person.descriptors.map((d: number[]) => new Float32Array(d));
    return new faceapi.LabeledFaceDescriptors(person.label, descriptors);
  });

  return new faceapi.FaceMatcher(labeled, 0.6);
};

export const getTopExpression = (expressions: faceapi.FaceExpressions): string => {
  let topExpression = '';
  let maxProbability = -Infinity;

  for (const key in expressions) {
    const value = expressions[key as keyof faceapi.FaceExpressions];
    if (typeof value === 'number' && value > maxProbability) {
      maxProbability = value;
      topExpression = key;
    }
  }

  return topExpression;
};

export const descriptorToHash = (descriptor: Float32Array) => {
  // Normalize the descriptor values to reduce the impact of lighting and angle variations
  const normalized = Array.from(descriptor).map(d => {
    // Round to 3 decimal places for better precision
    return Math.round(d * 1000) / 1000;
  });
  
  // Calculate the mean of the descriptor values
  const mean = normalized.reduce((sum, val) => sum + val, 0) / normalized.length;
  
  // Normalize values relative to the mean
  const normalizedValues = normalized.map(val => val - mean);
  
  // Convert to string with 3 decimal places
  return normalizedValues.map(d => d.toFixed(3)).join(',');
};
