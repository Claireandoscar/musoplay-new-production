import React, { useEffect } from 'react';

const RefreshPopup = ({ refreshesLeft, onConfirm, onClose, isInitialPopup = false }) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.popup-content')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const getMessage = () => {
    if (isInitialPopup) {
      return (
        <>
          You can use this button three times per game. Use it wisely!
          <br /><br />
          Note: Your total game time affects your leaderboard position.
        </>
      );
    }
    
    if (refreshesLeft === 0) {
      return "You have used all your refreshes for today!";
    }
    
    return `${refreshesLeft}/3`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#FFFDEE]/95 z-[9999]">
      <div className="popup-content bg-[#FFFDEE] shadow-lg border-2 border-[#1174B9] rounded-lg p-6 
        w-[90%] max-w-md mx-auto text-center relative">
        {/* Close button - made more prominent */}
        <button 
  onClick={onClose}
  className="absolute right-2 top-2 text-[#1174B9] text-2xl font-bold"
  aria-label="Close"
>
  ×
</button>

        <p className="text-xl font-patrick text-[#1174B9] mb-6">
          {getMessage()}
        </p>

        {(isInitialPopup || (refreshesLeft > 0 && !isInitialPopup)) && (
          <button
            onClick={onConfirm}
            className="bg-[#1174B9] font-patrick px-6 py-2 rounded-lg
              hover:bg-[#0d5a8f] transition-colors duration-200"
            style={{ color: '#FFFDEE' }}  // Ensuring text is consistently white
          >
            {isInitialPopup ? "I understand - Refresh Now" : "Yes, Refresh Game"}
          </button>
        )}
      </div>
    </div>
  );
};

export default RefreshPopup;