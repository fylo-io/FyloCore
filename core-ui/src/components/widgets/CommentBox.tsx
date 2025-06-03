import moment from "moment";
import { FC, useState } from "react";

const getTimeAgo = (previousTime: Date | string): string => {
  return moment(previousTime).fromNow();
};

interface CommentBoxProps {
  // eslint-disable-next-line
  nodeData: any;
  input: boolean;
}

const CommentBox: FC<CommentBoxProps> = ({ nodeData, input }) => {
  const [isHover, setHover] = useState(false);

  return (
    <div
      className="flex items-start space-x-3 p-1 max-w-sm bg-white rounded-lg shadow-md border border-gray-200 rounded-bl-none transition-all duration-500 ease-in-out ml-2"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderColor: input ? nodeData.comments[0].color : ""
      }}
    >
      {isHover && !input ? (
        <div className="flex flex-row gap-2">
          <div
            className="w-6 h-6 rounded-full flex flex-row items-center justify-center text-white"
            style={{ backgroundColor: nodeData.comments[0].color }}
          >
            {nodeData.comments[0].author}
          </div>
          <div className="flex flex-col">
            <div className="flex flex-row items-center justify-between min-w-[130px]">
              <span className="font-medium text-gray-800 py-0">{nodeData.comments[0].author}</span>
              <span className="text-xs text-gray-500 py-0">
                {getTimeAgo(nodeData.comments[0].created_at)}
              </span>
            </div>
            <span className="text-gray-700 text-sm py-0">{nodeData.comments[0].text}</span>
            <span className="text-xs text-gray-500 py-0">
              {`${nodeData.comments.length - 1} ${
                nodeData.comments.length > 2 ? "replies" : "reply"
              }`}
            </span>
          </div>
        </div>
      ) : (
        <div
          className="w-6 h-6 rounded-full flex flex-row items-center justify-center text-white"
          style={{
            backgroundColor: nodeData.comments[0].color
          }}
        >
          {nodeData.comments[0].author}
        </div>
      )}
    </div>
  );
};

export default CommentBox;
