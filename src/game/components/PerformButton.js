import React from 'react';
import './PerformButton.css';

const PerformButton = ({ onClick, isAvailable }) => {
  return (
    <button 
      className={`perform-button ${!isAvailable ? 'hidden' : ''}`}
      onClick={onClick}
      disabled={!isAvailable}
    >
      <img 
        src="/assets/images/ui/perform.svg" 
        alt="Perform melody" 
      />
    </button>
  );
};

export default PerformButton;