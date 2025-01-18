import React, { useState, useEffect } from 'react';

const LoadingCountdown = ({ onComplete }) => {
  const [count, setCount] = useState(5);
  const [isCountingDown, setIsCountingDown] = useState(true);

  useEffect(() => {
    if (count === 0) {
      setIsCountingDown(false);
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setCount(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-3 px-12">
      <div className="text-4xl font-['Patrick_Hand_SC'] text-[#1174B9] animate-pulse min-h-[48px]">
        {isCountingDown ? count : 'Ready!'}
      </div>
      <div className="text-lg font-['Patrick_Hand_SC'] text-[#1174B9]">
        {isCountingDown ? 'Loading your melody...' : 'Let\'s play!'}
      </div>
    </div>
  );
};

const InstructionsPopup = ({
  isPreloading,
  isAudioLoaded,
  onStartGame,
  gameMode = 'main'
}) => {
  const [hasCompletedCountdown, setHasCompletedCountdown] = useState(false);

  const handleCountdownComplete = () => {
    setHasCompletedCountdown(true);
  };

  // Reset state when isPreloading changes
  useEffect(() => {
    if (isPreloading) {
      setHasCompletedCountdown(false);
    }
  }, [isPreloading]);

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
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4" 
         style={{ backgroundColor: 'rgba(255, 253, 238, 0.8)' }}>
      <div className="bg-[#FFFFF5] shadow-xl border-2 border-[#1174B9]/30 rounded-lg w-full max-w-md">
        <div className="p-6">
          {/* Logo and Tagline */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-64 mb-3">
              <img
                src="/assets/images/ui/logo.svg"
                alt="MUSOPLAY"
                className="w-full h-auto"
              />
            </div>
            <p className="text-[#1174B9] text-xl font-['Patrick_Hand_SC'] tracking-wide">
              THE DAILY MUSIC GAME
            </p>
          </div>

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

          {/* Play button or Loading countdown */}
          <div className="flex justify-center">
            {!hasCompletedCountdown ? (
              <LoadingCountdown onComplete={handleCountdownComplete} />
            ) : (
              <button
                onClick={onStartGame}
                disabled={!isAudioLoaded}
                className={`
                  font-['Patrick_Hand_SC'] text-3xl
                  bg-[#1174B9] text-white
                  rounded-full px-12 py-3
                  border-2 border-[#1174B9]
                  flex items-center justify-center
                  transition-all duration-200
                  animate-pulse
                  ${!isAudioLoaded
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-white hover:text-[#1174B9] hover:scale-105 hover:animate-none'
                  }
                `}
              >
                PLAY
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsPopup;