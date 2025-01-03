import React from 'react';
import './ProgressBar.css';

function ProgressBar({ completedBars }) {
  const progress = (completedBars / 4) * 100;

  return (
    <div className="main-progress-bar-container">
      <div 
        className="main-progress-bar-fill" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
}

export default ProgressBar;