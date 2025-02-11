import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { supabase } from '../services/supabase';
import UserAvatar from '../components/UserAvatar';
import { Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const { data, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('id', user?.id)
          .single();
        if (error) throw error;
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUserStats();
    }
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
      {/* Logo */}
      <div className="p-4 flex justify-center">
        <img
          src="/assets/images/ui/logo.svg"
          alt="MUSOPLAY"
          className="h-8 object-contain"
        />
      </div>

      <div className="p-4 max-w-5xl mx-auto w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="font-patrick text-writing border-writing border-3 rounded-full px-6 py-2 mb-6 hover:bg-writing hover:text-white transition-colors"
        >
          BACK TO GAME
        </button>

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
              <div className="mb-8">
                <p className="text-sm font-patrick text-writing">SCORE</p>
                <p className="text-4xl font-patrick text-writing">15/16</p>
              </div>

              {/* Hearts and Social Buttons Container */}
              <div className="flex">
                {/* Hearts Section */}
                <div className="flex-1">
                  <p className="text-sm font-patrick text-writing mb-4">BAR PERFORMANCE</p>
                  <div className="grid grid-rows-4 gap-4">
                    {[4, 3, 4, 4].map((hearts, index) => (
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;