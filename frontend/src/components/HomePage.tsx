import React, { useState, useEffect } from 'react';
import { useTheme } from '../components/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import '../style/HomePage.css';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

type Page = 'home' | 'webcam' | 'upload';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
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
    // Frontend Technologies
    {
      name: "React:",
      icon: require("../assets/icons8-react-150.png"),
      description: "Dynamic UI rendering for a smooth user experience."
    },
    {
      name: "Redux:",
      icon: require("../assets/icons8-redux-150.png"),
      description: "Keeps your app state clean and globally synced."
    },
    {
      name: "TypeScript:",
      icon: require("../assets/icons8-typescript-150.png"),
      description: "Adds type safety and scalability to JavaScript code."
    },
    {
      name: "HTML5 Canvas:",
      icon: require("../assets/icons8-html-5-150.png"),
      description: "Draws bounding boxes and emotion overlays in real time."
    },
  
    // Backend Technologies
    {
      name: "Express:",
      icon: require("../assets/icons8-express-js-150.png"), // Make sure this file exists
      description: "Backend framework for handling APIs and routes efficiently."
    },
  
    // AI/ML Technologies
    {
      name: "TensorFlow.js:",
      icon: require("../assets/icons8-tensorflow-150.png"), // Make sure this file exists
      description: "Runs ML models directly in the browser for facial emotion analysis."
    },
    {
      name: "face-api.js:",
      icon: require("../assets/icons8-rest-api-100.png"),
      description: "Detects faces, emotions, and facial features using deep learning."
    },
    {
      name: "Kaggle:",
      icon: require("../assets/icons8-kaggle-150.png"),
      description: "Used Celebrity Face Dataset to trains the app to recognize known faces across uploads."
    },
  
    // Design & Infrastructure
    {
      name: "Figma:",
      icon: require("../assets/icons8-figma-150.png"), 
      description: "Design prototyping and UI layout planning done in Figma."
    },
    {
      name: "Azure:",
      icon: require("../assets/icons8-azure-150.png"), 
      description: "Cloud platform used for app hosting and deployment."
    }
  ];
  

  const useCases = [
    {
      title: "Movie & Media Reviews",
      description: "Capture live emotional reactions during movie trailers, short films, or ad previews to better understand audience sentiment.",
      image: "movie_media_review.png"
    },
    {
      title: "Game Development & Testing",
      description: "Gauge player engagement and emotional feedback throughout gameplay for refining user experience and game mechanics.",
      image: "game_dev_test.png"
    },
    {
      title: "UI/UX & Product Research",
      description: "Measure how users emotionally respond to new designs or features to make data-driven improvements in usability and design.",
      image: "product_review.png"
    },
    {
      title: "Online Learning & Classrooms",
      description: "Track student attention, confusion, or excitement levels during online sessions to adapt teaching methods accordingly.",
      image: "online_learning.png"
    },
    {
      title: "Mental Health & Wellness",
      description: "Monitor facial expressions over time to detect emotional patterns that could support therapy or self-awareness tools.",
      image: "mental_health.png"
    },
    {
      title: "Retail & Customer Feedback",
      description: "Evaluate customer reactions during product demos, feedback sessions, or surveys to enhance service and product satisfaction.",
      image: "customer_feedback.png"
    }
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1200,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 }
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1 }
      }
    ]
  };

  return (
    <div className={`homepage-container ${loaded ? 'loaded' : ''}`}>
      {/* Hero Section */}
      <div className="hero-container-color">
        <div className="container-align">
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
                <button onClick={() => onNavigate('webcam')} className="btn pulse-animation">Start Live Detection</button>
                <button onClick={() => onNavigate('upload')} className="btn btn-secondary pulse-animation">Analyze Photo</button>
              </motion.div>
            </motion.div>
            <motion.div 
              className="hero-image"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <img 
                src={require("../assets/face_recognition_app.png")} 
                alt="Face Recognition App Preview"
              />
            </motion.div>
          </motion.section>
        </div>
      </div>

      {/* How it works */}
      <div className="how-it-works-container">
        <div className="container-align">
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
      </div>

      {/* How it works */}
      <div className="how-its-made-container">
        <div className="container-align">
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
              <Slider {...sliderSettings}>
                {techItems.map((tech, index) => (
                  <motion.div 
                    key={tech.name}
                    className="tech-item"
                    variants={slideUp}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="tech-icon">
                      <img src={tech.icon} alt={tech.name} />
                      <div className="tech-hover-text"><strong>{tech.name}</strong> {tech.description}</div>
                    </div>

                  </motion.div>
                ))}
              </Slider>
            </motion.div>
          </motion.section>
        </div>
      </div>

      {/* Use Cases */}
      <div className="how-its-used-container">
        <div className="container-align">
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
    </div>
  );
};

export default HomePage;
