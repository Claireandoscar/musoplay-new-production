import React from 'react';
import './HeaderToolbar.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const HeaderToolbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStatsClick = () => {
    // Navigate to stats page, could add Premium check here if needed
    navigate('/stats');
  };

  const handleWarmupClick = () => {
    // Add warmup logic later
  };

  const handleHelpClick = () => {
    // Add help logic later
  };

  const handleSubscribeClick = () => {
    navigate('/signup');
  };

  const handleRefreshClick = () => {
    // Add refresh logic later
  };

  return (
    <div className="header-toolbar">
      <div className="button-row">
        <button 
          className="toolbar-button"
          onClick={handleStatsClick}
          title="Stats & Streaks"
        >
          <img src="/assets/images/ui/stats.svg" alt="Stats" className="button-img" />
        </button>
        <button 
          className="toolbar-button"
          onClick={handleWarmupClick}
          title="Warm Up"
        >
          <img src="/assets/images/ui/warmup.svg" alt="Warm Up" className="button-img" />
        </button>
        <button 
          className="toolbar-button"
          onClick={handleHelpClick}
          title="Help"
        >
          <img src="/assets/images/ui/question.svg" alt="Help" className="button-img" />
        </button>
        <button 
          className="toolbar-button"
          onClick={handleSubscribeClick}
          title="Subscribe"
        >
          <img src="/assets/images/ui/subscribe.svg" alt="Subscribe" className="button-img" />
        </button>
        <button 
          className="toolbar-button"
          onClick={handleRefreshClick}
          title="Refresh"
        >
          <img src="/assets/images/ui/refresh.svg" alt="Refresh" className="button-img" />
        </button>
      </div>
      <div className="logo-wrapper">
        <img src="/assets/images/ui/logo.svg" alt="Musoplay Logo" className="logo" />
      </div>
    </div>
  );
};

export default HeaderToolbar;