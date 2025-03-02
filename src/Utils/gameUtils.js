// src/utils/gameUtils.js

export const hasPlayedToday = () => {
    const gameCompletedToday = localStorage.getItem('gameCompletedToday') === 'true';
    const gameCompletedDate = localStorage.getItem('gameCompletedDate');
    const today = new Date().toISOString().split('T')[0];
    
    return gameCompletedDate === today && gameCompletedToday;
  };
  
  export const getLastGameScore = () => {
    return {
      score: parseInt(localStorage.getItem('lastGameScore') || '0', 10),
      hearts: JSON.parse(localStorage.getItem('lastGameHearts') || '[0,0,0,0]')
    };
  };
  
  export const clearGameCompletionData = () => {
    localStorage.removeItem('gameCompletedToday');
    localStorage.removeItem('gameCompletedDate');
    // We'll keep the score data for reference
  };