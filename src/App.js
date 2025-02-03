import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GameApp from './game/GameApp';
import SignUpPage from './pages/SignUpPage';
import StatsAndStreaks from './pages/StatsAndStreaks';
import { AuthProvider, useAuth } from './services/AuthContext';
import WarmUpGame from './warm_up_game/WarmUpGame';
import { GameProvider } from './context/GameContext';
import { WarmUpProvider } from './context/warmup-context';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen bg-[#FFFDEE] flex items-center justify-center">
      <p>Loading...</p>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/signup" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <GameProvider gameType="main">
              <GameApp />
            </GameProvider>
          } />
          <Route path="/warm-up" element={
            <WarmUpProvider>
              <WarmUpGame />
            </WarmUpProvider>
          } />
          <Route path="/signup" element={<SignUpPage />} />
          <Route 
            path="/stats" 
            element={
              <ProtectedRoute>
                <StatsAndStreaks />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-[#FFFDEE] flex items-center justify-center font-patrick text-[#1174B9]">
                  <p>Leaderboard Coming Soon</p>
                </div>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;