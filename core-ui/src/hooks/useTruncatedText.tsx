import { useCallback, useEffect, useState } from "react";

export const useTruncateText = (text: string, elementRef: React.RefObject<HTMLElement>) => {
  const [truncatedText, setTruncatedText] = useState(text);

  const truncateText = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    let low = 0;
    let high = text.length;
    let mid;

    while (low <= high) {
      mid = Math.floor((low + high) / 2);
      const truncated = text.slice(0, mid) + "...";
      element.textContent = truncated;

      if (element.scrollWidth <= element.clientWidth) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    const finalText = text.slice(0, high) + (high < text.length ? "..." : "");
    setTruncatedText(finalText);
  }, [text, elementRef]);

  useEffect(() => {
    truncateText();
    window.addEventListener("resize", truncateText);
    return () => window.removeEventListener("resize", truncateText);
  }, [truncateText]);

  return truncatedText;
};
