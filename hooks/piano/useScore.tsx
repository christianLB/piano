//@ts-nocheck
// hooks/useScore.ts
import { useEffect, useState } from "react";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import useProgressTracking from "./useProgressTracking";

export default function useScore() {
  const [osmd, setOsmd] = useState<OpenSheetMusicDisplay | null>(null);
  const [notes, setNotes] = useState([]); // Add useState for notes
  const [leftHandProgress, setLeftHandProgress] = useState(0);
  const [rightHandProgress, setRightHandProgress] = useState(0);

  function extractNotes(voice) {
    const notes = [];
    console.log({ voice });
    if (voice.sheet) {
      const sourceMeasures = voice.sheet.sourceMeasures;

      sourceMeasures.forEach((sourceMeasure) => {
        // Iterate through the vertical staff entry containers
        sourceMeasure.VerticalSourceStaffEntryContainers.forEach(
          (container) => {
            // Iterate through the staff entries
            container.StaffEntries.forEach((entry) => {
              // Iterate through the notes in the entry
              entry.Notes.forEach((note) => {
                notes.push(note);
              });
            });
          }
        );
      });

      console.log(notes);
    }
  }

  const highlightFirstNote = (color: string) => {
    if (notes.length === 0) {
      console.warn("No notes found to highlight.");
      return;
    }
    const firstNote = notes[0];
    console.log({ firstNote });
    updateNoteStyling(
      osmd,
      firstNote.sourceNote,
      firstNote.hand,
      color === "green"
    );
  };

  const compareMidiEventWithNote = (midiEvent, notes, progressIndices) => {
    console.log("Progress indices:", progressIndices, "Note index:", noteIndex);

    if (midiEvent.type !== "note-on" && midiEvent.type !== "note-off") {
      return false;
    }

    const hand = midiEvent.hand || "both";
    const noteIndex = progressIndices[hand] || 0;
    console.log("Notes:", notes);
    console.log("Midi event hand:", midiEvent.hand);
    console.log("Note index:", noteIndex);

    const note = notes[noteIndex];
    console.log("Note pitch:", note.pitch);
    console.log("Midi event note:", midiEvent.note);
    console.log("Midi event hand:", midiEvent.hand);
    console.log("Hand:", hand);

    if (!note) {
      return false;
    }
    const updatedComparisonResult =
      note.pitch === midiEvent.note && note.hand === hand;

    console.log("Updated comparison result:", updatedComparisonResult);
    const midiNote = midiEvent.note;
    const scoreNote = note.pitch;

    if (midiNote !== scoreNote) {
      return false;
    }

    // If hand information is available in the note, compare it with the MIDI event hand
    if (note.hand && midiEvent.hand && note.hand !== midiEvent.hand) {
      return false;
    }
    const isCorrect = true;
    console.log("Is correct:", isCorrect);

    return { isCorrect, hand };
  };

  const updateNoteStyling = (note, hand, isCorrect) => {
    const color = isCorrect ? "green" : "red";
    note.graphicalNotes.forEach((graphicalNote) => {
      console.log(graphicalNote);
      graphicalNote.sourceNote.colorDefault = color;
      graphicalNote.parent.parent.parent.reCalculate();
    });
    osmd?.render();
  };

  const handleMidiEvent = (midiEvent) => {
    console.log("Midi event:", midiEvent);
    const progressIndices = {
      left: leftHandProgress,
      right: rightHandProgress,
      both: Math.min(leftHandProgress, rightHandProgress),
    };

    // Pass notes and progressIndices as arguments to compareMidiEventWithNote
    const result = true; //compareMidiEventWithNote(midiEvent, notes, progressIndices);
    console.log("Comparison result:", result);

    // Check if result is an object with isCorrect and hand properties
    if (!result || typeof result !== "object") {
      return;
    }

    const { isCorrect, hand } = result;
    const note = notes[progressIndices[hand]];

    if (note) {
      updateNoteStyling(osmd, note.sourceNote, hand, isCorrect);
    }

    return result;
  };

  const loadScore = async (xmlContent: string, container: HTMLElement) => {
    if (!container) return;

    const osmdInstance = new OpenSheetMusicDisplay(container, {
      backend: "svg",
      drawTitle: true,
    });

    try {
      await osmdInstance.load(xmlContent);
      osmdInstance.render();
      setOsmd(osmdInstance);

      // Initialize the notes array after rendering the score
      const extractedNotes = extractNotes(osmdInstance);
      console.log({ extractedNotes });
      setNotes(extractedNotes); // Set the notes state
      //highlightFirstNote("green");
    } catch (error) {
      console.error("Error rendering MusicXML:", error);
    }
  };

  return {
    osmd,
    loadScore,
    compareMidiEventWithNote,
    notes,
    handleMidiEvent,
    setLeftHandProgress, // Add this line
    setRightHandProgress, // Add this line
  }; // Add compareMidiEventWithNote to the returned object
}
