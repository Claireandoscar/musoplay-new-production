// src/services/scoreService.js
import { supabase } from './supabase';

export const ScoreService = {
  _getUTCStartOfDay() {
    const utcDate = new Date();
    utcDate.setUTCHours(0, 0, 0, 0);
    return utcDate;
  },

  _getUTCEndOfDay() {
    const utcDate = new Date();
    utcDate.setUTCHours(23, 59, 59, 999);
    return utcDate;
  },

  _calculateStreak(currentStats, now) {
    console.log('Calculating streak with:', {
      currentStats,
      now: now.toISOString()
    });

    let newCurrentStreak = 1;
    let newBestStreak = currentStats?.best_streak || 1;

    if (currentStats?.last_played_at) {
      const lastPlayed = new Date(currentStats.last_played_at);
      
      // Make sure we're comparing dates without time
      const lastPlayedDate = new Date(lastPlayed.toDateString());
      const nowDate = new Date(now.toDateString());
      
      // Calculate days between plays (inclusive of played days)
      const timeDiff = Math.abs(nowDate - lastPlayedDate);
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      console.log('Streak calculation:', {
        lastPlayedDate: lastPlayedDate.toISOString(),
        nowDate: nowDate.toISOString(),
        daysDiff
      });

      if (daysDiff === 0) {
        // Same day play - maintain streak
        newCurrentStreak = currentStats.current_streak || 1;
      } else if (daysDiff === 1) {
        // Next day play - increment streak
        newCurrentStreak = (currentStats.current_streak || 0) + 1;
      } else {
        // Gap in play - reset streak
        newCurrentStreak = 1;
      }

      // Update best streak if current is higher
      newBestStreak = Math.max(newBestStreak, newCurrentStreak);
    }

    console.log('New streak values:', {
      newCurrentStreak,
      newBestStreak
    });

    return { newCurrentStreak, newBestStreak };
  },  // Added missing comma here

  async recordGameScore(userId, barScores, melodyId = null) {
    console.log('recordGameScore called with:', { userId, barScores, melodyId });
    
    try {
      const totalScore = barScores.reduce((sum, score) => sum + score, 0);
      // ... rest of the function
      const perfectBars = barScores.filter(score => score === 4).length;
      const now = new Date();
      const utcNow = now.toISOString();

      console.log('Processing score:', { totalScore, perfectBars, utcNow });

      // First get current stats for streak calculation
      const { data: currentStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('id', userId)
        .single();

      // Calculate new streak values
      const { newCurrentStreak, newBestStreak } = this._calculateStreak(currentStats, now);

      // Record the game score
      console.log('Recording score with calculated streaks:', {
        currentStreak: newCurrentStreak,
        bestStreak: newBestStreak
      });
      
      const { data: insertedScore, error: insertError } = await supabase
        .from('game_scores')
        .insert({
          user_id: userId,
          total_score: totalScore,
          bar_scores: barScores,
          perfect_bars: perfectBars,
          melody_id: melodyId,
          played_at: utcNow
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting score:', insertError);
        throw insertError;
      }

      console.log('Score recorded successfully:', insertedScore);
      
      // Update user stats with new streak values
      console.log('Updating user stats with new streaks...');
      
      if (currentStats) {
        const { error: updateError } = await supabase
          .from('user_stats')
          .update({
            total_games_played: currentStats.total_games_played + 1,
            total_perfect_scores: currentStats.total_perfect_scores + (totalScore === 16 ? 1 : 0),
            current_streak: newCurrentStreak,
            best_streak: newBestStreak,
            last_played_at: utcNow
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating user stats:', updateError);
          throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
          .from('user_stats')
          .insert({
            id: userId,
            total_games_played: 1,
            total_perfect_scores: totalScore === 16 ? 1 : 0,
            current_streak: newCurrentStreak,
            best_streak: newBestStreak,
            last_played_at: utcNow
          });

        if (insertError) {
          console.error('Error inserting user stats:', insertError);
          throw insertError;
        }
      }

      console.log('Streak update completed successfully');
      return insertedScore;
    } catch (error) {
      console.error('Error in recordGameScore:', error);
      throw error;
    }
  },

  async getUserScoreHistory(userId, limit = 30) {
    console.log('Fetching score history for user:', userId);
    
    try {
      const { data, error } = await supabase
        .from('game_scores')
        .select('*')
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      console.log('Score history fetched:', data);
      return data;
    } catch (error) {
      console.error('Error in getUserScoreHistory:', error);
      throw error;
    }
  },

  async getUserStats(userId) {
    console.log('Fetching user stats for:', userId);
    
    try {
      const utcStartOfDay = this._getUTCStartOfDay();
      const utcEndOfDay = this._getUTCEndOfDay();
      
      console.log('Getting games for time range:', {
        start: utcStartOfDay.toISOString(),
        end: utcEndOfDay.toISOString()
      });

      const { data: todayGames, error: todayError } = await supabase
        .from('game_scores')
        .select('*')
        .eq('user_id', userId)
        .gte('played_at', utcStartOfDay.toISOString())
        .lte('played_at', utcEndOfDay.toISOString())
        .order('played_at', { ascending: false })
        .limit(1);

      if (todayError) throw todayError;

      const { data: userData, error: userError } = await supabase
        .from('user_stats')
        .select('current_streak, best_streak, total_games_played, total_perfect_scores')
        .eq('id', userId)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      return {
        currentStreak: userData?.current_streak || 0,
        bestStreak: userData?.best_streak || 0,
        todayScore: todayGames?.[0]?.total_score || 0,
        barPerformance: todayGames?.[0]?.bar_scores || [0, 0, 0, 0],
        totalGamesPlayed: userData?.total_games_played || 0,
        totalPerfectScores: userData?.total_perfect_scores || 0
      };
    } catch (error) {
      console.error('Error in getUserStats:', error);
      throw error;
    }
  }
};