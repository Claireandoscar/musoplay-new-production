import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();

  const handleTodaysGameClick = () => {
    navigate('/');
  };

  const handleRefreshClick = () => {
    console.log('Refresh clicked');
    // Refresh logic will be added later
  };

  return (
    <div className="header-toolbar" style={{ backgroundColor: '#FFFDEE' }}>
      <div className="button-row">
        <button 
          className="toolbar-button"
          onClick={handleTodaysGameClick}
          title="Today's Game"
          data-testid="todays-game-button"
        >
          <img src="/assets/images/ui/todays-game.svg" alt="Today's Game" className="button-img" style={{ filter: 'invert(45%) sepia(99%) saturate(1646%) hue-rotate(101deg) brightness(97%) contrast(105%)' }} />
        </button>
        <button 
          className="toolbar-button"
          onClick={() => {}} // Will add how-to-play logic later
          title="How to Play"
          data-testid="how-to-play-button"
        >
          <img src="/assets/images/ui/how-to-play.svg" alt="How to Play" className="button-img" style={{ filter: 'invert(45%) sepia(99%) saturate(1646%) hue-rotate(101deg) brightness(97%) contrast(105%)' }} />
        </button>
        <button 
          className="toolbar-button"
          onClick={handleRefreshClick}
          title="Refresh"
          data-testid="refresh-button"
        >
          <img src="/assets/images/ui/green-refresh.svg" alt="Refresh" className="button-img" />
        </button>
      </div>
      <div className="logo-wrapper">
        <img src="/assets/images/ui/logo.svg" alt="Musoplay Logo" className="logo" />
        <span className="warm-up-text" style={{ color: '#00C22D', marginLeft: '10px' }}>Warm Up</span>
      </div>
    </div>
  );
};

export default Header;