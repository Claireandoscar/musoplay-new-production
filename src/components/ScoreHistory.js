import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const ScoreHistory = ({ userId }) => {
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
    return isActive ? 'purpleheart.svg' : 'purpleheart-empty.svg';
  };

  useEffect(() => {
    const fetchGameHistory = async () => {
      try {
        // Set time to midnight UTC
        const startOfMonth = new Date(Date.UTC(currentMonth.getFullYear(), currentMonth.getMonth(), 1));
        const endOfMonth = new Date(Date.UTC(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999));

        console.log('Fetching scores for range:', {
          start: startOfMonth.toISOString(),
          end: endOfMonth.toISOString()
        });

        const { data: scores, error } = await supabase
          .from('game_scores')
          .select('*')
          .eq('user_id', userId)
          .gte('played_at', startOfMonth.toISOString())
          .lte('played_at', endOfMonth.toISOString())
          .order('played_at', { ascending: false });

        if (error) throw error;

        console.log('Fetched scores:', scores);

        const latestAttempts = scores?.reduce((acc, game) => {
          const dateKey = new Date(game.played_at).toISOString().split('T')[0];
          if (!acc[dateKey] || new Date(game.played_at) > new Date(acc[dateKey].played_at)) {
            acc[dateKey] = {
              ...game,
              calculatedScore: Array.isArray(game.bar_scores) 
                ? game.bar_scores.reduce((sum, hearts) => sum + hearts, 0)
                : 0
            };
          }
          return acc;
        }, {});

        const filledHistory = [];
        let currentDate = new Date(startOfMonth);

        while (currentDate <= endOfMonth) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const gameForDay = latestAttempts?.[dateStr];

          filledHistory.push({
            date: dateStr,
            score: gameForDay?.calculatedScore || null,
            bar_scores: gameForDay?.bar_scores || [],
            played: !!gameForDay
          });

          currentDate.setDate(currentDate.getDate() + 1);
        }

        setGameHistory(filledHistory);
      } catch (error) {
        console.error('Error fetching game history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameHistory();
    const interval = setInterval(fetchGameHistory, 10000);
    return () => clearInterval(interval);
  }, [userId, currentMonth]);

  if (loading) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }

  return (
    <div className="card bg-[#FFFFF5] shadow-xl mb-6 border-2 border-[#1174B9]/30 rounded-lg">
      <div className="card-body p-6">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="font-['Patrick_Hand_SC'] text-[#1174B9] hover:text-[#0d5a94] px-4"
          >
            ←
          </button>
          <h3 className="font-['Patrick_Hand_SC'] text-xl">
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

        <div className="grid grid-cols-7 gap-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={`day-${index}`} className="text-center font-['Patrick_Hand_SC'] text-[#1174B9]">
              {day}
            </div>
          ))}
          
          {[...Array(new Date(gameHistory[0]?.date).getDay() || 0)].map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square border-2 border-[#1174B9]/10 rounded-lg" />
          ))}
          
          {gameHistory.map((game) => (
            <div 
              key={game.date}
              className={`aspect-square border-2 border-[#1174B9]/10 rounded-lg flex flex-col ${
                game.played ? 'bg-[#FFFFF5]' : 'bg-[#FFFDEE]'
              }`}
            >
              <div className="text-xs text-[#1174B9] p-1">
                {new Date(game.date).getDate()}
              </div>
              {game.played && game.bar_scores && (
                <div className="w-full flex flex-col justify-center p-1">
                  {game.bar_scores.map((hearts, barIndex) => (
                    <div key={barIndex} className="flex gap-[2px] justify-center">
                      {[...Array(4)].map((_, i) => (
                        <img 
                          key={i}
                          src={`/assets/images/ui/${getHeartImage(game.date, i < hearts)}`}
                          alt={i < hearts ? "Full Heart" : "Empty Heart"}
                          className="w-[10px] h-[10px]"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoreHistory;