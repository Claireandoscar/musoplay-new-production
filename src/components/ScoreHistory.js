import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import './ScoreHistory.css';  // Keep the CSS import

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
    
        // Fetch both original plays and replays in one query
        const { data: scores, error } = await supabase
          .from('game_scores')
          .select('*')
          .eq('user_id', userId)
          .or(`played_at.gte.${startOfMonth.toISOString()},original_date.gte.${startOfMonth.toISOString()}`)
          .or(`played_at.lte.${endOfMonth.toISOString()},original_date.lte.${endOfMonth.toISOString()}`)
          .order('played_at', { ascending: false });
    
        if (error) throw error;
    
        // Process each score and group by date
        const latestAttempts = {};
        
        // Process each score
        scores?.forEach(game => {
          // Determine which date to use as the key
          const dateKey = game.is_replay 
            ? new Date(game.original_date).toISOString().split('T')[0]  // For replays, use original_date
            : new Date(game.played_at).toISOString().split('T')[0];     // For regular plays, use played_at
          
          // Calculate score from bar_scores
          const calculatedScore = Array.isArray(game.bar_scores) 
            ? game.bar_scores.reduce((sum, hearts) => sum + hearts, 0)
            : 0;
          
          // If we don't have this date yet, or this score is better, use it
          if (!latestAttempts[dateKey] || calculatedScore > latestAttempts[dateKey].calculatedScore) {
            latestAttempts[dateKey] = {
              ...game,
              calculatedScore,
              displayBarScores: game.bar_scores
            };
          }
        });
    
        // Fill calendar days - update this section to track month properly
        const filledHistory = [];
        
        // Iterate through each day of the month
        for (let day = 1; day <= endOfMonth.getDate(); day++) {
          const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const dateStr = currentDate.toISOString().split('T')[0];
          const gameForDay = latestAttempts[dateStr];
    
          filledHistory.push({
            date: dateStr,
            score: gameForDay?.calculatedScore || null,
            bar_scores: gameForDay?.displayBarScores || [],
            played: !!gameForDay,
            month: currentMonth.getMonth(), // Store month info for rendering
            year: currentMonth.getFullYear() // Store year info for rendering
          });
        }
    
        setGameHistory(filledHistory);
        console.log('Game history updated with', filledHistory.filter(game => game.played).length, 'played days');
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
    
    // Regular interval refresh
    const interval = setInterval(fetchGameHistory, 10000);
    
    // Cleanup
    return () => {
      clearInterval(interval);
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