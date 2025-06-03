"use client";
import { ReactFlowProvider } from "@xyflow/react";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import ForceDirectedFlow from "@/components/ForceDirectedFlow";
import { SignInStatus } from "@/const";
import { useGraphStore } from "@/store/useGraphStore";
import { useUserStore } from "@/store/useUserStore";
import { Comment } from "@/types/comment";
import { FyloGraph } from "@/types/graph";
import { Note } from "@/types/note";
import Loader from "@/components/widgets/Loader";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const GraphView = ({ params }: { params: { id: string } }) => {
  const { user, setAsContributor, setAsNonContributor } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [graph, setGraph] = useState<FyloGraph | null>(null);
  const nodes = useGraphStore(state => state.nodes);
  const edges = useGraphStore(state => state.edges);
  const getGraphData = useGraphStore(state => state.getGraphData);

  useEffect(() => {
    if (!params.id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/graph/id/${params.id}`);
        if (response.data?.graph) {
          setGraph(response.data.graph);
          if (response.data.graph.source_graph_id) {
            await getGraphData(params.id, response.data.graph.source_graph_id);
          } else {
            await getGraphData(params.id);
          }
        }
      } catch (error) {
        toast.error("Error fetching graph details!");
      }
      setLoading(false);
    };

    fetchData();
  }, [params, getGraphData]);

  useEffect(() => {
    if (!graph) return;

    if (user !== SignInStatus.NOT_SIGNED && user !== SignInStatus.UNKNOWN) {
      axios
        .get(`${API_URL}/api/graph/viewers/${graph.id}`)
        .then(response => {
          if (response.data.viewers.map((viewer: { id: string }) => viewer.id).includes(user.id))
            setAsContributor();
          else setAsNonContributor();
        })
        .catch(error => {
          toast.error("Error fetching user profile data:", error);
        })
        .finally(() => setLoading(false));
    }

    const fetchGraphComments = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/comment/${graph.id}`);
        if (response.data?.comments) {
          setComments(response.data.comments);
        }
      } catch (error) {
        console.error("Error fetching graph comments:", error);
      }
    };

    fetchGraphComments();
    setLoading(false);
  }, [graph, user, setAsContributor, setAsNonContributor]);

  useEffect(() => {
    if (user !== SignInStatus.UNKNOWN && user !== SignInStatus.NOT_SIGNED) {
      axios
        .get(`${API_URL}/api/note/${user.name}`)
        .then(response => {
          if (response.data?.notes) setNotes(response.data.notes);
        })
        .catch(error => {
          console.error("Error fetching notes:", error);
        });
    }
  }, [user]);

  if (loading || !graph) {
    return <Loader />;
  }

  return (
    <ReactFlowProvider>
      <ForceDirectedFlow
        nodes={nodes}
        edges={edges}
        notes={notes}
        comments={comments}
        graph={graph}
      />
    </ReactFlowProvider>
  );
};

export default GraphView;
