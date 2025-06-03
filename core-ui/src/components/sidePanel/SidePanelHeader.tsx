import { X } from "lucide-react";

type NodeType = "Question" | "Investigation" | "Evidence" | "Claim";
interface HeaderProps {
  //? title => the text on each node, data.id.
  title: string;
  node_type: NodeType;
  close: () => void;
}

const themes: Record<string, string> = {
  Investigation: "bg-[#FDE047] text-[#422006] dark:bg-[#422006] dark:text-[#FDE047]",
  Question: "bg-[#60A5FA] text-[#172554] dark:bg-[#172554] dark:text-[#60A5FA]",
  Evidence: "bg-[#E879F9] text-[#4a044e] dark:bg-[#4a044e] dark:text-[#E879F9]",
  Claim: "bg-[#A3E635] text-[#1A2E05] dark:bg-[#1A2E05] dark:text-[#A3E635]"
};

const SidePanelHeader = ({ title, node_type, close }: HeaderProps) => (
  <div className="sticky top-0 pt-4 bg-sidePanel-background bg-opacity-100 z-20 flex flex-col gap-y-2 pb-[20px]">
    <div className="flex gap-x-4">
      <p className="text-[16px] font-medium text-sidePanel-text_primary leading-[1.40] tracking-[0]">
        {title}
      </p>
      <button
        onClick={close}
        className="flex items-center ml-auto justify-center w-6 h-6 mt-0.5 flex-shrink-0 rounded-[20px] border hover:bg-[#acacac]"
      >
        <X className="h-3 w-3 flex-flex-shrink-0 dark:stroke-[#f5f5f5]" />
      </button>
    </div>
    <div
      className={`w-fit h-fit rounded-full px-4 py-[2px] text-[10px] font-semibold leading-[1.40] tracking-tighters  ${themes[node_type]}`}
    >
      {node_type.toUpperCase()}
    </div>
  </div>
);
export default SidePanelHeader;
