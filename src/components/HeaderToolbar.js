import React, { useState, useEffect } from 'react';
import './HeaderToolbar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const HeaderToolbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSunday, setIsSunday] = useState(false);
  useAuth();

  const isWarmUpMode = location.pathname === '/warm-up';

  // Check if it's Sunday and update state
  useEffect(() => {
    const checkDay = () => {
      setIsSunday(new Date().getDay() === 0);
    };
    
    checkDay();
    // Check every hour in case day changes while app is open
    const interval = setInterval(checkDay, 3600000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to get the correct icon path
  const getIconPath = (iconName) => {
    if (isWarmUpMode) {
      // Warm-up mode always uses green icons
      return `/assets/images/ui/green-${iconName}.svg`;
    } else if (isSunday && !isWarmUpMode) {
      // Sunday in main game uses red icons
      return `/assets/images/ui/red-${iconName}.svg`;
    } else {
      // Regular main game uses default icons
      return `/assets/images/ui/${iconName}.svg`;
    }
  };

  const handleStatsClick = () => {
    console.log('Stats button clicked');
    try {
      navigate('/stats');
    } catch (error) {
      console.error('Error navigating to stats:', error);
    }
  };

  const handleWarmUpToggle = () => {
    if (isWarmUpMode) {
      console.log('Going back to main game');
      navigate('/');
    } else {
      console.log('Going to warm up mode');
      navigate('/warm-up');
    }
  };

  const handleHelpClick = () => {
    console.log('Help button clicked');
    // Add help logic later
  };

  const handleSubscribeClick = () => {
    console.log('Subscribe button clicked');
    try {
      navigate('/signup');
    } catch (error) {
      console.error('Error navigating to signup:', error);
    }
  };

  const handleRefreshClick = () => {
    if (isWarmUpMode) {
      console.log('Going back to main game');
      navigate('/');
    } else {
      console.log('Refresh button clicked');
      // Original refresh logic will go here later
    }
  };

  React.useEffect(() => {
    console.log('HeaderToolbar mounted, navigate function available:', !!navigate);
  }, [navigate]);

  return (
    <div className="header-toolbar">
      <div className="button-row">
        <button 
          className="toolbar-button"
          onClick={handleStatsClick}
          title="Stats & Streaks"
          data-testid="stats-button"
        >
          <img 
            src={isWarmUpMode ? '/assets/images/ui/green-statsbullet.svg' : getIconPath('stats')} 
            alt="Stats" 
            className="button-img" 
          />
        </button>
        <button 
          className="toolbar-button"
          onClick={handleWarmUpToggle}
          title={isWarmUpMode ? "Back to Main Game" : "Warm Up"}
          data-testid="warmup-button"
        >
          <img 
            src={isWarmUpMode ? '/assets/images/ui/green-goback.svg' : getIconPath('warmup')} 
            alt={isWarmUpMode ? "Back to Main Game" : "Warm Up"} 
            className="button-img" 
          />
        </button>
        <button 
          className="toolbar-button"
          onClick={handleHelpClick}
          title="Help"
          data-testid="help-button"
        >
          <img 
            src={isWarmUpMode ? '/assets/images/ui/green-question.svg' : getIconPath('question')} 
            alt="Help" 
            className="button-img" 
          />
        </button>
        <button 
          className="toolbar-button"
          onClick={handleSubscribeClick}
          title="Subscribe"
          data-testid="subscribe-button"
        >
          <img 
            src={isWarmUpMode ? '/assets/images/ui/green-subscribe.svg' : getIconPath('subscribe')} 
            alt="Subscribe" 
            className="button-img" 
          />
        </button>
        <button 
          className="toolbar-button"
          onClick={handleRefreshClick}
          title="Refresh"
          data-testid="refresh-button"
        >
          <img 
            src={isWarmUpMode ? '/assets/images/ui/green-refresh.svg' : getIconPath('refresh')} 
            alt="Refresh" 
            className="button-img" 
          />
        </button>
      </div>
      <div className="logo-wrapper">
        <img src="/assets/images/ui/logo.svg" alt="Musoplay Logo" className="logo" />
      </div>
    </div>
  );
};

export default HeaderToolbar;