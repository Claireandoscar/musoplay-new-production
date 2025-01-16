import React from 'react';
import './ProgressBar.css';

function ProgressBar({ completedBars }) {
  const progress = (completedBars / 4) * 100;
  const themeColor = '#1174B9';

  return (
    <div className="main-progress-bar-container" style={{ borderColor: themeColor }}>
      <div 
        className="main-progress-bar-fill" 
        style={{ 
          width: `${progress}%`,
          backgroundColor: themeColor
        }}
      ></div>
    </div>
  );
}

export default ProgressBar;