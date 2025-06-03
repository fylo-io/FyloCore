import { FC } from "react";

interface NoteProps {
  author: string;
  timeAgo: string;
  text: string;
  color: string;
}

const NoteItem: FC<NoteProps> = ({ author, timeAgo, text, color }) => {
  return (
    <div className="flex flex-row justify-between">
      <div className="flex flex-row gap-2 text-[12px]">
        <div
          className="text-[14px] w-6 h-6 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: color }}
        >
          {author && author.length > 0 ? author[0] : "X"}
        </div>
        <div>
          <div className="text-gray-400">{timeAgo}</div>
          <div className="text-black dark:text-gray-500">{text}</div>
        </div>
      </div>
      <div className="text-gray-500 hover:text-gray-700 cursor-pointer">
        <span className="inline-block">•••</span>
      </div>
    </div>
  );
};

export default NoteItem;
