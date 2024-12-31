import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { ScoreService } from '../services/scoreService';
import ScoreHistory from '../components/ScoreHistory';

const StatsAndStreaks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    currentStreak: 0,
    bestStreak: 0,
    todayScore: 0,
    barPerformance: [0, 0, 0, 0]
  });

  const loadStats = async () => {
    if (!user) {
      navigate('/');
      return;
    }
    try {
      setLoading(true);
      const userStats = await ScoreService.getUserStats(user.id);
      setStats(userStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [user, navigate]);

  // Add effect for focus/visibility changes
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused - refreshing stats');
      loadStats();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('Page visible - refreshing stats');
        loadStats();
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDEE] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDEE] flex flex-col">
      {/* Logo */}
      <div className="p-4 flex justify-center">
        <img 
          src="/assets/images/ui/logo.svg" 
          alt="Musoplay" 
          className="h-8 object-contain"
        />
      </div>
      
      <div className="p-4 max-w-5xl mx-auto w-full">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="font-['Patrick_Hand_SC'] text-[#00C22D] border-[#00C22D] border-3 rounded-full px-6 py-2 mb-6 hover:bg-[#00C22D] hover:text-white transition-colors"
        >
          BACK TO GAME
        </button>

        {/* Streak Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card bg-[#FFFFF5] shadow-xl border-2 border-[#1174B9]/30 rounded-lg">
            <div className="card-body p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-['Patrick_Hand_SC'] text-[#00C22D] mb-1">CURRENT STREAK</p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-['Patrick_Hand_SC'] text-[#00C22D]">{stats.currentStreak}</span>
                    <span className="ml-2 text-xl font-['Patrick_Hand_SC'] text-[#00C22D]">DAYS</span>
                  </div>
                </div>
                <img src="/assets/images/ui/streak.svg" alt="Streak" className="w-12 h-12" />
              </div>
            </div>
          </div>

          <div className="card bg-[#FFFFF5] shadow-xl border-2 border-[#1174B9]/30 rounded-lg">
            <div className="card-body p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-['Patrick_Hand_SC'] text-[#FF8A20] mb-1">BEST STREAK</p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-['Patrick_Hand_SC'] text-[#FF8A20]">{stats.bestStreak}</span>
                    <span className="ml-2 text-xl font-['Patrick_Hand_SC'] text-[#FF8A20]">DAYS</span>
                  </div>
                </div>
                <img src="/assets/images/ui/trophy.svg" alt="Trophy" className="w-12 h-12" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="block lg:flex lg:gap-4">
          {/* Today's Performance */}
          <div className="lg:w-1/2 mb-6 lg:mb-0">
            <div className="card bg-[#FFFFF5] shadow-xl border-2 border-[#1174B9]/30 rounded-lg h-full">
              <div className="card-body p-6">
                <h2 className="text-2xl font-['Patrick_Hand_SC'] mb-4">TODAY'S PERFORMANCE</h2>
                
                <div className="mb-6">
                  <p className="text-sm font-['Patrick_Hand_SC'] text-[#1174B9]">SCORE</p>
                  <p className="text-4xl font-['Patrick_Hand_SC']">{stats.todayScore}/16</p>
                </div>

                <div>
                  <p className="text-sm font-['Patrick_Hand_SC'] text-[#FF2376] mb-4">BAR PERFORMANCE</p>
                  <div className="grid grid-rows-4 gap-4">
                    {stats.barPerformance.map((hearts, index) => (
                      <div key={index} className="flex">
                        {[...Array(4)].map((_, i) => (
                          <img 
                            key={i}
                            src={`/assets/images/ui/${i < hearts ? 'heart.svg' : 'heart-empty.svg'}`}
                            alt={i < hearts ? "Full Heart" : "Empty Heart"}
                            className="w-8 h-8 mr-2"
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="lg:w-1/2">
            <ScoreHistory userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsAndStreaks;