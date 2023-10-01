import { useRef, useEffect } from "react";
import Head from "next/head";
import useMidi from "../hooks/piano/useMidi.tsx";
import useScore from "../hooks/piano/useScore.tsx";
import useProgressTracking from "../hooks/piano/useProgressTracking.tsx";
import PianoRoll from "../components/piano/PianoRoll.tsx";

export default function Piano() {
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const xmlContent = e.target.result;

        if (sheetMusicContainerRef.current) {
          loadScore(xmlContent, sheetMusicContainerRef.current);
        }
      };
      reader.readAsText(file);
    }
  };

  const sheetMusicContainerRef = useRef();
  const { midiEvents } = useMidi();
  const {
    osmd,
    loadScore,
    compareMidiEventWithNote,
    notes,
    handleMidiEvent,
    setLeftHandProgress,
    setRightHandProgress,
  } = useScore();

  const { leftHandProgress, rightHandProgress } = useProgressTracking(
    osmd,
    notes,
    handleMidiEvent,
    setLeftHandProgress,
    setRightHandProgress
  );

  useEffect(() => {
    if (!midiEvents || midiEvents.length === 0) return;

    const latestMidiEvent = midiEvents[midiEvents.length - 1];
    handleMidiEvent(latestMidiEvent);
  }, [midiEvents, notes, osmd]);

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Piano</title>
        <meta name="description" content="piano for all" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex-1 p-4 md:p-8">
        <input
          type="file"
          accept="text/xml,.xml,.musicxml"
          onChange={handleFileUpload}
        />
        <div ref={sheetMusicContainerRef}></div>
        <PianoRoll midiEvents={midiEvents} />
      </main>
    </div>
  );
}
