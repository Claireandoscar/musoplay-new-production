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

  async recordGameScore(userId, barScores, melodyId = null) {
    console.log('recordGameScore called with:', { userId, barScores, melodyId });
    
    try {
      const totalScore = barScores.reduce((sum, score) => sum + score, 0);
      const perfectBars = barScores.filter(score => score === 4).length;
      const utcNow = new Date().toISOString();

      console.log('Processing score:', { totalScore, perfectBars, utcNow });

      const startOfDay = this._getUTCStartOfDay();
      const endOfDay = this._getUTCEndOfDay();

      console.log('Time range:', { 
        startOfDay: startOfDay.toISOString(), 
        endOfDay: endOfDay.toISOString() 
      });

      // Record the game score
      console.log('Attempting to record score in Supabase...');
      
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
      
      // Update user stats
      console.log('Attempting to update user stats...');
      
      const { data: currentStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('id', userId)
        .single();

      const now = new Date();
      
      if (currentStats) {
        console.log('Updating existing user stats:', currentStats);
        
        const { error: updateError } = await supabase
          .from('user_stats')
          .update({
            total_games_played: currentStats.total_games_played + 1,
            total_perfect_scores: currentStats.total_perfect_scores + (totalScore === 16 ? 1 : 0),
            last_played_at: now.toISOString()
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating user stats:', updateError);
          throw updateError;
        }
      } else {
        console.log('Creating new user stats record');
        
        const { error: insertError } = await supabase
          .from('user_stats')
          .insert({
            id: userId,
            total_games_played: 1,
            total_perfect_scores: totalScore === 16 ? 1 : 0,
            current_streak: 1,
            best_streak: 1,
            last_played_at: now.toISOString()
          });

        if (insertError) {
          console.error('Error inserting user stats:', insertError);
          throw insertError;
        }
      }

      console.log('All updates completed successfully');
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

      if (error) {
        console.error('Error fetching score history:', error);
        throw error;
      }

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

      if (todayError) {
        console.error('Error fetching today\'s games:', todayError);
        throw todayError;
      }

      console.log('Today\'s games:', todayGames);

      const { data: userData, error: userError } = await supabase
        .from('user_stats')
        .select('current_streak, best_streak, total_games_played, total_perfect_scores')
        .eq('id', userId)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error fetching user stats:', userError);
        throw userError;
      }

      console.log('User stats:', userData);

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