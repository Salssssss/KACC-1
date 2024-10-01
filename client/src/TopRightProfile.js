//https://developer.mozilla.org/en-US/docs/Web/CSS/top 
//https://htmlcheatsheet.com/css/ 
//https://www.w3schools.com/css/css3_images.asp 
//https://www.w3schools.com/html/html_images.asp 
import React from 'react';

const TopRightProfile = () => {
  const username = localStorage.getItem('username');
  const profilePicture = require('./tempAssets/pfp.jpg')

  return (
    <div style={{ position: 'absolute', top: '10px', right: '20px', display: 'flex', alignItems: 'center' , color: 'yellow'}}>

      {profilePicture && <img src={profilePicture} alt="User" style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px' }} />}

      {username && <span>{username}</span>}
    </div>
  );
};

export default TopRightProfile;
 