// src/warm_up_game/components/LifeIndicator.js
import React from 'react';
import './LifeIndicator.css';
import WarmUpOverlayText from './WarmUpOverlayText';

function LifeIndicator({ hearts, isBarFailed }) {
  return (
    <>
      <div className="life-indicator">
        {[...Array(4)].map((_, i) => (
          <img
            key={i}
            src={process.env.PUBLIC_URL + `/assets/images/ui/${i < hearts ? 'greenheart.svg' : 'greenheart-empty.svg'}`}
            alt={i < hearts ? "Active Life" : "Lost Life"}
            className={`heart ${hearts === 0 && isBarFailed ? 'breaking' : ''}`}
          />
        ))}
      </div>
      <WarmUpOverlayText />
    </>
  );
}

export default LifeIndicator;