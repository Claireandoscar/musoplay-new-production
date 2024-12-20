import React, { useState, useCallback, useEffect, useReducer } from 'react';
import './App.css';
import { audioEngine } from './AudioEngine';
import Toolbar from './components/Toolbar';
import GameBoard from './components/GameBoard';
import Controls from './components/Controls';
import VirtualInstrument from './components/VirtualInstrument';
import ProgressBar from './components/ProgressBar';
import EndGameAnimation from './components/EndGameAnimation';
import LogRocket from 'logrocket';
import { trackEvent } from './services/analytics';

LogRocket.init('gwciye/musoplay');

const initialGameState = {
  currentNoteIndex: 0,
  gamePhase: 'initial',
  completedBars: [false, false, false, false],
  isBarFailing: false,
  barHearts: [4, 4, 4, 4],
  failedBars: [false, false, false, false]
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
            return {
                ...state,
                barHearts: state.barHearts.map((hearts, index) => 
                    index === action.barIndex ? hearts - 1 : hearts
                )
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
function App() {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  
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
  const [showInstructions, setShowInstructions] = useState(true);

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

  const handleStartGame = () => {   
    console.log('handleStartGame called');
    trackEvent('game_started');     
    if (!isPreloading && isAudioLoaded) {
      console.log('Conditions passed, starting game');
      setShowInstructions(false);
      setGameMode('initial');
        
      dispatch({ type: 'SET_GAME_PHASE', payload: 'initial' });
      dispatch({ type: 'UPDATE_NOTE_INDEX', payload: 0 });
      dispatch({ type: 'RESET_BAR_HEARTS' });
      dispatch({ type: 'RESET_COMPLETED_BARS' });
      dispatch({ type: 'SET_BAR_FAILING', failing: false });
        
      setScore(0);
      setCurrentBarIndex(0);
      setIsGameComplete(false);
      setIsGameEnded(false);
      setShowEndAnimation(false);
      setIsListenPracticeMode(false);
    } else {
      console.log('Game not starting because:', { isPreloading, isAudioLoaded });
    }
  };
  // Define loadAudio callback - combined version
  const loadAudio = useCallback(async (barIndex) => {
    console.log('LoadAudio called with barIndex:', barIndex);
    console.log('Current audioFiles:', audioFiles);
    
    if (audioFiles.length === 0 || barIndex >= audioFiles.length) {
        console.log('No audio files available or invalid bar index');
        setIsAudioLoaded(false);
        return;
    }

    try {
        const audioPath = audioFiles[barIndex];
        console.log('Loading audio from path:', audioPath);
        
        // Removed currentGameNumber parameter
        await audioEngine.loadSound(audioPath, `melody${barIndex}`);
        
        // Create Audio object
        const audio = new Audio(audioPath);
        setMelodyAudio(audio);
        
        setIsAudioLoaded(true);
        console.log('Audio successfully loaded, isAudioLoaded set to true');
        
        return audio;
    } catch (error) {
        console.error('Failed to load audio:', error);
        setIsAudioLoaded(false);
        return null;
    }
}, [audioFiles]); // Removed currentGameNumber from dependencies

useEffect(() => {
  console.log('Audio initialization effect running');
  
  const initAudio = async () => {
      console.log('Starting initAudio in App.js');
      try {
          // Platform detection
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          console.log('Platform:', isIOS ? 'iOS' : 'Android/Other');

          if (audioFiles.length > 0) {
              console.log(`Found ${audioFiles.length} audio files`);
              setIsPreloading(true);

              const success = await audioEngine.init();
              console.log('AudioEngine init result:', success);

              if (success) {
                  try {
                      // Load all piano notes (1-8) first
                      console.log('Loading piano notes...');
                      for (let i = 1; i <= 8; i++) {
                          await audioEngine.loadSound(`/assets/audio/n${i}.mp3`, `n${i}`);
                      }

                      // Then load UI sounds
                      console.log('Loading UI sounds...');
                      await audioEngine.loadSound('/assets/audio/ui-sounds/wrong-note.mp3', 'wrong');
                      await audioEngine.loadSound('/assets/audio/ui-sounds/bar-failed.mp3', 'fail');
                      await audioEngine.loadSound('/assets/audio/ui-sounds/bar-complete.mp3', 'complete');
                      await audioEngine.loadSound('/assets/audio/ui-sounds/note-flip.mp3', 'flip');

                      // Load current bar audio
                      const audioLoadResult = await loadAudio(currentBarIndex);
                      console.log('Audio load result:', audioLoadResult);

                      setIsAudioLoaded(true);
                      setIsPreloading(false);
                      console.log('isAudioLoaded set to true');
                      dispatch({ type: 'SET_GAME_PHASE', payload: 'ready' });

                      console.log('Final state check:', {
                          isAudioLoaded,
                          audioFiles: audioFiles.length,
                          currentBar: currentBarIndex
                      });
                  } catch (loadError) {
                      console.error('Error loading audio:', loadError);
                      setIsAudioLoaded(false);
                      setIsPreloading(false);
                  }
              }
          } else {
              console.log('No audio files available yet');
              setIsPreloading(false);
          }
      } catch (error) {
          console.error('Audio initialization error:', error);
          setIsAudioLoaded(false);
          setIsPreloading(false);
      }
  };

  initAudio();

  return () => {
      console.log('Cleaning up audio initialization effect');
  };
}, [audioFiles, currentBarIndex, loadAudio, dispatch, isAudioLoaded]);
useEffect(() => {
  const fetchAudioFiles = async () => {
      try {
        const jsonPath = `/assets/audio/testMelodies/2024-12-15/current.json`;
          console.log('Fetching JSON from:', jsonPath);
          const response = await fetch(jsonPath);
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log('Successfully loaded audio files:', data);
          setAudioFiles(data.melodyParts);
          setFullTunePath(data.fullTune);
          console.log('Audio files state updated');
      } catch (error) {
          console.error('Failed to load current.json:', error);
      }
  };

  fetchAudioFiles();
}, []); // No dependencies needed
  
  // Keep this useEffect for loading melodies when bar changes
  useEffect(() => {
    if (correctSequence.length > 0) {
      loadAudio(currentBarIndex);
    }
  }, [currentBarIndex, correctSequence, loadAudio]);

  // Updated practice mode handler
 
  const handleListenPractice = useCallback(async () => {
    trackEvent('practice_mode_entered', { barIndex: currentBarIndex });
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
        // Error recovery...
    }
}, [currentBarIndex, dispatch, isAudioLoaded]);

// Updated perform mode handler
const handlePerform = useCallback(async () => {
  trackEvent('perform_mode_entered', { barIndex: currentBarIndex });
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
  trackEvent('bar_completed', { 
    barIndex: currentBarIndex,
    success: isSuccess,
    hearts: gameState.barHearts[currentBarIndex]
  });
  
  // Reset hint state when moving to next bar
  setShowFirstNoteHint(false);

  if (melodyAudio) {
    melodyAudio.pause();
    melodyAudio.currentTime = 0;
  }
  
  const handleGameEnd = async () => {
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
  fullTuneMelodyAudio,   
  melodyAudio,   
  dispatch,   
  loadAudio,
  gameState.barHearts
]);

// eslint-disable-next-line no-unused-vars
const handleGameReset = () => {
  // ... function code
  trackEvent('game_completed', { 
    finalScore: score 
  });

  // Clear existing audio
  if (melodyAudio) {
      melodyAudio.pause();
      melodyAudio.currentTime = 0;
      setMelodyAudio(null);
  }

  if (fullTuneMelodyAudio) {
      fullTuneMelodyAudio.pause();
      fullTuneMelodyAudio.currentTime = 0;
  }

  // Reset all state
  setAudioFiles([]);
  setScore(0);
  setCurrentBarIndex(0);
  
  // Reset reducer state
  dispatch({ type: 'RESET_GAME_STATE' });

  // Clear completion states
  setIsGameComplete(false);
  setShowEndAnimation(false);
  setIsGameEnded(false);
  
  // Reset game modes
  setGameMode('initial');
  dispatch({ type: 'SET_GAME_PHASE', payload: 'initial' });
  dispatch({ type: 'UPDATE_NOTE_INDEX', payload: 0 });
  dispatch({ type: 'RESET_BAR_HEARTS' });
  dispatch({ type: 'RESET_COMPLETED_BARS' });
  
  // Reset UI states
  setIsListenPracticeMode(false);
};
const handleNotePlay = useCallback(async (noteNumber) => {
  trackEvent('note_played', { 
    note: noteNumber,
    gamePhase: gameState.gamePhase,
    barIndex: currentBarIndex   
  });

  console.log('handleNotePlay called with note:', noteNumber);  

  // Get first note of current sequence for hint check
  const currentSequence = correctSequence[currentBarIndex];
  const firstNote = currentSequence?.[0]?.number;

  // Only remove hint if this is the correct first note
  if (noteNumber === firstNote) {
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
  <div className="game-wrapper">
    <div className={`game-container ${gameMode}`}>
      <Toolbar onShowInstructions={() => setShowInstructions(true)} />
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
      />
      <ProgressBar completedBars={gameState.completedBars.filter(Boolean).length} />
      {showEndAnimation && (
        <EndGameAnimation 
          score={score}
          barHearts={gameState.barHearts}
        />
      )}
      {(showInstructions || isPreloading) && gameMode === 'initial' && currentBarIndex === 0 && (
  <div className="instructions-popup">
          <div className="instructions-content">
            <h2>HOW TO PLAY</h2>
            <div className="instruction-flow">
              <p>
                <span style={{ fontSize: '0.8em', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <img src="/assets/images/ui/heart.svg" alt="heart" style={{ width: '20px', height: '20px', margin: '0 5px' }} />
                  TURN OFF SILENT MODE
                  <img src="/assets/images/ui/heart.svg" alt="heart" style={{ width: '20px', height: '20px', margin: '0 5px' }} />
                </span>
                1. PRESS LISTEN & PRACTICE<br/>
                2. PLAY WHAT YOU HEAR USING THE COLOURFUL BUTTONS<br/>
                3. PRACTICE AS MANY TIMES AS YOU NEED<br/>
                4. PRESS PERFORM TO PLAY THE MELODY FOR REAL<br/>
                5. HIT THE RIGHT NOTES TO HANG ON TO YOUR HEARTS!
              </p>
            </div>
            <p className="challenge">CAN YOU HIT THE RIGHT NOTES?</p>
            <button 
  className="instructions-next" 
  onClick={handleStartGame}
  disabled={isPreloading || !isAudioLoaded}
>
  <img src="/assets/images/ui/play.svg" alt="Next" />
</button>
          </div>
        </div>
      )}
    </div>
  </div>
 );
}

export default App;
