// hooks/useProgressTracking.ts
import { useState, useEffect } from "react";

export default function useProgressTracking(osmd, notes, handleMidiEvent) {
  const [leftHandProgress, setLeftHandProgress] = useState(0);
  const [rightHandProgress, setRightHandProgress] = useState(0);

  useEffect(() => {
    if (setLeftHandProgress) {
      setLeftHandProgress(leftHandProgress);
    }
  }, [leftHandProgress, setLeftHandProgress]);

  useEffect(() => {
    if (setRightHandProgress) {
      setRightHandProgress(rightHandProgress);
    }
  }, [rightHandProgress, setRightHandProgress]);

  useEffect(() => {
    if (!osmd || !notes || !handleMidiEvent) return;

    const handleMidiEventWithProgressTracking = (midiEvent) => {
      const result = handleMidiEvent(midiEvent);

      if (result && result.isCorrect) {
        if (result.hand === "left") {
          setLeftHandProgress(leftHandProgress + 1);
        } else if (result.hand === "right") {
          setRightHandProgress(rightHandProgress + 1);
        }
      }
    };

    // Attach the new MIDI event handler to the osmd object
    osmd.handleMidiEvent = handleMidiEventWithProgressTracking;
  }, [osmd, notes, handleMidiEvent, leftHandProgress, rightHandProgress]);

  return { leftHandProgress, rightHandProgress };
}
