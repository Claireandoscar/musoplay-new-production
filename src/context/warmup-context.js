import React, { createContext, useContext, useState } from 'react';

const WarmUpContext = createContext();

export function WarmUpProvider({ children }) {
  const [showInstructions, setShowInstructions] = useState(() => {
    return sessionStorage.getItem('warmupShown') !== 'true';
  });

  const value = {
    showInstructions,
    setShowInstructions: (show) => {
      setShowInstructions(show);
      if (!show) sessionStorage.setItem('warmupShown', 'true');
    }
  };

  return (
    <WarmUpContext.Provider value={value}>
      {children}
    </WarmUpContext.Provider>
  );
}

export function useWarmUp() {
  const context = useContext(WarmUpContext);
  if (!context) {
    throw new Error('useWarmUp must be used within WarmUpProvider');
  }
  return context;
}