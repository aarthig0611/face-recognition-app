import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import '../style/Navbar.css';

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 920);
  const navigate = useNavigate();
  const location = useLocation();
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
    if (location.pathname !== '/') {
      navigate('/', { replace: false });
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
    if (location.pathname === '/webcam') {
      navigate('/upload');
    } else {
      navigate('/webcam');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo" onClick={closeMenu}>
          FaceRec
        </Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <button onClick={() => handleScrollTo('how-it-works')}>Getting started</button>
          <button onClick={() => handleScrollTo('about')}>How it works</button>
          <button onClick={() => handleScrollTo('use-cases')}>Use Cases</button>
          <button onClick={() => handleScrollTo('contact')}>Contact</button>
          <button className={'web-image-option'} onClick={handleActionClick}>
            {location.pathname === '/webcam' ? 'Analyze Photo' : 'Use Webcam'}
          </button>
          <div className="theme-toggle-container">
            <input 
              type="checkbox" 
              id="theme-toggle" 
              checked={theme === 'dark'}
              onChange={toggleTheme}
              aria-label="Toggle dark mode"
            />
            <label htmlFor="theme-toggle" className="theme-toggle-label">
              <span className="theme-toggle-ball"></span>
              <svg className="sun" width="16" height="16" viewBox="0 0 24 24">
                <path d="M12 18c3.313 0 6-2.687 6-6s-2.687-6-6-6-6 2.687-6 6 2.687 6 6 6zm0-2c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM3.515 4.929l1.414-1.414L7.05 5.636 5.636 7.05 3.515 4.93zM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414-2.121-2.121zm2.121-14.85l1.414 1.415-2.121 2.121-1.414-1.414 2.121-2.121zM5.636 16.95l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121zM23 11v2h-3v-2h3zM4 11v2H1v-2h3z"/>
              </svg>
              <svg className="moon" width="16" height="16" viewBox="0 0 24 24">
                <path d="M12 11.807C9.62 11.807 7.707 9.894 7.707 7.502S9.62 3.197 12 3.197s4.293 1.914 4.293 4.305-1.914 4.305-4.293 4.305zm0-7.807c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5zm4.793 15.707a.999.999 0 01-1.414 0l-1.414-1.414a.999.999 0 111.414-1.414l1.414 1.414a.999.999 0 010 1.414zM17 16h-1.5a1 1 0 010-2H17a1 1 0 010 2zm-6.5 0H9a1 1 0 010-2h1.5a1 1 0 010 2zm3.5 5a1 1 0 01-1 1h-1.5a1 1 0 010-2H13a1 1 0 011 1zm-6.793-1.707a.999.999 0 01-1.414 0l-1.414-1.414a.999.999 0 111.414-1.414l1.414 1.414a.999.999 0 010 1.414zM7 8H5.5a1 1 0 010-2H7a1 1 0 010 2z"/>
              </svg>
            </label>
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