import React, { useState, useCallback, useEffect, useReducer } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './HistoricalGame.css';
import { audioEngine } from '../AudioEngine';
import HeaderToolbar from '../components/HeaderToolbar';
import GameBoard from '../game/components/GameBoard';
import Controls from '../game/components/Controls';
import VirtualInstrument from '../game/components/VirtualInstrument';
import ProgressBar from '../game/components/ProgressBar';
import { supabase } from '../services/supabase';
import { useAuth } from '../services/AuthContext';
import { audioFetchService } from '../services/audioFetchService';
import HistoricalEndGameAnimation from './components/HistoricalEndGameAnimation';
import HistoricalHeaderOverlay from './components/HistoricalHeaderOverlay';
// Reusing the same initial game state as the main game
const initialGameState = {
  currentNoteIndex: 0,
  gamePhase: 'initial',
  completedBars: [false, false, false, false],
  isBarFailing: false,
  barHearts: [4, 4, 4, 4],
  failedBars: [false, false, false, false],
  hintLevel: 0 // 0 = no hints, 1 = first 2 notes, 2 = full sequence
};

// Reusing the same game reducer as the main game
function gameReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_NOTE_INDEX':
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
        ...initialGameState
      };
    default:
      return state;
  }
}

function HistoricalGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  // Parse URL parameters
  const [historicalDate, setHistoricalDate] = useState(null);
  const [playMode, setPlayMode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Audio-related states
  // eslint-disable-next-line no-unused-vars
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
  // eslint-disable-next-line no-unused-vars
  const [playStartTime, setPlayStartTime] = useState(null);

  // Sequence and completion tracking
  const [correctSequence, setCorrectSequence] = useState([]);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [isGameEnded, setIsGameEnded] = useState(false);
  const [showEndAnimation, setShowEndAnimation] = useState(false);
  const [isListenPracticeMode, setIsListenPracticeMode] = useState(false);
  const [showFirstNoteHint, setShowFirstNoteHint] = useState(false);

  // Standard note definitions
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

  // Parse URL parameters when component mounts
  useEffect(() => {
    const parseParams = () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const replayMode = queryParams.get('replay');
        const dateParam = queryParams.get('date');
        const modeParam = queryParams.get('mode');

        if (replayMode === 'true' && dateParam && modeParam) {
          const date = new Date(dateParam);
          setHistoricalDate(date);
          setPlayMode(modeParam);
        } else {
          // Try to get from localStorage as fallback
          const storedDate = localStorage.getItem('playAgainDate');
          const storedMode = localStorage.getItem('playAgainMode');
          
          if (storedDate && storedMode) {
            setHistoricalDate(new Date(storedDate));
            setPlayMode(storedMode);
          } else {
            setError('No valid date or mode found for historical play');
          }
        }
      } catch (error) {
        console.error('Error parsing parameters:', error);
        setError('Failed to load historical game parameters');
      } finally {
        setLoading(false);
      }
    };

    parseParams();
  }, [location.search]);

  // Load initial audio function
  const loadInitialAudio = useCallback(async (barIndex, audioPath) => {
    console.log('Loading initial historical audio for bar:', barIndex);
    try {
      await audioEngine.loadSound(audioPath, `melody${barIndex}`);
      const audio = new Audio(audioPath);
      setMelodyAudio(audio);
      setIsAudioLoaded(true);
      return audio;
    } catch (error) {
      console.error('Failed to load initial historical audio:', error);
      setIsAudioLoaded(false);
      return null;
    }
  }, []);

  // Load subsequent audio bars
  const loadAudio = useCallback(async (barIndex) => {
    if (audioFiles.length === 0 || barIndex >= audioFiles.length) {
      console.error('No historical audio files available or invalid bar index');
      setIsAudioLoaded(false);
      return;
    }
    try {
      const audioPath = audioFiles[barIndex];
      await audioEngine.loadSound(audioPath, `melody${barIndex}`);
      const audio = new Audio(audioPath);
      setMelodyAudio(audio);
      return audio;
    } catch (error) {
      console.error('Failed to load historical audio for bar:', error);
      setIsAudioLoaded(false);
      return null;
    }
  }, [audioFiles]);

  // Load historical audio data when date and mode are set
  useEffect(() => {
    const loadHistoricalAudio = async () => {
      if (!historicalDate) return;
      
      try {
        setIsPreloading(true);
        
        // Initialize audio engine
        const success = await audioEngine.init();
        if (!success) {
          throw new Error('Failed to initialize audio engine');
        }
        
        // Load basic sounds
        for (let i = 1; i <= 8; i++) {
          await audioEngine.loadSound(`/assets/audio/n${i}.mp3`, `n${i}`);
        }
        
        // Load UI sounds
        await audioEngine.loadSound('/assets/audio/ui-sounds/wrong-note.mp3', 'wrong');
        await audioEngine.loadSound('/assets/audio/ui-sounds/bar-failed.mp3', 'fail');
        await audioEngine.loadSound('/assets/audio/ui-sounds/bar-complete.mp3', 'complete');
        await audioEngine.loadSound('/assets/audio/ui-sounds/note-flip.mp3', 'flip');
        
        // This part will require adding fetchHistoricalMelody to audioFetchService
        const historicalData = await audioFetchService.fetchHistoricalMelody(historicalDate);
        
        setAudioFiles(historicalData.melodyParts);
        setFullTunePath(historicalData.fullTune);
        
        // Load first bar
        if (historicalData.melodyParts.length > 0) {
          await loadInitialAudio(0, historicalData.melodyParts[0]);
          
          // Record the start time of this practice session
          setPlayStartTime(new Date());
        }
        
        setIsAudioLoaded(true);
        dispatch({ type: 'SET_GAME_PHASE', payload: 'ready' });
      } catch (error) {
        console.error('Historical audio loading failed:', error);
        setError('Failed to load the melody from this date');
        setIsAudioLoaded(false);
      } finally {
        setIsPreloading(false);
      }
    };
    
    loadHistoricalAudio();
  }, [historicalDate, loadInitialAudio]);

  // Process audio files into sequences
  useEffect(() => {
    if (audioFiles.length > 0) {
      console.log('Processing historical audio files:', audioFiles);
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
  }, [audioFiles]);

  // Setup full tune playback
  useEffect(() => {
    if (!fullTunePath) return;
    const audio = new Audio(fullTunePath);
    
    // Handle visibility change
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        audio.pause();
      } else {
        if (audioEngine && audioEngine.audioContext?.state === 'suspended') {
          try {
            await audioEngine.init();
          } catch (error) {
            console.error('Failed to reinitialize AudioEngine:', error);
          }
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    setFullTuneMelodyAudio(audio);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      audio.pause();
    };
  }, [fullTunePath]);
  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (melodyAudio) {
        melodyAudio.pause();
        melodyAudio.currentTime = 0;
      }
      if (fullTuneMelodyAudio) {
        fullTuneMelodyAudio.pause();
        fullTuneMelodyAudio.currentTime = 0;
      }
    };
  }, [melodyAudio, fullTuneMelodyAudio]);

  // Exit back to Play Again page
  const handleExitToPlayAgain = useCallback(() => {
    navigate('/play-again');
  }, [navigate]);

  // Listen and practice mode handler
  const handleListenPractice = useCallback(async () => {
    if (!isAudioLoaded) return;

    try {
      setShowFirstNoteHint(false);
      await audioEngine.init();
      
      const bufferCheck = await audioEngine.verifyBuffers();
      if (!bufferCheck) {
        for (let i = 1; i <= 8; i++) {
          await audioEngine.loadSound(`/assets/audio/n${i}.mp3`, `n${i}`);
        }
      }
      
      const playSuccess = await audioEngine.playSound(
        `melody${currentBarIndex}`,
        0,
        () => setShowFirstNoteHint(true)
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

  // Perform mode handler
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

  // Move to next bar or end game
  const moveToNextBar = useCallback((isSuccess = true) => {
    setShowFirstNoteHint(false);
    
    if (melodyAudio) {
      melodyAudio.pause();
      melodyAudio.currentTime = 0;
    }
    
    const handleGameEnd = async () => {
      console.log('Historical game ending with score:', score);

  
      // Calculate total score from bar hearts
      const totalScore = gameState.barHearts.reduce((sum, hearts) => sum + hearts, 0);
      
      // Current date for record keeping
      const currentDate = new Date();
      
      if (user) {
        try {
          // Insert a new record for this play
          const { data, error } = await supabase
            .from('game_scores')
            .insert({
              user_id: user.id,
              played_at: currentDate.toISOString(), // When it was actually played
              bar_scores: gameState.barHearts,
              total_score: totalScore,
              perfect_bars: gameState.barHearts.filter(hearts => hearts === 4).length,
              is_replay: true, // Flag to identify this as a replay
              replay_date: currentDate.toISOString(), // Same as played_at for consistency
              original_date: historicalDate.toISOString(), // The date being replayed
              replay_mode: localStorage.getItem('playAgainMode')
            })
            .select();
          
          if (error) {
            console.error('Error recording score:', error);
          } else {
            console.log('Score recorded successfully:', data);
            
            // Force calendar refresh
            console.log('Setting forceCalendarRefresh flag to true');
            localStorage.setItem('forceCalendarRefresh', 'true');
          }
          
          console.log('Historical play processing complete');
        } catch (error) {
          console.error('Failed to record historical play:', error);
        }
      }
      
      // Continue with game end animation
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
        fullTuneMelodyAudio.play().catch(error => 
          console.error("Audio playback failed:", error)
        );
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
          audioEngine.playSound('complete');
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
    user,
    historicalDate
  ]);

  // Handle note playback
  const handleNotePlay = useCallback(async (noteNumber) => {
    // Get first note of current sequence for hint check
    const currentSequence = correctSequence[currentBarIndex];
    const firstNote = currentSequence?.[0]?.number;
    
    // Only remove hint if this is the correct first note OR we're in practice mode
    if (noteNumber === firstNote || gameState.gamePhase === 'practice') {
      setShowFirstNoteHint(false);
    }
    
    if (gameState.gamePhase !== 'practice' && gameState.gamePhase !== 'perform') {
      return;
    }
    
    // Initialize audio if needed
    if (audioEngine?.audioContext?.state !== 'running') {
      try {
        await audioEngine.init();
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error('Failed to initialize audio engine:', error);
        return;
      }
    }
    
    // Play the note
    try {
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
    
    // Check note in perform mode
    if (gameState.gamePhase === 'perform' && !gameState.isBarFailing) {
      const currentNote = currentSequence[gameState.currentNoteIndex];
      if (currentNote && noteNumber === currentNote.number) {
        // Correct note
        const newNoteIndex = gameState.currentNoteIndex + 1;
        dispatch({ type: 'UPDATE_NOTE_INDEX', payload: newNoteIndex });
        
        // Bar complete
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
        // Wrong note
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
        };
        
        try {
          await handleBarFailure();
        } catch (error) {
          console.error('Error in handleBarFailure:', error);
        }
      }
    }
  }, [
    gameState, 
    correctSequence, 
    currentBarIndex, 
    dispatch, 
    moveToNextBar, 
    setScore, 
    setShowFirstNoteHint
  ]);

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
    return () => {
      document.body.className = '';
    };
  }, [gameMode]);

  // Loading state
  if (loading || !historicalDate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-background-alt shadow-xl border-2 border-writing/30 rounded-lg p-6 text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="font-patrick text-writing">Loading historical game...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-background-alt shadow-xl border-2 border-writing/30 rounded-lg p-6 text-center">
          <p className="font-patrick text-writing text-xl mb-4">
            {error}
          </p>
          <button
            onClick={() => navigate('/play-again')}
            className="bg-writing text-white rounded-lg px-6 py-2 font-patrick"
          >
            Return to Play Again
          </button>
        </div>
      </div>
    );
  }

  // Render the main game
  return (
    <div className="game-wrapper historical-game-instance">
      <div className={`game-container ${gameMode}`}>
        <HeaderToolbar />
        <HistoricalHeaderOverlay 
          date={historicalDate}
          playMode={playMode}
          onExit={handleExitToPlayAgain}
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
  <HistoricalEndGameAnimation
    score={score}
    barHearts={gameState.barHearts}
    historicalDate={historicalDate}
    playMode={playMode}
    onExitToPlayAgain={handleExitToPlayAgain}
    className="historical-end-game-animation" // Add this class
  />
)}
      </div>
    </div>
  );
}

export default HistoricalGame;