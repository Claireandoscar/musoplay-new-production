import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export function GameProvider({ children, gameType = 'main' }) {
  const [showInstructions, setShowInstructions] = useState(() => {
    const hasSeenWarmup = sessionStorage.getItem('warmupInstructionsSeen');
    if (gameType === 'warmup' && !hasSeenWarmup) {
      return true;
    }
    const lastShownTime = sessionStorage.getItem(`${gameType}InstructionsShown`);
    return !lastShownTime;
  });

  useEffect(() => {
    if (!showInstructions) {
      if (gameType === 'warmup') {
        sessionStorage.setItem('warmupInstructionsSeen', 'true');
      }
      sessionStorage.setItem(`${gameType}InstructionsShown`, Date.now().toString());
    }
  }, [showInstructions, gameType]);

  const value = {
    showInstructions,
    setShowInstructions,
    gameType
  };

  return (
    <GameContext.Provider value={value}>{children}</GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}

export default GameContext;