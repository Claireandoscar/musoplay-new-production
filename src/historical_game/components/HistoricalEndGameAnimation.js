import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import HeaderToolbar from '../../components/HeaderToolbar';
import './HistoricalEndGameAnimation.css';

const HistoricalEndGameAnimation = ({ score, barHearts, historicalDate, playMode, onExitToPlayAgain, className }) => {
  const [animationStage, setAnimationStage] = useState(0);
  const [showText, setShowText] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const [isSunday, setIsSunday] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(
    playMode === 'single' ? 8 : null
  );
  
  useEffect(() => {
    // Determine if the historical date was a Sunday
    if (historicalDate) {
      setIsSunday(historicalDate.getDay() === 0);
    }
  }, [historicalDate]);

  const getScoringPhrase = (score) => {
    if (score === 16) return "Legendary";
    if (score === 15) return "Outstanding";
    if (score === 14) return "Brilliant";
    if (score === 13) return "Impressive";
    if (score === 12) return "Fantastic";
    if (score === 11) return "Well Done";
    if (score === 10) return "Great Job";
    if (score === 9) return "Nice Work";
    if (score === 8) return "Good Try";
    return "Keep Practicing";
  };

  // Wrapper for the exit function that sets the refresh flag - now using useCallback
  const handleExitToPlayAgain = useCallback(() => {
    // Set flag to force refresh the calendar when returning to Play Again page
    localStorage.setItem('forceCalendarRefresh', 'true');
    console.log('Setting forceCalendarRefresh flag before exiting');
    
    // Call the original exit function from props
    onExitToPlayAgain();
  }, [onExitToPlayAgain]);

  // Animation sequence
  useEffect(() => {
    const heartAnimationDuration = 300;
    const totalHeartAnimationTime = heartAnimationDuration * 4;

    const timer = setTimeout(() => {
      if (animationStage < 4) {
        setAnimationStage(prev => prev + 1);
      } else if (animationStage === 4) {
        setShowText(true);
        setTimeout(() => {
          setShowActions(true);
          setShowHeader(true);
        }, 500);
      }
    }, animationStage < 4 ? heartAnimationDuration : totalHeartAnimationTime);

    return () => clearTimeout(timer);
  }, [animationStage]);

  // Countdown timer for single play mode
  useEffect(() => {
    if (redirectCountdown === null) return;
    
    const timer = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            // Use our wrapper instead of calling onExitToPlayAgain directly
            handleExitToPlayAgain();
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [redirectCountdown, handleExitToPlayAgain]);

  // Format the historical date for display
  const formattedDate = historicalDate ? historicalDate.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase() : '';

  return (
    <div className={`end-game-animation historical-end-game-animation ${className || ''}`}>
      <div className={`header-container ${showHeader ? 'visible' : ''}`}>
        <HeaderToolbar />
      </div>

      <div className="animation-content">
        {showText && (
          <>
            <h2 className="scoring-phrase" style={{ color: "#1174B9" }}>{getScoringPhrase(score)}</h2>
            <div className="score-display" style={{ color: "#1174B9" }}>
              SCORE: {score}/16
            </div>
            <div className="date-display" style={{ color: "#1174B9" }}>
              {formattedDate}
            </div>
            <div className="historical-indicator" style={{ color: "#1174B9" }}>
              REPLAY MODE
            </div>
          </>
        )}

        <div className="hearts-display">
          {barHearts.map((hearts, index) => (
            <div key={index} className={`bar-hearts ${animationStage > index ? 'visible' : ''}`}>
              {[...Array(4)].map((_, i) => (
                <img 
                  key={i}
                  src={`/assets/images/ui/${i < hearts ? 
                    (isSunday ? 'heart.svg' : 'orangeheart.svg') : 
                    (isSunday ? 'heart-empty.svg' : 'orangeheart-empty.svg')}`}
                  alt={i < hearts ? "Full Heart" : "Empty Heart"}
                  className="heart-image"
                />
              ))}
            </div>
          ))}
        </div>

        {showActions && (
          <div className="historical-actions-section">
            {playMode === 'single' ? (
              <div className="redirect-countdown">
                <p style={{ color: "#1174B9" }}>RETURNING TO PLAY AGAIN IN {redirectCountdown} SECONDS...</p>
              </div>
            ) : (
              <div className="action-buttons">
                <button 
                  onClick={handleExitToPlayAgain}
                  className="historical-action-button"
                  style={{ 
                    backgroundColor: '#1174B9',
                    color: '#FFFDEE'
                  }}
                >
                  <ArrowLeft size={16} />
                  RETURN TO PLAY AGAIN
                </button>
                <button 
                  onClick={() => {
                    // Set refresh flag here too in case someone plays again
                    localStorage.setItem('forceCalendarRefresh', 'true');
                    window.location.reload();
                  }}
                  className="historical-action-button"
                  style={{ 
                    borderColor: '#1174B9',
                    color: '#1174B9'
                  }}
                >
                  PLAY THIS DAY AGAIN
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricalEndGameAnimation;