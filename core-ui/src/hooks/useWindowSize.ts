import { WindowSize } from "@/const";
import { useEffect, useState } from "react";

const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>(WindowSize.UNKNOWN);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setWindowSize(WindowSize.MOBILE);
      else setWindowSize(WindowSize.DESKTOP);
    };

    // Call on mount to set initial screen size
    handleResize();

    // Add event listener for window resizing
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return windowSize;
};

export default useWindowSize;
