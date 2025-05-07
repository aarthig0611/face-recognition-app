import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../style/Navbar.css';

const Navbar: React.FC = () => {

  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
      <Link to="/" className="logo" onClick={closeMenu}>
        FaceRec
      </Link>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <button onClick={() => handleScrollTo('how-it-works')}>Getting started</button>
        <button onClick={() => handleScrollTo('about')}>How it works</button>
        <button onClick={() => handleScrollTo('use-cases')}>Use Cases</button>
        <button onClick={() => handleScrollTo('contact')}>Contact</button>
        <button onClick={handleActionClick}>
          {location.pathname === '/webcam' ? 'Analyze Photo' : 'Use Webcam'}
        </button>
      </div>

      <div className="hamburger" onClick={toggleMenu}>
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </div>
    </nav>
  );
};

export default Navbar;
