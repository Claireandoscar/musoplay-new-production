import React, { useCallback, useRef } from 'react';
import './CubeButton.css';

const CubeButton = ({ 
  color, 
  frontImage, 
  bottomImage,
  noteNumber, 
  onNotePlay, 
  isGameEnded,
  isBarFailing, 
  showHint 
}) => {
  const buttonRef = useRef({
    isPressed: false,
    hasPlayedNote: false
  });

  const playNote = useCallback(() => {
    console.log(`[CubeButton ${noteNumber}] Attempting to play note`);
    if (!isBarFailing && !buttonRef.current.hasPlayedNote) {
      console.log(`[CubeButton ${noteNumber}] Conditions met, playing note`);
      buttonRef.current.hasPlayedNote = true;
      onNotePlay(noteNumber);
    } else {
      console.log(`[CubeButton ${noteNumber}] Note blocked:`, {
        isBarFailing,
        hasPlayedNote: buttonRef.current.hasPlayedNote
      });
    }
  }, [isBarFailing, noteNumber, onNotePlay]);

  const handleTouchStart = useCallback((e) => {
    console.log(`[CubeButton ${noteNumber}] Touch Start Event:`, {
      type: e.type,
      touches: e.touches.length,
      timestamp: new Date().toISOString()
    });
    e.preventDefault();
    buttonRef.current.isPressed = true;
    buttonRef.current.hasPlayedNote = false;
    playNote();
  }, [playNote, noteNumber]);

  const handleTouchEnd = useCallback((e) => {
    console.log(`[CubeButton ${noteNumber}] Touch End Event:`, {
      type: e.type,
      timestamp: new Date().toISOString()
    });
    e.preventDefault();
    buttonRef.current.isPressed = false;
    buttonRef.current.hasPlayedNote = false;
  }, [noteNumber]);

  const handleTouchMove = useCallback((e) => {
    console.log(`[CubeButton ${noteNumber}] Touch Move Event`);
    e.preventDefault();
  }, [noteNumber]);

  // Add keyboard support
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      buttonRef.current.isPressed = true;
      buttonRef.current.hasPlayedNote = false;
      playNote();
    }
  }, [playNote]);

  const handleKeyUp = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      buttonRef.current.isPressed = false;
      buttonRef.current.hasPlayedNote = false;
    }
  }, []);

  const handleClick = useCallback((e) => {
    console.log(`[CubeButton ${noteNumber}] Click Event`);
    e.preventDefault();
    onNotePlay(noteNumber);  // This should be all we need - let handleNotePlay manage the game state
  }, [noteNumber, onNotePlay]);

  const buttonClass = `cube-button ${color} ${isGameEnded ? 'game-ended' : ''} ${
    buttonRef.current.isPressed ? 'pressed' : ''
  } ${showHint ? 'show-hint' : ''}`;  // Add hint class

  return (
    <button 
      type="button"
      className={buttonClass}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onClick={handleClick} 
      disabled={isGameEnded}
      aria-label={`Play note ${noteNumber}`}
    >
      <div className="cube-face front">
        <img 
          src={frontImage} 
          alt=""  // Remove alt text since we have aria-label on button
          className="cube-image"
          draggable="false"
        />
      </div>
      <div className="cube-face bottom">
        <img 
          src={bottomImage} 
          alt="" 
          className="cube-image"
          draggable="false"
        />
      </div>
    </button>
  );
};

export default React.memo(CubeButton);