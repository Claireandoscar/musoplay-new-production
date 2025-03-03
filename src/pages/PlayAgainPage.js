import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { supabase } from '../services/supabase';
import ScoreHistory from '../components/ScoreHistory';
import OwnedMelodies from '../components/OwnedMelodies';
import SiteHeader from '../components/SiteHeader';

const PlayAgainPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMode] = useState('free'); // Will change to 'paid' in future
  const [isPlayedDay, setIsPlayedDay] = useState(true);
  const [gameHistory, setGameHistory] = useState({});
  const [ownedMelodies, setOwnedMelodies] = useState(new Set()); // Track owned melodies
  const [playedOnceMelodies, setPlayedOnceMelodies] = useState(new Set()); // Track played once melodies
  const [showOnlyUnlimited, setShowOnlyUnlimited] = useState(false); // For controlling options display

  // Redirect non-authenticated users after auth state is confirmed
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signup');
    }
  }, [user, authLoading, navigate]);

  // Check for calendar refresh flag and fetch game history
  useEffect(() => {
    // Don't run this if still loading auth or no user
    if (authLoading || !user) return;

    // Check for flag when page loads
    if (localStorage.getItem('forceCalendarRefresh') === 'true') {
      console.log('Found refresh flag, will reload calendar');
      localStorage.removeItem('forceCalendarRefresh');
    }
    
    // Fetch the user's game history and replay status
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      try {
        // Get played dates
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

        // Fetch all replay data for this user
        const { data: replayData, error: replayError } = await supabase
          .from('game_scores')
          .select('original_date, replay_mode')
          .eq('user_id', user.id)
          .eq('is_replay', true);
          
        if (replayError) throw replayError;
        
        // Create sets for owned melodies and single-play used melodies
        const ownedDatesSet = new Set();
        const playedOnceDatesSet = new Set();
        
        replayData?.forEach(item => {
          if (item.original_date) {
            const dateKey = new Date(item.original_date).toISOString().split('T')[0];
            
            if (item.replay_mode === 'unlimited') {
              ownedDatesSet.add(dateKey);
            } else if (item.replay_mode === 'single') {
              playedOnceDatesSet.add(dateKey);
            }
          }
        });
        
        console.log('Owned melody dates:', Array.from(ownedDatesSet));
        console.log('Already played once dates:', Array.from(playedOnceDatesSet));
        
        setOwnedMelodies(ownedDatesSet);
        setPlayedOnceMelodies(playedOnceDatesSet);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, [user, authLoading]);

  // Handle day selection from calendar
  const handleDaySelect = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(date);
    
    const wasPlayed = gameHistory[dateStr] || false;
    setIsPlayedDay(wasPlayed);
    
    // Check melody ownership/play status
    if (ownedMelodies.has(dateStr)) {
      // Already owns this melody - go straight to game
      goToHistoricalGame(date, 'unlimited');
    } else if (playedOnceMelodies.has(dateStr)) {
      // Already used "Play Once" - show only unlimited option
      setShowOnlyUnlimited(true);
      setShowOptions(true);
    } else {
      // Show all options
      setShowOnlyUnlimited(false);
      setShowOptions(true);
    }
  };

  // Navigate to historical game
  const goToHistoricalGame = (date, mode) => {
    setLoading(true);
    const formattedDate = date.toISOString();
    const dateKey = date.toISOString().split('T')[0];
    
    // Store selection in local storage
    localStorage.setItem('playAgainDate', formattedDate);
    localStorage.setItem('playAgainMode', mode);
    
    // If unlimited mode is selected, also store it with the date as a key
    if (mode === 'unlimited') {
      localStorage.setItem(`playAgainMode_${dateKey}`, 'unlimited');
    }
    
    // Navigate to the historical game
    navigate(`/play-historical?replay=true&date=${encodeURIComponent(formattedDate)}&mode=${mode}`);
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
      // Process payment (placeholder for future)
      const paymentSuccess = await processPayment(option);
      
      if (paymentSuccess) {
        goToHistoricalGame(selectedDate, option);
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

  // Loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-writing font-patrick">Loading...</p>
      </div>
    );
  }

  // If not authenticated, don't render anything (the redirect will happen)
  if (!user) {
    return null;
  }

  // Main component render
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
                <img src="/assets/images/ui/blue-archive.svg" alt="Archive" className="w-16 h-16" />
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
                <ScoreHistory 
                  userId={user?.id} 
                  onDaySelect={handleDaySelect} 
                  ownedMelodies={ownedMelodies}
                />
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
              {/* Show different message based on whether day was played and play status */}
              <div className="mt-2 px-3 py-1 bg-writing/10 rounded-lg">
                <span className="font-patrick text-writing text-sm">
                  {showOnlyUnlimited
                    ? "You've already played this once. Purchase unlimited plays?"
                    : isPlayedDay
                      ? "Choose your play option"
                      : "You missed this melody - buy it now!"}
                </span>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              {!showOnlyUnlimited && (
                <button
                  onClick={() => handlePlayOptionSelect('single')}
                  disabled={loading}
                  className="w-full border-2 border-[#1174B9] bg-[#FFFDEE] text-[#1174B9] rounded-lg 
                            py-3 font-patrick text-lg transition-colors hover:bg-[#1174B9] hover:text-white"
                >
                  Play Once
                  <span className="ml-2 text-sm font-normal">
                    FREE
                  </span>
                </button>
              )}
              
              <button
                onClick={() => handlePlayOptionSelect('unlimited')}
                disabled={loading}
                className="w-full border-2 border-[#AB08FF] bg-[#FFFDEE] text-[#AB08FF] rounded-lg 
                          py-3 font-patrick text-lg transition-colors hover:bg-[#AB08FF] hover:text-white"
              >
                {showOnlyUnlimited ? 'Buy Unlimited Plays' : 'Unlimited Plays'}
                <span className="ml-2 text-sm font-normal">
                  FREE
                </span>
              </button>
            </div>
            
            <button
              onClick={handleCloseOptions}
              className="w-full border-2 border-writing text-writing rounded-lg py-2 
                        font-patrick hover:bg-writing/10 transition-colors"
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