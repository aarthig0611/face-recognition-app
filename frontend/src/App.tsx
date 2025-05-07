import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WebcamFeed from './components/WebcamFeed';
import ImageUpload from './components/ImageUpload';
import HomePage from './components/HomePage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ThemeProvider } from '../src/components/ThemeContext';
import "../src/style/Theme.css"

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/webcam" element={<WebcamFeed />} />
              <Route path="/upload" element={<ImageUpload />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;