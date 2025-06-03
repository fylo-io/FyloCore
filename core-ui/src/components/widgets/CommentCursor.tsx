import useCommentStore from "@/store/useCommentStore";
import { FilePenLine, MessageCircle } from "lucide-react";
import { FC, useEffect, useState } from "react";

const CommentCursor: FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { type } = useCommentStore();

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      requestAnimationFrame(() => setPosition({ x: e.clientX, y: e.clientY }));
    };

    document.addEventListener("pointermove", handlePointerMove);

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <div
      style={{
        transform: `translate(${position.x - 16}px, ${position.y - 16}px)`,
        position: "absolute",
        pointerEvents: "none"
      }}
    >
      {type.startsWith("hover") ? (
        <></>
      ) : type === "Note" ? (
        <FilePenLine strokeWidth={1.5} className="bg-white text-blue-500" />
      ) : type === "Cmnt" ? (
        <MessageCircle strokeWidth={1.5} className="bg-white text-blue-500" />
      ) : (
        <></>
      )}
    </div>
  );
};

export default CommentCursor;
