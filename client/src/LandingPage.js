import React from 'react';

// Import images from the local directory
import imageOne from './tempAssets/depositphotos_2707374-stock-photo-accounting.jpg';
import imageTwo from './tempAssets/SOIN20217_780x440.jpg';
import imageThree from './tempAssets/loveandmoneyhub21_hero.jpg';
import imageFour from './tempAssets/pexels-pixabay-53621.jpg';
import imageFive from './tempAssets/Stock-ChartBoard-04-adobe.jpg';

const LandingPage = () => {

  return (
    <div className='landing'>
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
      <div className='landingPageText'>
        <h1>KACC</h1>
      </div>
    </div>
  );
};

export default LandingPage;
