import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import sunIcon from '../assets/icons8-sun-50.png';
import moonIcon from '../assets/icons8-moon-50.png';
import '../style/Navbar.css';

type Page = 'home' | 'webcam' | 'upload';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 920);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 920);
      if (window.innerWidth >= 920) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const handleScrollTo = (id: string) => {
    closeMenu();
    if (currentPage !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleActionClick = () => {
    closeMenu();
    if (currentPage === 'webcam') {
      onNavigate('upload');
    } else {
      onNavigate('webcam');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <button onClick={() => onNavigate('home')} className="logo">
          FaceRec
        </button>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <button onClick={() => handleScrollTo('how-it-works')}>How it work</button>
          <button onClick={() => handleScrollTo('about')}>How it's build</button>
          <button onClick={() => handleScrollTo('use-cases')}>How it's used</button>
          <button onClick={() => handleScrollTo('contact')}>How to reach us</button>
          <button className={'web-image-option'} onClick={handleActionClick}>
            {currentPage === 'webcam' ? 'Analyze Photo' : 'Start Live Detection'}
          </button>
          <div className="theme-toggle-container">
            <button 
              className="theme-toggle-button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              <img 
                src={theme === 'light' ? moonIcon : sunIcon} 
                alt={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                style={{ width: '24px', height: '24px' }}
              />
            </button>
          </div>
        </div>

        {isMobile && (
          <div className="hamburger" onClick={toggleMenu}>
            <span className={`bar ${menuOpen ? 'bar1-open' : ''}`} />
            <span className={`bar ${menuOpen ? 'bar2-open' : ''}`} />
            <span className={`bar ${menuOpen ? 'bar3-open' : ''}`} />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;