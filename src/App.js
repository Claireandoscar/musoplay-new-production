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
import { WarmUpRefreshProvider } from './warm_up_game/context/WarmUpRefreshContext';
import ProfilePage from './pages/ProfilePage';
import PlayAgainPage from './pages/PlayAgainPage.js';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-[100dvh] w-full bg-[#FFFDEE] flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/signup" />;
  }
  
  return children;
};

const Layout = ({ children }) => (
  <div className="min-h-[100dvh] w-full bg-[#FFFDEE] flex flex-col overflow-x-hidden">
    <div className="flex-1 flex flex-col">
      {children}
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Router>
            <Routes>
              <Route path="/" element={
                <GameProvider gameType="main">
                  <GameApp />
                </GameProvider>
              } />
              <Route path="/warm-up" element={
                <WarmUpProvider>
                  <WarmUpRefreshProvider>
                    <WarmUpGame />
                  </WarmUpRefreshProvider>
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
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/leaderboard" 
                element={
                  <ProtectedRoute>
                    <div className="min-h-[100dvh] w-full flex items-center justify-center font-patrick text-[#1174B9]">
                      <p>Leaderboard Coming Soon</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/play-again" 
                element={<PlayAgainPage />} 
              />
            </Routes>
        </Router>
      </Layout>
    </AuthProvider>
  );
}

export default App;