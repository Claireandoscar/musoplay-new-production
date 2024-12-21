import React from 'react';
import './ListenButton.css';

const ListenButton = ({ onClick, isAnimated }) => {
  return (
    <button 
      className={`listen-button ${isAnimated ? 'animated' : ''}`} 
      onClick={onClick}
    >
      <img 
        src="/assets/images/ui/listen.svg" 
        alt="Listen to melody" 
      />
    </button>
  );
};

export default ListenButton;