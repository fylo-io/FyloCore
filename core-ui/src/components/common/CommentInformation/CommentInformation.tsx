import { ChevronDownIcon, Play } from "lucide-react";
import { FC, useEffect, useState } from "react";

import { CustomEdgeType } from "@/components/edges";
import { ToolType } from "@/const";
import { Comment } from "@/types/comment";
import { Note } from "@/types/note";
import { Node } from "@/types/structure";
import JoinedUsers from "../JoinedUsers";
import PaneTab from "../PaneTab";
import ResizableComponent from "../ResizableComponent";
import CommentList from "./CommentList";
import NoteList from "./NoteList";

interface CommentInformationProps {
  graphId: string;
  color: string;
  selectedTool: string;
  notes: Note[];
  comments: Comment[];
  nodes: Node[];
  edges: CustomEdgeType[];
}

const CommentInformation: FC<CommentInformationProps> = ({
  graphId,
  color,
  selectedTool,
  notes,
  comments,
  nodes,
  edges
}) => {
  const selectedTab = selectedTool === ToolType.NOTE ? "Notes" : "Discussion";
  const [sortedNotes, setSortedNotes] = useState<Note[]>([]);
  const [sortedComments, setSortedComments] = useState<Comment[]>([]);

  useEffect(() => {
    const newNotes = [...notes];
    newNotes.sort((a: Note, b: Note) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    setSortedNotes([...newNotes]);
  }, [notes]);

  useEffect(() => {
    const newComments = [...comments];
    newComments.sort((a: Comment, b: Comment) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    setSortedComments([...newComments]);
  }, [comments]);

  return selectedTool === ToolType.DEFAULT || selectedTool === ToolType.IMPORT ? (
    <div className="absolute -left-1/2 -top-1/2">
      <JoinedUsers graphId={graphId} color={color} />
    </div>
  ) : (
    <div
      className={`absolute right-7 top-28 bottom-44 z-30 transition-all duration-500 ease-in-out bg-transparent cursor-default`}
    >
      <ResizableComponent border="left">
        <div className="flex flex-col h-full rounded-lg p-3">
          {/* Top Section */}
          <div className="flex flex-row justify-between items-center w-full gap-3">
            <div className="flex flex-row items-center gap-1">
              <JoinedUsers graphId={graphId} color={color} />
              <ChevronDownIcon className="h-3 w-3 cursor-pointer" />
            </div>
            <div className="flex flex-row items-center gap-3">
              <Play strokeWidth={1.5} />
              <ChevronDownIcon className="h-3 w-3 cursor-pointer" />
              <button className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white font-[14px] rounded-[8px] transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                Share
              </button>
            </div>
          </div>

          {/* Tab Section */}
          <div className="flex w-full items-center justify-between gap-2 py-3 border-b-2 border-solid border-[#f0f0f0] dark:border-[#262626]">
            <PaneTab pages={["Notes", "Discussion"]} selected={selectedTab} onChange={() => {}} />
            <ChevronDownIcon className="h-3 w-3 cursor-pointer" />
          </div>
          {/* Main Section */}
          {selectedTab === "Notes" ? (
            <div className="overflow-y-auto">
              <p className="mx-0 my-4 text-sm font-semibold text-primary">My Notes</p>
              <div className="flex flex-col gap-1">
                {nodes.map(node => (
                  <NoteList
                    key={`NoteList-${node.id}`}
                    node={node}
                    notes={sortedNotes.filter(note => note.node_id === node.id)}
                    color={color}
                  />
                ))}
                {edges.map(edge => (
                  <NoteList
                    key={`NoteList-${edge.id}`}
                    node={{
                      title: edge?.data?.label || "",
                      type: edge?.type || "",
                      id: "",
                      description: "",
                      connectedNodeIds: [],
                      childNodeIds: [],
                      parentId: "",
                      x: 0,
                      y: 0
                    }}
                    notes={sortedNotes.filter(note => note.node_id === edge.id)}
                    color={color}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto">
              <p className="mx-0 my-4 text-sm font-semibold text-primary">Comments and Replies</p>
              <div className="flex flex-col gap-1">
                {nodes.map(node => (
                  <CommentList
                    key={`CommentList-${node.id}`}
                    node={node}
                    comments={sortedComments.filter(comment => comment.node_id === node.id)}
                    color={color}
                  />
                ))}
                {edges.map(edge => (
                  <CommentList
                    key={`CommentList-${edge.id}`}
                    node={{
                      title: edge?.data?.label || "",
                      type: edge?.type || "",
                      id: "",
                      description: "",
                      connectedNodeIds: [],
                      childNodeIds: [],
                      parentId: "",
                      x: 0,
                      y: 0
                    }}
                    comments={sortedComments.filter(comment => comment.node_id === edge.id)}
                    color={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </ResizableComponent>
    </div>
  );
};

export default CommentInformation;
