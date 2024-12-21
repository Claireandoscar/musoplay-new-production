import React from 'react';
import './StartScreen.css';

const StartScreen = ({ onStartGame }) => {
  return (
    <div className="start-screen">
      <img 
        src="/assets/images/ui/logo.svg" 
        alt="Musoplay Logo" 
        className="logo"
      />
      <div className="tagline">THE DAILY MUSIC GAME</div>
      
      <div className="testing-info">
        <p>
          WELCOME TO MUSOPLAY TESTING!
          PLEASE SHARE YOUR THOUGHTS IN A QUICK SURVEY AFTER
        </p>
      </div>

      <button className="next-button" onClick={onStartGame}>
        <img src="/assets/images/ui/next.svg" alt="Next" />
      </button>
    </div>
  );
};

export default StartScreen;