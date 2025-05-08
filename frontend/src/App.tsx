import React, { useState } from 'react';
import WebcamFeed from './components/WebcamFeed';
import ImageUpload from './components/ImageUpload';
import HomePage from './components/HomePage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ThemeProvider } from '../src/components/ThemeContext';
import "../src/style/Theme.css"

type Page = 'home' | 'webcam' | 'upload';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const savedPage = localStorage.getItem('currentPage') as Page;
    return savedPage || 'home';
  });

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    localStorage.setItem('currentPage', page);
    switch (page) {
      case 'home':
        window.location.hash = 'homepage';
        break;
      case 'webcam':
        window.location.hash = 'webcam';
        break;
      case 'upload':
        window.location.hash = 'upload';
        break;
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'webcam':
        return <WebcamFeed onNavigate={handleNavigate} />;
      case 'upload':
        return <ImageUpload onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="app-container">
        <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
        <main className="main-content">
          {renderPage()}
        </main>
        <Footer onNavigate={handleNavigate} />
      </div>
    </ThemeProvider>
  );
};

export default App;