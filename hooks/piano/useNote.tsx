import { useState, useEffect } from "react";

const useNote = (osmd) => {
  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  const pitchNotationToMidiNumber = (pitchNotation) => {
    const noteToMidi = {
      C: 0,
      D: 2,
      E: 4,
      F: 5,
      G: 7,
      A: 9,
      B: 11,
    };

    const regex = /^([A-Ga-g])([-+]*)(\d+)/;
    const match = pitchNotation.match(regex);

    if (!match) {
      throw new Error(`Invalid pitch notation: ${pitchNotation}`);
    }

    const note = match[1].toUpperCase();
    const accidental = match[2];
    const octave = parseInt(match[3], 10);

    let midiNumber = (octave + 1) * 12 + noteToMidi[note];

    // Handle accidentals
    if (accidental) {
      midiNumber += accidental.length * (accidental[0] === "+" ? 1 : -1);
    }

    return midiNumber;
  };

  const setGraphicalNoteColor = (sourceNote, color) => {
    if (
      sourceNote &&
      sourceNote.parentStaffEntry &&
      sourceNote.parentStaffEntry.graphicalStaffEntry
    ) {
      const graphicalNotes =
        sourceNote.parentStaffEntry.graphicalStaffEntry.findGraphicalNotesBySourceNote(
          sourceNote
        );
      for (const graphicalNote of graphicalNotes) {
        graphicalNote.setNoteheadColor(color);
      }
    }
  };

  const highlight = (notes, color) => {
    if (!notes) {
      return;
    }

    if (!Array.isArray(notes)) {
      notes = [notes];
    }

    for (const note of notes) {
      const noteHead = note.notehead();
      noteHead.style.fillStyle = color;
      noteHead.draw();
    }
  };

  const getNoteName = (midiNumber) => {
    const note = noteNames[midiNumber % 12];
    return note;
  };

  const getNoteInfo = (note) => {
    if (note.isRest()) {
      return {
        noteName: "Rest",
        accidental: null,
        octave: null,
        duration: note.length.toString(),
        midiNoteNumber: null,
      };
    }

    const pitch = note.pitch;

    const noteName = getNoteName(pitch.halfTone); //noteNames[pitch.halfTone % 12]; // Corrected note name calculation
    const accidental = pitch.accidental;
    const octave = pitch.octave;
    const duration = note.length.toString();

    return {
      noteName,
      accidental,
      octave,
      duration,
      midiNoteNumber: pitch.halfTone,
    };
  };

  const isLeftHand = (sourceNote) => {
    if (!sourceNote || !sourceNote.ParentStaff) return false;
    return sourceNote.ParentStaff.id > 1;
  };

  const isRightHand = (sourceNote) => {
    if (!sourceNote || !sourceNote.ParentStaff) return false;
    return sourceNote.ParentStaff.id === 1;
  };

  return {
    getNoteInfo,
    highlight,
    getNoteName,
    pitchNotationToMidiNumber,
    isLeftHand,
    isRightHand,
  };
};

export default useNote;
