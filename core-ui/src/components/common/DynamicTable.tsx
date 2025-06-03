import { FC, useCallback, useEffect, useRef, useState } from "react";

interface DynamicTableProps {
  topContent: React.ReactNode;
  bottomContent: React.ReactNode;
  minTopHeight?: number;
  minBottomHeight?: number;
}

const DynamicTable: FC<DynamicTableProps> = ({
  topContent,
  bottomContent,
  minTopHeight = 50,
  minBottomHeight = 50
}) => {
  const [topHeight, setTopHeight] = useState<number>(200);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const initialY = useRef<number>(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      initialY.current = e.clientY - topHeight;
    },
    [topHeight]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && tableRef.current) {
        const newTopHeight = e.clientY - initialY.current;
        const totalHeight = tableRef.current.clientHeight;

        setTopHeight(Math.max(minTopHeight, Math.min(newTopHeight, totalHeight - minBottomHeight)));
      }
    },
    [isDragging, minTopHeight, minBottomHeight]
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
    <div ref={tableRef} className="w-full h-full flex flex-col overflow-hidden">
      <div className="overflow-auto flex-shrink-0" style={{ height: `${topHeight}px` }}>
        {topContent}
      </div>
      <div
        className="h-0.5 bg-[#f0f0f0] dark:bg-[#262626] cursor-row-resize flex-shrink-0"
        onMouseDown={handleMouseDown}
      ></div>
      <div className="overflow-auto flex-grow">{bottomContent}</div>
    </div>
  );
};

export default DynamicTable;
