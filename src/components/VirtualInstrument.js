import React from 'react';
import CubeButton from './CubeButton';

const VirtualInstrument = ({ 
  notes, 
  onNotePlay, 
  isGameEnded, 
  isBarFailing, 
  showFirstNoteHint,
  correctSequence,
  currentBarIndex,
  hintLevel,
  currentNoteIndex  // Add this prop to track current note
}) => {
  // Function to determine if a note should show hint
  const shouldShowHint = (noteNumber) => {
    if (!correctSequence[currentBarIndex]) return false;
    
    const sequence = correctSequence[currentBarIndex];
    const noteIndexInSequence = sequence.findIndex(note => note.number === noteNumber);
    
    if (noteIndexInSequence === -1) return false;

    // Standard first note hint
    if (showFirstNoteHint && noteIndexInSequence === 0) return true;

    // Only show hint for current note being played
    if (noteIndexInSequence === currentNoteIndex) {
      // Hint level 1: Only show if within first 2 notes
      if (hintLevel === 1 && noteIndexInSequence < 2) return true;
      // Hint level 2: Show for any note in sequence
      if (hintLevel === 2) return true;
    }

    return false;
  };

  return (
    <div className="virtual-instrument">
      {notes.map((note) => (
        <CubeButton
          key={note.id}
          color={note.color}
          frontImage={`/assets/images/cube-fronts/n${note.id}.svg`}
          bottomImage={`/assets/images/cube-bottoms/${note.id}.svg`}
          noteNumber={note.noteNumber}
          onNotePlay={onNotePlay}
          isGameEnded={isGameEnded}
          isBarFailing={isBarFailing}
          showHint={shouldShowHint(note.noteNumber)}
        />
      ))}
    </div>
  );
};

export default VirtualInstrument;