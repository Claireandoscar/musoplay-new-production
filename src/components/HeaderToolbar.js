import React, { useState, useRef } from 'react';
import './HeaderToolbar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import DropDown from './DropDown'; 

const HeaderToolbar = ({ onRefresh }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isWarmUpMode = location.pathname === '/warm-up';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const helpButtonRef = useRef(null);
  const { user } = useAuth(); 

  const handleStatsClick = () => {
    try {
      navigate('/stats');
    } catch (error) {
      console.error('Error navigating to stats:', error);
    }
  };

  const handleLeaderboardClick = () => {
    try {
      navigate('/leaderboard');
    } catch (error) {
      console.error('Error navigating to leaderboard:', error);
    }
  };

  const handleHelpClick = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSubscribeClick = () => {
    try {
      if (user) {
        navigate('/profile');
      } else {
        navigate('/signup');
      }
    } catch (error) {
      console.error('Error navigating:', error);
    }
  };

  const handleRefreshClick = () => {
    if (isWarmUpMode) {
      onRefresh();
      return;
    }
  
    // Just call handleRefreshAction without any conditions
    if (window.handleRefreshAction) {
      window.handleRefreshAction();
    }
  };

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
            src="/assets/images/ui/blue-stats.svg"
            alt="Stats" 
            className="button-img" 
          />
        </button>
        <button 
          className="toolbar-button"
          onClick={handleLeaderboardClick}
          title="Leaderboard"
          data-testid="leaderboard-button"
        >
          <img 
            src="/assets/images/ui/LeaderBoard.svg"
            alt="Leaderboard" 
            className="button-img" 
          />
        </button>
        <button 
          className="toolbar-button relative"
          onClick={handleHelpClick}
          ref={helpButtonRef}
          title="Help"
          data-testid="help-button"
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          <img 
            src="/assets/images/ui/blue-question.svg"
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
            src="/assets/images/ui/blue-subscribe.svg"
            alt="Subscribe" 
            className="button-img" 
          />
        </button>
        <button 
          className="toolbar-button relative"
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
      <div className="logo-wrapper z-[1]">
        <img src="/assets/images/ui/logo.svg" alt="Musoplay Logo" className="logo" />
      </div>

      <DropDown
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        buttonRef={helpButtonRef}
        dropdownRef={dropdownRef}
        isGameMenu={true}
      />
    </div>
  );
};

export default HeaderToolbar;