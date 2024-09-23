import React from 'react';
import { useNavigate } from 'react-router-dom';

// Import images from the local directory
import imageOne from './tempAssets/adamrotter_loafc4_wwwadamrotterpl-1.jpg';
import imageTwo from './tempAssets/1-Rashed-AlShashai-A-Concise-Passage-installation-view-at-Desert-X-AlUla-photo-Lance-Gerber-courtesy-the-artist-RCU-and-Desert-X-scaled.jpg';
import imageThree from './tempAssets/content_aziz-acharki-290990.jpg';
import imageFour from './tempAssets/Cover21.jpg';
import imageFive from './tempAssets/shutterstock_189352979.jpg';

const LandingPage = () => {
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  return (
    <div>
      <nav>
        <div className="rightNav">
          <button onClick={() => navigate('/')}>
            <img src={imageOne} alt="Navigation Logo" style={{ width: '50px' }} /> {/* Replace this with the actual image */}
          </button>
        </div>
        <div className="leftNav">
          <button onClick={() => navigate('/login')}>Login</button>
          <button onClick={() => navigate('/create-account')}>Create Account</button>
        </div>
      </nav>

      <div className="slider">
        <figure>
          <div className="slide">
            <p>Image One</p>
            <img src={imageOne} alt="" />
          </div>
          <div className="slide">
            <p>Image Two</p>
            <img src={imageTwo} alt="" />
          </div>
          <div className="slide">
            <p>Image Three</p>
            <img src={imageThree} alt="" />
          </div>
          <div className="slide">
            <p>Image Four</p>
            <img src={imageFour} alt="" />
          </div>
          <div className="slide">
            <p>Image Five</p>
            <img src={imageFive} alt="" />
          </div>
        </figure>
      </div>
    </div>
  );
};

export default LandingPage;
