// src/game/components/LifeIndicator.js
import React, { useState, useEffect } from 'react';
import './LifeIndicator.css';

function LifeIndicator({ hearts, isBarFailed }) {
  const [isSunday, setIsSunday] = useState(false);

  useEffect(() => {
    const checkDay = () => {
      setIsSunday(new Date().getDay() === 0);
    };
    
    checkDay();
    const interval = setInterval(checkDay, 3600000);
    return () => clearInterval(interval);
  }, []);

  const getHeartImage = (isActive) => {
    if (isSunday) {
      return isActive ? 'heart.svg' : 'heart-empty.svg';
    } else {
      return isActive ? 'orangeheart.svg' : 'orangeheart-empty.svg';
    }
  };

  return (
    <div className="life-indicator">
      {[...Array(4)].map((_, i) => (
        <img
          key={i}
          src={process.env.PUBLIC_URL + `/assets/images/ui/${getHeartImage(i < hearts)}`}
          alt={i < hearts ? "Active Life" : "Lost Life"}
          className={`heart ${hearts === 0 && isBarFailed ? 'breaking' : ''}`}
        />
      ))}
    </div>
  );
}

export default LifeIndicator;