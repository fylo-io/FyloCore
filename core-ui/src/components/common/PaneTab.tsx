import { FC } from "react";

interface PaneTabProps {
  pages: Array<string>;
  selected: string;
  onChange: (newPage: string) => void;
}

const PaneTab: FC<PaneTabProps> = ({ pages, selected, onChange }) => {
  return (
    <div className="flex items-center gap-1">
      {pages.map(page => (
        <div
          key={page}
          className={`rounded-[4px] text-xs leading-[18px] font-medium py-1 px-2 cursor-pointer hover:bg-secondary  ${
            selected === page ? "bg-gray-100 dark:bg-[#27272a]" : " "
          }`}
          onClick={() => onChange(page)}
        >
          {page}
        </div>
      ))}
    </div>
  );
};

export default PaneTab;
