import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const OwnedMelodies = ({ userId }) => {
  const [ownedMelodies, setOwnedMelodies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOwnedMelodies = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
  
      try {
        console.log('Fetching owned melodies for user:', userId);
        
        // First, let's get all game scores (original plays and replays)
        const { data: allScores, error: allScoresError } = await supabase
          .from('game_scores')
          .select('*')
          .eq('user_id', userId)
          .order('played_at', { ascending: false });
          
        if (allScoresError) throw allScoresError;
        
        // Then, get just unlimited replays to identify owned melodies
        const { data: unlimitedReplays, error: replaysError } = await supabase
          .from('game_scores')
          .select('*')
          .eq('user_id', userId)
          .eq('is_replay', true)
          .eq('replay_mode', 'unlimited')
          .order('replay_date', { ascending: false });
  
        if (replaysError) throw replaysError;
        
        console.log('Found unlimited replays:', unlimitedReplays?.length || 0);
        console.log('Found total scores:', allScores?.length || 0);
        console.log('Raw unlimited replays data:', unlimitedReplays);
  
        // Find the unique dates for owned melodies
        const ownedDates = new Set();
        unlimitedReplays?.forEach(replay => {
          if (replay.original_date) {
            const dateKey = new Date(replay.original_date).toISOString().split('T')[0];
            ownedDates.add(dateKey);
          }
        });
        
        console.log('Found owned dates:', Array.from(ownedDates));
        
        // Group all scores (originals and replays) by date
        const melodiesByDate = {};
        
        allScores?.forEach(scoreRecord => {
          // Determine the date to use (original_date for replays, played_at for originals)
          let dateToUse;
          if (scoreRecord.is_replay && scoreRecord.original_date) {
            dateToUse = new Date(scoreRecord.original_date);
          } else {
            dateToUse = new Date(scoreRecord.played_at);
          }
          
          const dateKey = dateToUse.toISOString().split('T')[0];
          
          // Only process scores for owned melodies
          if (!ownedDates.has(dateKey)) return;
          
          if (!melodiesByDate[dateKey]) {
            melodiesByDate[dateKey] = {
              date: dateToUse,
              scores: [],
              lastPlayed: scoreRecord.is_replay ? 
                new Date(scoreRecord.replay_date || scoreRecord.played_at) : 
                new Date(scoreRecord.played_at)
            };
          }
          
          // Calculate score (prefer best_score if available)
          let calculatedScore;
          if (scoreRecord.best_score) {
            calculatedScore = scoreRecord.best_score;
          } else if (scoreRecord.best_bar_scores && Array.isArray(scoreRecord.best_bar_scores)) {
            calculatedScore = scoreRecord.best_bar_scores.reduce((sum, hearts) => sum + hearts, 0);
          } else if (Array.isArray(scoreRecord.bar_scores)) {
            calculatedScore = scoreRecord.bar_scores.reduce((sum, hearts) => sum + hearts, 0);
          } else {
            calculatedScore = scoreRecord.total_score || 0;
          }
            
          // Add this score to the array
          melodiesByDate[dateKey].scores.push({
            score: calculatedScore,
            playDate: scoreRecord.is_replay ? 
              new Date(scoreRecord.replay_date || scoreRecord.played_at) : 
              new Date(scoreRecord.played_at)
          });
          
          // Update lastPlayed if this score is more recent
          const scoreDate = scoreRecord.is_replay ? 
            new Date(scoreRecord.replay_date || scoreRecord.played_at) : 
            new Date(scoreRecord.played_at);
            
          if (scoreDate > melodiesByDate[dateKey].lastPlayed) {
            melodiesByDate[dateKey].lastPlayed = scoreDate;
          }
        });
        
        // Process each melody to get best and last scores
        const processedMelodies = Object.values(melodiesByDate).map(melody => {
          // Sort scores by date, most recent first
          melody.scores.sort((a, b) => b.playDate - a.playDate);
          
          // Get the last score (most recent)
          const lastScore = melody.scores[0]?.score || 0;
          
          // Get the best score (highest)
          const bestScore = Math.max(...melody.scores.map(s => s.score || 0));
          
          return {
            ...melody,
            lastScore,
            bestScore
          };
        });
        
        // Sort by date (newest first)
        const sortedMelodies = processedMelodies.sort((a, b) => b.lastPlayed - a.lastPlayed);
        
        console.log('Processed melodies for display:', sortedMelodies);
        setOwnedMelodies(sortedMelodies);
      } catch (error) {
        console.error('Error fetching owned melodies:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchOwnedMelodies();
    
    // Add focus event listener to refresh data when user returns to tab
    const handleFocus = () => {
      fetchOwnedMelodies();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Check for refresh flag
    const checkForRefresh = () => {
      const shouldRefresh = localStorage.getItem('forceCalendarRefresh') === 'true';
      if (shouldRefresh) {
        console.log('OwnedMelodies: Force refreshing after collection update');
        localStorage.removeItem('forceCalendarRefresh');
        fetchOwnedMelodies();
      }
    };
    
    // Check immediately and when window gets focus
    checkForRefresh();
    window.addEventListener('focus', checkForRefresh);
    
    // Cleanup
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('focus', checkForRefresh);
    };
  }, [userId]);
  const handleReplay = (date) => {
    const formattedDate = date.toISOString();
    localStorage.setItem('playAgainDate', formattedDate);
    localStorage.setItem('playAgainMode', 'unlimited');
    navigate(`/play-historical?replay=true&date=${encodeURIComponent(formattedDate)}&mode=unlimited`);
  };

  if (loading) {
    return <div className="py-4 text-center font-patrick text-writing">Loading your melodies...</div>;
  }

  return (
    <div className="space-y-3">
      {ownedMelodies.length > 0 ? (
        <>
          {ownedMelodies.map((melody, index) => (
                <div 
                  key={index} 
                  onClick={() => handleReplay(melody.date)}
                  className="p-3 border-2 border-writing/30 rounded-lg hover:bg-writing/5 cursor-pointer transition-colors"
                >
                  <div className="flex items-start">
                    <img 
                      src="/assets/images/ui/purpleheart.svg" 
                      alt="Owned Melody" 
                      className="w-5 h-5 mt-1 mr-3 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <p className="font-patrick text-writing font-bold">
                        {melody.date.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <div className="flex flex-wrap text-sm font-patrick text-writing">
                        <div className="mr-4">Best Score: {melody.bestScore}/16</div>
                        <div>Last Score: {melody.lastScore}/16</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
        <div className="font-patrick text-writing text-center py-6">
          <p className="mb-2">You don't own any melodies yet.</p>
          <p>Select "Unlimited Plays" when replaying a melody to add it to your collection.</p>
        </div>
      )}
    </div>
  );
};

export default OwnedMelodies;