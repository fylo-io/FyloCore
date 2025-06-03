import { FloatingEdgeType } from "@/components/edges";
import { EntityNode } from "@/components/nodes";
import { Document, Node } from "@/types/structure";
import { useEffect, useState } from "react";

const useGraphs = (nodes: EntityNode[], edges: FloatingEdgeType[]) => {
  const [graphNodes, setGraphNodes] = useState<Node[]>([]);
  const [graphDocuments, setGraphDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const newGraphNodes = nodes.map(
      node =>
        ({
          id: node.id,
          title: node.data.id,
          description: node.data.description,
          type: node.data.node_type,
          connectedNodeIds: [],
          childNodeIds: [],
          parentId: "",
          x: node.position.x,
          y: node.position.y
        }) as Node
    );
    const nodeToIndexMap = new Map<string, number>(
      newGraphNodes.map((nd, index) => [nd.id, index])
    );

    for (const edge of edges) {
      if (
        nodeToIndexMap.get(edge.source) === undefined ||
        nodeToIndexMap.get(edge.target) === undefined
      )
        continue;
      newGraphNodes[nodeToIndexMap.get(edge.source)!].connectedNodeIds.push(edge.target);
      newGraphNodes[nodeToIndexMap.get(edge.target)!].connectedNodeIds.push(edge.source);
    }

    const visited = Array(nodes.length).fill(false);
    const depth = Array(nodes.length).fill(-1);
    const newGraphDocuments: Document[] = [];

    for (let i = 0; i < nodes.length; i++) {
      if (!nodes[i].data.is_root) continue;
      depth[i] = 0;
      visited[i] = true;

      const queue: number[] = [];
      let head = 0,
        tail = 0;

      queue[tail++] = i;
      while (head < tail) {
        const current = queue[head++];
        for (const nextNodeId of newGraphNodes[current].connectedNodeIds) {
          const nextNodeIndex = nodeToIndexMap.get(nextNodeId)!;
          if (visited[nextNodeIndex]) continue;
          visited[nextNodeIndex] = true;
          depth[nextNodeIndex] = depth[current] + 1;
          newGraphNodes[current].childNodeIds.push(nextNodeId);
          queue[tail++] = nextNodeIndex;
          newGraphNodes[nextNodeIndex].parentId = nodes[current].id;
        }
      }

      newGraphDocuments.push({
        id: nodes[i].id,
        title: nodes[i].data.id,
        description: nodes[i].data.description,
        type: nodes[i].data.node_type,
        count: tail,
        x: nodes[i].position.x,
        y: nodes[i].position.y
      } as Document);
    }

    setGraphDocuments([...newGraphDocuments]);
    setGraphNodes([...newGraphNodes]);
  }, [nodes, edges]);

  return { graphDocuments, graphNodes };
};

export default useGraphs;
