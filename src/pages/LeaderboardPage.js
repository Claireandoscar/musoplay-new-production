import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../services/AuthContext';
import SiteHeader from '../components/SiteHeader';

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user } = useAuth();
  const [userRank, setUserRank] = useState(null);
  const [playerMetadata, setPlayerMetadata] = useState({});

  // Fetch user information for all players on the leaderboard
  const fetchUserMetadata = useCallback(async (userIds) => {
    try {
      if (userIds.length === 0) return {};
      
      // Fetch profiles for all users in the leaderboard
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
        
      if (error) throw error;
      
      // Create a map of user_id to profile data
      const profileMap = {};
      data?.forEach(profile => {
        profileMap[profile.id] = {
          username: profile.username || 'PLAYER',
          avatar_url: profile.avatar_url
        };
      });
      
      // If the current user is in the list but not in profiles, add their data
      if (user && userIds.includes(user.id) && !profileMap[user.id]) {
        profileMap[user.id] = {
          username: user.user_metadata?.username || 'YOU',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture
        };
      }
      
      return profileMap;
    } catch (error) {
      console.error('Error fetching user metadata:', error);
      
      // Fallback to just showing the current user's metadata
      if (user) {
        return {
          [user.id]: {
            username: user.user_metadata?.username || 'YOU',
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture
          }
        };
      }
      return {};
    }
  }, [user]);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async (date) => {
    setLoading(true);
    try {
      // Calculate total hearts from bar_scores array (moved inside useCallback)
      const calculateTotalHearts = (barScores) => {
        if (!Array.isArray(barScores)) return 0;
        return barScores.reduce((total, hearts) => total + hearts, 0);
      };
      
      // Create date range for the selected day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      console.log("FETCHING LEADERBOARD FOR DATE RANGE:", 
        startOfDay.toISOString(), 
        endOfDay.toISOString()
      );
      
      // Fetch game scores - filter to original plays only (not replays)
      // First attempt using the is_replay field
      let query = supabase
        .from('game_scores')
        .select('id, user_id, total_score, completion_time, bar_scores, played_at')
        .gte('played_at', startOfDay.toISOString())
        .lte('played_at', endOfDay.toISOString());
      
      // Try to filter by is_replay if the field exists
      try {
        query = query.eq('is_replay', false);
      } catch (e) {
        console.log('is_replay field might not exist, skipping filter');
      }
      
      // Execute the query
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log("RAW LEADERBOARD DATA:", data);
      
      // Post-process to ensure only one entry per user (first play of the day)
      const userFirstPlays = {};
      
      if (data && data.length > 0) {
        // Group by user and get earliest play for each
        data.forEach(entry => {
          const userId = entry.user_id;
          const playTime = new Date(entry.played_at).getTime();
          
          if (!userFirstPlays[userId] || 
              playTime < new Date(userFirstPlays[userId].played_at).getTime()) {
            userFirstPlays[userId] = entry;
          }
        });
        
        // Convert back to array and sort
        const processedData = Object.values(userFirstPlays).sort((a, b) => {
          // First by score (highest first)
          if (b.total_score !== a.total_score) {
            return b.total_score - a.total_score;
          }
          
          // Calculate total hearts if total_score isn't available
          const aHearts = a.total_score || calculateTotalHearts(a.bar_scores);
          const bHearts = b.total_score || calculateTotalHearts(b.bar_scores);
          
          if (bHearts !== aHearts) {
            return bHearts - aHearts;
          }
          
          // If completion_time isn't available, sort by played_at instead
          if (!a.completion_time && !b.completion_time) {
            return new Date(a.played_at).getTime() - new Date(b.played_at).getTime();
          }
          
          // Then by completion time (fastest first)
          return (a.completion_time || 999999) - (b.completion_time || 999999);
        });
        
        console.log("PROCESSED LEADERBOARD DATA:", processedData);
        
        // Get unique user IDs
        const userIds = [...new Set(processedData.map(entry => entry.user_id))];
        
        // Fetch user metadata for these users
        const metadata = await fetchUserMetadata(userIds);
        setPlayerMetadata(metadata);
        
        // Find user's rank if logged in
        if (user) {
          const userPosition = processedData.findIndex(entry => entry.user_id === user.id);
          setUserRank(userPosition >= 0 ? userPosition + 1 : null);
        }
        
        setLeaderboardData(processedData);
      } else {
        setLeaderboardData([]);
      }
    } catch (error) {
      console.error('ERROR FETCHING LEADERBOARD:', error);
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  }, [user, fetchUserMetadata]);

  useEffect(() => {
    fetchLeaderboard(selectedDate);
  }, [selectedDate, fetchLeaderboard]);

  // Handle date navigation
  const changeDate = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  // Get player display name
  const getPlayerName = (entry, index) => {
    // If it's the current user, use their metadata
    if (entry.user_id === user?.id) {
      return (user.user_metadata?.username || user.user_metadata?.name || 'YOU').toUpperCase();
    }
    
    // Otherwise use the cached metadata or a default
    return (playerMetadata[entry.user_id]?.username || `PLAYER ${index + 1}`).toUpperCase();
  };
  
  // Get player avatar URL
  const getPlayerAvatar = (entry) => {
    // If it's the current user, use their metadata
    if (entry.user_id === user?.id) {
      return user.user_metadata?.avatar_url || user.user_metadata?.picture;
    }
    
    // Otherwise use the cached metadata
    return playerMetadata[entry.user_id]?.avatar_url;
  };

  // Render heart icons in a 4x4 grid with bar-specific hearts
  const renderHearts = (entry) => {
    // If we don't have bar_scores, create a default array
    const barScores = Array.isArray(entry.bar_scores) && entry.bar_scores.length === 4 
      ? entry.bar_scores 
      : [4, 4, 4, 4];
    
    // Create 4 rows of hearts, one for each bar
    return (
      <div className="grid grid-rows-4 gap-1 w-24">
        {barScores.map((barHearts, barIndex) => (
          <div key={barIndex} className="flex gap-0.5">
            {[...Array(4)].map((_, heartIndex) => (
              <img
                key={`${barIndex}-${heartIndex}`}
                src={`/assets/images/ui/${heartIndex < barHearts ? 'orangeheart.svg' : 'orangeheart-empty.svg'}`}
                alt={heartIndex < barHearts ? "FULL HEART" : "EMPTY HEART"}
                className="w-5 h-5"
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <div className="p-4 max-w-5xl mx-auto w-full">
        {/* Combined Welcome Header with Date Navigation */}
        <div className="card bg-background-alt shadow-xl border-2 border-writing/30 rounded-lg mb-6">
          <div className="card-body p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-patrick text-[#AB08FF] text-lg">WELCOME TO THE</h3>
                <h1 className="font-patrick text-[#AB08FF] text-3xl font-bold mb-2">DAILY LEADERBOARD</h1>
                <p className="font-patrick text-[#AB08FF] text-sm">SEE HOW YOU RANK!</p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => changeDate(-1)}
                  className="p-2 border-2 border-[#AB08FF]/30 rounded-lg"
                >
                  <span className="font-patrick text-[#AB08FF]">←</span>
                </button>
                <span className="font-patrick text-[#AB08FF] uppercase">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <button 
                  onClick={() => changeDate(1)}
                  className="p-2 border-2 border-[#AB08FF]/30 rounded-lg"
                >
                  <span className="font-patrick text-[#AB08FF]">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Your Rank Card - Only show if user is logged in and has a rank */}
        {user && userRank && (
          <div className="card bg-background-alt shadow-xl border-2 border-writing/30 rounded-lg mb-6">
            <div className="card-body p-6">
              <h2 className="font-patrick text-[#1174B9] text-xl mb-2">YOUR RANK</h2>
              <div className="flex items-center">
                <div className="w-10 h-10 flex items-center justify-center border-2 border-writing/30 rounded-full mr-3">
                  <span className="font-patrick text-[#1174B9] text-xl">#{userRank}</span>
                </div>
                <div className="font-patrick text-[#1174B9]">
                  SCORE: {leaderboardData.find(entry => entry.user_id === user.id)?.total_score || 0}/16
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="card bg-background-alt shadow-xl border-2 border-writing/30 rounded-lg">
          <div className="card-body p-6">
            {loading ? (
              <div className="text-center py-4">
                <p className="font-patrick text-[#1174B9]">LOADING LEADERBOARD...</p>
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="text-center py-4">
                <p className="font-patrick text-[#1174B9]">NO SCORES FOR THIS DAY YET.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-writing/30">
                      <th className="py-2 px-2 text-left font-patrick text-[#1174B9]">RANK</th>
                      <th className="py-2 px-2 text-left font-patrick text-[#1174B9]">PLAYER</th>
                      <th className="py-2 px-2 text-right font-patrick text-[#1174B9]">SCORE</th>
                      <th className="py-2 px-2 text-center font-patrick text-[#1174B9]">HEARTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((entry, index) => (
                      <tr 
                        key={entry.id} 
                        className={`border-b border-writing/10 ${entry.user_id === user?.id ? 'bg-writing/10' : ''}`}
                      >
                        <td className="py-3 px-2 font-patrick text-[#1174B9]">#{index + 1}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center">
                            {getPlayerAvatar(entry) ? (
                              <img src={getPlayerAvatar(entry)} alt="Avatar" className="w-8 h-8 rounded-full mr-2" />
                            ) : (
                              <div className="w-8 h-8 bg-[#1174B9]/20 rounded-full mr-2 flex items-center justify-center">
                                <span className="font-patrick text-[#1174B9]">
                                  {getPlayerName(entry, index).charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span className="font-patrick text-[#1174B9]">
                              {getPlayerName(entry, index)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right font-patrick text-[#1174B9]">
                          <div className="text-lg">{entry.total_score}/16</div>
                          <div className="text-xs text-[#1174B9]/60 uppercase">
                            {entry.played_at ? new Date(entry.played_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                          </div>
                        </td>
                        <td className="py-3 px-2 flex justify-center">
                          {renderHearts(entry)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Refresh Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => fetchLeaderboard(selectedDate)}
                className="px-4 py-2 bg-[#1174B9] text-white rounded-lg font-patrick hover:bg-[#0d5a8f] transition-colors"
              >
                REFRESH LEADERBOARD
              </button>
            </div>
          </div>
        </div>
        
        {/* Help Text */}
        <div className="mt-4 text-center">
          <p className="text-sm text-[#1174B9] uppercase">
            SCORES ARE RANKED BY POINTS FIRST, THEN BY SUBMISSION TIME.
          </p>
          <p className="text-xs text-[#1174B9] mt-1 uppercase">
            ONLY FIRST PLAYS OF THE DAY ARE SHOWN ON THE LEADERBOARD.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;