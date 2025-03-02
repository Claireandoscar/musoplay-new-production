import React, { useState } from 'react';
import './HeaderToolbar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import InstructionsPopup from '../pages/InstructionsPopup';
import { audioEngine } from '../AudioEngine';

const HeaderToolbar = ({ onRefresh }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isWarmUpMode = location.pathname === '/warm-up';
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Handler for the home button click (replacing stats button)
  const handleHomeClick = () => {
    try {
      navigate('/profile');
    } catch (error) {
      console.error('Error navigating to profile:', error);
    }
  };
  
  // Handler for the how to play button
  const handleHowToPlayClick = () => {
    setShowInstructions(true);
  };
  
  // Handler for the refresh button
  const handleRefreshClick = () => {
    if (isWarmUpMode) {
      onRefresh();
      return;
    }
    
    // Call handleRefreshAction for main game
    if (window.handleRefreshAction) {
      window.handleRefreshAction();
    }
  };

  // Handler for starting the game after instructions
  const handleStartGame = async () => {
    try {
      // Initialize audio if needed
      const audioState = audioEngine.getAudioContextState();
      if (audioState.state === 'suspended') {
        await audioEngine.audioContext.resume();
      }
      
      // Close instructions popup
      setShowInstructions(false);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };
  
  return (
    <div className="header-toolbar">
      <div className="button-row">
        {/* Home button (replaces Stats button) */}
        <button
          className="toolbar-button"
          onClick={handleHomeClick}
          title="Home"
          data-testid="home-button"
        >
          <img
            src="/assets/images/ui/blue-home.svg"
            alt="Home"
            className="button-img"
          />
        </button>
        
        {/* How to Play button (replaces the middle buttons) */}
        <button
          className="toolbar-button how-to-play-button"
          onClick={handleHowToPlayClick}
          title="How to Play"
          data-testid="how-to-play-button"
        >
          HOW TO PLAY
        </button>
        
        {/* Refresh button (unchanged) */}
        <button
          className="toolbar-button"
          onClick={handleRefreshClick}
          title="Refresh"
          data-testid="refresh-button"
        >
          <img
            src="/assets/images/ui/blue-refresh.svg"
            alt="Refresh"
            className="button-img"
          />
        </button>
      </div>
      
      <div className="logo-wrapper">
        <img src="/assets/images/ui/logo.svg" alt="Musoplay Logo" className="logo" />
      </div>
      
      {/* Instructions Popup */}
      {showInstructions && (
        <InstructionsPopup
          gameType={isWarmUpMode ? "warmup" : "main"}
          isPreloading={false}
          isAudioLoaded={true}
          onStartGame={handleStartGame}
          show={showInstructions}
        />
      )}
    </div>
  );
};

export default HeaderToolbar;