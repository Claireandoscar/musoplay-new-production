// src/game/components/GameBoard.js
import React, { useState, useEffect } from 'react';
import LifeIndicator from './LifeIndicator';
import Bar from './Bar';
import VisualFeedback from './VisualFeedback';

const GameBoard = ({
  barHearts,
  currentBarIndex,
  renderBar,
  isBarFailed,
  gamePhase,
  isWarmupMode  // Add this prop
}) => {
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (renderBar?.failedBars?.[currentBarIndex] === true) {
      if (!showFeedback && currentBarIndex < 3) {
        setShowFeedback(true);
      }
    }
  }, [renderBar?.failedBars, currentBarIndex, showFeedback]);

  // Debug logging to track props
  console.log('GameBoard Render:', {
    currentBarIndex,
    gamePhase,
    correctSequence: renderBar?.correctSequence,
    completedBars: renderBar?.completedBars,
    currentNoteIndex: renderBar?.currentNoteIndex,
    failedBars: renderBar?.failedBars,
    showFeedback,
    isWarmupMode  // Add to debug logging
  });

  const renderBarComponent = (barNumber) => {
    const barIndex = barNumber - 1;
    const isCurrentBar = currentBarIndex === barIndex;

    console.log(`Bar ${barNumber} rendering:`, {
      sequence: renderBar?.correctSequence?.[barIndex],
      currentNoteIndex: isCurrentBar ? renderBar?.currentNoteIndex : 0,
      isComplete: renderBar?.completedBars?.[barIndex],
      isFailing: isBarFailed && isCurrentBar,
      hasFailed: renderBar?.failedBars?.[barIndex]
    });

    return (
      <Bar
        key={barNumber}
        barNumber={barNumber}
        isActive={isCurrentBar}
        sequence={renderBar?.correctSequence?.[barIndex] || []}
        currentNoteIndex={isCurrentBar ? renderBar?.currentNoteIndex : 0}
        isBarComplete={renderBar?.completedBars?.[barIndex] || false}
        isGameComplete={renderBar?.isGameComplete || false}
        isBarFailing={isBarFailed && isCurrentBar}
        hasFailed={renderBar?.failedBars?.[barIndex]}
        gamePhase={gamePhase}
      />
    );
  };

  // Early return if essential props are missing
  if (!renderBar?.correctSequence) {
    console.warn('GameBoard: Missing correct sequence data');
    return (
      <div className="bars-container">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="lives-container">
        <LifeIndicator
          hearts={barHearts[currentBarIndex] || 0}
          isBarFailed={isBarFailed}
          isWarmupMode={isWarmupMode}  // Pass the prop to LifeIndicator
        />
      </div>
      <div className="bars-container">
        {[1, 2, 3, 4].map(barNumber => renderBarComponent(barNumber))}
      </div>
      <VisualFeedback
        barNumber={currentBarIndex + 1}
        show={renderBar?.failedBars?.[currentBarIndex] && currentBarIndex < 3}
        onComplete={() => {
          console.log('Feedback complete');
        }}
      />
    </>
  );
};

export default GameBoard;