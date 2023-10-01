//@ts-nocheck
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import { useState } from "react";

const useScoreData = (osmd: OpenSheetMusicDisplay | null) => {
  const [data, setData] = useState<any>({});
  const getSystemHeight = (systemNumber: number = 0) => {
    if (osmd) {
      const musicSystems = osmd.graphic?.musicPages[0]?.musicSystems;
      if (musicSystems && musicSystems.length > 0) {
        const firstSystem = musicSystems[0];
        const staffLines = firstSystem.staffLines;
        if (staffLines.length >= 2) {
          const topStaffLine =
            staffLines[0].PositionAndShape.AbsolutePosition.y;
          const bottomStaffLine =
            staffLines[1].PositionAndShape.AbsolutePosition.y;
          const systemHeight = Math.abs(bottomStaffLine - topStaffLine);
          return systemHeight;
        }
      }
    }
    return 0;
  };

  const getData = () => {
    const data = {
      systemHeight: getSystemHeight(),
    };
    console.log("data", data);
    setData(data);
  };

  return {
    getData,
    ...data,
  };
};

export default useScoreData;
