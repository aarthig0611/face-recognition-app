import React from 'react';
import { useTheme } from './ThemeContext';
import '../style/Footer.css';

type Page = 'home' | 'webcam' | 'upload';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { theme } = useTheme();

  const handleScrollTo = (id: string) => {
    onNavigate('home');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const navbar = document.querySelector('.navbar') as HTMLElement;
        const navbarHeight = navbar?.offsetHeight || 0;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  return (
    <footer className={`footer ${theme}`}>
      <div className="footer-container">
        <div className="footer-content">
          <section id="contact">
            <div className="footer-section contact-section">
              <h3>Contact Information</h3>
              <p><strong>Aarthi Ganesan</strong></p>
              <p>
                <img 
                  src={theme === 'light' 
                    ? require("../assets/dark-icons8-email-50.png") 
                    : require("../assets/white-icons8-email-50.png")} 
                  alt="Email" 
                  className="contact-icon" 
                /> 
                <a href="mailto:aarthig0611@gmail.com">aarthig0611@gmail.com</a>
              </p>
              <p>
                <img 
                  src={theme === 'light' 
                    ? require("../assets/dark-icons8-linkedin-50.png") 
                    : require("../assets/icons8-linkedin-50.png")} 
                  alt="LinkedIn" 
                  className="contact-icon" 
                /> 
                <a href="https://www.linkedin.com/in/aarthi-ganesan/" target="_blank" rel="noopener noreferrer">aarthi-ganesan</a>
              </p>
            </div>
          </section>

          <div className="footer-section links-section">
            <h3>Quick Links</h3>
            <ul>
              <li><button onClick={() => handleScrollTo('start')}>Home</button></li>
              <li><button onClick={() => handleScrollTo('how-it-works')}>How it works</button></li>
              <li><button onClick={() => handleScrollTo('about')}>How it's made</button></li>
              <li><button onClick={() => handleScrollTo('use-cases')}>How it's used</button></li>
              <li><a href="https://github.com/aarthig0611/face-recognition-app" target="_blank" rel="noopener noreferrer">GitHub Link</a></li>
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