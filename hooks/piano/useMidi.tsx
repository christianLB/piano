import { useEffect, useState } from "react";

export default function useMidi() {
  const [midi, setMidi] = useState(null);
  const [midiEvents, setMidiEvents] = useState<any>([]);

  useEffect(() => {
    async function loadWebMidi() {
      const webMidiModule = await import("webmidi");
      setMidi(webMidiModule.WebMidi);
    }

    loadWebMidi();
  }, []);

  const OCTAVE_OFFSET = 0;

  function applyOctaveOffset(noteValue) {
    return noteValue + OCTAVE_OFFSET;
  }

  const handleMidiMessage = (event) => {
    const [type, note, velocity] = event.data;
    const isNoteOn = (type & 0xf0) === 0x90 && velocity > 0;
    const isNoteOff =
      (type & 0xf0) === 0x80 || ((type & 0xf0) === 0x90 && velocity === 0);

    const transposedNote = applyOctaveOffset(note);

    if (isNoteOn) {
      const midiEvent = {
        type: "note-on",
        note: transposedNote,
        velocity: velocity / 127,
      };
      setMidiEvents((prevEvents) => [...prevEvents, midiEvent]);
    } else if (isNoteOff) {
      const midiEvent = {
        type: "note-off",
        note: transposedNote,
      };
      setMidiEvents((prevEvents) => [...prevEvents, midiEvent]);
    }
  };

  const onMidiEvent = (callback) => {
    if (midi) {
      midi.inputs.forEach((input) => {
        if (typeof callback === "function") {
          input.addListener("midimessage", "all", callback);
        } else {
          input.removeListener("midimessage", "all");
        }
      });
    }
  };

  useEffect(() => {
    if (!midi) return;

    midi.enable((err) => {
      if (err) {
        console.error("midi could not be enabled:", err);
        return;
      }

      console.log("midi enabled!");
      console.log("Input devices:", midi.inputs);
      console.log("Output devices:", midi.outputs);

      // Add event listener for each input device
      midi.inputs.forEach((input) => {
        input.addListener("midimessage", "all", handleMidiMessage);
      });

      // Clean up event listeners when the component is unmounted
      return () => {
        midi.inputs.forEach((input) => {
          input.removeListener("midimessage", "all", handleMidiMessage);
        });
      };
    });
  }, [midi]);

  return { midi, midiEvents };
}
