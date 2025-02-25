import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import InstructionsPopup from '../pages/InstructionsPopup';

const DropDown = ({ isOpen, onClose, buttonRef, dropdownRef, alignment = 'center', isGameMenu = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showInstructions, setShowInstructions] = useState(false);
  const isWarmUpMode = location.pathname === '/warm-up';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          !buttonRef.current.contains(event.target)) {
        onClose();
      }
    };
  
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef, dropdownRef]);

  const handleWarmUpToggle = () => {
    onClose();
    if (isWarmUpMode) {
      navigate('/');
    } else {
      navigate('/warm-up');
    }
  };

  const handleHowToPlay = () => {
    onClose();
    setShowInstructions(true);
  };

  const handlePlayAgain = () => {
    onClose();
    navigate('/play-again');
  };

  // Define base menu items that appear in all menus
  const baseMenuItems = [
    { 
      label: 'FAQ', 
      action: () => {
        onClose();
        console.log('FAQ clicked');
      }
    },
    { 
      label: 'PRIVACY & TERMS', 
      action: () => {
        onClose();
        console.log('Privacy & Terms clicked');
      }
    },
    { 
      label: 'REPORT A BUG', 
      action: () => {
        onClose();
        console.log('Report a Bug clicked');
      }
    }
  ];

  // Construct menu items based on context
  const menuItems = isGameMenu
    ? [
        // Game menu (Question mark)
        { 
          label: 'HOW TO PLAY', 
          action: handleHowToPlay
        },
        {
          label: isWarmUpMode ? 'MAIN GAME' : 'WARM UP GAME',
          action: handleWarmUpToggle
        },
        {
          label: 'PLAY AGAIN',
          action: handlePlayAgain
        },
        ...baseMenuItems
      ]
    : [
        // Everything menu
        {
          label: isWarmUpMode ? 'BACK TO MAIN GAME' : 'WARM UP GAME',
          action: handleWarmUpToggle
        },
        // Show Profile only on Stats page
        ...(location.pathname !== '/profile' ? [{
          label: 'YOUR PAGE',
          action: () => {
            onClose();
            navigate('/profile');
          }
        }] : []),
        // Show Stats & Streaks if not on stats page
        ...(location.pathname !== '/stats' ? [{
          label: 'STATS & STREAKS',
          action: () => {
            onClose();
            navigate('/stats');
          }
        }] : []),
        // Show Leaderboard if not on leaderboard page
        ...(location.pathname !== '/leaderboard' ? [{
          label: 'LEADERBOARD',
          action: () => {
            onClose();
            navigate('/leaderboard');
          }
        }] : []),
        // Add Play Again to Everything menu
        {
          label: 'PLAY AGAIN',
          action: handlePlayAgain
        },
        ...baseMenuItems
      ];

  if (!isOpen && !showInstructions) return null;

  return (
    <>
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute top-full mt-1 z-50 ${
            alignment === 'center' 
              ? 'left-1/2 -translate-x-1/2' 
              : alignment === 'right' 
                ? 'right-0' 
                : 'left-0'
          }`}
        >
          <div 
            className="w-48 bg-background-alt border-2 border-[#1174B9]/30 rounded-lg 
            shadow-xl transform transition-transform duration-200 ease-in-out origin-top
            animate-in fade-in slide-in-from-top-2"
          >
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="w-full px-4 py-3 text-left text-[#1174B9] font-patrick
                         hover:bg-[#1174B9]/10 transition-colors first:rounded-t-lg 
                         last:rounded-b-lg border-b last:border-b-0 border-[#1174B9]/30"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {showInstructions && (
        <InstructionsPopup
          gameType={isWarmUpMode ? 'warmup' : 'main'}
          isPreloading={false}
          isAudioLoaded={true}
          onStartGame={() => setShowInstructions(false)}
          show={showInstructions}
          showCountdown={false} 
        />
      )}
    </>
  );
};

export default DropDown;