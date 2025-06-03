import { Handle, Position } from "@xyflow/react";
import { EntityNodeData } from "./index";

const EntityNodeComponent = ({ data }: { data: EntityNodeData }) => {
  return (
    <div
      style={{
        padding: "10px",
        border: "1px solid #ddd",
        borderRadius: "5px",
        background: "white"
      }}
    >
      <Handle type="target" position={Position.Top} />
      <h3>{data.title}</h3>
      <p>{data.description}</p>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default EntityNodeComponent;
