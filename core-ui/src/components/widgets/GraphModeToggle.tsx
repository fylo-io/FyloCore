import classNames from "classnames";
import { FC } from "react";

interface GraphModeToggleProps {
  mode: string;
  setMode: (newMode: string) => void;
  onModeChange: (newMode: string) => void;
  options: string[];
}

const GraphModeToggle: FC<GraphModeToggleProps> = ({ mode, setMode, onModeChange, options }) => {
  return (
    <div className="top-5 left-1/3 flex justify-center space-x-2 z-40 absolute">
      <button
        onClick={() => {
          setMode("DEFAULT");
          onModeChange("DEFAULT");
        }}
        className={classNames("rounded-md px-4 py-2 font-bold", {
          "bg-black text-white": mode === "DEFAULT",
          "bg-gray-300 text-black": mode !== "DEFAULT"
        })}
      >
        DEFAULT
      </button>

      {options.map(option => (
        <button
          key={`option-key-${option}`}
          onClick={() => {
            setMode(option);
            onModeChange(option);
          }}
          className={classNames("rounded-md px-4 py-2 font-bold", {
            "bg-black text-white": mode === option,
            "bg-gray-300 text-black": mode !== option
          })}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default GraphModeToggle;
