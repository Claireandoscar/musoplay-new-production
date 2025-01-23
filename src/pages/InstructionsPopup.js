import React, { useState, useEffect } from 'react';

const LoadingCountdown = ({ onComplete }) => {
  const [count, setCount] = useState(3);
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
    <div className="flex flex-col items-center justify-center py-3">
      <div className="text-4xl font-patrick text-writing animate-pulse min-h-[48px]">
        {isCountingDown ? count : 'Ready!'}
      </div>
      <div className="text-lg font-patrick text-writing">
        {isCountingDown ? 'Loading your melody...' : 'Let\'s play!'}
      </div>
    </div>
  );
};

const InstructionsPopup = ({ gameType = 'main', isPreloading, isAudioLoaded, onStartGame }) => {
  const [hasCompletedCountdown, setHasCompletedCountdown] = useState(false);

  useEffect(() => {
    if (isPreloading) {
      setHasCompletedCountdown(false);
    }
  }, [isPreloading]);

  const handleCountdownComplete = () => {
    setHasCompletedCountdown(true);
  };

  const getHeartImage = () => {
    if (gameType === 'warmup') return 'greenheart.svg';
    return new Date().getDay() === 0 ? 'heart.svg' : 'orangeheart.svg';
  };

  const getDifficultyText = () => {
    if (gameType === 'warmup') return 'WARM-UP GAME';
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
    <div className="fixed inset-0 flex items-center justify-center z-30">
      <div className="bg-background-alt shadow-xl border-2 border-writing/30 rounded-lg 
                    md:w-[450px] w-[85%] md:h-[85vh] h-[75vh] md:max-h-[800px] max-h-[650px] md:min-h-[600px] min-h-[500px]
                    p-6 flex flex-col gap-4">
        {/* Logo section */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-44">
            <img src="/assets/images/ui/logo.svg" alt="MUSOPLAY" className="w-full h-auto" />
          </div>
          <p className="text-writing text-lg font-patrick">THE DAILY MUSIC GAME</p>
        </div>

        {/* Date and difficulty section */}
        <div className="text-center text-base font-patrick text-writing">
          {getFormattedDate()}
        </div>

        <div className="flex items-center justify-center gap-2">
          <img src={`/assets/images/ui/${getHeartImage()}`} alt="heart" className="w-5 h-5" />
          <p className="text-lg font-patrick text-writing">{getDifficultyText()}</p>
          <img src={`/assets/images/ui/${getHeartImage()}`} alt="heart" className="w-5 h-5" />
        </div>

        <h2 className="text-xl font-patrick text-writing text-center">HOW TO PLAY</h2>

        {/* Silent mode warning */}
        <div className="flex items-center justify-center text-base font-patrick text-writing">
          <img src={`/assets/images/ui/${getHeartImage()}`} alt="heart" className="w-4 h-4 mx-2" />
          TURN OFF SILENT MODE
          <img src={`/assets/images/ui/${getHeartImage()}`} alt="heart" className="w-4 h-4 mx-2" />
        </div>

        {/* Instructions */}
        <div className="space-y-3 text-writing font-patrick text-base">
          <p>1. PRESS LISTEN & PRACTICE</p>
          <p>2. PLAY WHAT YOU HEAR USING THE COLOURFUL BUTTONS</p>
          <p>3. PRACTICE AS MANY TIMES AS YOU NEED</p>
          <p>4. PRESS PERFORM TO PLAY THE MELODY FOR REAL</p>
          <p>5. HIT THE RIGHT NOTES TO HANG ON TO YOUR HEARTS!</p>
        </div>

        <p className="text-writing text-lg text-center font-patrick">CAN YOU HIT THE RIGHT NOTES?</p>

        <div className="flex justify-center mt-2">
          {!hasCompletedCountdown ? (
            <LoadingCountdown onComplete={handleCountdownComplete} />
          ) : (
            <button
              onClick={onStartGame}
              disabled={!isAudioLoaded}
              className={`
                font-patrick text-xl
                bg-writing text-white
                rounded-full px-8 py-2
                border-2 border-writing
                flex items-center justify-center
                transition-all duration-200
                animate-pulse
                ${!isAudioLoaded
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-white hover:text-writing hover:scale-105 hover:animate-none'
                }
              `}
            >
              PLAY
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructionsPopup;