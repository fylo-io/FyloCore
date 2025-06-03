import { useReactFlow } from "@xyflow/react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CirclePlus,
  PanelLeft,
  Search
} from "lucide-react";
import Image from "next/image";
import { FC, useEffect, useState } from "react";

import { Document, Node } from "@/types/structure";
import CustomTooltip from "../CustomTooltip";
import DynamicTable from "../DynamicTable";
import InformationTabs from "../InformationTabs";
import Menu from "../Menu";
import ResizableComponent from "../ResizableComponent";
import DocumentItem from "./DocumentItem";

interface GraphInformationProps {
  graphName: string;
  documents: Document[];
  nodes: Node[];
  downloadGraph: () => void;
  // eslint-disable-next-line
  uploadGraphDataFromJSON: (graphData: any) => void;
}

const GraphInformation: FC<GraphInformationProps> = ({
  graphName,
  documents,
  nodes,
  downloadGraph,
  uploadGraphDataFromJSON
}) => {
  const [show, setShow] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDocumentSectionHidden, setDocumentSectionHidden] = useState(true);
  const [isNodesSectionHidden, setNodesSectionHidden] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("Graphs");
  const [isOpen, setOpen] = useState<boolean[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const { setCenter } = useReactFlow();

  useEffect(() => {
    setOpen(Array(nodes.length).fill(false));
  }, [nodes.length]);

  const renderNodeItem = (nodeData: Node, depth: number) => {
    const index = nodes.indexOf(nodeData);

    return (
      <div className="flex flex-col gap-1" key={`sidebar-node-${nodeData.id}`}>
        <CustomTooltip
          content={
            <div className="flex flex-col gap-2">
              <p className="text-[12px] italic">{nodeData.title}</p>
              <p className="text-[10px]">{nodeData.description}</p>
            </div>
          }
        >
          <div
            className={`flex items-center justify-between py-1 rounded-[4px] ${
              selectedNode !== nodeData.id
                ? "bg-white dark:bg-[#0A0A0A]"
                : "bg-secondary dark:bg-secondary"
            } hover:bg-secondary hover:dark:bg-secondary cursor-pointer`}
            style={{ paddingLeft: `${8 + 16 * depth}px` }}
            onClick={() => {
              const newOpen = [...isOpen];
              newOpen[index] = !newOpen[index];
              setOpen(newOpen);
              setSelectedNode(nodeData.id);
              setCenter(nodeData.x, nodeData.y, { zoom: 0.5, duration: 1000 });
            }}
          >
            <div className="flex items-center gap-1 w-[80%]">
              {nodeData.childNodeIds.length > 0 &&
                (isOpen[index] ? (
                  <ChevronDownIcon className="h-3 w-3 cursor-pointer" />
                ) : (
                  <ChevronRightIcon className="h-3 w-3 cursor-pointer" />
                ))}
              <span className="text-xs truncate">{nodeData.title}</span>
            </div>
            <span className="bg-white dark:bg-[#0A0A0A] px-2 text-[10px] leading-4 font-medium rounded-[4px]">
              {nodeData.type}
            </span>
          </div>
        </CustomTooltip>
        <div className="pl-2">
          {nodeData.childNodeIds.length > 0 &&
            isOpen[index] &&
            nodeData.childNodeIds.map(child => {
              const nextNode = nodes.find(nd => nd.id === child)!;
              return renderNodeItem(nextNode, depth + 1);
            })}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`absolute left-7 top-6 ${
        show ? "bottom-40 w-80" : "w-32"
      } z-40 bg-transparent transition-all duration-500 ease-in-out cursor-default`}
    >
      {show ? (
        <ResizableComponent border="right">
          <div className="flex flex-col h-full">
            {/* Top Section */}
            <div className="flex flex-col w-full p-3 gap-5 border-solid border-[#f0f0f0] dark:border-[#262626]">
              <div className="flex items-center justify-between w-full">
                <Image src="/images/fylo-logo.svg" alt="Fylogenesis" height={30} width={35} />
                <p
                  className="m-0 text-base font-semibold cursor-pointer"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  {graphName}
                </p>
                {showMenu && (
                  <Menu
                    download={downloadGraph}
                    hideMenu={() => setShowMenu(false)}
                    uploadGraphDataFromJSON={uploadGraphDataFromJSON}
                  />
                )}
                <PanelLeft
                  className="cursor-pointer"
                  strokeWidth={1.5}
                  onClick={() => setShow(!show)}
                />
              </div>
              <div className="flex flex-row items-center bg-[#EEEEEE] rounded-[8px] p-3">
                <Search size={20} strokeWidth={1.8} />
                <input
                  type="text"
                  className="bg-transparent outline-none focus:ring-0 focus:outline-none"
                  placeholder="  Search.."
                />
              </div>
            </div>
            {/* Tab Section */}
            <div className="flex flex-col w-full p-3">
              <InformationTabs
                pages={["Graphs", "Ontologies"]}
                selected={selectedTab}
                onChange={newPage => setSelectedTab(newPage)}
              />
            </div>
            <DynamicTable
              topContent={
                <div className="flex flex-col w-full items-center justify-between gap-1 p-3 border-[#f0f0f0] dark:border-[#262626]">
                  <div
                    className="w-full flex flex-row justify-between items-center cursor-pointer"
                    onClick={() => setDocumentSectionHidden(!isDocumentSectionHidden)}
                  >
                    <div className="flex flex-row items-center gap-2">
                      <div className="h-2 w-2 rounded-full border-2 border-[#777C83]" />
                      <p className="m-0 text-sm font-semibold text-primary">Documents</p>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <CirclePlus color="#74797E" size={20} />
                      {isDocumentSectionHidden ? (
                        <ChevronDownIcon className="h-5 w-5 cursor-pointer" color="#74797E" />
                      ) : (
                        <ChevronUpIcon className="h-5 w-5 cursor-pointer" color="#74797E" />
                      )}
                    </div>
                  </div>
                  <div className="w-full">
                    {!isDocumentSectionHidden && (
                      <div className="flex flex-col pl-1.5 gap-1">
                        {documents.map((d, index) => (
                          <DocumentItem
                            key={`sidebar-document-${index}`}
                            {...d}
                            isSelected={selectedDocument === d.id}
                            selectDocument={setSelectedDocument}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              }
              bottomContent={
                <div className="flex flex-col w-full items-center justify-between gap-5 p-3">
                  <div className="w-full flex items-center justify-between">
                    <div
                      className="w-full flex flex-row justify-between items-center cursor-pointer"
                      onClick={() => setNodesSectionHidden(!isNodesSectionHidden)}
                    >
                      <div className="flex flex-row items-center gap-2">
                        <div className="h-2 w-2 rounded-full border-2 border-[#777C83]" />
                        <p className="m-0 text-sm font-semibold text-primary">Nodes</p>
                      </div>
                      {isNodesSectionHidden ? (
                        <ChevronDownIcon className="h-5 w-5 cursor-pointer" color="#74797E" />
                      ) : (
                        <ChevronUpIcon className="h-5 w-5 cursor-pointer" color="#74797E" />
                      )}
                    </div>
                  </div>
                  {!isNodesSectionHidden && (
                    <div className="flex flex-col w-full gap-1">
                      {nodes
                        .filter(nd => nd.parentId === selectedDocument)
                        .map(n => renderNodeItem(n, 0))}
                    </div>
                  )}
                </div>
              }
            />
          </div>
        </ResizableComponent>
      ) : (
        <div className="bg-white dark:bg-[#0A0A0A] shadow-container rounded-lg flex flex-row w-full p-3 items-center justify-between">
          <Image src="/images/fylo-logo.svg" alt="Fylogenesis" height={30} width={35} />
          <PanelLeft className="cursor-pointer" strokeWidth={1.5} onClick={() => setShow(!show)} />
        </div>
      )}
    </div>
  );
};

export default GraphInformation;
