import React, { useState, useEffect } from 'react';
import './ProgressBar.css';

function ProgressBar({ completedBars }) {
  const [isSunday, setIsSunday] = useState(false);
  const progress = (completedBars / 4) * 100;

  useEffect(() => {
    const checkDay = () => {
      setIsSunday(new Date().getDay() === 0);
    };
    
    checkDay();
    const interval = setInterval(checkDay, 3600000);
    return () => clearInterval(interval);
  }, []);

  const themeColor = isSunday ? '#FF2376' : '#AB08FF';

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