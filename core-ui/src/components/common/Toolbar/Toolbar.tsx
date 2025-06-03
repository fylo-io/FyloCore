import { FilePenLine, Import, MessageCircle, MousePointer2 } from "lucide-react";
import { FC, useEffect } from "react";

import { ToolType, WindowSize } from "@/const";
import useWindowSize from "@/hooks/useWindowSize";
import { SourceDocument } from "@/types/document";
import toast from "react-hot-toast";
import ImportDocument from "./ImportDocument";

interface ToolbarProps {
  tool: ToolType;
  onToolChange: (newTool: ToolType) => void;
  onSubmit: (message: string) => void;
}

const Toolbar: FC<ToolbarProps> = ({ tool, onToolChange, onSubmit }) => {
  const windowSize = useWindowSize();
  const iconClass = "p-1 h-8 w-8 cursor-pointer";

  const renderIcon = (
    Icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>,
    currentTool: ToolType,
    toolType: ToolType
  ) => {
    const isActive = currentTool === toolType;

    return (
      <div
        onClick={() => onToolChange(toolType)}
        className={`flex flex-row justify-center items-center gap-1 rounded-[8px] px-1.5 py-1 cursor-pointer ${
          isActive
            ? windowSize === WindowSize.DESKTOP
              ? "bg-[#EAF3FF] dark:bg-[#27272a]"
              : "bg-[#3E4144] dark:bg-[#27272a]"
            : "hover:bg-gray-300 hover:dark:bg-gray-800"
        }`}
      >
        <Icon
          strokeWidth={1.5}
          height={windowSize === WindowSize.MOBILE ? 18 : 18}
          width={windowSize === WindowSize.MOBILE ? 18 : 18}
          className={`${iconClass} ${
            isActive
              ? windowSize === WindowSize.DESKTOP
                ? "text-[#0167F8]"
                : "text-white"
              : windowSize === WindowSize.DESKTOP
                ? ""
                : "text-white"
          }`}
        />
        {isActive && toolType === ToolType.IMPORT && (
          <span className={windowSize === WindowSize.DESKTOP ? "text-[#0167F8]" : "text-white"}>
            {toolType}
          </span>
        )}
      </div>
    );
  };

  const handleSubmit = (documents: SourceDocument[]) => {
    for (const document of documents) {
      onSubmit(document.content);
    }
    onToolChange(ToolType.DEFAULT);
  };

  const handleBack = () => {
    onToolChange(ToolType.DEFAULT);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const auth_success = urlParams.get("auth_success");

    if (auth_success) {
      toast.success("Connected to Zotero", { position: "bottom-right" });
      onToolChange(ToolType.IMPORT);
    }
  }, [onToolChange]);

  return (
    <div className="transition-all duration-300 ease-in-out">
      {/* ImportDocument Component with Slide-in Effect */}
      <div
        className={`absolute z-50 top-28 right-5 bottom-28 transition-all duration-500 ease-out transform ${
          tool === ToolType.IMPORT
            ? "translate-y-0 translate-x-0"
            : "translate-y-[500px] translate-x-[500px]"
        }`}
      >
        <ImportDocument onSubmit={handleSubmit} onBack={handleBack} />
      </div>
      <div className="absolute left-0 right-0 bottom-0">
        <div className="relative flex flex-row justify-center mb-5">
          {/* Toolbar Icons */}
          <div
            className={`w-fit z-50 shadow-container flex flex-row items-center gap-2 p-2 ${
              windowSize === WindowSize.DESKTOP ? "bg-white" : "bg-black"
            } dark:bg-[#0f0f0f] rounded-[10px] cursor-default`}
          >
            {renderIcon(MousePointer2, tool, ToolType.DEFAULT)}
            {renderIcon(Import, tool, ToolType.IMPORT)}
            {renderIcon(FilePenLine, tool, ToolType.NOTE)}
            {renderIcon(MessageCircle, tool, ToolType.COMMENT)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
