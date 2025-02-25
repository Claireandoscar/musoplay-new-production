import React from 'react';
import { useNavigate } from 'react-router-dom';
import EverythingButton from '../components/EverythingButton';

const PlayAgainPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-[#FFFDEE]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <img src="/assets/images/ui/logo.svg" alt="MUSOPLAY" className="h-8" />
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="font-patrick text-[#1174B9] border-[#1174B9] border-2 rounded-lg px-6 py-2 hover:bg-[#1174B9]/10 transition-colors"
            >
              BACK TO GAME
            </button>
            <EverythingButton />
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-lg p-8 bg-background-alt border-2 border-writing/30 rounded-lg shadow-xl">
          <h1 className="text-3xl font-patrick text-writing text-center mb-6">PLAY AGAIN</h1>
          <p className="text-xl font-patrick text-writing text-center mb-8">
            WELCOME TO <span className="font-bold">PLAY AGAIN</span>! REPLAY YOUR FAVORITE DAILY MELODIES AND AIM FOR A PERFECT SCORE.
          </p>
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 mb-4 flex items-center justify-center">
              <svg className="animate-spin text-writing" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-2xl font-patrick text-writing text-center">
              Coming Soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayAgainPage;