import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WebcamFeed from './components/WebcamFeed';
import ImageUpload from './components/ImageUpload';
import HomePage from './components/HomePage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './App.css'

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/webcam" element={<WebcamFeed />} />
        <Route path="/upload" element={<ImageUpload />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
