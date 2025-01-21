import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GameApp from './game/GameApp';
import SignUpPage from './pages/SignUpPage';
import StatsAndStreaks from './pages/StatsAndStreaks';
import { AuthProvider, useAuth } from './services/AuthContext';
import WarmUpGame from './warm_up_game/WarmUpGame';

// Protected Route wrapper component
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
  <Route path="/" element={<GameApp />} />
  <Route path="/warm-up" element={<WarmUpGame />} /> {/* Make sure this is present */}
  <Route path="/signup" element={<SignUpPage />} />
  <Route 
    path="/stats" 
    element={
      <ProtectedRoute>
        <StatsAndStreaks />
      </ProtectedRoute>
    } 
  />
</Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;