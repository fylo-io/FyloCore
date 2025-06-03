"use client";
import axios from "axios";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";

import CreateGraphButton from "@/components/common/CreateGraphButton";
import GraphCard from "@/components/common/GraphCard";
import { SignInStatus, WindowSize } from "@/const";
import useUserInfo from "@/hooks/useUserInfo";
import useWindowSize from "@/hooks/useWindowSize";
import { FyloGraph } from "@/types/graph";
import Loader from "@/components/widgets/Loader";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Dashboard: FC = () => {
  const { status } = useSession();
  const { user } = useUserInfo();
  const router = useRouter();
  const [graphs, setGraphs] = useState<FyloGraph[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [animateContent, setAnimateContent] = useState<boolean>(false);
  const windowSize = useWindowSize();

  useEffect(() => {
    const fetchGraphs = async () => {
      if (user === SignInStatus.NOT_SIGNED || user === SignInStatus.UNKNOWN) return;
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/graph/user/${user.id}`);
        setGraphs(response.data.graphs);
      } catch (error) {
        console.error("Error fetching graphs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGraphs();
  }, [user]);

  // Once loading is complete and there are graphs, trigger the slide down animation.
  useEffect(() => {
    if (!isLoading && graphs.length > 0) {
      // Adding a tiny delay to ensure the DOM is ready for the animation.
      setTimeout(() => {
        setAnimateContent(true);
      }, 50);
    }
  }, [isLoading, graphs]);

  const handleCreateGraph = async (title: string, description: string) => {
    if (user === SignInStatus.NOT_SIGNED || user === SignInStatus.UNKNOWN) return;

    try {
      const response = await axios.post(`${API_URL}/api/graph`, {
        title,
        description,
        creatorId: user.id,
        creatorName: user.name,
        creatorProfileColor: user.profile_color
      });

      if (response.status === 201) {
        toast.success("Graph created", { position: "bottom-right" });
        router.push(`/graph/${response.data.graph.id}`);
      }
    } catch (error) {
      console.error("Error creating graph:", error);
    }
  };

  const handleDeleteGraph = async (graphId: string) => {
    try {
      const response = await axios.delete(`${API_URL}/api/graph`, {
        data: { id: graphId }
      });

      if (response.status === 200) {
        setGraphs(prevGraphs => prevGraphs.filter(graph => graph.id !== graphId));
      }
    } catch (error) {
      console.error("Error deleting graph:", error);
    }
  };

  // Show a loader while fetching data or if the session status is still "loading"
  if (isLoading || status === "loading") {
    return <Loader />;
  }

  return (
    <>
      {windowSize === WindowSize.DESKTOP && (
        <>
          {graphs && graphs.length === 0 ? (
            <div className="absolute h-screen w-screen flex flex-col justify-center items-center gap-12">
              <div className="flex flex-col justify-center items-center gap-4">
                <p className="font-medium text-[25px]">Map Your Thoughts</p>
                <p className="max-w-[500px] text-[#80858C] text-[18px] text-center">
                  Navigate ideas and workflows with AI-powered precision. Create, connect, and
                  streamline with smart insights.
                </p>
              </div>
              <div className="z-50">
                <CreateGraphButton onCreateGraph={handleCreateGraph} />
              </div>
            </div>
          ) : (
            <div className="pt-[120px]">
              <div
                className={`absolute p-7 w-screen z-30 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 transition-all duration-500 transform ${
                  animateContent ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
                }`}
              >
                {graphs.map((graph: FyloGraph) => (
                  <GraphCard
                    key={`graph-card-${graph.id}`}
                    graph={graph}
                    onDelete={(graphId: string) => handleDeleteGraph(graphId)}
                  />
                ))}
              </div>
              <div className="absolute top-7 right-[400px] z-50">
                <CreateGraphButton onCreateGraph={handleCreateGraph} />
              </div>
            </div>
          )}
        </>
      )}

      {windowSize === WindowSize.MOBILE && (
        <div className="grid grid-cols-2 p-5 gap-4">
          <div className="bg-custom-gradient h-[172px] rounded-[10px] flex flex-col justify-between items-center pt-[50px] pb-[10px]">
            <Plus color="white" size={50} strokeWidth={1.3} />
            <span className="font-bold text-white">Create New Graph</span>
          </div>
          {graphs.map((graph: FyloGraph) => (
            <GraphCard key={`graph-card-${graph.id}`} graph={graph} />
          ))}
        </div>
      )}
    </>
  );
};

export default Dashboard;
