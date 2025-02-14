import React, { useState, useRef } from 'react';
import DropDown from './DropDown';

const EverythingButton = ({ isMobile }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleButtonClick = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className={`relative ${isMobile ? 'w-full' : ''}`}>
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className={`font-patrick text-[#1174B9] border-[#1174B9] border-2 
                   rounded-lg hover:bg-[#1174B9]/10 transition-colors
                   ${isMobile ? 'w-full py-2 text-sm' : 'px-6 py-2'}`}
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        EVERYTHING
      </button>

      <DropDown
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        buttonRef={buttonRef}
        dropdownRef={dropdownRef}
        alignment="right"
        isGameMenu={false}
      />
    </div>
  );
};

export default EverythingButton;