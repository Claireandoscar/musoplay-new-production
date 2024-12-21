import React from 'react';
import './PracticeButton.css';

const PracticeButton = ({ onClick, isAvailable }) => {
  return (
    <button 
      className={`practice-button ${!isAvailable ? 'hidden' : ''}`}
      onClick={onClick}
      disabled={!isAvailable}
    >
      <img 
        src="/assets/images/ui/practice.svg" 
        alt="Practice melody" 
      />
    </button>
  );
};

export default PracticeButton;