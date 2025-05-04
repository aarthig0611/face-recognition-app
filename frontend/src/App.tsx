import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WebcamFeed from './components/WebcamFeed';
import ImageUpload from './components/ImageUpload';
import HomePage from './components/HomePage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/webcam" element={<WebcamFeed />} />
        <Route path="/upload" element={<ImageUpload />} />
      </Routes>
    </Router>
  );
};

export default App;
