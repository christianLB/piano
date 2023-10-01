// hooks/piano/useOSMDLoader.tsx
import { useEffect } from "react";

interface IOSMDLoaderOptions {
  onReady?: () => void;
}

const useOSMDLoader = (osmd, url, { onReady }: IOSMDLoaderOptions) => {
  const loadMusicXML = async (file) => {
    if (osmd && file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const musicXmlContent = event.target.result;
        await osmd.load(musicXmlContent);
        osmd.render();
        if (onReady) {
          onReady();
        }
      };
      reader.readAsText(file);
    }
  };

  // Load a sample MusicXML file on component mount
  useEffect(() => {
    if (url) {
      const loadSampleMusicXML = async () => {
        const response = await fetch(`/${url}`);
        const musicXMLContent = await response.text();
        const musicXMLFile = new File([musicXMLContent], url, {
          type: "application/xml",
        });
        loadMusicXML(musicXMLFile); // Call loadMusicXML directly, instead of using the useOSMDLoader hook
      };
      if (osmd) {
        loadSampleMusicXML();
      }
    }
  }, [osmd, url]);

  return { loadMusicXML };
};

export default useOSMDLoader;
