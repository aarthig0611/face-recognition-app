import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import '../style/HomePage.css';

const HomePage: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme } = useTheme();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
  };

  const slideUp = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const techItems = [
    {
      name: "React",
      icon: "icons8-react-150.png",
      description: "Dynamic UI rendering for a smooth user experience."
    },
    {
      name: "Redux",
      icon: "icons8-redux-150.png",
      description: "Keeps your app state clean and globally synced."
    },
    {
      name: "Express + TypeScript",
      icon: "icons8-typescript-150.png",
      description: "Handles backend APIs with speed and structure."
    },
    {
      name: "face-api.js",
      icon: "icons8-face-150.png",
      description: "Detects faces, emotions, and facial features using deep learning."
    },
    {
      name: "HTML5 Canvas",
      icon: "icons8-html5-150.png",
      description: "Draws bounding boxes and emotion overlays in real time."
    },
    {
      name: "Celebrity Face Dataset",
      icon: "icons8-kaggle-150.png",
      description: "Trains the app to recognize known faces across uploads."
    }
  ];

  const useCases = [
    {
      title: "Movie & Media Reviews",
      description: "Capture live emotional reactions during movie trailers, short films, or ad previews to better understand audience sentiment.",
      image: "1.png"
    },
    {
      title: "Game Development & Testing",
      description: "Gauge player engagement and emotional feedback throughout gameplay for refining user experience and game mechanics.",
      image: "2.png"
    },
    {
      title: "UI/UX & Product Research",
      description: "Measure how users emotionally respond to new designs or features to make data-driven improvements in usability and design.",
      image: "1.png"
    },
    {
      title: "Online Learning & Classrooms",
      description: "Track student attention, confusion, or excitement levels during online sessions to adapt teaching methods accordingly.",
      image: "2.png"
    },
    {
      title: "Mental Health & Wellness",
      description: "Monitor facial expressions over time to detect emotional patterns that could support therapy or self-awareness tools.",
      image: "1.png"
    },
    {
      title: "Retail & Customer Feedback",
      description: "Evaluate customer reactions during product demos, feedback sessions, or surveys to enhance service and product satisfaction.",
      image: "2.png"
    }
  ];

  return (
    <div className={`homepage-container ${loaded ? 'loaded' : ''}`}>
      {/* Hero Section */}
      <motion.section 
        id="start" 
        className="hero"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <motion.div className="hero-text" variants={staggerContainer}>
          <motion.h1 variants={slideUp}>Webcam Image Feed with Facial Recognition</motion.h1>
          <motion.p variants={slideUp}>Smart facial recognition at your fingertips.</motion.p>
          <motion.div className="hero-buttons" variants={slideUp}>
            <Link to="/webcam" className="btn pulse-animation">Start Live Detection</Link>
            <Link to="/upload" className="btn btn-secondary pulse-animation">Analyze Photo</Link>
          </motion.div>
        </motion.div>
        <motion.div 
          className="hero-image"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <img 
            src={theme === 'dark' 
              ? "Laptop-with-Digital-Face-Recognition-dark.png" 
              : "Laptop-with-Digital-Face-Recognition-light.png"} 
            alt="Detected face preview" 
          />
        </motion.div>
      </motion.section>

      {/* How it works */}
      <div className="how-it-works-container">
        <motion.section 
          id="how-it-works" 
          className="info-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2>How it works</h2>
          <div className="info-cards">
            <motion.div 
              className="info-card"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <h3>Use Your Webcam</h3>
              <ol>
                <li><strong>Grant Access:</strong> Allow your camera when prompted.</li>
                <li><strong>Start Detection:</strong> Click <em>Start</em> to begin real-time analysis.</li>
                <li><strong>See Emotions:</strong> Watch your emotions being tracked live.</li>
                <li><strong>Register Faces:</strong> Unknown faces appear for easy registration.</li>
                <li><strong>Get Insights:</strong> Stop the feed to view detailed emotion reports (Only for registered users).</li>
              </ol>
            </motion.div>
            <motion.div 
              className="info-card"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h3>Upload a Photo</h3>
              <ol>
                <li><strong>Select Image:</strong> Upload JPG or PNG of a face.</li>
                <li><strong>Instant Recognition:</strong> The system analyzes faces and emotions.</li>
                <li><strong>Name Unknowns:</strong> Add names for any unidentified faces.</li>
                <li><strong>Smarter Each Time:</strong> The app remembers registered faces for future uploads.</li>
              </ol>
            </motion.div>
          </div>
        </motion.section>
      </div>

      {/* How it works */}
      <div className="how-its-made-container">
        <motion.section 
          id="about" 
          className="info-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2>How It's Made</h2>
          <p className="intro-text">
            We built this app to recognize faces and emotions using modern, responsive web tools and AI models — all in real time. Here's what makes it tick:
          </p>

          <motion.div 
            className="tech-icon-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {techItems.map((tech, index) => (
              <motion.div 
                key={tech.name}
                className="tech-item"
                variants={slideUp}
                whileHover={{ scale: 1.05 }}
              >
                <div className="tech-icon">
                  <img src={tech.icon} alt={tech.name} />
                </div>
                <div className="tech-hover-text">
                  <strong>{tech.name}</strong><br />{tech.description}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </div>

      {/* Use Cases */}
      <div className="how-its-used-container">
        <motion.section 
          id="use-cases" 
          className="info-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2>How It's Used</h2>
          <motion.div 
            className="use-cards"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {useCases.map((useCase, index) => (
              <motion.div 
                key={useCase.title}
                className="use-card"
                variants={slideUp}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                style={{
                  '--bg-image': `url(${require(`../assets/${useCase.image}`)})`
                } as React.CSSProperties}
              >
                <h4>{useCase.title}</h4>
                <p>{useCase.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
};

export default HomePage;
