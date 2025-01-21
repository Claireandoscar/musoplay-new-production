import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Auth handlers remain the same
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

  const handleAppleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple'
    });
    if (error) alert(error.message);
  };

  const handleFacebookSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook'
    });
    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Logo */}
      <div className="p-4 flex justify-center">
        <img 
          src="/assets/images/ui/logo.svg" 
          alt="Musoplay" 
          className="h-8 object-contain"
        />
      </div>
      
      <div className="p-4 max-w-2xl mx-auto w-full">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="font-patrick text-easy border-easy border-3 rounded-full px-6 py-2 mb-6 hover:bg-easy hover:text-white transition-colors"
        >
          BACK TO GAME
        </button>

        {/* Main Card */}
        <div className="card bg-background-alt shadow-xl border-2 border-writing/30 rounded-lg mb-6">
          <div className="card-body p-6">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="/assets/images/ui/n6.svg" 
                alt="Icon" 
                className="w-8 h-8"
              />
              <h2 className="text-2xl font-patrick">CREATE A FREE ACCOUNT</h2>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleGoogleSignUp}
                className="w-full p-3 border-2 border-writing/30 rounded-lg font-patrick hover:bg-writing/5 transition-colors"
              >
                CONTINUE WITH GOOGLE
              </button>
              <button 
                onClick={handleAppleSignUp}
                className="w-full p-3 border-2 border-writing/30 rounded-lg font-patrick hover:bg-writing/5 transition-colors"
              >
                CONTINUE WITH APPLE
              </button>
              <button 
                onClick={handleFacebookSignUp}
                className="w-full p-3 border-2 border-writing/30 rounded-lg font-patrick hover:bg-writing/5 transition-colors"
              >
                CONTINUE WITH FACEBOOK
              </button>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 p-3 border-2 border-writing/30 rounded-lg font-patrick bg-transparent"
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 p-3 border-2 border-writing/30 rounded-lg font-patrick bg-transparent"
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
                <span className="font-patrick">TRACK YOUR STATS AND STREAKS</span>
              </div>
              <div className="flex items-center gap-3">
                <img src="/assets/images/ui/warmupbullet.svg" alt="" className="w-6 h-6" />
                <span className="font-patrick">ACCESS WEEKLY WARM-UP GAME</span>
              </div>
              <div className="flex items-center gap-3">
                <img src="/assets/images/ui/archive.svg" alt="" className="w-6 h-6" />
                <span className="font-patrick">PLAY ALL HISTORIC GAMES</span>
              </div>
              <div className="flex items-center gap-3">
                <img src="/assets/images/ui/terms.svg" alt="" className="w-6 h-6" />
                <span className="font-patrick">LEARN A NEW MUSICAL TERM DAILY</span>
              </div>
              <div className="flex items-center gap-3">
                <img src="/assets/images/ui/subscribebullet.svg" alt="" className="w-6 h-6" />
                <span className="font-patrick">RECEIVE DAILY GAME STRAIGHT TO YOUR INBOX</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/')}
              className="w-full p-3 mt-6 bg-easy text-white rounded-lg font-patrick hover:bg-[#00A025] transition-colors"
            >
              PLAY TODAY'S GAME
            </button>
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