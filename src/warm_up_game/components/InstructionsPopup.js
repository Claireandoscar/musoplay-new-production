import React from 'react';

const InstructionsPopup = ({ 
  isPreloading, 
  isAudioLoaded, 
  onStartGame, 
  gameMode = 'warmup'
}) => {
  const getHeartImage = () => {
    if (gameMode === 'warmup') return 'greenheart.svg';
    return new Date().getDay() === 0 ? 'heart.svg' : 'orangeheart.svg';
  };

  const getDifficultyText = () => {
    if (gameMode === 'warmup') return 'WARM-UP GAME';
    return new Date().getDay() === 0 ? 'DIFFICULT CHALLENGE' : 'MEDIUM CHALLENGE';
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).toUpperCase();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(255, 253, 238, 0.8)' }}>
      <div className="bg-[#FFFFF5] shadow-xl border-2 border-[#1174B9]/30 rounded-lg w-full max-w-md">
        <div className="p-6">
          {/* Date */}
          <div className="text-center mb-4">
            <p className="text-base font-['Patrick_Hand_SC'] text-[#1174B9]">
              {getFormattedDate()}
            </p>
          </div>

          {/* Difficulty Level */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <img
              src={`/assets/images/ui/${getHeartImage()}`}
              alt="heart"
              className="w-5 h-5"
            />
            <p className="text-xl font-['Patrick_Hand_SC'] text-[#1174B9]">
              {getDifficultyText()}
            </p>
            <img
              src={`/assets/images/ui/${getHeartImage()}`}
              alt="heart"
              className="w-5 h-5"
            />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-['Patrick_Hand_SC'] text-[#1174B9] text-center mb-6">
            HOW TO PLAY
          </h2>
          
          {/* Silent mode warning */}
          <div className="flex items-center justify-center mb-6 text-sm font-['Patrick_Hand_SC'] text-[#1174B9]">
            <img
              src={`/assets/images/ui/${getHeartImage()}`}
              alt="heart"
              className="w-5 h-5 mx-1"
            />
            TURN OFF SILENT MODE
            <img
              src={`/assets/images/ui/${getHeartImage()}`}
              alt="heart"
              className="w-5 h-5 mx-1"
            />
          </div>
          
          {/* Instructions list */}
          <div className="space-y-3 text-[#1174B9] font-['Patrick_Hand_SC'] mb-6 text-lg">
            <p>1. PRESS LISTEN & PRACTICE</p>
            <p>2. PLAY WHAT YOU HEAR USING THE COLOURFUL BUTTONS</p>
            <p>3. PRACTICE AS MANY TIMES AS YOU NEED</p>
            <p>4. PRESS PERFORM TO PLAY THE MELODY FOR REAL</p>
            <p>5. HIT THE RIGHT NOTES TO HANG ON TO YOUR HEARTS!</p>
          </div>
          
          {/* Challenge text */}
          <p className="text-[#1174B9] text-xl text-center font-['Patrick_Hand_SC'] mb-6">
            CAN YOU HIT THE RIGHT NOTES?
          </p>
          
          {/* Play button */}
<div className="flex justify-center">
  <button
    onClick={onStartGame}
    disabled={isPreloading || !isAudioLoaded}
    className={`
      font-['Patrick_Hand_SC'] text-3xl
      bg-[#1174B9] text-white
      rounded-full px-12 py-3
      border-2 border-[#1174B9]
      flex items-center justify-center
      transition-all duration-200
      animate-pulse
      ${isPreloading || !isAudioLoaded 
        ? 'opacity-50 cursor-not-allowed' 
        : 'hover:bg-white hover:text-[#1174B9] hover:scale-105 hover:animate-none'
      }
    `}
  >
    PLAY
  </button>
</div>
          </div>
        </div>
      </div>
  );
};

export default InstructionsPopup;