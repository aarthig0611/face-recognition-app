import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div>
      <div>
        <h1>Welcome to Face Recognition App</h1>
        <p>
          Upload a photo or use your webcam to recognize faces, detect age, gender, and emotions,
          and register new users if they're not recognized.
        </p>

        <div>
          <Link to="/webcam">Use Webcam</Link>
          <Link to="/upload">Upload Image</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
