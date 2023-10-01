import Head from "next/head";
import { useRef } from "react";
import useOSMD from "../hooks/piano/useOSMD.tsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faStop,
  faStepBackward,
  faStepForward,
  faMinus,
  faEquals,
  faRefresh,
  faPlus,
  faKeyboard,
  faMusic,
} from "@fortawesome/free-solid-svg-icons";
import PianoRoll from "../components/piano/PianoRoll.tsx";
import usePayloadCollection from "../hooks/usePayloadCollection.ts";
import useSelect from "../hooks/useSelect.tsx";

export default function Piano() {
  const containerRef = useRef(null);
  const { arrayData: scores } = usePayloadCollection({
    collection: "scores",
    fetchOnInit: true,
  });
  const { selected: selectedScore, SelectComponent: ScoreSelect } = useSelect({
    options: scores,
    labelKey: "title",
    valueKey: "content",
  });

  const {
    osmd,
    prev,
    stop,
    next,
    play,
    pause,
    reset,
    getNoteName,
    toggleHandSelection,
    isPlaying,
    currentMeasure,
    currentBeatNotesInfo,
    midiEvents,
    currentNotesOn,
    selectedHands,
  } = useOSMD(containerRef, selectedScore);

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Piano</title>
        <meta name="description" content="piano for all" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex-1 p-4 md:p-8">
        <div ref={containerRef} className="osmd-container" />
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10 text-center font-cinzel text-2xl">
          <div>
            Measure: {currentMeasure} | Notes:{" "}
            {currentBeatNotesInfo.map((note) => note.noteName).join(", ")}
          </div>
          <div>
            current notes:{" "}
            {currentNotesOn.map((note) => getNoteName(note)).join(", ")}
          </div>
        </div>
        <div className="fixed top-2 right-2 flex flex-col gap-2 bg-white rounded-lg p-2 shadow-lg">
          <div className="flex">{ScoreSelect}</div>
          <div className="flex flex-row">
            <div className="flex gap-2 mb-2">
              {!isPlaying && (
                <button onClick={play}>
                  <FontAwesomeIcon icon={faPlay} />
                </button>
              )}
              {isPlaying && (
                <button onClick={stop}>
                  <FontAwesomeIcon icon={faStop} />
                </button>
              )}
              <button onClick={pause} disabled={!isPlaying}>
                <FontAwesomeIcon icon={faPause} />
              </button>
              <button onClick={reset}>
                <FontAwesomeIcon icon={faRefresh} />
              </button>
            </div>
            <div className="flex gap-4 mb-4">
              <button onClick={prev}>
                <FontAwesomeIcon icon={faStepBackward} />
              </button>
              <button onClick={next}>
                <FontAwesomeIcon icon={faStepForward} />
              </button>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setPlaybackSpeed(0.5)}>
                <FontAwesomeIcon icon={faMinus} />
              </button>
              <button onClick={() => setPlaybackSpeed(1)}>
                <FontAwesomeIcon icon={faEquals} />
              </button>
              <button onClick={() => setPlaybackSpeed(1.5)}>
                <FontAwesomeIcon icon={faPlus} />
              </button>
              <button
                className={`${
                  selectedHands.right ? "text-red-500" : "text-gray-500"
                }`}
                onClick={() => toggleHandSelection("right")}
              >
                <FontAwesomeIcon icon={faKeyboard} />
              </button>
              <button
                className={`${
                  selectedHands.left ? "text-red-500" : "text-gray-500"
                }`}
                onClick={() => toggleHandSelection("left")}
              >
                <FontAwesomeIcon icon={faMusic} />
              </button>
            </div>
          </div>
        </div>
        <div className={"fixed top-2 left-2"}>
          <PianoRoll midiEvents={midiEvents} />
        </div>
      </main>
      <style jsx>{`
        .osmd-container {
          margin-bottom: 1rem;
        }

        .font-cinzel {
          font-family: "Cinzel", serif;
        }

        button {
          background: #ffffff;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 1rem;
          cursor: pointer;
          box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.1),
            -6px -6px 12px rgba(255, 255, 255, 0.7);
          transition: all 0.2s ease;
          width: 50px;
          height: 50px;
        }

        button:hover {
          box-shadow: inset 4px 4px 8px rgba(0, 0, 0, 0.1),
            inset -4px -4px 8px rgba(255, 255, 255, 0.7);
        }
      `}</style>
    </div>
  );
}
