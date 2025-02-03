import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InstructionsPopup from '../pages/InstructionsPopup';

const DropDown = ({ isOpen, onClose, buttonRef, dropdownRef, isWarmUpMode }) => {
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(false);

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

  const handleHowToPlay = () => {
    onClose();
    setShowInstructions(true);
  };

  const handleWarmUpToggle = () => {
    onClose();
    if (isWarmUpMode) {
      navigate('/');
    } else {
      navigate('/warm-up');
    }
  };

  const menuItems = [
    { 
      label: 'How to Play', 
      action: handleHowToPlay
    },
    {
      label: isWarmUpMode ? 'Back to Main Game' : 'Warm Up Game',
      action: handleWarmUpToggle
    },
    { label: 'Archive', action: () => console.log('Archive clicked') },
    { label: 'FAQ', action: () => console.log('FAQ clicked') },
    { label: 'Privacy & Terms', action: () => console.log('Privacy & Terms clicked') }
  ];

  if (!isOpen && !showInstructions) return null;

  return (
    <>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50"
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