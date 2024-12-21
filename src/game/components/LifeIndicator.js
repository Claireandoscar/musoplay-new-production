// LifeIndicator.js
import React from 'react';
import './LifeIndicator.css';

function LifeIndicator({ hearts, isBarFailed }) {
  return (
    <div className="life-indicator">
      {[...Array(4)].map((_, i) => (
        <img 
          key={i}
          src={process.env.PUBLIC_URL + `/assets/images/ui/${i < hearts ? 'heart.svg' : 'heart-empty.svg'}`} 
          alt={i < hearts ? "Active Life" : "Lost Life"} 
          className={`heart ${hearts === 0 && isBarFailed ? 'breaking' : ''}`}
        />
      ))}
    </div>
  );
}

export default LifeIndicator;