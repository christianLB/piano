import { useState, useEffect } from "react";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";

const useScoreHighlighter = (osmd: OpenSheetMusicDisplay | null) => {
  const [highlightedElement, setHighlightedElement] = useState<number | null>(
    null
  );

  const highlightElement = (elementIndex: number, color: string) => {
    const measure = osmd?.GraphicSheet.MeasureList[0][0]; // Get the first measure of the first staff
    const element =
      measure?.staffEntries[elementIndex]?.graphicalVoiceEntries[0]?.notes[0];

    if (element) {
      element.sourceNote.NoteheadColor = color; // Change the color
      setHighlightedElement(elementIndex);
      osmd?.render();
    }
  };

  const highlightGreen = (elementIndex: number) => {
    highlightElement(elementIndex, "#00ff00");
  };

  const highlightRed = (elementIndex: number) => {
    highlightElement(elementIndex, "#ff0000");
  };

  const highlightBlack = (elementIndex: number) => {
    highlightElement(elementIndex, "#000000");
  };

  const highlightBlue = (elementIndex: number) => {
    highlightElement(elementIndex, "#0000ff");
  };

  // const addHoverHandlers = () => {
  //   console.log("hoverHandlers");
  //   if (osmd && osmd.GraphicSheet) {
  //     console.log("GraphicSheet");
  //     const measures = osmd.GraphicSheet.MeasureList;
  //     measures.forEach((measureList) => {
  //       console.log(measureList);
  //       measureList.forEach((measure, elementIndex) => {
  //         measure.staffEntries.forEach((staffEntry) => {
  //           staffEntry.graphicalVoiceEntries.forEach((voiceEntry) => {
  //             voiceEntry.notes.forEach((note) => {
  //               console.log(note);
  //               note.setHoverHandler(
  //                 () => {
  //                   highlightBlue(elementIndex); // Blue on hover
  //                 },
  //                 () => {
  //                   highlightBlack(elementIndex); // Black when hovering out
  //                 }
  //               );
  //             });
  //           });
  //         });
  //       });
  //     });
  //   }
  // };

  // useEffect(() => {
  //   if (osmd?.GraphicSheet) {
  //     addHoverHandlers();
  //   }
  // }, [osmd?.GraphicSheet]);

  return {
    highlightedElement,
    highlightElement,
    highlightGreen,
    highlightRed,
    highlightBlack,
    highlightBlue,
  };
};

export default useScoreHighlighter;
