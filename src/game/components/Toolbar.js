// Toolbar.js
import React from 'react';
import './Toolbar.css';

const Toolbar = ({ onShowInstructions }) => {
  const handleClick = () => {
    console.log('Help button clicked');
    onShowInstructions();
  };

  return (
    <div className="toolbar">
      <img 
        src="/assets/images/ui/logo.svg" 
        alt="Musoplay Logo" 
        className="toolbar-logo"
      />
      <button 
        onClick={handleClick}
        className="how-to-play-button"
        aria-label="Show instructions"
      >
        <img 
          src="/assets/images/ui/how-to-play.svg" 
          alt="How To Play" 
          className="how-to-play-icon"
        />
      </button>
    </div>
  );
};

export default Toolbar;