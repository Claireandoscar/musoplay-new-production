import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import './ScoreHistory.css';

const ScoreHistory = ({ userId, onDaySelect, ownedMelodies = new Set(), instanceId = 'default' }) => {
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Helper function to get heart image based on date
  const getHeartImage = (date, isActive) => {
    const gameDate = new Date(date);
    const isSunday = gameDate.getDay() === 0;
    if (isSunday) {
      return isActive ? 'heart.svg' : 'heart-empty.svg';
    }
    return isActive ? 'orangeheart.svg' : 'orangeheart-empty.svg';
  };

  useEffect(() => {
    const fetchGameHistory = async () => {
      try {
        if (!userId) {
          setLoading(false);
          return;
        }
        
        console.log('Fetching game history for user:', userId);
        
        // Get all scores for the user
        const { data: scores, error } = await supabase
          .from('game_scores')
          .select('*')
          .eq('user_id', userId)
          .order('played_at', { ascending: false });
          
        if (error) throw error;
        
        console.log('All scores fetched:', scores?.length || 0);

        // Get days in the selected month
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Create game history array
        const filledHistory = [];
        
        for (let day = 1; day <= daysInMonth; day++) {
          // Create a proper date object for this day
          const dateObj = new Date(year, month, day);
          const dateStr = dateObj.toISOString().split('T')[0];
          
          // Find scores for this date
          const scoresForDay = scores?.filter(game => {
            let gameDate;
            if (game.is_replay && game.original_date) {
              // For replays, use the original date
              gameDate = new Date(game.original_date);
            } else {
              // For original plays, use played_at
              gameDate = new Date(game.played_at);
            }
            
            // Compare just the date part (YYYY-MM-DD)
            const gameDateStr = gameDate.toISOString().split('T')[0];
            return gameDateStr === dateStr;
          });
          
          // Get best score for this day
          let bestScore = null;
    
          if (scoresForDay && scoresForDay.length > 0) {
            // Find the highest score
            bestScore = scoresForDay.reduce((best, game) => {
              const gameScore = game.total_score || 
                (Array.isArray(game.bar_scores) ? game.bar_scores.reduce((sum, hearts) => sum + hearts, 0) : 0);
              
              return gameScore > best.score ? { 
                score: gameScore, 
                barScores: game.bar_scores 
              } : best;
            }, { score: 0, barScores: [] });
          }
          
          // Check if this melody is owned
          const isOwned = ownedMelodies.has(dateStr);
          
          // Add day to history
          filledHistory.push({
            date: dateStr,
            score: bestScore ? bestScore.score : null,
            bar_scores: bestScore ? bestScore.barScores : [],
            played: !!bestScore,
            isOwned,
            day
          });
        }
        
        setGameHistory(filledHistory);
      } catch (error) {
        console.error('Error fetching game history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGameHistory();
    
    // Set up refresh check
    const checkForRefresh = () => {
      if (localStorage.getItem('forceCalendarRefresh') === 'true') {
        console.log('Force refreshing calendar data');
        localStorage.removeItem('forceCalendarRefresh');
        fetchGameHistory();
      }
    };
    
    checkForRefresh();
    window.addEventListener('focus', checkForRefresh);
    
    return () => {
      window.removeEventListener('focus', checkForRefresh);
    };
  }, [userId, currentMonth, ownedMelodies]);

  const handleDayClick = (game) => {
    if (onDaySelect) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const gameDate = new Date(game.date);
      
      if (game.played || gameDate < today) {
        onDaySelect(new Date(game.date));
      }
    }
  };

  if (loading) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Generate calendar grid
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDay = new Date(year, month, 1).getDay();
    
    // Create week rows
    const weeks = [];
    let days = [];
    
    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div 
          key={`${instanceId}-empty-start-${i}`}
          className="calendar-day border-2 border-[#1174B9]/10 rounded-lg"
        />
      );
    }
    
    // Add days of the month
    gameHistory.forEach(game => {
      days.push(
        <div
          key={`${instanceId}-day-${game.day}`}
          onClick={() => handleDayClick(game)}
          className={`calendar-day border-2 ${
            onDaySelect
              ? (game.played || new Date(game.date) < today)
                ? game.isOwned 
                  ? 'border-[#AB08FF]/30 hover:border-[#AB08FF] cursor-pointer transition-colors owned-melody'
                  : 'border-[#1174B9]/30 hover:border-[#1174B9] cursor-pointer transition-colors'
                : 'border-[#1174B9]/10'
              : 'border-[#1174B9]/10'
          } rounded-lg ${
            game.played ? 'bg-[#FFFFF5]' : 'bg-[#FFFDEE]'
          }`}
        >
          <div className="text-xs text-[#1174B9] p-1 flex items-center">
            <span>{game.day}</span>
            {game.isOwned && (
              <img 
                src="/assets/images/ui/purpleheart.svg" 
                alt="Owned" 
                className="owned-indicator ml-1"
                style={{ width: '10px', height: '10px' }}
              />
            )}
          </div>
          {game.played && game.bar_scores && (
            <div className="calendar-hearts">
              {game.bar_scores.map((hearts, barIndex) => (
                <div key={`hearts-row-${game.day}-${barIndex}`} className="calendar-hearts-row">
                  {[...Array(4)].map((_, i) => (
                    <img
                      key={`heart-${game.day}-${barIndex}-${i}`}
                      src={`/assets/images/ui/${getHeartImage(game.date, i < hearts)}`}
                      alt={i < hearts ? "Full Heart" : "Empty Heart"}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      );
      
      // Start a new week after Saturday
      if ((firstDay + game.day) % 7 === 0 || game.day === gameHistory.length) {
        weeks.push(
          <React.Fragment key={`${instanceId}-week-${weeks.length}`}>
            {days}
          </React.Fragment>
        );
        days = [];
      }
    });
    
    // Add remaining empty cells to complete the last week
    if (days.length > 0) {
      const remainingCells = 7 - days.length;
      for (let i = 0; i < remainingCells; i++) {
        days.push(
          <div 
            key={`${instanceId}-empty-end-${i}`}
            className="calendar-day border-2 border-[#1174B9]/10 rounded-lg"
          />
        );
      }
      weeks.push(
        <React.Fragment key={`${instanceId}-week-${weeks.length}`}>
          {days}
        </React.Fragment>
      );
    }
    
    return weeks;
  };

  return (
    <div className="score-history-container card bg-[#FFFFF5] shadow-xl mb-6 border-2 border-[#1174B9]/30 rounded-lg max-w-full">
      <div className="card-body p-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="font-['Patrick_Hand_SC'] text-[#1174B9] hover:text-[#0d5a94] px-4"
          >
            ←
          </button>
          <h3 className="font-['Patrick_Hand_SC'] text-xl text-[#1174B9]">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}
          </h3>
          <button
            onClick={() => {
              const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
              if (nextMonth <= new Date()) {
                setCurrentMonth(nextMonth);
              }
            }}
            className={`font-['Patrick_Hand_SC'] px-4 ${
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1) <= new Date()
                ? 'text-[#1174B9] hover:text-[#0d5a94]'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            →
          </button>
        </div>
        
        <div className="calendar-grid">
          {/* Day headings */}
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={`${instanceId}-heading-${index}`} className="text-center font-['Patrick_Hand_SC'] text-[#1174B9]">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {renderCalendar()}
        </div>
        
        {onDaySelect && (
          <p className="mt-4 font-patrick text-sm text-writing">
            * Replaying past games does not affect your streak or leaderboard position.
          </p>
        )}
      </div>
    </div>
  );
};

export default ScoreHistory;