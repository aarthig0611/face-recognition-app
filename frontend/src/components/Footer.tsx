import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import '../style/Footer.css';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const handleScrollTo = (id: string) => {
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

  return (
    <footer className={`footer ${theme}`}>
      <div className="footer-container">
        <div className="footer-content">
          <section id="contact">
            <div className="footer-section contact-section">
              <h3>Contact Information</h3>
              <p>Aarthi Ganesan</p>
              <p><img src="/icons/email.png" alt="Email" className="contact-icon" /> <a href="mailto:aarthig0611@gmail.com">aarthig0611@gmail.com</a></p>
              <p><img src="/icons/github.png" alt="GitHub" className="contact-icon" /> <a href="https://github.com/aarthig0611/face-recognition-app" target="_blank" rel="noopener noreferrer">Face Recognition App</a></p>
            </div>
          </section>

          <div className="footer-section links-section">
            <h3>Quick Links</h3>
            <ul>
              <li><button onClick={() => handleScrollTo('start')}>Home</button></li>
              <li><button onClick={() => handleScrollTo('how-it-works')}>How it works</button></li>
              <li><button onClick={() => handleScrollTo('about')}>How it's build</button></li>
              <li><button onClick={() => handleScrollTo('use-cases')}>How it's used</button></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Face Recognition App. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;