import { useReactFlow } from "@xyflow/react";
import { FC } from "react";

import CustomTooltip from "@/components/common/CustomTooltip";

interface DocumentItemProps {
  id: string;
  title: string;
  description: string;
  type: string;
  count: number;
  x: number;
  y: number;
  isSelected: boolean;
  selectDocument: (value: string | null) => void;
}

const DocumentItem: FC<DocumentItemProps> = ({
  id,
  title,
  description,
  type,
  count,
  x,
  y,
  isSelected,
  selectDocument
}) => {
  const { setCenter } = useReactFlow();

  return (
    <CustomTooltip
      content={
        <div className="flex flex-col gap-2">
          <p className="text-[12px] italic">{title}</p>
          <p className="text-[10px]">{description}</p>
        </div>
      }
    >
      <div
        className={`py-2 px-2 rounded-[5px] ${
          !isSelected ? "bg-transparent" : "bg-gray-100 dark:bg-[#27272a]"
        } flex justify-between items-center hover:bg-secondary hover:dark:bg-secondary cursor-pointer`}
        onClick={() => {
          selectDocument(id);
          setCenter(x, y, { zoom: 0.5, duration: 1000 });
        }}
      >
        <span className="text-xs truncate">{title}</span>
        <div className="flex gap-1 items-center">
          <span className="text-[10px] leading-[15px] font-semibold">{count}</span>
          <span className="text-[10px] leading-[15px] font-semibold">{type}</span>
        </div>
      </div>
    </CustomTooltip>
  );
};

export default DocumentItem;
