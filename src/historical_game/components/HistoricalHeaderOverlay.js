// src/historical_game/components/HistoricalHeaderOverlay.js
import React from 'react';
import './HistoricalHeaderOverlay.css';

const HistoricalHeaderOverlay = ({ date, playMode }) => {
  // Format the date
  const formattedDate = date ? date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : '';

  return (
    <div className="historical-text-overlay">
      REPLAY {formattedDate}
    </div>
  );
};

export default HistoricalHeaderOverlay;