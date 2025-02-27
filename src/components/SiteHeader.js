import React from 'react';
import { useNavigate } from 'react-router-dom';
import EverythingButton from './EverythingButton';

const SiteHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-[#FFFDEE]">
      {/* Desktop & Tablet Layout */}
      <div className="hidden md:flex max-w-4xl mx-auto px-4 py-3 items-center justify-between">
        <img 
          src="/assets/images/ui/logo.svg" 
          alt="MUSOPLAY" 
          className="h-8 cursor-pointer"
          onClick={() => navigate('/')}
        />
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="font-patrick text-[#1174B9] border-[#1174B9] border-2 rounded-lg 
                     px-6 py-2 hover:bg-[#1174B9]/10 transition-colors"
          >
            BACK TO GAME
          </button>
          <EverythingButton isMobile={false} />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden w-full">
        <div className="flex flex-col gap-3 px-4 py-3">
          {/* Logo Row */}
          <div className="flex justify-center">
            <img 
              src="/assets/images/ui/logo.svg" 
              alt="MUSOPLAY" 
              className="h-6 cursor-pointer"
              onClick={() => navigate('/')}
            />
          </div>
          
          {/* Buttons Row */}
          <div className="flex justify-start gap-2">
            <button
              onClick={() => navigate('/')}
              className="flex-1 font-patrick text-[#1174B9] border-[#1174B9] border-2 
                       rounded-lg py-2 hover:bg-[#1174B9]/10 transition-colors text-sm"
            >
              BACK TO GAME
            </button>
            <div className="flex-1">
              <EverythingButton isMobile={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteHeader;