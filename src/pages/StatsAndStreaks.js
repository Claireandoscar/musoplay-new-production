import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { ScoreService } from '../services/scoreService';
import ScoreHistory from '../components/ScoreHistory';
import { Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';

// Utility function to determine heart image based on date
const getHeartImageForDate = (date, isActive) => {
  const isSunday = date.getDay() === 0;
  if (isSunday) {
    return isActive ? '/assets/images/ui/heart.svg' : '/assets/images/ui/heart-empty.svg';
  } else {
    return isActive ? '/assets/images/ui/orangeheart.svg' : '/assets/images/ui/orangeheart-empty.svg';
  }
};

const StatsAndStreaks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    currentStreak: 0,
    bestStreak: 0,
    todayScore: 0,
    barPerformance: [0, 0, 0, 0],
    lastPlayedDate: new Date()
  });

  const handleShare = (platform) => {
    const date = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    const shareText = `MUSOPLAY - ${date}\nScore: ${stats.todayScore}/16`;
    const shareUrl = 'https://musoplay.com';

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`);
        break;
      case 'instagram':
        alert('Screenshot and share on Instagram!');
        break;
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`);
        break;
      default:
        break;
    }
  };

  const handleNativeShare = async () => {
    const date = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    const shareText = `MUSOPLAY - ${date}\nScore: ${stats.todayScore}/16`;
    const shareUrl = 'https://musoplay.com';

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MUSOPLAY Score',
          text: shareText,
          url: shareUrl
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      alert('Use the social buttons above to share your score!');
    }
  };

  const loadStats = async () => {
    if (!user) {
      navigate('/');
      return;
    }
    try {
      setLoading(true);
      const userStats = await ScoreService.getUserStats(user.id);
      setStats({
        ...userStats,
        lastPlayedDate: new Date(userStats.lastPlayedDate || new Date())
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [user, navigate]);

  useEffect(() => {
    const handleFocus = () => {
      loadStats();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
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
          className="font-['Patrick_Hand_SC'] text-[#1174B9] border-[#1174B9] border-3 rounded-full px-6 py-2 mb-6 hover:bg-[#1174B9] hover:text-white transition-colors"
        >
          BACK TO GAME
        </button>

        {/* Streak Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card bg-[#FFFFF5] shadow-xl border-2 border-[#1174B9]/30 rounded-lg">
            <div className="card-body p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-['Patrick_Hand_SC'] text-[#AB08FF] mb-1">CURRENT STREAK</p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-['Patrick_Hand_SC'] text-[#AB08FF]">{stats.currentStreak}</span>
                    <span className="ml-2 text-xl font-['Patrick_Hand_SC'] text-[#AB08FF]">DAYS</span>
                  </div>
                </div>
                <img src="/assets/images/ui/purple-streak.svg" alt="Streak" className="w-12 h-12" />
              </div>
            </div>
          </div>

          <div className="card bg-[#FFFFF5] shadow-xl border-2 border-[#1174B9]/30 rounded-lg">
            <div className="card-body p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-['Patrick_Hand_SC'] text-[#AB08FF] mb-1">BEST STREAK</p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-['Patrick_Hand_SC'] text-[#AB08FF]">{stats.bestStreak}</span>
                    <span className="ml-2 text-xl font-['Patrick_Hand_SC'] text-[#AB08FF]">DAYS</span>
                  </div>
                </div>
                <img src="/assets/images/ui/purple-trophy.svg" alt="Trophy" className="w-12 h-12" />
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
                <h2 className="text-2xl font-['Patrick_Hand_SC'] text-[#1174B9] mb-4">TODAY'S PERFORMANCE</h2>

                <div className="mb-8">
                  <p className="text-sm font-['Patrick_Hand_SC'] text-[#1174B9]">SCORE</p>
                  <p className="text-4xl font-['Patrick_Hand_SC'] text-[#1174B9]">{stats.todayScore}/16</p>
                </div>

                {/* Hearts and Social Buttons Container */}
                <div className="flex">
                  {/* Hearts Section */}
                  <div className="flex-1">
                    <p className="text-sm font-['Patrick_Hand_SC'] text-[#1174B9] mb-4">BAR PERFORMANCE</p>
                    <div className="grid grid-rows-4 gap-4">
                      {stats.barPerformance.map((hearts, index) => (
                        <div key={index} className="flex">
                          {[...Array(4)].map((_, i) => (
                            <img 
                              key={i}
                              src={getHeartImageForDate(stats.lastPlayedDate, i < hearts)}
                              alt={i < hearts ? "Full Heart" : "Empty Heart"}
                              className="w-8 h-8 mr-2"
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Social Buttons Section */}
                  <div className="flex-1 flex justify-center">
                    <div className="w-32 flex flex-col justify-between">
                      {/* 2x2 Social Grid */}
                      <div className="grid grid-cols-2 gap-4 mt-8">
                        <button
                          onClick={() => handleShare('facebook')}
                          className="w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-colors hover:bg-gray-50"
                          style={{ borderColor: '#1174B9' }}
                        >
                          <Facebook size={24} style={{ stroke: '#1174B9' }} />
                        </button>

                        <button
                          onClick={() => handleShare('instagram')}
                          className="w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-colors hover:bg-gray-50"
                          style={{ borderColor: '#1174B9' }}
                        >
                          <Instagram size={24} style={{ stroke: '#1174B9' }} />
                        </button>

                        <button
                          onClick={() => handleShare('whatsapp')}
                          className="w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-colors hover:bg-gray-50"
                          style={{ borderColor: '#1174B9' }}
                        >
                          <MessageCircle size={24} style={{ stroke: '#1174B9' }} />
                        </button>

                        <button
                          onClick={() => handleShare('linkedin')}
                          className="w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-colors hover:bg-gray-50"
                          style={{ borderColor: '#1174B9' }}
                        >
                          <Linkedin size={24} style={{ stroke: '#1174B9' }} />
                        </button>
                      </div>

                      {/* Please Share Button */}
                      <button
                        onClick={handleNativeShare}
                        className="w-full text-sm font-['Patrick_Hand_SC'] border-2 rounded-lg px-2 py-2 transition-colors hover:bg-gray-50"
                        style={{ 
                          borderColor: '#1174B9',
                          color: '#1174B9'
                        }}
                      >
                        PLEASE SHARE!
                      </button>
                    </div>
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