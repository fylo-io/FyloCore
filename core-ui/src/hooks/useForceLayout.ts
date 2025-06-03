import { Node, ReactFlowState, useNodesInitialized, useReactFlow, useStore } from "@xyflow/react";
import {
  Simulation,
  SimulationLinkDatum,
  SimulationNodeDatum,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY
} from "d3-force";
import { useCallback, useEffect, useRef, useState } from "react";

type UseForceLayoutOptions = {
  alpha?: number;
  alphaDecay?: number;
  distance?: number;
  strength?: number;
  velocityDecay?: number;
};

type SimNodeType = SimulationNodeDatum &
  Node & {
    width: number;
    height: number;
  };

const elementCountSelector = (state: ReactFlowState): number =>
  state.nodeLookup.size + state.edges.length;

const useForceLayout = ({
  // eslint-disable-next-line
  alpha = 0.3,
  alphaDecay = 0.0228,
  distance = 200,
  strength = -800,
  velocityDecay = 0.4
}: UseForceLayoutOptions) => {
  const nodesInitialized = useNodesInitialized();
  const elementCount = useStore(elementCountSelector);
  const simulationRef = useRef<Simulation<SimNodeType, SimulationLinkDatum<SimNodeType>> | null>(
    null
  );
  const { setNodes, getNodes, getEdges } = useReactFlow();
  const [isSimulationComplete, setIsSimulationComplete] = useState(false);

  const defaultNodeSize = 150;

  const initializeSimulation = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();

    if (!nodes.length) return;

    const simulationNodes: SimNodeType[] = nodes.map(node => ({
      ...node,
      x: node.position.x,
      y: node.position.y,
      width: node.width || defaultNodeSize,
      height: node.height || defaultNodeSize
    }));

    const simulationLinks: SimulationLinkDatum<SimNodeType>[] = edges.map(edge => ({
      source: edge.source,
      target: edge.target
    }));
    // eslint-disable-next-line
    const nodeIds: any = new Set(simulationNodes.map(node => node.id));
    // eslint-disable-next-line
    const validLinks: any = simulationLinks.filter(
      link => nodeIds.has(link.source) && nodeIds.has(link.target)
    );

    const simulation = forceSimulation<SimNodeType>(simulationNodes)
      .force(
        "link",
        forceLink<SimNodeType, SimulationLinkDatum<SimNodeType>>(validLinks)
          .id(d => d.id)
          .distance(distance)
      )
      .force("charge", forceManyBody().strength(strength))
      .force("x", forceX().strength(0.1))
      .force("y", forceY().strength(0.1))
      .force(
        "collide",
        forceCollide<SimNodeType>().radius(d => {
          // Cast d to SimNodeType to access width and height
          const node = d as SimNodeType;
          return (
            Math.sqrt(
              ((node.width || defaultNodeSize) * (node.height || defaultNodeSize)) / Math.PI
            ) + 10
          );
        })
      )
      .alphaDecay(alphaDecay)
      .velocityDecay(velocityDecay);

    simulation.on("tick", () => {
      setNodes(nds =>
        nds.map(node => {
          const simNode = simulationNodes.find(n => n.id === node.id);
          if (simNode && isFinite(simNode.x!) && isFinite(simNode.y!)) {
            return {
              ...node,
              position: {
                x: simNode.x!,
                y: simNode.y!
              }
            };
          }
          return node;
        })
      );
    });

    simulation.on("end", () => setIsSimulationComplete(true));

    simulationRef.current = simulation;
  }, [
    getNodes,
    getEdges,
    setNodes,
    distance,
    strength,
    alphaDecay,
    velocityDecay,
    defaultNodeSize
  ]);

  useEffect(() => {
    if (nodesInitialized && elementCount > 0) {
      initializeSimulation();
    }
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [nodesInitialized, elementCount, initializeSimulation]);

  const updateNodePosition = useCallback(
    (nodeId: string, newPosition: { x: number; y: number }) => {
      const simulation = simulationRef.current;
      if (simulation) {
        const node = simulation.nodes().find(n => n.id === nodeId);
        if (node) {
          // Update the node's position without restarting the simulation
          node.fx = newPosition.x;
          node.fy = newPosition.y;
          node.x = newPosition.x;
          node.y = newPosition.y;
        }
      }
      // Update the node position in React Flow
      setNodes(nds => nds.map(n => (n.id === nodeId ? { ...n, position: newPosition } : n)));
    },
    [setNodes]
  );

  const releaseFixedNode = useCallback((nodeId: string) => {
    const simulation = simulationRef.current;
    if (simulation) {
      const node = simulation.nodes().find(n => n.id === nodeId);
      if (node) {
        // Instead of releasing the node, we keep its position fixed
        node.fx = node.x;
        node.fy = node.y;
      }
      // We don't restart the simulation here
    }
  }, []);

  return { updateNodePosition, releaseFixedNode, isSimulationComplete };
};

export default useForceLayout;
