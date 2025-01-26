import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export function GameProvider({ children, gameType = 'main' }) {
  // Clear storage for testing
  useEffect(() => {
    sessionStorage.removeItem('warmupInstructionsShown');
    console.log('Storage cleared for testing');
  }, []);

  const [showInstructions, setShowInstructions] = useState(() => {
    const stored = sessionStorage.getItem('warmupInstructionsShown');
    console.log('GameProvider init:', { gameType, stored });
    return stored !== 'true';
  });

  useEffect(() => {
    console.log('GameProvider effect:', { showInstructions, gameType });
    if (!showInstructions) {
      sessionStorage.setItem('warmupInstructionsShown', 'true');
    }
  }, [showInstructions, gameType]);

  return (
    <GameContext.Provider value={{ showInstructions, setShowInstructions, gameType }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  console.log('useGame hook called:', context);
  return context;
}

export default GameContext;