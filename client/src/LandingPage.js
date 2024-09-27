import React from 'react';

// Import images from the local directory
import imageOne from './tempAssets/adamrotter_loafc4_wwwadamrotterpl-1.jpg';
import imageTwo from './tempAssets/1-Rashed-AlShashai-A-Concise-Passage-installation-view-at-Desert-X-AlUla-photo-Lance-Gerber-courtesy-the-artist-RCU-and-Desert-X-scaled.jpg';
import imageThree from './tempAssets/content_aziz-acharki-290990.jpg';
import imageFour from './tempAssets/Cover21.jpg';
import imageFive from './tempAssets/shutterstock_189352979.jpg';

const LandingPage = () => {

  return (
    <div>
      <div className="slider">
        <figure>
          <div className="slide">
            <img src={imageOne} alt="" />
          </div>
          <div className="slide">
            <img src={imageTwo} alt="" />
          </div>
          <div className="slide">
            <img src={imageThree} alt="" />
          </div>
          <div className="slide">
            <img src={imageFour} alt="" />
          </div>
          <div className="slide">
            <img src={imageFive} alt="" />
          </div>
        </figure>
      </div>
    </div>
  );
};

export default LandingPage;
