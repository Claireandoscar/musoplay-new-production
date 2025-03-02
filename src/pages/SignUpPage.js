import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../services/AuthContext';
import SiteHeader from '../components/SiteHeader';
import { hasPlayedToday } from '../Utils/gameUtils';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  // Check if user has already played today
  useEffect(() => {
    setHasPlayed(hasPlayedToday());
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Check your email for the confirmation link!');
    }
    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    });
    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Use SiteHeader with navigation based on play status */}
      <SiteHeader overrideStatus="notPlayed" />  {/* Override to always show "BACK TO GAME" */}
      
      <div className="p-4 max-w-2xl mx-auto w-full">
        {/* Welcome Card - Different for players who have already played */}
        <div className="card bg-background-alt shadow-xl border-2 border-writing/30 rounded-lg mb-6">
          <div className="card-body p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="font-patrick text-[#AB08FF]">
                  <span className="text-lg font-normal">WELCOME TO</span><br />
                  <span className="text-2xl font-bold">MUSOPLAY</span>
                </h1>
                {hasPlayed ? (
                  <p className="font-patrick text-[#AB08FF] mt-1 text-sm font-normal">
                    WANT ANOTHER GO? SIGN UP <span className="font-bold">FREE</span> TO REPLAY
                  </p>
                ) : (
                  <p className="font-patrick text-[#AB08FF] mt-1 text-sm font-normal">
                    CREATE AN ACCOUNT TO ACCESS ALL FEATURES
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                {hasPlayed ? (
                  <img src="/assets/images/ui/n7.svg" alt="Note" className="w-16 h-16" />
                ) : (
                  <img src="/assets/images/ui/blue-archive.svg" alt="Archive" className="w-16 h-16" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sign Up Card */}
        <div className="card bg-background-alt shadow-xl border-2 border-writing/30 rounded-lg mb-6">
          <div className="card-body p-6">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="/assets/images/ui/n6.svg" 
                alt="Icon" 
                className="w-8 h-8"
              />
              <h2 className="text-2xl font-patrick text-[#1174B9]">CREATE A FREE ACCOUNT</h2>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleGoogleSignUp}
                className="w-full p-3 border-2 border-writing/30 rounded-lg font-patrick text-[#1174B9] hover:bg-writing/5 transition-colors"
              >
                CONTINUE WITH GOOGLE
              </button>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 p-3 border-2 border-writing/30 rounded-lg font-patrick bg-transparent text-[#1174B9]"
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 p-3 border-2 border-writing/30 rounded-lg font-patrick bg-transparent text-[#1174B9]"
                />
              </div>

              <button 
                onClick={handleEmailSignUp}
                disabled={loading}
                className="w-full p-3 bg-easy text-white rounded-lg font-patrick hover:bg-[#00A025] transition-colors disabled:opacity-50"
              >
                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              </button>
            </div>
          </div>
        </div>

        {/* Features Card */}
        <div className="card bg-background-alt shadow-xl border-2 border-writing/30 rounded-lg">
          <div className="card-body p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src="/assets/images/ui/statsbullet.svg" alt="" className="w-6 h-6" />
                <span className="font-patrick text-[#1174B9]">TRACK YOUR STATS AND STREAKS</span>
              </div>
              <div className="flex items-center gap-3">
                <img src="/assets/images/ui/warmupbullet.svg" alt="" className="w-6 h-6" />
                <span className="font-patrick text-[#1174B9]">ACCESS WEEKLY WARM-UP GAME</span>
              </div>
              <div className="flex items-center gap-3">
                <img src="/assets/images/ui/blue-archive.svg" alt="" className="w-6 h-6" />
                <span className="font-patrick text-[#1174B9]">PLAY ALL HISTORIC GAMES</span>
              </div>
              <div className="flex items-center gap-3">
                <img src="/assets/images/ui/subscribebullet.svg" alt="" className="w-6 h-6" />
                <span className="font-patrick text-[#1174B9]">RECEIVE DAILY GAME STRAIGHT TO YOUR INBOX</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/')}
              className="w-full p-3 mt-6 bg-easy text-white rounded-lg font-patrick hover:bg-[#00A025] transition-colors"
            >
              PLAY TODAY'S GAME
            </button>
            
            {/* In-App Purchases Note */}
            <p className="text-center text-xs text-[#1174B9]/70 mt-3 font-patrick">
              * SOME FEATURES MAY REQUIRE IN-APP PURCHASES
            </p>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-auto p-4 flex justify-center gap-6 text-writing font-patrick">
        <button className="hover:underline">PRIVACY POLICY</button>
        <button className="hover:underline">TERMS & CONDITIONS</button>
        <button className="hover:underline">COOKIE POLICY</button>
      </div>
    </div>
  );
};

export default SignUpPage;