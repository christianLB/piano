import { useRef, useEffect } from "react";
//import { Factory, Flow } from "vexflow";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";

export function useVexFlow() {
  const sheetMusicCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (sheetMusicCanvasRef.current) {
        sheetMusicCanvasRef.current.remove();
      }
    };
  }, []);

  const renderMusicXML = (xmlContent: string) => {
    if (sheetMusicCanvasRef.current) {
      const osmd = new OpenSheetMusicDisplay(sheetMusicCanvasRef.current, {
        autoResize: true,
      });
      osmd.load(xmlContent).then(() => {
        osmd.render();
      });
    }
  };

  return {
    sheetMusicCanvasRef,
    renderMusicXML,
  };
}

export default useVexFlow;
