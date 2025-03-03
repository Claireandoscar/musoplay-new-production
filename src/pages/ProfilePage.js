import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { supabase } from '../services/supabase';
import UserAvatar from '../components/UserAvatar';
import { Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';


const ProfilePage = () => {
  const navigate = useNavigate(); 
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [todayPerformance, setTodayPerformance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user?.id) return;

        // Get today's date at midnight UTC
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch general stats
        const { data: statsData, error: statsError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('id', user.id)
          .single();

        if (statsError) throw statsError;

       // Fetch today's game score
const { data: scoreData, error: scoreError } = await supabase
.from('game_scores')
.select('*')
.eq('user_id', user.id)
.eq('is_replay', false) // Add this line - only get original plays
.gte('played_at', today.toISOString())
.order('played_at', { ascending: true }) // Change to ascending to get first score
.limit(1)
.single();

        if (scoreError && scoreError.code !== 'PGRST116') { // Ignore "no rows returned" error
          throw scoreError;
        }

        // Ensure score data has the correct structure
        const formattedScoreData = scoreData ? {
          ...scoreData,
          total_score: scoreData.total_score || 0,
          bar_scores: scoreData.bar_scores || [4, 4, 4, 4]
        } : null;

        setStats(statsData || {
          current_streak: 0,
          best_streak: 0,
          total_perfect_scores: 0,
          total_games_played: 0
        });
        setTodayPerformance(formattedScoreData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleShare = (platform) => {
    const shareText = "MUSOPLAY - Check out my profile!";
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
        if (navigator.share) {
          try {
            navigator.share({
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
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-writing font-patrick">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
   <SiteHeader />
   
      <div className="p-4 max-w-5xl mx-auto w-full">
       

        {/* Profile Card */}
        <div className="card bg-background-alt shadow-xl border-2 border-writing/30 rounded-lg mb-6">
          <div className="card-body p-6">
            <UserAvatar
              imageUrl={user?.user_metadata?.avatar_url}
              username={user?.user_metadata?.username || 'Player'}
              onImageChange={async (file) => {
                try {
                  const fileExt = file.name.split('.').pop();
                  const fileName = `${user.id}-avatar.${fileExt}`;
                  const filePath = `avatars/${fileName}`;
                  const { error: uploadError } = await supabase.storage
                    .from('profiles')
                    .upload(filePath, file, { upsert: true });
                  if (uploadError) throw uploadError;
                  const { data: { publicUrl } } = supabase.storage
                    .from('profiles')
                    .getPublicUrl(filePath);
                  const { error: updateError } = await supabase.auth.updateUser({
                    data: { avatar_url: publicUrl }
                  });
                  if (updateError) throw updateError;
                } catch (error) {
                  console.error('Error uploading avatar:', error);
                }
              }}
              onUsernameChange={async (newUsername) => {
                try {
                  const { error } = await supabase.auth.updateUser({
                    data: { username: newUsername }
                  });
                  if (error) throw error;
                } catch (error) {
                  console.error('Error updating username:', error);
                }
              }}
            />
          </div>
        </div>

        {/* Main Grid Layout - 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prizes Card - Top Left */}
          <div className="card bg-background-alt shadow-xl border-2 border-writing/30 rounded-lg">
            <div className="card-body p-6">
              <h2 className="text-2xl font-patrick text-writing mb-4">Prizes</h2>
              <div className="space-y-4">
                <p className="font-patrick text-writing">Coming soon...</p>
              </div>
            </div>
          </div>

          {/* Quick Actions Card - Top Right */}
          <div className="card bg-background-alt shadow-xl border-2 border-writing/30 rounded-lg">
            <div className="card-body p-6">
              <h2 className="text-2xl font-patrick text-writing mb-4">Quick Actions</h2>
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/warm-up')}
                  className="w-full bg-easy text-white rounded-lg py-3 font-patrick hover:bg-easy/90 transition-colors"
                >
                  PRACTICE WITH WARM-UP GAME
                </button>
                <button
                  onClick={() => navigate('/leaderboard')}
                  className="w-full bg-writing text-white rounded-lg py-3 font-patrick hover:bg-writing/90 transition-colors"
                >
                  VIEW LEADERBOARD
                </button>
              </div>
            </div>
          </div>

          {/* Stats Card - Bottom Left */}
          <div className="card bg-background-alt shadow-xl border-2 border-writing/30 rounded-lg">
            <div className="card-body p-6">
              <h2 className="text-2xl font-patrick text-writing mb-4">Your Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-patrick text-writing">Current Streak</span>
                  <span className="font-patrick text-writing text-xl">{stats?.current_streak || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-patrick text-writing">Best Streak</span>
                  <span className="font-patrick text-writing text-xl">{stats?.best_streak || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-patrick text-writing">Perfect Scores</span>
                  <span className="font-patrick text-writing text-xl">{stats?.total_perfect_scores || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-patrick text-writing">Games Played</span>
                  <span className="font-patrick text-writing text-xl">{stats?.total_games_played || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Performance Card - Bottom Right */}
          <div className="card bg-background-alt shadow-xl border-2 border-writing/30 rounded-lg">
            <div className="card-body p-6">
              <h2 className="text-2xl font-patrick text-writing mb-4">Today's Performance</h2>
              {todayPerformance ? (
                <>
                  <div className="mb-8">
                    <p className="text-sm font-patrick text-writing">SCORE</p>
                    <p className="text-4xl font-patrick text-writing">
                      {todayPerformance.total_score}/16
                    </p>
                  </div>

                  {/* Hearts and Social Buttons Container */}
                  <div className="flex">
                    {/* Hearts Section */}
                    <div className="flex-1">
                      <p className="text-sm font-patrick text-writing mb-4">BAR PERFORMANCE</p>
                      <div className="grid grid-rows-4 gap-4">
                        {(todayPerformance?.bar_scores || [4, 4, 4, 4]).map((hearts, index) => (
                          <div key={index} className="flex">
                            {[...Array(4)].map((_, i) => (
                              <img
                                key={i}
                                src={`/assets/images/ui/${i < hearts ? 'orangeheart.svg' : 'orangeheart-empty.svg'}`}
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
                        <div className="grid grid-cols-2 gap-4 mt-8">
                          <button
                            onClick={() => handleShare('facebook')}
                            className="w-12 h-12 rounded-lg border-2 border-writing flex items-center justify-center transition-colors hover:bg-gray-50"
                          >
                            <Facebook size={24} className="text-writing" />
                          </button>
                          <button
                            onClick={() => handleShare('instagram')}
                            className="w-12 h-12 rounded-lg border-2 border-writing flex items-center justify-center transition-colors hover:bg-gray-50"
                          >
                            <Instagram size={24} className="text-writing" />
                          </button>
                          <button
                            onClick={() => handleShare('whatsapp')}
                            className="w-12 h-12 rounded-lg border-2 border-writing flex items-center justify-center transition-colors hover:bg-gray-50"
                          >
                            <MessageCircle size={24} className="text-writing" />
                          </button>
                          <button
                            onClick={() => handleShare('linkedin')}
                            className="w-12 h-12 rounded-lg border-2 border-writing flex items-center justify-center transition-colors hover:bg-gray-50"
                          >
                            <Linkedin size={24} className="text-writing" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleShare('native')}
                          className="w-full text-sm font-patrick text-writing border-2 border-writing rounded-lg px-4 py-2 transition-colors hover:bg-gray-50"
                        >
                          PLEASE SHARE!
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="font-patrick text-writing text-center">
                  No game played today yet!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;