import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../style/HomePage.css';

const HomePage: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="homepage-container">

      {/* Hero Section */}
      <section id="start" className="hero">
        <div className="hero-text">
          <h1>Webcam Image Feed with Facial Recognition</h1>
          <p>Smart facial recognition at your fingertips.</p>
          <div className="hero-buttons">
            <Link to="/webcam" className="btn">Use Webcam</Link>
            <Link to="/upload" className="btn btn-secondary">Analyze Photo</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="Laptop with Digital Face Recognition.png" alt="Detected face preview" />
        </div>
      </section>

      {/* Getting Started */}
      <section id="how-it-works" className="info-section">
        <h2>Getting Started Made Simple</h2>
        <div className="info-cards">
          <div className="info-card">
            <h3>Use Your Webcam</h3>
            <ol>
              <li><strong>Grant Access:</strong> Allow your camera when prompted.</li>
              <li><strong>Start Detection:</strong> Click <em>Start</em> to begin real-time analysis.</li>
              <li><strong>See Emotions:</strong> Watch your emotions being tracked live.</li>
              <li><strong>Register Faces:</strong> Unknown faces appear for easy registration.</li>
              <li><strong>Get Insights:</strong> Stop the feed to view detailed emotion reports (Only for registered users).</li>
            </ol>
          </div>
          <div className="info-card">
            <h3>Upload a Photo</h3>
            <ol>
              <li><strong>Select Image:</strong> Upload JPG or PNG of a face.</li>
              <li><strong>Instant Recognition:</strong> The system analyzes faces and emotions.</li>
              <li><strong>Name Unknowns:</strong> Add names for any unidentified faces.</li>
              <li><strong>Smarter Each Time:</strong> The app remembers registered faces for future uploads.</li>
            </ol>
          </div>
        </div>
      </section>


      {/* How it works */}
      <section id="about" className="info-section">
        <h2>How It Works</h2>
        <p className="intro-text">
          We built this app to recognize faces and emotions using modern, responsive web tools and AI models — all in real time. Here's what makes it tick:
        </p>

        <div className="tech-icon-grid">
          <div className="tech-item">
            <div className="tech-icon">
              <img src="icons8-react-150.png" alt="React" />
            </div>
            <p className="tech-hover-text">
                <strong>React</strong><br />Dynamic UI rendering for a smooth user experience.
            </p>
          </div>
          <div className="tech-item">
            <div className="tech-icon">
              <img src="icons8-redux-150.png" alt="Redux" />
            </div>
            <p className="tech-hover-text">
                <strong>Redux</strong><br />Keeps your app state clean and globally synced.
            </p>
          </div>
          <div className="tech-item">
            <div className="tech-icon">
              <img src="icons8-typescript-150.png" alt="Express" />
            </div>
            <p className="tech-hover-text">
                <strong>Express + TypeScript</strong><br />Handles backend APIs with speed and structure.
            </p>
          </div>
          <div className="tech-item">
            <div className="tech-icon">
              <img src="icons8-face-150.png" alt="face-api.js" />
            </div>
            <p className="tech-hover-text">
                <strong>face-api.js</strong><br />Detects faces, emotions, and facial features using deep learning.
            </p>
          </div>
          <div className="tech-item">
            <div className="tech-icon">
              <img src="icons8-html5-150.png" alt="HTML5 Canvas" />
            </div>
            <p className="tech-hover-text">
                <strong>HTML5 Canvas</strong><br />Draws bounding boxes and emotion overlays in real time.
            </p>
          </div>
          <div className="tech-item">
            <div className="tech-icon">
              <img src="icons8-kaggle-150.png" alt="Kaggle Dataset" />
            </div>
            <p className="tech-hover-text">
                <strong>Celebrity Face Dataset</strong><br />Trains the app to recognize known faces across uploads.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="info-section">
        <h2>Use Cases</h2>
        <div className="use-cards">
          <div className="use-card">
            <h4>🎬 Movie & Media Reviews</h4>
            <p>Capture live emotional reactions during movie trailers, short films, or ad previews to better understand audience sentiment.</p>
          </div>
          <div className="use-card">
            <h4>🎮 Game Development & Testing</h4>
            <p>Gauge player engagement and emotional feedback throughout gameplay for refining user experience and game mechanics.</p>
          </div>
          <div className="use-card">
            <h4>🧪 UI/UX & Product Research</h4>
            <p>Measure how users emotionally respond to new designs or features to make data-driven improvements in usability and design.</p>
          </div>
          <div className="use-card">
            <h4>🏫 Online Learning & Classrooms</h4>
            <p>Track student attention, confusion, or excitement levels during online sessions to adapt teaching methods accordingly.</p>
          </div>
          <div className="use-card">
            <h4>🏥 Mental Health & Wellness</h4>
            <p>Monitor facial expressions over time to detect emotional patterns that could support therapy or self-awareness tools.</p>
          </div>
          <div className="use-card">
            <h4>🛍️ Retail & Customer Feedback</h4>
            <p>Evaluate customer reactions during product demos, feedback sessions, or surveys to enhance service and product satisfaction.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
