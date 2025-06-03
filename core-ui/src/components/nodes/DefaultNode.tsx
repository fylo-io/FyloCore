import { Handle, NodeToolbar, Position, useStore } from "@xyflow/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, ChevronDownIcon, ChevronUpIcon, FilePenLine, MessageCircle } from "lucide-react";
import { FC, memo, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import CommentBox from "@/components/widgets/CommentBox";
import { SignInStatus } from "@/const";
import useCommentStore from "@/store/useCommentStore";
import { useDetailPanelStore } from "@/store/useDetailPanelStore";
import { useSelectedNodeStore } from "@/store/useSelectedNode";
import { useUserStore } from "@/store/useUserStore";
import { DefaultNodeProps } from "@/types/detailSidePanel";
import { Badge } from "../ui/Badge";
import { NodeToolBarComponent } from "../widgets/NodeToolbar";
interface ExpandedContentProps {
  data: string | undefined;
  viewDetails: (state: boolean) => void;
}

const ExpandedContent = memo(({ data, viewDetails }: ExpandedContentProps) => (
  <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: "auto", opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <CardContent
      id="default-content"
      className="px-4 pt-4 flex flex-col rounded-b-[16px] truncate text-wrap"
    >
      <p className="text-sm mb-4 font-light tracking-wide">{data}</p>
    </CardContent>
    <div className="relative flex items-center justify-between gap-x-[2px] h-10 px-6 rounded-b-[16px] pt-2 bg-border">
      <span className="font-medium text-[10px] text-[#80858C]"></span>
      <button onClick={() => viewDetails(true)} className="font-medium text-[10px] text-foreground">
        View Details
      </button>
      <div className="absolute w-full -top-1 left-0 bg-[#ffffff] rounded-b-[40px]"></div>
    </div>
  </motion.div>
));
ExpandedContent.displayName = "ExpandedContent";

const DefaultNode: FC<DefaultNodeProps> = memo(({ id, data }: DefaultNodeProps) => {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCircle, setShowCircle] = useState(false);
  const [circlePosition, setCirclePosition] = useState<number[]>([]);
  const zoom = useStore(state => state.transform[2]);
  const [input, setInput] = useState(false);
  const [content, setContent] = useState("");
  const [commentVisible, setCommentVisible] = useState(false);
  const [isHover, setHover] = useState(false);
  const [originType, setOriginType] = useState("");
  const type = useCommentStore(state => state.type);
  const setType = useCommentStore(state => state.setType);
  const setText = useCommentStore(state => state.setText);
  const setNodeId = useCommentStore(state => state.setNodeId);
  const markAsReady = useCommentStore(state => state.markAsReady);
  const user = useUserStore(state => state.user);
  const isContributor = useUserStore(state => state.isContributor);
  const setPanelIsOpen = useDetailPanelStore(state => state.setPanelIsOpen);
  const selectedNode = useSelectedNodeStore(state => state.selectedNode);

  useEffect(() => {
    setOriginType(type.slice(Math.floor(type.length / 5) * 5));
  }, [type]);

  useEffect(() => {
    if (data.comments && data.comments.length) setCommentVisible(true);
    else setCommentVisible(false);
  }, [data]);

  useEffect(() => {
    setInput(false);
    setContent("");
    setHover(false);
  }, [originType]);

  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!nodeRef.current) return;
    const rect = nodeRef.current.getBoundingClientRect();

    const ratio = (rect.right - rect.left) / 298;
    const radius = ratio * 24;

    const x1 = rect.left + radius,
      y1 = rect.top + radius;
    const x2 = rect.right - radius,
      y2 = rect.bottom - radius;
    const mx = event.clientX,
      my = event.clientY;

    const getDistance = (sx: number, sy: number, ex: number, ey: number) => {
      return Math.sqrt((ex - sx) * (ex - sx) + (ey - sy) * (ey - sy));
    };

    let onBorder = false;
    if (
      Math.abs(radius * 1.05 - getDistance(mx, my, x1, y1)) < 3 &&
      x1 - radius * 1.05 <= mx &&
      mx <= x1 &&
      y1 - radius * 1.05 <= my &&
      my <= y1
    ) {
      const rat = radius / getDistance(mx, my, x1, y1);
      setCirclePosition([
        (x1 - rat * (x1 - mx) - (x1 - radius)) / ratio,
        (y1 - rat * (y1 - my) - (y1 - radius)) / ratio
      ]);
      onBorder = true;
    }
    if (
      Math.abs(radius * 1.05 - getDistance(mx, my, x1, y2)) < 3 &&
      x1 - radius * 1.05 <= mx &&
      mx <= x1 &&
      y2 <= my &&
      my <= y2 + radius * 1.05
    ) {
      const rat = radius / getDistance(mx, my, x1, y2);
      setCirclePosition([
        (x1 - rat * (x1 - mx) - (x1 - radius)) / ratio,
        (y2 + rat * (my - y2) - (y1 - radius)) / ratio
      ]);
      onBorder = true;
    }
    if (
      Math.abs(radius * 1.05 - getDistance(mx, my, x2, y2)) < 3 &&
      x2 <= mx &&
      mx <= x2 + radius * 1.05 &&
      y2 <= my &&
      my <= y2 + radius * 1.05
    ) {
      const rat = radius / getDistance(mx, my, x2, y2);
      setCirclePosition([
        (x2 + rat * (mx - x2) - (x1 - radius)) / ratio,
        (y2 + rat * (my - y2) - (y1 - radius)) / ratio
      ]);
      onBorder = true;
    }
    if (
      Math.abs(radius * 1.05 - getDistance(mx, my, x2, y1)) < 3 &&
      x2 <= mx &&
      mx <= x2 + radius * 1.05 &&
      y1 - radius * 1.05 <= my &&
      my <= y1
    ) {
      const rat = radius / getDistance(mx, my, x2, y1);
      setCirclePosition([
        (x2 + rat * (mx - x2) - (x1 - radius)) / ratio,
        (y1 - rat * (y1 - my) - (y1 - radius)) / ratio
      ]);
      onBorder = true;
    }
    if (x1 <= mx && mx <= x2) {
      if (Math.abs(my - y1 + radius * 1.05) < 5) {
        setCirclePosition([(mx - x1 + radius) / ratio, 0]);
        onBorder = true;
      }
      if (Math.abs(my - y2 - radius * 1.05) < 5) {
        setCirclePosition([(mx - x1 + radius) / ratio, (y2 - y1 + 2 * radius) / ratio]);
        onBorder = true;
      }
    }
    if (y1 <= my && my <= y2) {
      if (Math.abs(mx - x1 + radius * 1.05) < 5) {
        setCirclePosition([0, (my - y1 + radius) / ratio]);
        onBorder = true;
      }
      if (Math.abs(mx - x2 - radius * 1.05) < 5) {
        setCirclePosition([(x2 - x1 + 2 * radius) / ratio, (my - y1 + radius) / ratio]);
        onBorder = true;
      }
    }

    if (onBorder) {
      setShowCircle(true);
    } else {
      setShowCircle(false);
    }
  };

  const handleMouseLeave = () => {
    setShowCircle(false);
    setHover(false);
    if (type.startsWith("hover")) setType(type.slice(Math.floor(type.length / 5) * 5));
  };

  const handleMouseEnter = () => {
    setHover(true);
    setType("hover" + type);
  };

  // eslint-disable-next-line
  const cardHeaderStyle: any = {};
  if (data.is_moving) cardHeaderStyle.boxShadow = `0 0 0 3px ${data.picker_color}`;
  if (data.is_root) {
    cardHeaderStyle.outlineColor = "#FFB800";
    cardHeaderStyle.outlineOffset = "8px";
    cardHeaderStyle.outlineStyle = "solid";
    cardHeaderStyle.outlineWidth = "1.5px";
  }

  const handleClick = () => {
    if (type.length && !input) setInput(true);
  };

  const handleSubmit = () => {
    if (type.length && content.length) {
      setText(content);
      setNodeId(id);
      markAsReady();
      setInput(false);
    }
  };

  return (
    <div
      ref={nodeRef}
      className="w-[300px] h-auto relative flex justify-center items-center group"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        cursor: originType.length > 0 ? "pointer" : showCircle ? "crosshair" : "grab"
      }}
    >
      <motion.div
        whileHover={{ scale: 1.0 }}
        whileTap={{ scale: 0.98 }}
        className="w-full"
        onClick={() => setInput(false)}
      >
        <Card
          className={`w-[300px] backdrop-blur-md bg-card/10 backdrop-opacity-100 shadow-lg hover:shadow-xl rounded-3xl h-fit  dark:border-[#272727]`}
          style={data.is_moving ? { borderColor: data.picker_color, borderWidth: "1px" } : {}}
        >
          <Handle
            type="target"
            position={Position.Top}
            className={`opacity-${showCircle ? 1 : 0}`}
            style={{
              left: `${showCircle ? `${circlePosition[0]}px` : "50%"}`,
              top: `${showCircle ? `${circlePosition[1]}px` : "50%"}`,
              height: "7.5px",
              width: "7.5px",
              border: "2px solid black",
              backgroundColor: "white"
            }}
          />

          {data.node_type && data.node_type.length > 0 && (
            <Badge
              variant="default"
              className="absolute -top-4 left-4 z-10 text-xs font-normal bg-black dark:bg-white"
            >
              {data.node_type}
            </Badge>
          )}

          <CardHeader
            className="ring-offset-4 hover:ring-offset-[6px] transition-all dark:ring-offset-[#09090B] ring-1 ring-[#C6C6C6] dark:ring-[#59595B] bg-[#F4F4F4] dark:bg-[#272729] text-primary p-2 cursor-pointer rounded-[6px] "
            onClick={toggleExpand}
            role="button"
            aria-expanded={isExpanded}
            aria-controls="default-content"
            style={cardHeaderStyle}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-lg font-light tracking-wide">{data.id}</span>
              </div>
              {isExpanded ? (
                <ChevronUpIcon className="h-5 w-5 flex-shrink-0" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 flex-shrink-0" />
              )}
            </CardTitle>
          </CardHeader>

          <AnimatePresence>
            {isExpanded && (
              <ExpandedContent data={data.description} viewDetails={() => setPanelIsOpen(true)} />
            )}
          </AnimatePresence>

          <Handle
            type="source"
            position={Position.Top}
            className="opacity-0"
            style={{
              left: `${showCircle ? `${circlePosition[0]}px` : "50%"}`,
              top: `${showCircle ? `${circlePosition[1]}px` : "50%"}`,
              backgroundColor: "white"
            }}
          />

          {(!data.reference &&
            !data.locked &&
            (user === SignInStatus.NOT_SIGNED || user === SignInStatus.UNKNOWN)) ||
            (isContributor && (
              <NodeToolbar isVisible={selectedNode?.id === id} position={Position.Top} offset={20}>
                <NodeToolBarComponent data={data} id={id} isEditing={isExpanded} />
              </NodeToolbar>
            ))}
        </Card>
      </motion.div>

      {(isHover || (commentVisible && originType === "Cmnt") || input) && originType !== "" && (
        <div
          className="absolute flex flex-row top-0 left-[100%] items-center "
          style={{
            transform: `scale(${1 / zoom})`,
            transformOrigin: "top left"
          }}
        >
          {commentVisible && originType === "Cmnt" ? (
            <CommentBox nodeData={data} input={input} />
          ) : originType === "Note" ? (
            <FilePenLine strokeWidth={1.5} className="bg-white dark:bg-transparent text-blue-500" />
          ) : (
            <MessageCircle
              strokeWidth={1.5}
              className="bg-white dark:bg-transparent  text-blue-500"
            />
          )}
          {input && (
            <div className="flex flex-row gap-1 rounded-sm shadow-container bg-white dark:bg-black items-center h-[26px]">
              <input
                className="ml-2 font-[8px] outline-none dark:bg-transparent"
                type="text"
                value={content}
                placeholder="Add a comment"
                onChange={e => setContent(e.target.value)}
              />
              <ArrowUp
                className="h-5 w-5 hover:dark:stroke-blue-500"
                onClick={() => handleSubmit()}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
});
DefaultNode.displayName = "DefaultNode";

export default DefaultNode;
