import React from 'react';
import { useNavigate } from 'react-router-dom';

// Import images from the local directory
import logo from './images/Gray and Black Simple Studio Logo.png';

const Nav = () => {
  const navigate = useNavigate();

    return (
        <nav>
            <div className="leftNav">
                <button onClick={() => navigate('/')}>
                    <img src={logo} alt="Navigation Logo" style={{ width: '50px' }} /> {/* Replace this with the actual image */}
                </button>
            </div>
            <div className="rightNav">
                <button onClick={() => navigate('/login')}>Login</button>
                <button onClick={() => navigate('/create-profile')}>Create Account</button>
            </div>
        </nav>
    );
};

export default Nav;