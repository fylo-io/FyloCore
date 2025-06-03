import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import moment from "moment";
import { FC, useState } from "react";

import { Comment } from "@/types/comment";
import { Node } from "@/types/structure";
import CommentItem from "./CommentItem";

const getTimeAgo = (previousTime: Date | string): string => {
  return moment(previousTime).fromNow();
};

interface CommentListProps {
  node: Node;
  comments: Comment[];
  color: string;
}

const CommentList: FC<CommentListProps> = ({ node, comments }) => {
  const [open, setOpen] = useState(false);

  return comments.length ? (
    <div className="flex flex-col">
      <div className="flex flex-row justify-between px-0 py-1">
        <div className="flex flex-row items-center gap-1">
          {open ? (
            <ChevronDownIcon className="h-3 w-3 cursor-pointer" onClick={() => setOpen(false)} />
          ) : (
            <ChevronRightIcon className="h-3 w-3 cursor-pointer" onClick={() => setOpen(true)} />
          )}
          <span className="text-xs font-semibold">{node.title}</span>
        </div>
        <span className="text-[10px] px-1 py-0.5 font-medium bg-gray-100 dark:bg-gray-600 rounded">
          {node.type}
        </span>
      </div>
      <div className="ml-1">
        {open &&
          comments.map(comment => (
            <CommentItem
              key={comment.id}
              author={comment.author}
              timeAgo={getTimeAgo(comment.created_at)}
              text={comment.text}
              color={comment.color}
            />
          ))}
      </div>
    </div>
  ) : (
    <></>
  );
};

export default CommentList;
