//@ts-nocheck
import { useState, useEffect, useRef } from "react";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import useOSMDLoader from "./useOSMDLoader.tsx";
import useCursor from "./useCursor.tsx";
import useScoreData from "./useScoreData.tsx";

const useOSMD = (elementRef, url) => {
  const [osmd, setOsmd] = useState(null);
  const osmdRef = useRef(null);
  const { getData, systemHeight } = useScoreData(osmd);

  const cursor = useCursor(
    osmd,
    elementRef.current, // Pass elementRef.current instead of containerRef.current
    systemHeight //this should be change to receive the whole scoreData interface that doesn't yet exist.
  );

  useOSMDLoader(osmd, url, {
    onReady: () => {
      getData();
      cursor.initializeCursor();
    },
  });

  useEffect(() => {
    if (!osmdRef.current && elementRef.current && url) {
      osmdRef.current = new OpenSheetMusicDisplay(elementRef.current, {
        autoResize: true,
        backend: "svg",
        drawTitle: true,
        cursorsOptions: [
          {
            type: 0,
            color: "#d2d2d2",
            alpha: 80,
            follow: true,
          },
        ],
        drawSubtitle: false,
        drawComposer: false,
        drawLyricist: false,
        drawCredits: false,
        drawPartNames: false,
        drawFingerings: true,
        renderSingleHorizontalStaffline: false,
      });
      setOsmd(osmdRef.current);
    }
  }, [elementRef, url]);

  return { osmd, ...cursor };
};

export default useOSMD;
