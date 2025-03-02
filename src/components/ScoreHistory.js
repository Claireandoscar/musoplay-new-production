import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import './ScoreHistory.css'; // Keep the CSS import

const ScoreHistory = ({ userId, onDaySelect }) => {
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
        console.log('Fetching game history for user:', userId);
        
        // Set time to midnight UTC
        const startOfMonth = new Date(Date.UTC(currentMonth.getFullYear(), currentMonth.getMonth(), 1));
        const endOfMonth = new Date(Date.UTC(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999));
        
        console.log('Date range:', {
          start: startOfMonth.toISOString(),
          end: endOfMonth.toISOString(),
          currentMonth: currentMonth.toISOString()
        });
        
        // Use a simple query to get all scores for the user
        const { data: scores, error } = await supabase
          .from('game_scores')
          .select('*')
          .eq('user_id', userId)
          .order('played_at', { ascending: false });
          
        if (error) throw error;
        
        console.log('All scores fetched:', scores?.length || 0);

        // Initialize array for all days in the month
        const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
        const filledHistory = [];
        
        for (let day = 1; day <= daysInMonth; day++) {
          const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
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
            
            // Convert to ISO date string and compare just the date part
            const gameDateStr = gameDate.toISOString().split('T')[0];
            return gameDateStr === dateStr;
          });
          
          if (dateStr === '2025-03-02') {
            console.log(`Scores for March 2:`, scoresForDay);
          }
          
          // Get best score for this day
          let bestScore = null;
    
          
          if (scoresForDay && scoresForDay.length > 0) {
            // Find the score with the highest total
            bestScore = scoresForDay.reduce((best, game) => {
              const gameScore = game.total_score || 
                (Array.isArray(game.bar_scores) ? game.bar_scores.reduce((sum, hearts) => sum + hearts, 0) : 0);
              
              return gameScore > best.score ? { 
                score: gameScore, 
                barScores: game.bar_scores 
              } : best;
            }, { score: 0, barScores: [] });
          }
          
          // Add day to history
          filledHistory.push({
            date: dateStr,
            score: bestScore ? bestScore.score : null,
            bar_scores: bestScore ? bestScore.barScores : [],
            played: !!bestScore,
            month: currentMonth.getMonth(),
            year: currentMonth.getFullYear()
          });
        }
        
        // Log final history size
        console.log(`Final filled history:`, filledHistory);
        console.log(`Games marked as played:`, filledHistory.filter(game => game.played).length);
        
        setGameHistory(filledHistory);
      } catch (error) {
        console.error('Error fetching game history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Initial fetch
    fetchGameHistory();
    
    // Add force refresh check
    const checkForRefresh = () => {
      const shouldRefresh = localStorage.getItem('forceCalendarRefresh') === 'true';
      if (shouldRefresh) {
        console.log('Force refreshing calendar data after historical game');
        localStorage.removeItem('forceCalendarRefresh');
        fetchGameHistory();
      }
    };
    
    // Check immediately and when window gets focus
    checkForRefresh();
    window.addEventListener('focus', checkForRefresh);
    
    // Cleanup
    return () => {
      window.removeEventListener('focus', checkForRefresh);
    };
  }, [userId, currentMonth]);

  // Updated handler for day selection that allows clicking on past days
  const handleDayClick = (game) => {
    // If onDaySelect is provided (we're in the Play Again page)
    if (onDaySelect) {
      // Get today's date at midnight for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get the game date
      const gameDate = new Date(game.date);
      
      // Allow selection if:
      // 1. The day has a score (was previously played), OR
      // 2. The day is in the past (user missed playing it)
      if (game.played || gameDate < today) {
        onDaySelect(new Date(game.date));
      }
    }
  };

  if (loading) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }

  // Create today variable for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Calculate first day of the month and its day of the week (0-6, where 0 is Sunday)
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const firstDayWeekday = firstDayOfMonth.getDay();

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
            <div key={`heading-${index}`} className="text-center font-['Patrick_Hand_SC'] text-[#1174B9]">
              {day}
            </div>
          ))}
          
          {/* Empty days at start of month - with unique keys */}
          {[...Array(firstDayWeekday)].map((_, i) => (
            <div
              key={`empty-start-${currentMonth.getMonth()}-${currentMonth.getFullYear()}-${i}`}
              className="calendar-day border-2 border-[#1174B9]/10 rounded-lg"
            />
          ))}
          
          {/* Actual days of the month - with month and year in key to ensure uniqueness */}
          {gameHistory.map((game) => {
            const gameDate = new Date(game.date);
            return (
              <div
                key={`day-${gameDate.getMonth()}-${gameDate.getFullYear()}-${gameDate.getDate()}`}
                onClick={() => handleDayClick(game)}
                className={`calendar-day border-2 ${
                  onDaySelect
                    ? (game.played || new Date(game.date) < today)
                      ? 'border-[#1174B9]/30 hover:border-[#1174B9] cursor-pointer transition-colors'
                      : 'border-[#1174B9]/10'
                    : 'border-[#1174B9]/10'
                } rounded-lg ${
                  game.played ? 'bg-[#FFFFF5]' : 'bg-[#FFFDEE]'
                }`}
              >
                <div className="text-xs text-[#1174B9] p-1">
                  {gameDate.getDate()}
                </div>
                {game.played && game.bar_scores && (
                  <div className="calendar-hearts">
                    {game.bar_scores.map((hearts, barIndex) => (
                      <div key={`hearts-row-${gameDate.getDate()}-${barIndex}`} className="calendar-hearts-row">
                        {[...Array(4)].map((_, i) => (
                          <img
                            key={`heart-${gameDate.getDate()}-${barIndex}-${i}`}
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
          })}
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