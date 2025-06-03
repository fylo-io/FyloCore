import { Handle, Position } from "@xyflow/react";
import { FC } from "react";

interface GroupedNodeProps {}

const GroupedNode: FC<GroupedNodeProps> = ({}) => {
  return (
    <div
      className={`w-[300px] h-[200px] relative flex justify-center items-center bg-gray-100 shadow-lg`}
      style={{ cursor: "grab" }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      Group
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

export default GroupedNode;
