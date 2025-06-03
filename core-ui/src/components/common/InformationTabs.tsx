import { FC } from "react";

interface InformationTabProps {
  pages: Array<string>;
  selected: string;
  onChange: (newPage: string) => void;
}

const InformationTab: FC<InformationTabProps> = ({ pages, selected, onChange }) => {
  return (
    <div className="w-full border-b border-gray-200">
      <nav className="-mb-px flex flex-row justify-between" aria-label="Tabs">
        {pages.map(page => (
          <button
            key={page}
            className={`
                whitespace-nowrap border-b-2 font-medium text-sm w-full 
                ${
                  selected === page
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            onClick={() => onChange(page)}
          >
            {page}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default InformationTab;
