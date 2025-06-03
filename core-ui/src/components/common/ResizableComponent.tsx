import { FC, useCallback, useEffect, useRef, useState } from "react";

interface ResizableComponentProps {
  children: React.ReactNode;
  border: string;
  minWidth?: number;
  maxWidth?: number;
}

const ResizableComponent: FC<ResizableComponentProps> = ({
  children,
  border,
  minWidth = 200,
  maxWidth = 800
}) => {
  const [width, setWidth] = useState(320);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth =
          border === "right" ? e.clientX - containerRect.left : containerRect.right - e.clientX;
        setWidth(Math.max(minWidth, Math.min(newWidth, maxWidth)));
      }
    },
    [isDragging, border, minWidth, maxWidth]
  );

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className={`bg-white dark:bg-[#0A0A0A] z-50 rounded-lg shadow-container absolute h-full w-80 max-w-[33.333vw] ${
        border === "left" ? "right" : "left"
      }-0`}
      style={{ width: `${width}px` }}
    >
      {children}
      <div
        className={`absolute top-0 ${border}-0 w-1 h-full bg-transparent cursor-ew-resize`}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default ResizableComponent;
