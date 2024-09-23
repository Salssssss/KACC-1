import React from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation

const LandingPage = () => {
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  return (
    <div>
      <nav>
        <div className="rightNav">
        <button onClick={() => navigate('/')}>
          <img></img>
        </button>
        </div>
        <div className="leftNav">
          <button onClick={() => navigate('/login')}>Login</button>
          <button onClick={() => navigate('/create-account')}>Create Account</button>
        </div>
      </nav>
      <div class="slider">
          <figure>
              <div class="slide">
                  <p>Image One</p>
                  <img src={"./tempAssets/adamrotter_loafc4_wwwadamrotterpl-1.jpg"}></img>
              </div>
              <div class="slide">
                  <p>Image Two</p>
                  <img src="tempAssets/1-Rashed-AlShashai-A-Concise-Passage-installation-view-at-Desert-X-AlUla-photo-Lance-Gerber-courtesy-the-artist-RCU-and-Desert-X-scaled.jpg"></img>
              </div>
              <div class="slide">
                  <p>Image Three</p>
                  <img src="tempAssets/content_aziz-acharki-290990.jpg"></img>
              </div>
              <div class="slide">
                  <p>Image Four</p>
                  <img src="tempAssets/Cover21.jpg"></img>
              </div>
              <div class="slide">
                  <p>Image Five</p>
                  <img src="tempAssets/shutterstock_189352979.jpg"></img>
              </div>
          </figure>
      </div>
    </div>
  );
};

export default LandingPage;
