import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { supabase } from '../services/supabase';
import ScoreHistory from '../components/ScoreHistory';
import OwnedMelodies from '../components/OwnedMelodies';
import SiteHeader from '../components/SiteHeader';

const PlayAgainPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMode] = useState('free'); // Will change to 'paid' in future
  const [isPlayedDay, setIsPlayedDay] = useState(true);
  const [gameHistory, setGameHistory] = useState({});

  useEffect(() => {
    // Check for flag when page loads
    if (localStorage.getItem('forceCalendarRefresh') === 'true') {
      console.log('Found refresh flag, will reload calendar');
      localStorage.removeItem('forceCalendarRefresh');
    }
    
    // Fetch the user's game history to check if days were played
    const fetchUserGameHistory = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('game_scores')
          .select('*')
          .eq('user_id', user.id)
          .order('played_at', { ascending: false });
          
        if (error) throw error;
        
        // Create a map of played dates
        const playedDates = {};
        data?.forEach(game => {
          // Use original_date for replays, played_at for originals
          const dateKey = game.is_replay 
            ? new Date(game.original_date).toISOString().split('T')[0]
            : new Date(game.played_at).toISOString().split('T')[0];
            
          playedDates[dateKey] = true;
        });
        
        setGameHistory(playedDates);
      } catch (error) {
        console.error('Error fetching game history:', error);
      }
    };
    
    fetchUserGameHistory();
  }, [user]);

  // Handle day selection from calendar
  const handleDaySelect = (date) => {
    setSelectedDate(date);
    
    // Check if this day has a score record
    const dateStr = date.toISOString().split('T')[0];
    const wasPlayed = gameHistory[dateStr] || false;
    setIsPlayedDay(wasPlayed);
    
    setShowOptions(true);
  };

  // Placeholder for future payment processing
  const processPayment = async (option) => {
    // This will be the payment integration point in the future
    console.log(`Payment option selected: ${option}`);

    if (paymentMode === 'free') {
      // Skip payment in free mode, just proceed to game
      return true;
    }

    // Future payment implementation would return true on success
    return true;
  };

  // Handle play option selection
  const handlePlayOptionSelect = async (option) => {
    setLoading(true);
    try {
      // Format the date for use in navigation
      const formattedDate = selectedDate.toISOString();
      const dateKey = selectedDate.toISOString().split('T')[0];
      
      // Store selection in local storage to be used by game
      localStorage.setItem('playAgainDate', formattedDate);
      localStorage.setItem('playAgainMode', option);
      
      // If unlimited mode is selected, also store it with the date as a key
      // This will help us track which melodies were purchased for unlimited plays
      if (option === 'unlimited') {
        localStorage.setItem(`playAgainMode_${dateKey}`, 'unlimited');
      }
  
      // Process payment (placeholder for future)
      const paymentSuccess = await processPayment(option);
      
      if (paymentSuccess) {
        // Navigate to the historical game route with query params
        navigate(`/play-historical?replay=true&date=${encodeURIComponent(formattedDate)}&mode=${option}`);
      } else {
        // Payment failed - would show error in paid implementation
        setLoading(false);
      }
    } catch (error) {
      console.error('Error starting replay:', error);
      setLoading(false);
    }
  };
  
  // Close the options modal
  const handleCloseOptions = () => {
    setShowOptions(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Use the SiteHeader component */}
      <SiteHeader />

      <div className="p-4 max-w-5xl mx-auto w-full">
        {/* Play Again Title Card */}
        <div className="card bg-background-alt shadow-xl border-2 border-writing/30 rounded-lg mb-6">
          <div className="card-body p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="font-patrick text-[#AB08FF]">
                  <span className="text-lg font-normal">WELCOME TO</span><br />
                  <span className="text-2xl font-bold">PLAY AGAIN</span>
                </h1>
                <p className="font-patrick text-[#AB08FF] mt-1 text-sm font-normal">
                  IMPROVE YOUR SCORES AND YOUR SKILLS
                </p>
              </div>
              <div className="flex-shrink-0">
                <img src="/assets/images/ui/archive.svg" alt="Archive" className="w-16 h-16" />
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout for desktop */}
        <div className="block lg:flex lg:gap-4">
          {/* Calendar Card - Left Column */}
          <div className="lg:w-1/2 mb-6 lg:mb-0">
            <div className="card bg-background-alt shadow-xl border-2 border-writing/30 rounded-lg h-full">
              <div className="card-body p-6">
                <h2 className="text-xl font-patrick text-writing mb-4">SELECT THE DAY YOU WANT TO REPLAY</h2>
                
                {/* Calendar Component */}
                <ScoreHistory userId={user?.id} onDaySelect={handleDaySelect} />
              </div>
            </div>
          </div>

          {/* Melodies You Own Card - Right Column - Fixed height with scrolling */}
          <div className="lg:w-1/2">
            <div className="card bg-background-alt shadow-xl border-2 border-writing/30 rounded-lg">
              <div className="p-6">
                <h2 className="text-xl font-patrick text-writing mb-4">MELODIES YOU OWN</h2>
                
                {/* Scrollable container with fixed height */}
                <div className="h-64 md:h-80 lg:h-96 overflow-y-auto pr-1">
                  <OwnedMelodies userId={user?.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Play Options Modal */}
      {showOptions && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background-alt shadow-xl border-2 border-writing/30 rounded-lg p-6 w-[90%] max-w-md mx-auto">
            <div className="flex flex-col items-center mb-5">
              <h2 className="text-xl font-patrick text-writing">
                Play {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric'
                })}
              </h2>
              
              {/* Show different message based on whether day was played */}
              <div className="mt-2 px-3 py-1 bg-writing/10 rounded-lg">
                <span className="font-patrick text-writing text-sm">
                  {isPlayedDay 
                    ? "Choose your play option" 
                    : "You missed this melody - buy it now!"}
                </span>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <button 
                onClick={() => handlePlayOptionSelect('single')}
                disabled={loading}
                className="w-full bg-writing text-white rounded-lg py-3 font-patrick hover:bg-writing/90 transition-colors flex justify-between items-center"
              >
                <div className="flex items-center">
                  <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    <span className="font-patrick text-lg">1×</span>
                  </div>
                  <span>Play Once</span>
                </div>
                <span className="bg-white text-writing px-3 py-1 rounded font-bold">
                  FREE
                </span>
              </button>
              
              <button 
                onClick={() => handlePlayOptionSelect('unlimited')}
                disabled={loading}
                className="w-full bg-special text-white rounded-lg py-3 font-patrick hover:bg-special/90 transition-colors flex justify-between items-center"
              >
                <div className="flex items-center">
                  <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    <span className="font-patrick text-sm">∞</span>
                  </div>
                  <span>Unlimited Plays</span>
                </div>
                <span className="bg-white text-special px-3 py-1 rounded font-bold">
                  FREE
                </span>
              </button>
            </div>
            
            <button
              onClick={handleCloseOptions}
              className="w-full border-2 border-writing text-writing rounded-lg py-2 font-patrick hover:bg-writing/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-background-alt shadow-xl border-2 border-writing/30 rounded-lg p-6">
            <p className="text-writing font-patrick">Loading game...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayAgainPage;