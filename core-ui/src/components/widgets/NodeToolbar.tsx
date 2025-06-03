import { SignInStatus } from "@/const";
import { cn } from "@/lib/utils";
import { useEditStore } from "@/store/useEditStore";
import { useUserStore } from "@/store/useUserStore";
import { DefaultNodeProps } from "@/types/detailSidePanel";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import {
  ChevronDown,
  FileCheck,
  FileSearch,
  FileSearch2,
  MessageCircle,
  Pencil,
  Plus,
  Trash
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import EditNodeModal from "../common/EditNodeModal";
import { LoginModal } from "../common/LoginModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/Tooltip";

interface NodeToolBarProps extends DefaultNodeProps {
  isEditing: boolean;
}

type NodeToolbarItem = {
  label: string;
  icon?: JSX.Element;
  toolTipContent?: string;
  subMenu?: NodeToolbarItem[];
  onClick?: () => void;
};

export const NodeToolBarComponent = memo(({ id, data, isEditing }: NodeToolBarProps) => {
  const [subMenuOpenIndex, setSubMenuOpenIndex] = useState<number | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [editModalIsOpen, setEditModalIsOpen] = useState<boolean>(false);
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);

  const setAddAction = useEditStore(state => state.setAddAction);
  const setDeleteAction = useEditStore(state => state.setDeleteAction);
  const startEditing = useEditStore(state => state.startEditing);
  const stopEditing = useEditStore(state => state.stopEditing);
  const user = useUserStore(state => state.user);

  // Callback for deleting a node, checks user authentication first
  const handleDeleteNode = useCallback(
    (id: string) => {
      if (user !== SignInStatus.NOT_SIGNED && user !== SignInStatus.UNKNOWN) {
        setDeleteAction(id);
      } else {
        setModalIsOpen(true);
      }
    },
    [user, setDeleteAction]
  );

  // Effect to handle editing state
  useEffect(() => {
    if (isEditing) {
      startEditing(id);
    } else {
      stopEditing();
    }
  }, [isEditing, id, startEditing, stopEditing]);

  // Effect to close sub-menu when clicking outside
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!toolbarRef.current?.contains(e.target as Node)) {
        setSubMenuOpenIndex(null);
      }
    };
    document.addEventListener("click", onClickOutside);
    return () => {
      document.removeEventListener("click", onClickOutside);
    };
  }, []);

  // Memoized array of toolbar actions
  const NodeToolBarActions: NodeToolbarItem[] = useMemo(
    () => [
      {
        label: "Add Node",
        toolTipContent: "Add Node",
        icon: <Plus className="w-4 h-4 stroke-[#a5aaaa]" />,
        subMenu: [
          {
            label: "Investigation Node",
            icon: <FileSearch className="w-4 h-4 stroke-white" />,
            onClick: () => setAddAction(id, "Investigation")
          },
          {
            label: "Question Node",
            icon: <MessageCircle className="w-4 h-4 stroke-white" />,
            onClick: () => setAddAction(id, "Question")
          },
          {
            label: "Claim Node",
            icon: <FileCheck className="w-4 h-4 stroke-white" />,
            onClick: () => setAddAction(id, "Claim")
          },
          {
            label: "Evidence Node",
            icon: <FileSearch2 className="w-4 h-4 stroke-white" />,
            onClick: () => setAddAction(id, "Evidence")
          }
        ]
      },
      {
        label: "Edit",
        toolTipContent: "Edit",
        icon: <Pencil className="w-4 h-4 stroke-[#a5aaaa]" />,
        onClick: () => setEditModalIsOpen(true)
      },
      {
        label: "Delete",
        toolTipContent: "Delete",
        icon: <Trash className="w-4 h-4 stroke-[#a5aaaa]" />,
        onClick: () => handleDeleteNode(id)
      }
    ],
    [id, handleDeleteNode, setAddAction]
  );

  // Handler for action clicks
  const handleActionClick = useCallback(
    (action: NodeToolbarItem, i: number) => {
      action.onClick?.();
      setSubMenuOpenIndex(subMenuOpenIndex === i ? null : i);
    },
    [subMenuOpenIndex]
  );

  return (
    <>
      {modalIsOpen &&
        createPortal(<LoginModal close={() => setModalIsOpen(false)} />, document.body)}
      {editModalIsOpen &&
        createPortal(
          <EditNodeModal id={id} close={() => setEditModalIsOpen(false)} />,
          document.body
        )}
      <div ref={toolbarRef} className="flex w-fit h-10 items-center justify-center text-white">
        <div className="flex w-full h-full rounded-sm overflow-hidden bg-[#1E1E1E]">
          <TooltipProvider delayDuration={350}>
            {NodeToolBarActions.map((action, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex w-full h-full items-center border-r-[0.5px] last:border-r-0 border-[#292929] hover:bg-[#313131]",
                      i === 0 ? "px-3 space-x-1" : "px-4",
                      subMenuOpenIndex === 0 && i === 0 && "bg-[#313131]"
                    )}
                    onClick={e => {
                      handleActionClick(action, i);
                      e.stopPropagation();
                    }}
                  >
                    {action.icon}
                    {action.label === "Add Node" && (
                      <ChevronDown className="w-2.5 h-2.5 justify-end" />
                    )}
                    {subMenuOpenIndex === 0 && action.subMenu && (
                      <div className="absolute -right-[1px] top-[42px] bg-[#1E1E1E] py-3 px-2.5 rounded-sm text-nowrap z-[1000]">
                        {action.subMenu.map((sub, index) => (
                          <div
                            key={index}
                            onClick={sub.onClick}
                            className="py-3 px-2 rounded-[7px] flex items-center gap-2 hover:bg-[#313131] z-[1000] cursor-pointer"
                          >
                            {sub.icon}
                            {sub.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                {subMenuOpenIndex !== 0 && (
                  <TooltipContent>
                    <p>{action.toolTipContent}</p>
                    <TooltipArrow className="fill-[#1e1e1e]" />
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>
    </>
  );
});

NodeToolBarComponent.displayName = "NodeToolBarComponent";
