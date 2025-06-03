import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import moment from "moment";
import { FC, useState } from "react";

import { Note } from "@/types/note";
import { Node } from "@/types/structure";
import NoteItem from "./NoteItem";

const getTimeAgo = (previousTime: Date | string): string => {
  return moment(previousTime).fromNow();
};

interface NoteListProps {
  node: Node;
  notes: Note[];
  color: string;
}

const NoteList: FC<NoteListProps> = ({ node, notes, color }) => {
  const [open, setOpen] = useState(false);

  return notes.length ? (
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
          notes.map(note => (
            <NoteItem
              key={note.id}
              author={note.author}
              timeAgo={getTimeAgo(note.created_at)}
              text={note.text}
              color={color}
            />
          ))}
      </div>
    </div>
  ) : (
    <></>
  );
};

export default NoteList;
