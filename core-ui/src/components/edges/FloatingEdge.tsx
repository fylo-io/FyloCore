import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useInternalNode,
  useStore
} from "@xyflow/react";
import { ArrowUp, MessageCircle } from "lucide-react";
import { FC, useEffect, useMemo, useState } from "react";

import CommentBox from "../../components/widgets/CommentBox";
import useCommentStore from "../../store/useCommentStore";
import { getEdgeParams } from "./utils";

interface CustomEdgeData {
  id: string;
  source: string;
  target: string;
  label: string;
  // eslint-disable-next-line
  data: any;
}

interface CustomEdgeProps extends EdgeProps<CustomEdgeData> {
  id: string;
  source: string;
  target: string;
  // eslint-disable-next-line
  markerEnd?: any;
  style: React.CSSProperties;
  data: CustomEdgeData;
}

// eslint-disable-next-line
const FloatingEdge: FC<CustomEdgeProps> = ({ id, source, target, markerEnd, style, data }) => {
  const { type, setType, setText, setNodeId, markAsReady } = useCommentStore();
  const zoom = useStore(state => state.transform[2]);
  const [input, setInput] = useState(false);
  const [content, setContent] = useState("");
  // eslint-disable-next-line
  const [commentVisible, setCommentVisible] = useState(false);
  const [isHover, setHover] = useState(false);
  const [originType, setOriginType] = useState("");

  useEffect(() => {
    setOriginType(type.slice(Math.floor(type.length / 5) * 5));
  }, [type]);

  useEffect(() => {
    setInput(false);
    setContent("");
    setHover(false);
  }, [originType]);

  const handleMouseLeave = () => {
    setHover(false);
    if (type.startsWith("hover")) setType(type.slice(Math.floor(type.length / 5) * 5));
  };

  const handleMouseEnter = () => {
    setHover(true);
    setType("hover" + type);
  };

  const handleClick = () => {
    if (type.length && !input) setInput(true);
  };

  const handleSubmit = () => {
    if (type.length && content.length) {
      setText(content);
      setNodeId(originType === "Note" ? id : `-${id}`);
      markAsReady();
      setInput(false);
    }
  };

  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  const edgeParams = useMemo(() => {
    if (!sourceNode || !targetNode) {
      return null;
    }
    return getEdgeParams(sourceNode, targetNode);
  }, [sourceNode, targetNode]);

  if (!edgeParams) {
    return null;
  }

  // eslint-disable-next-line
  const { sx, sy, tx, ty, sourcePos, targetPos, controlOffset, isTargetLeft } = edgeParams;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
    curvature: isTargetLeft ? -0.5 : 0.5
  });

  const dashArray = "0, 6"; // This creates a pattern of 5px dash and 5px gap
  const linecap = "round";
  const strokeWidth = 2;

  return (
    <>
      <defs>
        <marker
          id={`edge-arrow-${id}`}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" className="text-gray-400" />
        </marker>
      </defs>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={`url(#edge-arrow-${id})`}
        style={{
          ...style,
          strokeDasharray: dashArray,
          strokeLinecap: linecap,
          strokeWidth,
          stroke: "#999"
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: "#ffcc00",
            padding: 3,
            paddingLeft: 10,
            paddingRight: 10,
            borderRadius: 10,
            fontSize: 8,
            fontWeight: 700,
            pointerEvents: "all"
          }}
          className="nodrag nopan"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          {data?.label}
          {(isHover || (commentVisible && originType === "Cmnt") || input) && originType !== "" && (
            <div
              className="absolute flex flex-row top-0 left-[100%] items-center"
              style={{
                transform: `scale(${1 / zoom})`,
                transformOrigin: "top left"
              }}
            >
              {commentVisible && originType === "Cmnt" ? (
                <CommentBox nodeData={data.data} input={input} />
              ) : (
                <MessageCircle strokeWidth={1.5} className="bg-white text-blue-500" />
              )}
              {input && (
                <div className="flex flex-row gap-1 rounded-sm shadow-container bg-white items-center h-[26px]">
                  <input
                    className="ml-2 font-[8px] outline-none"
                    type="text"
                    value={content}
                    placeholder="Add a comment"
                    onChange={e => setContent(e.target.value)}
                  />
                  <ArrowUp className="h-5 w-5 cursor-pointer" onClick={() => handleSubmit()} />
                </div>
              )}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default FloatingEdge;
