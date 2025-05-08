# Face Recognition Application

## Description
A modern face recognition application that allows users to detect, recognize, and analyze faces in images and video streams. This application provides real-time face detection and recognition capabilities with a user-friendly interface.

## Features
- Real-time face detection and recognition
- Support for multiple face detection in a single image
- Face landmark detection (eyes, nose, mouth, etc.)
- Age and gender estimation
- Emotion detection
- Face comparison and matching
- Secure storage of face data
- Real-time video stream processing
- Image upload and processing

## Tech Stack
- **Frontend:**
  - React.js
  - TypeScript
  - Tailwind CSS
  - React Router
  - Axios for API calls

- **Backend:**
  - Node.js
  - Express.js


- **Face Recognition:**
  - face-api.js
  - OpenCV.js
  - TensorFlow.js

- **Development Tools:**
  - Git for version control
  - ESLint for code linting
  - Prettier for code formatting
  - Jest for testing

## Prerequisites
- Node.js (v14 or higher)
- Modern web browser with WebGL support
- Webcam (for real-time detection)

## Installation
1. Clone the repository:
```bash
git clone https://github.com/yourusername/face-recognition-app.git
cd face-recognition-app
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
```

4. Start the application:
```bash
# Start backend server
cd backend
npm run dev

# Start frontend development server
cd ../frontend
npm start
```

## Usage
1. Open the application in your web browser
2. Allow camera access when prompted
3. Choose between real-time detection or image upload
4. View detection results and analysis
5. Save or export results as needed
