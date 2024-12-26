// src/services/scoreService.js
import { supabase } from './supabase';

export const ScoreService = {
  async recordGameScore(userId, barScores, melodyId = null) {
    try {
      const totalScore = barScores.reduce((sum, score) => sum + score, 0);
      const perfectBars = barScores.filter(score => score === 4).length;

      const { data, error } = await supabase
        .from('game_scores')
        .insert({
          user_id: userId,
          total_score: totalScore,
          bar_scores: barScores,
          perfect_bars: perfectBars,
          melody_id: melodyId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error recording game score:', error);
      throw error;
    }
  },

  async getUserScoreHistory(userId, limit = 30) {
    try {
      const { data, error } = await supabase
        .from('game_scores')
        .select('*')
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching score history:', error);
      throw error;
    }
  },

  async getUserStats(userId) {
    try {
      // Get current date at start of day in UTC
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      
      // Get first game of today
      const { data: todayGames, error: todayError } = await supabase
        .from('game_scores')
        .select('*')
        .eq('user_id', userId)
        .gte('played_at', today.toISOString())
        .order('played_at', { ascending: true })
        .limit(1);

      if (todayError) throw todayError;

      // Get recent games for stats calculation
      const { data: recentGames, error: recentError } = await supabase
        .from('game_scores')
        .select('total_score, perfect_bars, bar_scores')
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .limit(30);

      if (recentError) throw recentError;

      // Get user's streak data
      const { data: userData, error: userError } = await supabase
        .from('user_stats')
        .select('current_streak, best_streak')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const stats = {
        averageScore: 0,
        perfectBars: 0,
        bestScore: 0,
        recentScores: [],
        currentStreak: userData?.current_streak || 0,
        bestStreak: userData?.best_streak || 0,
        // Use first game of today for visualization
        todayScore: todayGames?.[0]?.total_score || 0,
        barPerformance: todayGames?.[0]?.bar_scores || [0, 0, 0, 0],
      };

      if (recentGames?.length > 0) {
        stats.averageScore = recentGames.reduce((sum, game) => sum + game.total_score, 0) / recentGames.length;
        stats.perfectBars = recentGames.reduce((sum, game) => sum + game.perfect_bars, 0);
        stats.bestScore = Math.max(...recentGames.map(game => game.total_score));
        stats.recentScores = recentGames.map(game => game.total_score);
      }

      return stats;
    } catch (error) {
      console.error('Error calculating user stats:', error);
      throw error;
    }
  }
};