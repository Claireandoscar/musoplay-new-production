import React from 'react';
import HeaderToolbar from '../components/HeaderToolbar';
import './SignUpPage.css';

const SignUpPage = () => {
  return (
    <div className="signup-container">
      <HeaderToolbar />
      
      <div className="signup-content">
        <div className="title-section">
          <div className="title-container">
            <img src="/assets/images/ui/n6.svg" alt="" className="n6-icon" />
            <h1 className="title">CREATE A FREE ACCOUNT</h1>
          </div>
        </div>

        <div className="content-container">
          {/* Left side login section */}
          <div className="login-section">
            <div className="social-buttons">
              <button className="social-button">CONTINUE WITH GOOGLE</button>
              <button className="social-button">CONTINUE WITH APPLE</button>
              <button className="social-button">CONTINUE WITH FACEBOOK</button>
            </div>
            
            <div className="login-form">
              <div className="email-password-container">
                <input type="email" placeholder="Email" />
                <input type="password" placeholder="Password" />
              </div>
              <button className="create-account-button">CREATE ACCOUNT</button>
            </div>
          </div>

          {/* Right Section */}
          <div className="features-section">
            <div className="feature-list">
              <div className="feature-item">
                <img src="/assets/images/ui/statsbullet.svg" alt="" className="feature-icon" />
                <span>TRACK YOUR STATS AND STREAKS</span>
              </div>
              <div className="feature-item">
                <img src="/assets/images/ui/warmupbullet.svg" alt="" className="feature-icon" />
                <span>ACCESS WEEKLY WARM-UP GAME</span>
              </div>
              <div className="feature-item">
                <img src="/assets/images/ui/archive.svg" alt="" className="feature-icon" />
                <span>PLAY ALL HISTORIC GAMES</span>
              </div>
              <div className="feature-item">
                <img src="/assets/images/ui/terms.svg" alt="" className="feature-icon" />
                <span>LEARN A NEW MUSICAL TERM DAILY</span>
              </div>
              <div className="feature-item">
                <img src="/assets/images/ui/subscribebullet.svg" alt="" className="feature-icon" />
                <span>RECEIVE DAILY GAME STRAIGHT TO YOUR INBOX</span>
              </div>
            </div>
            <button className="play-game-button">PLAY TODAY'S GAME</button>
          </div>
        </div>

        {/* Footer links - moved outside content-container */}
        <div className="footer-links">
          <button className="footer-button">Privacy Policy</button>
          <button className="footer-button">Terms & Conditions</button>
          <button className="footer-button">Cookie Policy</button>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;