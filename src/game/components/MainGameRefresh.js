import React, { useState, useEffect, useCallback } from 'react';

const MainGameRefresh = ({ onRefresh }) => {
  // State for popup display and refresh count
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');
  const [isInitialPopup, setIsInitialPopup] = useState(false);
  const [refreshesLeft, setRefreshesLeft] = useState(() => {
    // For development/testing - always reset to 3
    if (process.env.NODE_ENV === 'development') {
      localStorage.setItem('mainGameRefreshes', '3');
      return 3;
    }

    // Production logic
    const stored = localStorage.getItem('mainGameRefreshes');
    const today = new Date().toLocaleDateString();
    const storedDate = localStorage.getItem('mainGameRefreshDate');
    
    if (storedDate !== today) {
      localStorage.setItem('mainGameRefreshes', '3');
      localStorage.setItem('mainGameRefreshDate', today);
      return 3;
    }
    
    return stored ? parseInt(stored, 10) : 3;
  });

  // Function to show temporary message
  const showTemporaryMessage = useCallback((messageText) => {
    setIsInitialPopup(false);
    setMessage(messageText);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2000);
  }, []);

  // Handle the refresh action
  const handleRefresh = useCallback(() => {
    if (refreshesLeft <= 0) {
      showTemporaryMessage("You've used up all your refreshes today!");
      return;
    }

    const newCount = refreshesLeft - 1;
    setRefreshesLeft(newCount);
    localStorage.setItem('mainGameRefreshes', newCount.toString());

    // Perform the refresh
    if (onRefresh) {
      onRefresh();
    }

    // Show appropriate message after refresh
    if (newCount === 2) {
      showTemporaryMessage("You have 2 refreshes left");
    } else if (newCount === 1) {
      showTemporaryMessage("You have 1 refresh left");
    } else if (newCount === 0) {
      showTemporaryMessage("This is your last refresh!");
    }
  }, [refreshesLeft, onRefresh, showTemporaryMessage]);

  // Initial popup confirmation handler
  const handleInitialConfirm = useCallback(() => {
    setShowPopup(false);
    setIsInitialPopup(false);
    handleRefresh();
  }, [handleRefresh]);

  // Setup the refresh action on the window object
  useEffect(() => {
    const handleRefreshAction = () => {
      if (refreshesLeft === 3) {
        setIsInitialPopup(true);
        setMessage("You can use this button three times per game. Use it wisely!\n\nNote: Your total game time affects your leaderboard position.");
        setShowPopup(true);
        return;
      }

      handleRefresh();
    };

    window.handleRefreshAction = handleRefreshAction;
    
    return () => {
      delete window.handleRefreshAction;
    };
  }, [refreshesLeft, handleRefresh]);

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#FFFDEE]/95 z-[9999]">
      <div className="bg-[#FFFDEE] shadow-lg border-2 border-[#1174B9] rounded-lg p-6 
        w-[90%] max-w-md mx-auto text-center relative">
        <p className="text-xl font-patrick text-[#1174B9] mb-6">
          {message}
        </p>

        {isInitialPopup && (
          <button
            onClick={handleInitialConfirm}
            className="bg-[#1174B9] font-patrick px-6 py-2 rounded-lg
              hover:bg-[#0d5a8f] transition-colors duration-200"
            style={{ color: '#FFFDEE' }}
          >
            I understand - Refresh Now
          </button>
        )}
      </div>
    </div>
  );
};

export default MainGameRefresh;