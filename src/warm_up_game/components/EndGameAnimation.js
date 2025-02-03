import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderToolbar from '../../components/HeaderToolbar';
import './EndGameAnimation.css';

const EndGameAnimation = ({ score, barHearts }) => {
  const navigate = useNavigate();
  const [animationStage, setAnimationStage] = useState(0);
  const [showText, setShowText] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  
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

  useEffect(() => {
    const heartAnimationDuration = 300;
    const totalHeartAnimationTime = heartAnimationDuration * 4;

    const timer = setTimeout(() => {
      if (animationStage < 4) {
        setAnimationStage(prev => prev + 1);
      } else if (animationStage === 4) {
        setShowText(true);
        setTimeout(() => {
          setShowShare(true);
          setShowHeader(true);
        }, 500);
      }
    }, animationStage < 4 ? heartAnimationDuration : totalHeartAnimationTime);

    return () => clearTimeout(timer);
  }, [animationStage]);

  const handlePlayMainGame = () => {
    navigate('/');
  };

  return (
    <div className="end-game-animation">
      <div className={`header-container ${showHeader ? 'visible' : ''}`}>
        <HeaderToolbar />
      </div>

      <div className="animation-content">
        {showText && (
          <>
            <h2 className="scoring-phrase">{getScoringPhrase(score)}</h2>
            <div className="score-display">
              SCORE: {score}/16
            </div>
            <div className="date-display">
              {new Date().toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              }).toUpperCase()}
            </div>
          </>
        )}
        
        <div className="hearts-display">
          {barHearts.map((hearts, index) => (
            <div key={index} className={`bar-hearts ${animationStage > index ? 'visible' : ''}`}>
              {[...Array(4)].map((_, i) => (
                <img 
                  key={i}
                  src={`/assets/images/ui/${i < hearts ? 'greenheart.svg' : 'greenheart-empty.svg'}`}
                  alt={i < hearts ? "Full Heart" : "Empty Heart"}
                  className="heart-image"
                />
              ))}
            </div>
          ))}
        </div>

        {showShare && (
          <div className="share-section">
            <button 
              onClick={handlePlayMainGame}
              className="play-main-game-button"
            >
              PLAY TODAY'S GAME
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EndGameAnimation;