import React, { useEffect, useState } from 'react';
import { Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import HeaderToolbar from '../../components/HeaderToolbar';
import './EndGameAnimation.css';

const EndGameAnimation = ({ score, barHearts }) => {
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

  const handleShare = (platform) => {
    const date = new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
    
    const shareText = `MUSOPLAY - ${date}\n${getScoringPhrase(score)}\nScore: ${score}/16`;
    const shareUrl = 'https://musoplay.com'; // Replace with actual URL

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`);
        break;
      case 'instagram':
        alert('Screenshot and share on Instagram!');
        break;
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`);
        break;
      default:
        break;
    }
  };

  const handleNativeShare = async () => {
    const date = new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
    
    const shareText = `MUSOPLAY - ${date}\n${getScoringPhrase(score)}\nScore: ${score}/16`;
    const shareUrl = 'https://musoplay.com'; // Replace with actual URL

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MUSOPLAY Score',
          text: shareText,
          url: shareUrl
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      alert('Use the social buttons above to share your score!');
    }
  };

  return (
    <div className="end-game-animation">
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
                  src={`/assets/images/ui/${i < hearts ? 'greenheart.svg' : 'grennheart-empty.svg'}`}
                  alt={i < hearts ? "Full Heart" : "Empty Heart"}
                  className="heart-image"
                />
              ))}
            </div>
          ))}
        </div>

        {showShare && (
          <div className="share-section">
            <div className="share-buttons">
              <button onClick={() => handleShare('facebook')} className="share-button">
                <Facebook />
              </button>
              <button onClick={() => handleShare('instagram')} className="share-button">
                <Instagram />
              </button>
              <button onClick={() => handleShare('whatsapp')} className="share-button">
                <MessageCircle />
              </button>
              <button onClick={() => handleShare('linkedin')} className="share-button">
                <Linkedin />
              </button>
            </div>
            <button 
              onClick={handleNativeShare}
              className="share-text-button"
            >
              PLEASE SHARE!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EndGameAnimation;