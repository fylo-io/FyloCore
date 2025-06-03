import { EdgeLabelRenderer, useViewport } from "@xyflow/react";

type CursorProps = {
  x: number;
  y: number;
  color: string;
  clientName: string;
};

const ProfileCursor = (props: CursorProps) => {
  const { x, y, color, clientName } = props;
  const viewport = useViewport();

  // Constants for customization
  const baseSize = 30;
  const minScale = 0.75;
  const maxScale = 1.5;

  // Calculate the scaling factor, clamped between minScale and maxScale
  const scaleFactor = Math.max(minScale, Math.min(maxScale, 1 / viewport.zoom));

  // Calculate transformations for position and scaling
  const translate = `translate(${x}px, ${y}px)`;
  const scale = `scale(${scaleFactor})`;
  return (
    <EdgeLabelRenderer>
      <div
        id="cursor"
        style={{
          transform: `${translate} ${scale}`,
          position: "absolute",
          transformOrigin: "top left"
        }}
        className="z-10 transition-transform duration-300 ease-in-out"
      >
        <svg
          viewBox="0 0 50 50"
          style={{
            width: baseSize,
            height: baseSize
          }}
        >
          <polyline points="10,50 0,0 50,25 20,25" fill={color} />
        </svg>
        <span
          id="cursor-text"
          style={{
            backgroundColor: color,
            transform: scale,
            transformOrigin: "top left",
            whiteSpace: "nowrap"
          }}
          className="inline-block rounded-lg px-3 py-1 text-sm font-semibold text-white mt-1"
        >
          {clientName}
        </span>
      </div>
    </EdgeLabelRenderer>
  );
};

type CursorsProps = {
  // eslint-disable-next-line
  remoteCursors: Record<string, any>;
  currentUserId: string;
};

const Cursors = ({ remoteCursors, currentUserId }: CursorsProps) => {
  const cursorElements = Object.values(remoteCursors)
    .filter(cursor => cursor.userId !== currentUserId)
    .map(cursor => (
      <ProfileCursor
        key={cursor.userId}
        x={cursor.x}
        y={cursor.y}
        color={cursor.color}
        clientName={cursor.name}
      />
    ));

  return <>{cursorElements}</>;
};

export default Cursors;
