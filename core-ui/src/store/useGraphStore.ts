import axios from "axios";
import { create } from "zustand";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type EntityNode = {
  id: string;
  type: string;
  // eslint-disable-next-line
  position: any;
  // eslint-disable-next-line
  data: any;
};

type FloatingEdgeType = {
  id: string;
  type: string;
  source: string;
  target: string;
  // eslint-disable-next-line
  data: any;
};

type GraphStore = {
  nodes: EntityNode[];
  edges: FloatingEdgeType[];
  getGraphData: (graphId: string, sourceGraphId?: string) => Promise<void>;
};

export const useGraphStore = create<GraphStore>(set => ({
  nodes: [],
  edges: [],
  getGraphData: async (graphId: string, sourceGraphId?: string) => {
    try {
      // Fetch current graph data
      const currentNodesPromise = axios.get(`${API_URL}/api/node/${graphId}`);
      const currentEdgesPromise = axios.get(`${API_URL}/api/edge/${graphId}`);

      // Fetch reference graph data if available, otherwise resolve to empty arrays
      const refNodesPromise = sourceGraphId
        ? axios.get(`${API_URL}/api/node/${sourceGraphId}`)
        : Promise.resolve({ data: { nodes: [] } });
      const refEdgesPromise = sourceGraphId
        ? axios.get(`${API_URL}/api/edge/${sourceGraphId}`)
        : Promise.resolve({ data: { edges: [] } });

      // Await all requests concurrently
      const [nodesRes, edgesRes, refNodesRes, refEdgesRes] = await Promise.all([
        currentNodesPromise,
        currentEdgesPromise,
        refNodesPromise,
        refEdgesPromise
      ]);

      // Map current graph data
      const currentNodes =
        // eslint-disable-next-line
        nodesRes.data?.nodes?.map((obj: any) => ({
          id: obj.id,
          type: obj.type,
          position: obj.position,
          data: obj.data
        })) || [];
      const currentEdges =
        // eslint-disable-next-line
        edgesRes.data?.edges?.map((obj: any) => ({
          id: obj.id,
          type: obj.type,
          source: obj.source,
          target: obj.target,
          data: obj.data
        })) || [];

      // Map reference graph data (if any) and mark them as reference
      const refNodes =
        // eslint-disable-next-line
        refNodesRes.data?.nodes?.map((obj: any) => ({
          id: obj.id,
          type: obj.type,
          position: obj.position,
          data: { ...obj.data, reference: true }
        })) || [];
      const refEdges =
        // eslint-disable-next-line
        refEdgesRes.data?.edges?.map((obj: any) => ({
          id: obj.id,
          type: obj.type,
          source: obj.source,
          target: obj.target,
          data: { ...obj.data, reference: true }
        })) || [];

      // Combine the data
      const combinedNodes = [...currentNodes, ...refNodes];
      const combinedEdges = [...currentEdges, ...refEdges];

      // Update the store only once with the combined data
      set({ nodes: combinedNodes, edges: combinedEdges });
    } catch (error) {
      console.error("Error fetching graph data:", error);
    }
  }
}));
