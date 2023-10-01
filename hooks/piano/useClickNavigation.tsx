import { useEffect, useState } from "react";

const useClickNavigation = (osmd, container) => {
  const [selectedMeasure, setSelectedMeasure] = useState<Number>(0);
  const [selectedVoiceEntry, setSelectedVoiceEntry] = useState<Number>(0);
  useEffect(() => {
    if (!osmd || !container) return;

    const handleClickOnSheet = (event) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      let nearestDistance = Infinity;
      let nearestElement = null;

      const measureList = osmd.GraphicSheet.MeasureList;

      for (let i = 0; i < measureList.length; i++) {
        const staffEntries = measureList[i][0].staffEntries;
        for (const staffEntry of staffEntries) {
          const graphicalVoiceEntries = staffEntry.graphicalVoiceEntries;
          for (const graphicalVoiceEntry of graphicalVoiceEntries) {
            const notes = graphicalVoiceEntry.notes;
            for (const note of notes) {
              const bbox = note.getSVGGElement().getBBox();
              const distance = Math.sqrt(
                Math.pow(x - bbox.x, 2) + Math.pow(y - bbox.y, 2)
              );

              if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestElement = note;
              }
            }
          }
        }
      }

      if (nearestElement) {
        const {
          sourceNote: { sourceMeasure },
          parentVoiceEntry,
        } = nearestElement;
        const voiceEntry = parentVoiceEntry;
        const measureIndex = sourceMeasure.measureListIndex;
        const voiceEntryIndex =
          sourceMeasure.VerticalSourceStaffEntryContainers.findIndex(
            (container) =>
              container.sourceStaffEntry === voiceEntry.parentStaffEntry
          );

        setSelectedMeasure(measureIndex);
        setSelectedVoiceEntry(voiceEntryIndex);
        //osmd.cursor.iterator.currentMeasureIndex = measureIndex;
        //osmd.cursor.iterator.currentVoiceEntryIndex = voiceEntryIndex;
      }
    };

    container.addEventListener("click", handleClickOnSheet);

    return () => {
      container.removeEventListener("click", handleClickOnSheet);
    };
  }, [osmd, container]);

  return {
    selectedMeasure,
    selectedVoiceEntry,
  };
};

export default useClickNavigation;
