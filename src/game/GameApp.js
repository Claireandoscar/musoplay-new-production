import React, { useState, useCallback, useEffect, useReducer } from 'react';
import './Game.css';  // Updated from App.css
import { audioEngine } from '../AudioEngine';  // Go up one level
import HeaderToolbar from '../components/HeaderToolbar'; 
import GameBoard from './components/GameBoard';
import Controls from './components/Controls';
import VirtualInstrument from './components/VirtualInstrument';
import ProgressBar from './components/ProgressBar';
import EndGameAnimation from './components/EndGameAnimation';
import { supabase } from '../services/supabase';
import { useAuth } from '../services/AuthContext';
import { ScoreService } from '../services/scoreService';
import { audioFetchService } from '../services/audioFetchService';
import InstructionsPopup from '../pages/InstructionsPopup';
import { useGame } from '../context/GameContext';
import MainGameRefresh from './components/MainGameRefresh';
import { useNavigate } from 'react-router-dom';
import { hasPlayedToday, clearGameCompletionData } from '../Utils/gameUtils';



const initialGameState = {
  currentNoteIndex: 0,
  gamePhase: 'initial',
  completedBars: [false, false, false, false],
  isBarFailing: false,
  barHearts: [4, 4, 4, 4],
  failedBars: [false, false, false, false],
  // Add this new property
  hintLevel: 0  // 0 = no hints, 1 = first 2 notes, 2 = full sequence
};

function gameReducer(state, action) {
    switch (action.type) {
        case 'UPDATE_NOTE_INDEX':
            console.log('UPDATE_NOTE_INDEX reducer:', {
                oldIndex: state.currentNoteIndex,
                newIndex: action.payload,
                fullState: state
            });
            return {
                ...state,
                currentNoteIndex: action.payload
            };
            
        case 'SET_GAME_PHASE':
            return {
                ...state,
                gamePhase: action.payload
            };
            
        case 'RESET_BAR_HEARTS':
            return {
                ...state,
                barHearts: [4, 4, 4, 4]
            };
            
        case 'RESET_COMPLETED_BARS':
            return {
                ...state,
                completedBars: [false, false, false, false]
            };

        case 'UPDATE_COMPLETED_BARS':
            return {
                ...state,
                completedBars: state.completedBars.map((bar, index) => 
                    index === action.barIndex ? action.completed : bar
                )
            };

            case 'WRONG_NOTE':
              const currentHearts = state.barHearts[action.barIndex];
              const newHearts = currentHearts - 1;
              const newHintLevel = newHearts === 2 ? 1 : newHearts === 1 ? 2 : state.hintLevel;
              
              return {
                  ...state,
                  barHearts: state.barHearts.map((hearts, index) => 
                      index === action.barIndex ? newHearts : hearts
                  ),
                  hintLevel: newHintLevel
              };

              case 'RESET_HINT_LEVEL':
    return {
        ...state,
        hintLevel: 0
    };

        case 'SET_BAR_FAILING':
            return {
                ...state,
                isBarFailing: action.failing
            };

        case 'SET_BAR_FAILED':
            return {
                ...state,
                failedBars: state.failedBars.map((failed, index) => 
                    index === action.barIndex ? action.failed : failed
                )
            };

        case 'RESET_GAME_STATE':
            return {
                ...initialGameState,
                currentNoteIndex: 0,
                gamePhase: 'initial',
                completedBars: [false, false, false, false],
                isBarFailing: false,
                barHearts: [4, 4, 4, 4],
                failedBars: [false, false, false, false]
            };   
            
        default:
            return state;
    }
}

function GameApp() {
  const navigate = useNavigate();
  console.log('Main Game Mounted:', window.location.pathname);
  const { user } = useAuth();
  console.log('Current authenticated user:', user);
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  
  // Check if user has already played today
  useEffect(() => {
    if (hasPlayedToday()) {
      console.log('User has already played today');
      
      // Redirect based on authentication status
      if (user) {
        navigate('/profile');
      } else {
        navigate('/signup', {
          state: {
            message: "You've already played today! Sign up to access more features."
          }
        });
      }
    } else {
      console.log('User has not played today, proceeding with game setup');
      
      // Check if we need to clear stale data (from previous days)
      const gameCompletedDate = localStorage.getItem('gameCompletedDate');
      const today = new Date().toISOString().split('T')[0];
      
      if (gameCompletedDate && gameCompletedDate !== today) {
        console.log('Clearing stale game completion data');
        clearGameCompletionData();
      }
    }
  }, [navigate, user]);

  // Audio-related states
  const [isPreloading, setIsPreloading] = useState(true);
  const [audioFiles, setAudioFiles] = useState([]);
  const [fullTunePath, setFullTunePath] = useState('');
  const [melodyAudio, setMelodyAudio] = useState(null);
  const [fullTuneMelodyAudio, setFullTuneMelodyAudio] = useState(null);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  // Game state and progress
  const [gameMode, setGameMode] = useState('initial');
  const [score, setScore] = useState(0);
  const [currentBarIndex, setCurrentBarIndex] = useState(0);
  const { showInstructions, setShowInstructions } = useGame();

  const [gameTimer, setGameTimer] = useState({
    startTime: null,
    elapsedTime: 0,
    isRunning: false
  });


  // Sequence and completion tracking
  const [correctSequence, setCorrectSequence] = useState([]);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [isGameEnded, setIsGameEnded] = useState(false);
  const [showEndAnimation, setShowEndAnimation] = useState(false);
  const [isListenPracticeMode, setIsListenPracticeMode] = useState(false);
  const [showFirstNoteHint, setShowFirstNoteHint] = useState(false);
  const notes = [
    { id: 1, color: 'red', noteNumber: 1 },
    { id: 2, color: 'orange', noteNumber: 2 },
    { id: 3, color: 'yellow', noteNumber: 3 },
    { id: 4, color: 'green', noteNumber: 4 },
    { id: 5, color: 'lightblue', noteNumber: 5 },
    { id: 6, color: 'blue', noteNumber: 6 },
    { id: 7, color: 'purple', noteNumber: 7 },
    { id: 8, color: 'red', noteNumber: 8 },
  ];

  const handleStartGame = useCallback(async () => {   
    console.log('handleStartGame called');    
    if (!isPreloading && isAudioLoaded) {
      setShowInstructions(false);
      console.log('Conditions passed, starting game');
      
      try {
        // Initialize the timer
        setGameTimer({
          startTime: Date.now(),
          elapsedTime: 0,
          isRunning: true
        });
        
        // Initialize audio
        const audioState = audioEngine.getAudioContextState();
        if (audioState.state === 'suspended') {
          await audioEngine.audioContext.resume();
        }
        console.log('Audio context initialized');
  
        // Update instructions state
        setShowInstructions(false);
  
        // Initialize game state
        setGameMode('initial');
        dispatch({ type: 'SET_GAME_PHASE', payload: 'initial' });
        dispatch({ type: 'UPDATE_NOTE_INDEX', payload: 0 });
        dispatch({ type: 'RESET_BAR_HEARTS' });
        dispatch({ type: 'RESET_COMPLETED_BARS' });
        dispatch({ type: 'SET_BAR_FAILING', failing: false });
        
        // Reset game progress
        setScore(0);
        setCurrentBarIndex(0);
        setIsGameComplete(false);
        setIsGameEnded(false);
        setShowEndAnimation(false);
        setIsListenPracticeMode(false);
      } catch (error) {
        console.error('Game initialization error:', error);
      }
    } else {
      console.log('Game not starting because:', { isPreloading, isAudioLoaded });
    }
  }, [isPreloading, isAudioLoaded, dispatch, setGameMode, 
    setScore, setCurrentBarIndex, setIsGameComplete, setIsGameEnded, 
    setShowEndAnimation, setIsListenPracticeMode, setShowInstructions]);
useEffect(() => {
  const checkAuth = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('Current user:', user);
    if (error) {
      console.error('Auth error:', error);
    }
  };
  
  checkAuth();
}, []);

const loadAudio = useCallback(async (barIndex) => {
  console.log('GamePlay LoadAudio called with barIndex:', barIndex);
    
  if (audioFiles.length === 0 || barIndex >= audioFiles.length) {
    console.log('No audio files available or invalid bar index');
    setIsAudioLoaded(false);
    return;
  }

  try {
    const audioPath = audioFiles[barIndex];
    console.log('Loading audio from next bar path:', audioPath);
    await audioEngine.loadSound(audioPath, `melody${barIndex}`);
    const audio = new Audio(audioPath);
    setMelodyAudio(audio);
    console.log('Next bar audio successfully loaded');
    return audio;
  } catch (error) {
    console.error('Failed to load next bar audio:', error);
    setIsAudioLoaded(false);
    return null;
  }
}, [audioFiles]); 
// First declare loadInitialAudio as a useCallback
const loadInitialAudio = useCallback(async (barIndex, audioPath) => {
  console.log('Initial audio loading for first bar:', barIndex);
  try {
    await audioEngine.loadSound(audioPath, `melody${barIndex}`);
    const audio = new Audio(audioPath);
    setMelodyAudio(audio);
    setIsAudioLoaded(true);
    console.log('Initial audio successfully loaded');
    return audio;
  } catch (error) {
    console.error('Failed to load initial audio:', error);
    setIsAudioLoaded(false);
    return null;
  }
}, []);

// Main initialization useEffect
useEffect(() => {
  const fetchAndInitAudio = async () => {
    try {
      // First check if user has already played today
      if (user?.id) {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        
        const { data, error } = await supabase
          .from('game_scores')
          .select('*')
          .eq('user_id', user.id)
          .gte('played_at', today.toISOString())
          .limit(1);
        
        if (!error && data && data.length > 0) {
          console.log('User has already played today, redirecting to profile page');
          navigate('/profile');
          return; // Stop initialization if already played
        }
      }
      
      console.log('Starting audio setup...');
      setIsPreloading(true);
      
      // First, initialize the audio engine
      const success = await audioEngine.init();
      console.log('AudioEngine init result:', success);
      
      if (!success) {
        throw new Error('Failed to initialize audio engine');
      }
      
      // Load basic sounds first
      console.log('Loading basic sounds...');
      for (let i = 1; i <= 8; i++) {
        await audioEngine.loadSound(`/assets/audio/n${i}.mp3`, `n${i}`);
      }
      
      // Load UI sounds
      await audioEngine.loadSound('/assets/audio/ui-sounds/wrong-note.mp3', 'wrong');
      await audioEngine.loadSound('/assets/audio/ui-sounds/bar-failed.mp3', 'fail');
      await audioEngine.loadSound('/assets/audio/ui-sounds/bar-complete.mp3', 'complete');
      await audioEngine.loadSound('/assets/audio/ui-sounds/note-flip.mp3', 'flip');
      
      // Fetch melody files
      try {
        const melodyData = await audioFetchService.fetchSupabaseAudio();
        const localDateString = audioFetchService.getLocalDateString();
        
        if (melodyData.date === localDateString) {
          console.log('Setting up today\'s melody');
          setAudioFiles(melodyData.melodyParts);
          setFullTunePath(melodyData.fullTune);
          
          // Load first bar
          if (melodyData.melodyParts.length > 0) {
            await loadInitialAudio(0, melodyData.melodyParts[0]);
          }
        } else {
          throw new Error('Melody not for today');
        }
      } catch (error) {
        console.log('Using fallback melody:', error);
        const fallbackData = await audioFetchService.fetchFallbackAudio();
        setAudioFiles(fallbackData.melodyParts);
        setFullTunePath(fallbackData.fullTune);
        if (fallbackData.melodyParts.length > 0) {
          await loadInitialAudio(0, fallbackData.melodyParts[0]);
        }
      }
      
      setIsAudioLoaded(true);
      dispatch({ type: 'SET_GAME_PHASE', payload: 'ready' });
      console.log('Audio setup complete');
    } catch (error) {
      console.error('Audio setup failed:', error);
      setIsAudioLoaded(false);
    } finally {
      setIsPreloading(false);
    }
  };
  
  fetchAndInitAudio();
}, [loadInitialAudio, dispatch, user, navigate]);
// Keep the bar loading effect separate
useEffect(() => {
  if (correctSequence.length > 0 && currentBarIndex > 0) { // Only load subsequent bars
    loadAudio(currentBarIndex);
  }
}, [currentBarIndex, correctSequence, loadAudio]);
  useEffect(() => {
    if (correctSequence.length > 0 && currentBarIndex > 0) { // Only load subsequent bars
      loadAudio(currentBarIndex);
    }
  }, [currentBarIndex, correctSequence, loadAudio]);

  // Updated practice mode handler
 
  const handleListenPractice = useCallback(async () => {
    if (!isAudioLoaded) return;
    
    try {
        // Reset hint state before playing
        setShowFirstNoteHint(false);
        
        // Force reinitialize audio engine and verify state
        await audioEngine.init();
        
        // Verify buffers are loaded before proceeding
        const bufferCheck = await audioEngine.verifyBuffers();
        if (!bufferCheck) {
            // If buffers aren't found, reload them
            for (let i = 1; i <= 8; i++) {
                await audioEngine.loadSound(`/assets/audio/n${i}.mp3`, `n${i}`);
            }
        }
        
        // Now attempt to play melody with completion callback
        const playSuccess = await audioEngine.playSound(
            `melody${currentBarIndex}`,
            0,
            () => setShowFirstNoteHint(true)  // Show hint after melody plays
        );
        
        if (playSuccess) {
            dispatch({ type: 'SET_GAME_PHASE', payload: 'practice' });
            setGameMode('practice');
            setIsListenPracticeMode(true);
            document.documentElement.dataset.hasInteracted = 'true';
        } else {
            throw new Error('Failed to play melody');
        }
        
    } catch (error) {
        console.error('Failed to play melody:', error);
    }
}, [currentBarIndex, dispatch, isAudioLoaded]);

useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // User left the page - pause the timer
      if (gameTimer.isRunning) {
        const now = Date.now();
        const newElapsedTime = gameTimer.elapsedTime + (now - gameTimer.startTime);
        setGameTimer(prev => ({
          ...prev,
          elapsedTime: newElapsedTime,
          isRunning: false
        }));
      }
    } else {
      // User returned to the page - resume the timer if it was running
      if (gameState.gamePhase === 'practice' || gameState.gamePhase === 'perform') {
        setGameTimer(prev => ({
          ...prev,
          startTime: Date.now(),
          isRunning: true
        }));
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [gameTimer, gameState.gamePhase]);

// Updated perform mode handler
const handlePerform = useCallback(async () => {
  if (gameState.gamePhase === 'perform') {
    try {
      await audioEngine.init();
      audioEngine.playSound(`melody${currentBarIndex}`);
    } catch (error) {
      console.error("Error in perform mode playback:", error);
    }
  } else {
    dispatch({ type: 'SET_GAME_PHASE', payload: 'perform' });
    setGameMode('play');
    setIsListenPracticeMode(false);
    dispatch({ type: 'UPDATE_NOTE_INDEX', payload: 0 });
  }
}, [gameState.gamePhase, currentBarIndex, dispatch]);

// Handle viewport height
useEffect(() => {
    function setVH() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    setVH();
    window.addEventListener('resize', setVH);
    return () => window.removeEventListener('resize', setVH);
}, []);

// Update body class
useEffect(() => {
    document.body.className = gameMode;
}, [gameMode]);

// Process audio files into sequences
// Keep this effect - it processes the audio files to create note sequences
useEffect(() => {
    if (audioFiles.length > 0) {
        console.log('Processing audio files:', audioFiles);
        
        const sequences = audioFiles.map(filepath => {
            const filename = filepath.split('/').pop();
            const noteSection = filename.split('bar')[1];
            
            const noteSequence = noteSection
                .split('n')
                .slice(1)
                .map(note => note.replace('.mp3', ''));
            
            const processedSequence = noteSequence.map(note => {
                const cleanNote = note.replace('.mp3', '');
                return {
                    number: parseInt(cleanNote.replace('QL', '').replace('QR', ''), 10),
                    isQuaverLeft: cleanNote.includes('QL'),
                    isQuaverRight: cleanNote.includes('QR'),
                    fullNote: cleanNote
                };
            });
            
            return processedSequence;
        });
        
        setCorrectSequence(sequences);
        dispatch({ type: 'RESET_COMPLETED_BARS' });
    }
}, [audioFiles, dispatch]);

useEffect(() => {
  if (!fullTunePath) return;
  
  const audio = new Audio(fullTunePath);
  
  // Handle visibility change - handle both audio types
  const handleVisibilityChange = async () => {
    if (document.hidden) {
      audio.pause();
    } else {
      // Page is visible again - ensure audioEngine is ready
      if (audioEngine && audioEngine.audioContext?.state === 'suspended') {
        try {
          await audioEngine.init();
          console.log('AudioEngine reinitialized after visibility change');
        } catch (error) {
          console.error('Failed to reinitialize AudioEngine:', error);
        }
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  setFullTuneMelodyAudio(audio);

  // Cleanup
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    audio.pause();
  };
}, [fullTunePath]);

// Cleanup effect for audio
useEffect(() => {
    return () => {
        if (melodyAudio) {
            melodyAudio.pause();
            melodyAudio.currentTime = 0;
        }
    };
}, [melodyAudio]);

const moveToNextBar = useCallback((isSuccess = true) => {
  // Reset hint state when moving to next bar
  setShowFirstNoteHint(false);

  if (melodyAudio) {
    melodyAudio.pause();
    melodyAudio.currentTime = 0;
  }
  const handleGameEnd = async () => {
    // Calculate final elapsed time with a reasonable fallback
    let totalTimeSeconds = 0;
    
    if (gameTimer.startTime) {
      // Normal case - we have timing data
      if (gameTimer.isRunning) {
        const now = Date.now();
        totalTimeSeconds = Math.floor((gameTimer.elapsedTime + (now - gameTimer.startTime)) / 1000);
      } else {
        totalTimeSeconds = Math.floor(gameTimer.elapsedTime / 1000);
      }
    } else {
      // Fallback case - we don't have timing data
      // Use a reasonable estimate: 30 seconds per bar
      totalTimeSeconds = 30 * 4; // 4 bars * 30 seconds
      console.warn('Using fallback completion time of 120 seconds');
    }
    
    // Stop the timer
    setGameTimer(prev => ({
      ...prev,
      isRunning: false
    }));
    
    console.log('handleGameEnd triggered', {
      score,
      barHearts: gameState.barHearts,
      user: user?.id,
      completionTime: totalTimeSeconds
    });
    console.log('Game ending with score:', score, 'completion time:', totalTimeSeconds, 'seconds');
    
    // Record game completion in localStorage
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('gameCompletedToday', 'true');
    localStorage.setItem('gameCompletedDate', today);
    localStorage.setItem('lastGameScore', score.toString());
    localStorage.setItem('lastGameHearts', JSON.stringify(gameState.barHearts));
    localStorage.setItem('lastGameCompletionTime', totalTimeSeconds.toString());
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Auth check:', { user, authError });
      
      if (user) {
        // Get user's profile data for the leaderboard
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single();
        
        // Record in game_scores table with completion time
        await supabase
          .from('game_scores')
          .insert({
            user_id: user.id,
            total_score: score,
            bar_scores: gameState.barHearts,
            completion_time: totalTimeSeconds,
            username: profileData?.username,
            avatar_url: profileData?.avatar_url,
            played_at: new Date().toISOString()
          });
        
        // Also use the ScoreService if that's your preferred approach
        // Modify this call if you've updated ScoreService to accept completion time
        await ScoreService.recordGameScore(user.id, gameState.barHearts);
        
        // Set the flag to force calendar refresh
        localStorage.setItem('forceCalendarRefresh', 'true');
        
        // First try to get current stats
        let { data: currentStats, error: fetchError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('id', user.id)
          .single();
        
        console.log('Current stats:', { currentStats, fetchError });
        
        if (!currentStats) {
          // Insert initial stats
          const { data: insertData, error: insertError } = await supabase
            .from('user_stats')
            .insert({
              id: user.id,
              current_streak: 1,
              best_streak: 1,
              total_games_played: 1,
              total_perfect_scores: score === 16 ? 1 : 0,
              last_played_at: new Date().toISOString()
            })
            .select();
            
          console.log('Insert result:', { insertData, insertError });
        } else {
          // Update existing stats
          const { data: updateData, error: updateError } = await supabase
            .from('user_stats')
            .update({
              total_games_played: currentStats.total_games_played + 1,
              total_perfect_scores: currentStats.total_perfect_scores + (score === 16 ? 1 : 0),
              last_played_at: new Date().toISOString()
            })
            .eq('id', user.id)
            .select();
            
          console.log('Update result:', { updateData, updateError });
        }
      }
    } catch (error) {
      console.error('Detailed error in handleGameEnd:', error);
    }
    
    // Continue with game end animation regardless of score recording
    setIsGameComplete(true);
    setIsGameEnded(true);
    setGameMode('ended');
    setIsListenPracticeMode(false);
    dispatch({
      type: 'UPDATE_COMPLETED_BARS',
      barIndex: currentBarIndex,
      completed: true
    });
    dispatch({ type: 'SET_GAME_PHASE', payload: 'ended' });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    setShowEndAnimation(true);
    
    if (fullTuneMelodyAudio) {
      fullTuneMelodyAudio.currentTime = 0;
      fullTuneMelodyAudio.play().catch(error => console.error("Audio playback failed:", error));
    }
  };
   const handleNextBar = async () => {
    dispatch({
      type: 'UPDATE_COMPLETED_BARS',
      barIndex: currentBarIndex,
      completed: true
    });

    if (isSuccess) {
      try {
        if (audioEngine && typeof audioEngine.playSound === 'function') {
          audioEngine.playSound('success');
        }
      } catch (error) {
        console.log('Could not play success sound:', error);
      }
    }

    dispatch({ type: 'UPDATE_NOTE_INDEX', payload: 0 });
    dispatch({ type: 'SET_GAME_PHASE', payload: 'initial' });
    setGameMode('initial');
    setIsListenPracticeMode(false);
    
    await loadAudio(currentBarIndex + 1);
    setCurrentBarIndex(prev => prev + 1);
  };
  
  const nextBarIndex = currentBarIndex + 1;
  if (nextBarIndex < correctSequence.length) {
    if (!isSuccess) {
      setTimeout(() => {
        handleNextBar();
      }, 3000); 
    } else {
      handleNextBar();
    }
  } else {
    handleGameEnd();
  }
}, [
  currentBarIndex,    
  correctSequence.length,   
  melodyAudio,   
  dispatch,   
  loadAudio,
  score,
  setShowFirstNoteHint,
  fullTuneMelodyAudio,
  gameState.barHearts,
  user?.id 
]);
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// In GameApp.js
const handleGameReset = useCallback(() => {
  // Reset timer state
  setGameTimer({
    startTime: Date.now(),
    elapsedTime: 0,
    isRunning: true
  });
  
  // Just pause and reset position
  if (melodyAudio) {
    melodyAudio.pause();
    melodyAudio.currentTime = 0;
  }
  if (fullTuneMelodyAudio) {
    fullTuneMelodyAudio.pause();
    fullTuneMelodyAudio.currentTime = 0;
  }
  // Reset game state but keep audio files
  setScore(0);
  setCurrentBarIndex(0);
  dispatch({ type: 'RESET_GAME_STATE' });
  setIsGameComplete(false);
  setShowEndAnimation(false);
  setIsGameEnded(false);
  setGameMode('initial');
  dispatch({ type: 'SET_GAME_PHASE', payload: 'initial' });
  dispatch({ type: 'UPDATE_NOTE_INDEX', payload: 0 });
  dispatch({ type: 'RESET_BAR_HEARTS' });
  dispatch({ type: 'RESET_COMPLETED_BARS' });
  setIsListenPracticeMode(false);
}, [gameTimer.elapsedTime, gameTimer.isRunning, gameTimer.startTime]); // Add these dependencies
const handleNotePlay = useCallback(async (noteNumber) => {
  console.log('handleNotePlay called with note:', noteNumber);

  // Get first note of current sequence for hint check
  const currentSequence = correctSequence[currentBarIndex];
  const firstNote = currentSequence?.[0]?.number;

  // Only remove hint if this is the correct first note OR we're in practice mode
  if (noteNumber === firstNote || gameState.gamePhase === 'practice') {
    setShowFirstNoteHint(false);
  }

  if (gameState.gamePhase !== 'practice' && gameState.gamePhase !== 'perform') {     
    console.log('Note ignored - wrong game phase:', gameState.gamePhase);     
    return;   
  }

  if (audioEngine?.audioContext?.state !== 'running') {
    try {
      await audioEngine.init();
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
      return;
    }
  }

  try {
    console.log('Playing note:', noteNumber);
    const source = audioEngine.playSound(`n${noteNumber}`);
    if (!source) {
      throw new Error('No audio source created');
    }
  } catch (error) {
    console.error('Failed to play note:', error);
    try {
      await audioEngine.init();
      audioEngine.playSound(`n${noteNumber}`);
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    }
  }

  if (gameState.gamePhase === 'perform' && !gameState.isBarFailing) {
    const currentNote = currentSequence[gameState.currentNoteIndex];
    
    if (currentNote && noteNumber === currentNote.number) {
      const newNoteIndex = gameState.currentNoteIndex + 1;
      dispatch({ type: 'UPDATE_NOTE_INDEX', payload: newNoteIndex });

      if (newNoteIndex === currentSequence.length) {
        try {
          audioEngine.playSound('complete');
        } catch (error) {
          console.error('Failed to play complete sound:', error);
        }
        
        const updatedScore = gameState.barHearts[currentBarIndex];
        setScore(prevScore => prevScore + updatedScore);
        moveToNextBar(true);
      }
    } else {
      const handleBarFailure = async () => {
        try {
          await audioEngine.playSound('wrong');
        } catch (error) {
          console.error('Failed to play wrong note sound:', error);
        }
      
        dispatch({ type: 'SET_BAR_FAILING', failing: true });
        dispatch({ type: 'UPDATE_NOTE_INDEX', payload: 0 });
        dispatch({ type: 'WRONG_NOTE', barIndex: currentBarIndex });
      
        if (gameState.barHearts[currentBarIndex] <= 1) {
          dispatch({ 
            type: 'SET_BAR_FAILED', 
            barIndex: currentBarIndex, 
            failed: true 
          });
      
          await new Promise(resolve => setTimeout(resolve, 300));
          try {
            await audioEngine.playSound('wrong');
          } catch (error) {
            console.error('Failed to play wrong note sound:', error);
          }
      
          await new Promise(resolve => setTimeout(resolve, 300));
          dispatch({ type: 'SET_BAR_FAILING', failing: false });
          moveToNextBar(false);
        } else {
          setTimeout(() => {
            dispatch({ type: 'SET_BAR_FAILING', failing: false });
          }, 500);
        }
      }
     
      try {
        await handleBarFailure();
      } catch (error) {
        console.error('Error in handleBarFailure:', error);
      }
    }
  }
}, [gameState, correctSequence, currentBarIndex, dispatch, moveToNextBar, setScore, setShowFirstNoteHint]);
return (
  <div className="game-wrapper main-game-instance"> 
    <div className={`game-container ${gameMode}`}>
    <HeaderToolbar 
  onRefresh={handleGameReset}
/>
      <GameBoard 
        barHearts={gameState.barHearts}
        currentBarIndex={currentBarIndex}
        renderBar={{
          correctSequence,
          currentNoteIndex: gameState.currentNoteIndex,
          completedBars: gameState.completedBars,
          isGameComplete,
          failedBars: gameState.failedBars
        }}
        isBarFailed={gameState.isBarFailing}
        gamePhase={gameState.gamePhase}
      />
      <Controls 
        onListenPractice={handleListenPractice}
        onPerform={handlePerform}
        isListenPracticeMode={isListenPracticeMode}
        isPerformAvailable={isAudioLoaded}
        isAudioLoaded={isAudioLoaded}
        gamePhase={gameState.gamePhase}
        isGameEnded={isGameEnded}
      />
      <VirtualInstrument 
        notes={notes}
        onNotePlay={handleNotePlay}
        isGameEnded={isGameEnded}
        isBarFailing={gameState.isBarFailing}
        showFirstNoteHint={showFirstNoteHint}
        correctSequence={correctSequence}
        currentBarIndex={currentBarIndex}
        hintLevel={gameState.hintLevel}
        currentNoteIndex={gameState.currentNoteIndex}
      />
      <ProgressBar 
        completedBars={gameState.completedBars.filter(Boolean).length} 
      />
    {showEndAnimation && (
  <EndGameAnimation 
    score={score}
    barHearts={gameState.barHearts}
  />
)}
    </div>
    <MainGameRefresh onRefresh={handleGameReset} />
    <InstructionsPopup
      gameType="main"
      isPreloading={isPreloading}
      isAudioLoaded={isAudioLoaded}
      onStartGame={handleStartGame}
      show={showInstructions}
      showCountdown={true}
    />
  </div>
);
}

export default GameApp;