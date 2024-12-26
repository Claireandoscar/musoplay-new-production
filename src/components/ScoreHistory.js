import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const ScoreHistory = ({ userId }) => {
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchGameHistory = async () => {
      try {
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        const { data: scores, error } = await supabase
          .from('game_scores')
          .select('*')
          .eq('user_id', userId)
          .gte('played_at', startOfMonth.toISOString())
          .lte('played_at', endOfMonth.toISOString())
          .order('played_at', { ascending: true });

        if (error) throw error;

        const firstAttempts = scores?.reduce((acc, game) => {
          const dateKey = game.played_at.split('T')[0];
          if (!acc[dateKey]) {
            acc[dateKey] = game;
          }
          return acc;
        }, {});

        const filledHistory = [];
        let currentDate = new Date(startOfMonth);

        while (currentDate <= endOfMonth) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const gameForDay = firstAttempts?.[dateStr];

          filledHistory.push({
            date: dateStr,
            score: gameForDay?.total_score || null,
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
            <div key={`empty-${i}`} className="aspect-square border border-[#1174B9]/30 rounded-lg" />
          ))}
          
          {gameHistory.map((game) => (
            <div 
              key={game.date}
              className={`aspect-square rounded-lg border ${
                game.played 
                  ? 'bg-[#FFFFF5] border-[#1174B9]' 
                  : 'bg-[#FFFDEE] border-[#1174B9]/30 flex items-center justify-center'
              }`}
            >
              {game.played ? (
                <div className="w-full h-full flex items-center justify-center p-0.5">
                  <div className="flex flex-col gap-[0.05vh] sm:gap-[0.2vh]">
                    {game.bar_scores.map((hearts, barIndex) => (
                      <div key={barIndex} className="flex gap-[0.05vh] sm:gap-[0.2vh]">
                        {[...Array(4)].map((_, i) => (
                          <img 
                            key={i}
                            src={`/assets/images/ui/${i < hearts ? 'heart.svg' : 'heart-empty.svg'}`}
                            alt={i < hearts ? "Full Heart" : "Empty Heart"}
                            className="w-[0.8vh] h-[0.8vh] sm:w-[1.5vh] sm:h-[1.5vh]"
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm font-['Patrick_Hand_SC'] text-[#1174B9]/50">
                  {new Date(game.date).getDate()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoreHistory;