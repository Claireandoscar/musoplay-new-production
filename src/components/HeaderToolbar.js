import React from 'react';
import './HeaderToolbar.css';
import { useNavigate } from 'react-router-dom';

const HeaderToolbar = () => {
  const navigate = useNavigate();

  return (
    <div className="header-toolbar">
      <div className="button-row">
        <button className="toolbar-button">
          <img src="/assets/images/ui/stats.svg" alt="Stats" className="button-img" />
        </button>
        <button className="toolbar-button">
          <img src="/assets/images/ui/warmup.svg" alt="Warm Up" className="button-img" />
        </button>
        <button className="toolbar-button">
          <img src="/assets/images/ui/question.svg" alt="Help" className="button-img" />
        </button>
        <button 
          className="toolbar-button"
          onClick={() => navigate('/signup')}  // Added this onClick handler
        >
          <img src="/assets/images/ui/subscribe.svg" alt="Subscribe" className="button-img" />
        </button>
        <button className="toolbar-button">
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