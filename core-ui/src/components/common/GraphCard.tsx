import { SquareArrowOutUpRight, Trash2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { FC } from "react";
import AvatarGroup from "react-avatar-group";

import { SignInStatus, WindowSize } from "@/const";
import useWindowSize from "@/hooks/useWindowSize";
import { useUserStore } from "@/store/useUserStore";
import { FyloGraph } from "@/types/graph";

interface GraphCardProps {
  graph: FyloGraph;
  onDelete?: (graphId: string) => void;
}
const GraphCard: FC<GraphCardProps> = React.memo(({ graph, onDelete }: GraphCardProps) => {
  const currentPage = usePathname();
  const router = useRouter();
  const windowSize = useWindowSize();
  const user = useUserStore(state => state.user);

  if (user === SignInStatus.UNKNOWN) return null;

  const handleDelete = () => {
    if (onDelete) onDelete(graph.id);
  };

  return (
    <>
      {windowSize === WindowSize.DESKTOP && (
        <div className="border rounded-[10px] p-5 shadow-sm bg-white z-30">
          <div className="flex justify-between items-start">
            <h2 className="text-[18px] font-semibold text-gray-900">{graph?.title}</h2>
            <div className="flex space-x-1">
              <button
                onClick={() => router.push(`/graph/${graph.id}`)}
                className="p-1 hover:bg-gray-100 rounded transition"
                aria-label="Share"
              >
                <SquareArrowOutUpRight size={16} className="text-gray-500" />
              </button>
              {currentPage === "/dashboard" && (
                <button
                  onClick={handleDelete}
                  className="p-1 hover:bg-gray-100 rounded transition"
                  aria-label="Share"
                >
                  <Trash2 size={16} className="text-gray-500" />
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-5 line-clamp-2 min-h-[2.8em]">
            {graph?.description}
          </p>

          <div className="mt-2 flex flex-row justify-between items-center w-full">
            <button className="text-sm text-gray-700 mt-2 underline hover:text-gray-900 transition">
              View Description
            </button>
            <div className="flex flex-row items-center gap-4">
              <span className="text-sm font-semibold">{`${graph?.node_count} Node${
                graph?.node_count && graph?.node_count > 1 ? "s" : ""
              }`}</span>
              <AvatarGroup
                avatars={
                  Array.isArray(graph?.contributors)
                    ? graph.contributors
                        .filter(user => user && user?.name && user?.profile_color)
                        .map(user => ({ avatar: user.name, backgroundColor: user.profile_color }))
                    : []
                }
                initialCharacters={1}
                max={3}
                size={30}
                displayAllOnHover
                shadow={2}
              />
            </div>
          </div>
        </div>
      )}

      {windowSize === WindowSize.MOBILE && (
        <div className="h-[172px] rounded-[10px] border-[1px] flex flex-col justify-center items-center">
          <div className="h-[80%] border-b-[1px] rounded-t-[12px] w-full bg-[#F5F5F580] flex flex-col items-center pt-[60px]">
            <span className="font-bold">{graph?.title}</span>
          </div>
          <div className="w-full flex flex-row justify-between items-center px-3">
            <span className="py-[10px] truncate font-bold">{graph?.description}</span>
            <button
              onClick={() => router.push(`/graph/${graph.id}`)}
              className="rounded transition"
              aria-label="Share"
            >
              <SquareArrowOutUpRight size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
      )}
    </>
  );
});
GraphCard.displayName = "GraphCard";
export default GraphCard;
