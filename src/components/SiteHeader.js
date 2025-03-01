import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import EverythingButton from './EverythingButton';
import { supabase } from '../services/supabase';
import { useAuth } from '../services/AuthContext';

const SiteHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if we're on the Play Again or Stats page
  const isPlayAgainPage = location.pathname === '/play-again';
  const isStatsPage = location.pathname === '/stats';

  // Check if the user has played today
  useEffect(() => {
    const checkIfUserPlayedToday = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Get today's date at midnight UTC
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        // Query for any game scores from today
        const { data, error } = await supabase
          .from('game_scores')
          .select('*')
          .eq('user_id', user.id)
          .gte('played_at', today.toISOString())
          .limit(1);

        if (error) {
          console.error('Error checking play status:', error);
          setHasPlayedToday(false);
        } else {
          // If data exists and has at least one entry, user has already played today
          setHasPlayedToday(data && data.length > 0);
        }
      } catch (error) {
        console.error('Exception checking play status:', error);
        setHasPlayedToday(false);
      } finally {
        setLoading(false);
      }
    };

    checkIfUserPlayedToday();
  }, [user?.id]);

  const handleGameButtonClick = () => {
    // If on Play Again page, go to stats page
    if (isPlayAgainPage) {
      navigate('/stats');
    }
    // If on Stats page, go to profile page
    else if (isStatsPage) {
      navigate('/profile');
    }
    // If played today but not on Play Again or Stats page, go to Play Again
    else if (hasPlayedToday) {
      navigate('/play-again');
    }
    // If not played today, go to main game
    else {
      navigate('/');
    }
  };

  // Determine button text based on current page and play status
  let buttonText;
  if (isPlayAgainPage) {
    buttonText = "STATS & STREAKS";
  } else if (isStatsPage) {
    buttonText = "YOUR PAGE";
  } else if (hasPlayedToday) {
    buttonText = "PLAY AGAIN";
  } else {
    buttonText = "BACK TO GAME";
  }

  return (
    <div className="w-full bg-[#FFFDEE]">
      {/* Desktop & Tablet Layout */}
      <div className="hidden md:flex max-w-4xl mx-auto px-4 py-3 items-center justify-between">
        <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/')}>
          <img
            src="/assets/images/ui/logo.svg"
            alt="MUSOPLAY"
            className="h-8"
          />
          <p className="text-[#1174B9] text-base font-patrick font-bold mt-1 uppercase">Play a New Tune Everyday</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleGameButtonClick}
            className="font-patrick text-[#1174B9] border-[#1174B9] border-2 rounded-lg
              px-6 py-2 hover:bg-[#1174B9]/10 transition-colors"
            disabled={loading}
          >
            {loading ? "LOADING..." : buttonText}
          </button>
          <EverythingButton isMobile={false} />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden w-full">
        <div className="flex flex-col gap-3 px-4 py-3">
          {/* Logo Row */}
          <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/')}>
            <img
              src="/assets/images/ui/logo.svg"
              alt="MUSOPLAY"
              className="h-6"
            />
            <p className="text-[#1174B9] text-sm font-patrick font-bold mt-0.5 uppercase">Play a New Tune Everyday</p>
          </div>
          {/* Buttons Row */}
          <div className="flex justify-start gap-2">
            <button
              onClick={handleGameButtonClick}
              className="flex-1 font-patrick text-[#1174B9] border-[#1174B9] border-2
                rounded-lg py-2 hover:bg-[#1174B9]/10 transition-colors text-sm"
              disabled={loading}
            >
              {loading ? "..." : buttonText}
            </button>
            <div className="flex-1">
              <EverythingButton isMobile={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteHeader;