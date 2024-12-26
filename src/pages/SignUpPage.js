import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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

  // Rest of your component remains exactly the same
  return (
    <div className="min-h-screen bg-[#FFFDEE] flex flex-col">
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
          className="font-['Patrick_Hand_SC'] text-[#00C22D] border-[#00C22D] border-3 rounded-full px-6 py-2 mb-6 hover:bg-[#00C22D] hover:text-white transition-colors"
        >
          BACK TO GAME
        </button>

        {/* Main Card */}
        <div className="card bg-[#FFFFF5] shadow-xl border-2 border-[#1174B9]/30 rounded-lg mb-6">
          <div className="card-body p-6">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="/assets/images/ui/n6.svg" 
                alt="Icon" 
                className="w-8 h-8"
              />
              <h2 className="text-2xl font-['Patrick_Hand_SC']">CREATE A FREE ACCOUNT</h2>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleGoogleSignUp}
                className="w-full p-3 border-2 border-[#1174B9]/30 rounded-lg font-['Patrick_Hand_SC'] hover:bg-[#1174B9]/5 transition-colors"
              >
                CONTINUE WITH GOOGLE
              </button>
              <button 
                onClick={handleAppleSignUp}
                className="w-full p-3 border-2 border-[#1174B9]/30 rounded-lg font-['Patrick_Hand_SC'] hover:bg-[#1174B9]/5 transition-colors"
              >
                CONTINUE WITH APPLE
              </button>
              <button 
                onClick={handleFacebookSignUp}
                className="w-full p-3 border-2 border-[#1174B9]/30 rounded-lg font-['Patrick_Hand_SC'] hover:bg-[#1174B9]/5 transition-colors"
              >
                CONTINUE WITH FACEBOOK
              </button>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 p-3 border-2 border-[#1174B9]/30 rounded-lg font-['Patrick_Hand_SC'] bg-transparent"
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 p-3 border-2 border-[#1174B9]/30 rounded-lg font-['Patrick_Hand_SC'] bg-transparent"
                />
              </div>

              <button 
                onClick={handleEmailSignUp}
                disabled={loading}
                className="w-full p-3 bg-[#00C22D] text-white rounded-lg font-['Patrick_Hand_SC'] hover:bg-[#00A025] transition-colors disabled:opacity-50"
              >
                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              </button>
            </div>
          </div>
        </div>

        {/* Features Card */}
        <div className="card bg-[#FFFFF5] shadow-xl border-2 border-[#1174B9]/30 rounded-lg">
          <div className="card-body p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src="/assets/images/ui/statsbullet.svg" alt="" className="w-6 h-6" />
                <span className="font-['Patrick_Hand_SC']">TRACK YOUR STATS AND STREAKS</span>
              </div>
              <div className="flex items-center gap-3">
                <img src="/assets/images/ui/warmupbullet.svg" alt="" className="w-6 h-6" />
                <span className="font-['Patrick_Hand_SC']">ACCESS WEEKLY WARM-UP GAME</span>
              </div>
              <div className="flex items-center gap-3">
                <img src="/assets/images/ui/archive.svg" alt="" className="w-6 h-6" />
                <span className="font-['Patrick_Hand_SC']">PLAY ALL HISTORIC GAMES</span>
              </div>
              <div className="flex items-center gap-3">
                <img src="/assets/images/ui/terms.svg" alt="" className="w-6 h-6" />
                <span className="font-['Patrick_Hand_SC']">LEARN A NEW MUSICAL TERM DAILY</span>
              </div>
              <div className="flex items-center gap-3">
                <img src="/assets/images/ui/subscribebullet.svg" alt="" className="w-6 h-6" />
                <span className="font-['Patrick_Hand_SC']">RECEIVE DAILY GAME STRAIGHT TO YOUR INBOX</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/')}
              className="w-full p-3 mt-6 bg-[#00C22D] text-white rounded-lg font-['Patrick_Hand_SC'] hover:bg-[#00A025] transition-colors"
            >
              PLAY TODAY'S GAME
            </button>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-auto p-4 flex justify-center gap-6 text-[#1174B9] font-['Patrick_Hand_SC']">
        <button className="hover:underline">PRIVACY POLICY</button>
        <button className="hover:underline">TERMS & CONDITIONS</button>
        <button className="hover:underline">COOKIE POLICY</button>
      </div>
    </div>
  );
};

export default SignUpPage;