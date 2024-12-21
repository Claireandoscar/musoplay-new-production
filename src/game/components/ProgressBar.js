import React from 'react';
import './ProgressBar.css';

function ProgressBar({ completedBars }) {
  const progress = (completedBars / 4) * 100; // Assuming there are 4 bars in total

  return (
    <div className="progress-bar-container">
      <div 
        className="progress-bar-fill" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
}

export default ProgressBar;