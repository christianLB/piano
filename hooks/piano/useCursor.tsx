//@ts-nocheck
import { OpenSheetMusicDisplay, Cursor, Note } from "opensheetmusicdisplay";
import { useState, useEffect, useRef } from "react";
import cursorStyles from "../../styles/Cursor.module.css";
import useNote from "./useNote";
import useMidi from "./useMidi";
import useClickNavigation from "./useClickNavigation";

const useCursor = (
  osmd: OpenSheetMusicDisplay | null,
  container: HTMLElement | null,
  systemHeight
  //style: any
) => {
  //state & hooks
  const [cursor, setCursor] = useState<Cursor | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(12);
  const [selectedHands, setSelectedHands] = useState<{
    [key: string]: boolean;
  }>({
    left: true,
    right: true,
  });

  const { selectedMeasure, selectedVoiceEntry } = useClickNavigation(
    osmd,
    container
  );
  const currentNotesOnRef = useRef<number[]>([]);
  const selectedHandsRef = useRef(selectedHands);
  const {
    getNoteInfo,
    highlight,
    getNoteName,
    pitchNotationToMidiNumber,
    isRightHand,
    isLeftHand,
  } = useNote(osmd);
  const { midi, midiEvents } = useMidi();

  //effects

  useEffect(() => {
    cursor?.reset();
    if (cursor?.iterator) cursor.iterator.currentMeasureIndex = selectedMeasure;
    //cursor?.iterator.currentVoiceEntryIndex = 0;
    cursor?.previous(); //TODO: ???
    cursor?.next();
  }, [selectedMeasure, selectedVoiceEntry]);

  useEffect(() => {
    selectedHandsRef.current = selectedHands;
  }, [selectedHands]);

  // const getCurrentMeasureIndex = () => {
  //   if (cursor && cursor.iterator) {
  //     const iterator = cursor.iterator;
  //     const currentMeasureIndex = iterator.currentMeasureIndex;
  //     return currentMeasureIndex;
  //   }
  //   return -1;
  // };

  // Initialize the custom cursor
  const initializeCursor = () => {
    const cursorInstance: Cursor | undefined = osmd?.cursor;
    cursorInstance?.show();
    cursorInstance?.cursorElement.classList.add(cursorStyles.custom);
    setCursor(cursorInstance);
    reset();
  };

  const toggleHandSelection = (hand: string) => {
    setSelectedHands((prevSelectedHands) => {
      // Copy the previous state
      const updatedSelectedHands = { ...prevSelectedHands };
      // Toggle the selected hand
      updatedSelectedHands[hand] = !updatedSelectedHands[hand];
      // Update the state with the new values
      return updatedSelectedHands;
    });
  };

  // # write compareNotes function
  // should compare currentNotesOn with currentBeatNotes.
  // only return true if all notes in the beat are on.
  // # create a function that will return true if the notes are on
  const compareNotes = (beatNotes = [], notesOn = [], selectedHands) => {
    if (!notesOn.length) return false;
    const OCTAVE_OFFSET = 12;
    const notesOnSet = new Set(notesOn);

    return beatNotes.every((beatNote) => {
      if (!beatNote.vfpitch) return true; // Skip processing if vfpitch is not defined
      const { sourceNote } = beatNote;
      const { halfTone } = sourceNote;
      const isRight = isRightHand(sourceNote);
      const isLeft = isLeftHand(sourceNote);
      if (
        (isLeft && !!selectedHands.left) ||
        (isRight && !!selectedHands.right)
      ) {
        const transposedHalfTone = halfTone + OCTAVE_OFFSET;
        const includes = notesOnSet.has(transposedHalfTone);
        highlight(beatNote, includes ? "green" : "black");
        return includes; // Return whether the note is found
      }
      return true; // If hand selection conditions are not met, return true to continue
    });
  };

  const handleMidiEvent = (event) => {
    const eventType = event.data[0];
    const noteValue = event.data[1];

    if (eventType === 144) {
      const notes = cursor?.GNotesUnderCursor();
      notes.forEach((note) => {
        if (
          note.sourceNote &&
          note.sourceNote.pitch &&
          note.sourceNote.pitch.halfTone === noteValue
        ) {
          highlight(note, "green");
        }
      });
      currentNotesOnRef.current.push(noteValue);
      const currentNotes = cursor?.GNotesUnderCursor();
      const compare = compareNotes(
        currentNotes,
        currentNotesOnRef.current,
        selectedHandsRef.current
      );
      compare && next();
    } else if (eventType === 128) {
      const notes = cursor?.GNotesUnderCursor();
      notes.forEach((note) => {
        if (
          note.sourceNote &&
          note.sourceNote.pitch &&
          note.sourceNote.pitch.halfTone === noteValue
        ) {
          highlight(note, "black");
        }
      });
      currentNotesOnRef.current = currentNotesOnRef.current.filter(
        (note) => note !== noteValue
      );
      const currentNotes = cursor?.GNotesUnderCursor();
      compareNotes(
        currentNotes,
        currentNotesOnRef.current,
        selectedHandsRef.current
      );
    }
  };

  useEffect(() => {
    if (!midi) return;

    midi.inputs.forEach((input) => {
      input.addListener("midimessage", "all", handleMidiEvent);
    });

    // Clean up event listeners when the component is unmounted
    return () => {
      midi.inputs.forEach((input) => {
        input.removeListener("midimessage", "all", handleMidiEvent);
      });
    };
  }, [midi, cursor]);

  // Move cursor to the next note
  const next = () => {
    if (cursor) {
      customNext();
    }
  };

  function customNext() {
    // Utility function to check the playability of a note based on selected hands
    const isRelevantNote = (note) => {
      if (note.sourceNote.isRestFlag) return false;
      console.log(note, note.sourceNote.isRestFlag);
      return (
        (isRightHand(note.sourceNote) && selectedHands.right) ||
        (isLeftHand(note.sourceNote) && selectedHands.left)
      );
    };
    // Function to process the next beat
    const processNextBeat = () => {
      cursor.next();
      const notes = cursor.GNotesUnderCursor();
      const relevantNotes = notes.filter(isRelevantNote);
      if (relevantNotes.length > 0) {
        // A beat with relevant notes is found, so return.
        return;
      } else {
        // No relevant notes found, so check the next beat.
        processNextBeat();
      }
    };
    processNextBeat();
  }

  // Move cursor to the previous note
  const prev = () => {
    if (cursor) {
      cursor.previous();
      const notes = cursor.GNotesUnderCursor();
      highlight(notes, "black");
    }
  };

  // Play the score from the current position
  const play = async () => {
    if (cursor && !isPlaying) {
      cursor.show();
      setIsPlaying(true);
    }
  };

  // Add this useEffect inside your useCursor hook
  useEffect(() => {
    let timeoutId;

    const playNextNote = () => {
      if (isPlaying) {
        next();
        const notes = cursor?.GNotesUnderCursor();

        if (notes.length > 0) {
          const minDuration = Math.min(
            ...notes.map((note) => note.length.realValue)
          );

          const durationInMilliseconds =
            (minDuration * 60 * 1000) / playbackSpeed;
          timeoutId = setTimeout(playNextNote, durationInMilliseconds);
        } else {
          setIsPlaying(false);
        }
      }
    };

    if (isPlaying) {
      playNextNote();
    } else {
      clearTimeout(timeoutId);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isPlaying, playbackSpeed]);

  // Pause the playback
  const pause = () => {
    setIsPlaying(false);
  };

  // Move cursor to the beginning of the score
  const reset = () => {
    if (cursor && cursor.iterator) {
      cursor.reset();
      cursor.iterator.currentMeasureIndex = 0;
    }
  };

  // Change the playback speed (1 is normal speed)
  const setSpeed = (speed) => {
    setPlaybackSpeed(speed);
  };

  return {
    next,
    prev,
    play,
    pause,
    reset,
    setSpeed,
    initializeCursor,
    getNoteName,
    stop: () => setIsPlaying(false),
    toggleHandSelection,
    midiEvents,
    isPlaying,
    //midiEvents,
    currentMeasure: cursor?.iterator?.currentMeasureIndex,
    currentBeatNotes: cursor?.GNotesUnderCursor(),
    currentBeatNotesInfo: [], //TODO add this back.
    // currentBeatNotesInfo: cursor
    //   ?.GNotesUnderCursor()
    //   .map((note) => getNoteInfo(note)),
    currentNotesOn: currentNotesOnRef.current || [],
    selectedHands,
  };
};

export default useCursor;
