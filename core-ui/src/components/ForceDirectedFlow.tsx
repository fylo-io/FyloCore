"use client";

import {
  addEdge,
  Background,
  BackgroundVariant,
  ConnectionLineType,
  FinalConnectionState,
  Node,
  NodeTypes,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow
} from "@xyflow/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

import Toolbar from "@/components/common/Toolbar/Toolbar";
import { CustomEdgeType, edgeTypes } from "@/components/edges";
import FloatingConnectionLine from "@/components/edges/FloatingConnectionLine";
import { CustomNodeType, EntityNode } from "@/components/nodes";
import CommentCursor from "@/components/widgets/CommentCursor";
import Cursors from "@/components/widgets/ProfileCursor";
import { SignInStatus, ToolType, WindowSize } from "@/const";
import useForceLayout from "@/hooks/useForceLayout";
import useGraphs from "@/hooks/useGraphs";
import useUserInfo from "@/hooks/useUserInfo";
import useWindowSize from "@/hooks/useWindowSize";
import useCommentStore from "@/store/useCommentStore";
import { useEditStore } from "@/store/useEditStore";
import { useUserStore } from "@/store/useUserStore";
import { Comment } from "@/types/comment";
import { FyloEdge, FyloGraph, FyloNode } from "@/types/graph";
import { Note } from "@/types/note";

import ConceptNode from "./nodes/ConceptNode";
import DatasetNode from "./nodes/DatasetNode";
import DefaultNode from "./nodes/DefaultNode";
import DomainNode from "./nodes/DomainNode";
import ExperimentNode from "./nodes/ExperimentNode";
import GroupedNode from "./nodes/GroupedNode";
import MethodNode from "./nodes/MethodNode";
import ProblemNode from "./nodes/ProblemNode";
import ResearchOutputNode from "./nodes/ResearchOutputNode";
import TheoryNode from "./nodes/TheoryNode";

import { useDetailPanelStore } from "@/store/useDetailPanelStore";
import { DefaultNodeProps } from "@/types/detailSidePanel";
import toast from "react-hot-toast";
import CommentInformation from "./common/CommentInformation/CommentInformation";
import ForkGraphButton from "./common/ForkGraphButton";
import GraphInformation from "./common/GraphInformation/GraphInformation";
import ShareGraphButton from "./common/ShareGraphButton";
import UserInformation from "./common/UserInformation";
import DetailSidePanel from "./sidePanel/SidePanel";
import { useSelectedNodeStore } from "@/store/useSelectedNode";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const nodeTypes: NodeTypes = {
  Concept: ConceptNode,
  Dataset: DatasetNode,
  Default: DefaultNode,
  Domain: DomainNode,
  Experiment: ExperimentNode,
  Grouped: GroupedNode,
  Method: MethodNode,
  Problem: ProblemNode,
  ResearchOutput: ResearchOutputNode,
  Theory: TheoryNode
};

interface ForceDirectedFlowProps {
  nodes: CustomNodeType[];
  edges: CustomEdgeType[];
  notes: Note[];
  comments: Comment[];
  graph: FyloGraph;
}

const ForceDirectedFlow: FC<ForceDirectedFlowProps> = ({
  nodes: initialNodes,
  edges: initialEdges,
  notes: initialNotes,
  comments: initialComments,
  graph
}) => {
  const router = useRouter();
  const isContributor = useUserStore(state => state.isContributor);
  const { user } = useUserInfo();
  const windowSize = useWindowSize();

  const focusNodeId = useEditStore(state => state.focusNodeId);
  const actionType = useEditStore(state => state.actionType);
  const nodeType = useEditStore(state => state.nodeType);
  const nodeTitle = useEditStore(state => state.nodeTitle);
  const nodeDescription = useEditStore(state => state.nodeDescription);
  const clear = useEditStore(state => state.clear);
  const stopEditing = useEditStore(state => state.stopEditing);
  const selectedNode = useSelectedNodeStore(state => state.selectedNode);
  const setSelectedNode = useSelectedNodeStore(state => state.setSelectedNode);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  // eslint-disable-next-line
  const [remoteCursors, setRemoteCursors] = useState<any>({});

  const { graphDocuments, graphNodes } = useGraphs(nodes, edges);

  const sidePanelIsOpen = useDetailPanelStore(state => state.panelIsOpen);
  const setSidePanelIsOpen = useDetailPanelStore(state => state.setPanelIsOpen);

  // Handle Message Queue
  const [isChatting, setChatting] = useState(false);
  const [messageQueue, setMessageQueue] = useState<string[]>([]);

  const sendMessage = (message: string) => {
    setMessageQueue(prevMessages => [...prevMessages, message]);
  };

  useEffect(() => {
    if (messageQueue.length > 0 && !isChatting) {
      const message = messageQueue[0];
      socketRef.current?.emit("chat", graph.id, message);
      setChatting(true);
      setMessageQueue(messageQueue.slice(1));
    }
  }, [graph, messageQueue, isChatting]);

  // Rendering Nodes, Edges, Notes, Comments
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  // ReactFlow
  const { fitView } = useReactFlow();
  const { updateNodePosition, releaseFixedNode, isSimulationComplete } = useForceLayout({
    strength: -10000,
    distance: 600,
    alpha: 0.3,
    alphaDecay: 0.01,
    velocityDecay: 0.4
  });

  useEffect(() => {
    if (isSimulationComplete) {
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 1000 });
      }, 100);
    }
  }, [isSimulationComplete, fitView]);

  useEffect(() => {
    if (isSimulationComplete) {
      axios.post(`${API_URL}/api/node/saveNodePositions`, {
        nodes: nodes.map(node => ({
          id: node.id,
          position: node.position
        }))
      });
    }
  }, [isSimulationComplete]);

  const { screenToFlowPosition } = useReactFlow();

  // Handle Socket
  const socketRef = useRef<Socket | null>(null);

  // Initialize the Socket.IO connection once and clean up properly
  useEffect(() => {
    if (!graph || user === SignInStatus.UNKNOWN || user === SignInStatus.NOT_SIGNED) return;

    socketRef.current = io(`${process.env.NEXT_PUBLIC_API_URL}/graph`);
    const socket = socketRef.current;
    socket.emit("join_graph", graph.id);

    // eslint-disable-next-line
    const onAddNode = (data: any) => {
      setNodes(nds => nds.concat({ ...data } as EntityNode));
    };
    // eslint-disable-next-line
    const onAddEdge = (data: any) => {
      const newEdge: CustomEdgeType = { ...data };
      setEdges(eds => addEdge(newEdge, eds));
    };
    // eslint-disable-next-line
    const onAddNodeEdge = (nodeData: any, edgeData: any) => {
      onAddNode(nodeData);
      onAddEdge(edgeData);
    };
    // eslint-disable-next-line
    const onMoveNode = (data: any) => {
      if (user.profile_color !== data.data.picker_color) {
        setNodes(prevNodes =>
          prevNodes.map(node =>
            node.id === data.id
              ? { ...node, position: data.position, data: { ...data.data } }
              : node
          )
        );
      }
    };
    // eslint-disable-next-line
    const onStopNode = (data: any) => {
      setNodes(prevNodes =>
        prevNodes.map(node =>
          node.id === data.id
            ? {
                ...node,
                position: data.position,
                selected: false,
                dragging: false,
                data: {
                  ...node.data,
                  is_moving: false,
                  picker_color: "",
                  profile_name: ""
                }
              }
            : node
        )
      );
    };
    // eslint-disable-next-line
    const onUpdateStream = (id: any, key: any, value: any) => {
      // Optimization: Handle nodes and edges updates separately
      if (["id", "node_type", "title", "description"].includes(key)) {
        setNodes(prevNodes => {
          return prevNodes.map(node => {
            if (node.id === id) {
              const newNode = { ...node };
              if (key === "id") newNode.data.id = value;
              else if (key === "node_type") newNode.data.node_type = value;
              else if (key === "title") newNode.data.id = value;
              else newNode.data.description = value;
              return newNode;
            }
            return node;
          });
        });
      } else if (key === "edge_type") {
        setEdges(prevEdges =>
          prevEdges.map(edge => (edge.id === id ? { ...edge, data: { label: value } } : edge))
        );
      }
    };
    const onUpdateNode = (updatedNode: FyloNode) => {
      setNodes(prevNodes => {
        return prevNodes.map(node => {
          if (node.id === updatedNode.id) {
            return updatedNode;
          } else {
            return node;
          }
        });
      });
    };
    const onUpdateEdge = (updatedEdge: FyloEdge) => {
      setEdges(prevEdges => {
        return prevEdges.map(edge => {
          if (edge.id === updatedEdge.id) {
            return updatedEdge;
          } else {
            return edge;
          }
        });
      });
    };
    const onDeleteNode = (deletedNodeId: string) => {
      setNodes(prevNodes => prevNodes.filter(nd => nd.id !== deletedNodeId));
    };
    const onLockNode = (lockedNodeId: string) => {
      if (focusNodeId === lockedNodeId) return;
      setNodes(prevNodes => {
        return prevNodes.map(node => {
          if (node.id === lockedNodeId) {
            return { ...node, data: { ...node.data, locked: true } };
          } else {
            return node;
          }
        });
      });
    };
    const onUnlockNode = (unlockedNodeId: string) => {
      if (focusNodeId === unlockedNodeId) return;
      setNodes(prevNodes => {
        return prevNodes.map(node => {
          if (node.id === unlockedNodeId) {
            return { ...node, data: { ...node.data, locked: false } };
          } else {
            return node;
          }
        });
      });
    };

    // eslint-disable-next-line
    const remoteCursorData = (data: any) => {
      // eslint-disable-next-line
      setRemoteCursors((prevCursors: any) => ({
        ...prevCursors,
        [data.userId]: data
      }));
    };

    const onChatComplete = () => {
      setChatting(false);
    };

    const onAddComment = (comment: Comment) => {
      const isDuplicate = comments.some(item => item.id === comment.id);
      if (!isDuplicate) {
        setComments([...comments, comment]);
      }
    };

    socket.on("add_node", onAddNode);
    socket.on("add_edge", onAddEdge);
    socket.on("add_node_edge", onAddNodeEdge);
    socket.on("move_node", onMoveNode);
    socket.on("stop_node", onStopNode);
    socket.on("update_stream", onUpdateStream);
    socket.on("update_node", onUpdateNode);
    socket.on("update_edge", onUpdateEdge);
    socket.on("delete_node", onDeleteNode);
    socket.on("lock_node", onLockNode);
    socket.on("unlock_node", onUnlockNode);
    socket.on("update_remote_cursor", remoteCursorData);
    socket.on("chat_complete", onChatComplete);
    socket.on("add_comment", onAddComment);

    return () => {
      socket.emit("leave_graph", graph.id);
      socket.off("add_node", onAddNode);
      socket.off("add_edge", onAddEdge);
      socket.off("move_node", onMoveNode);
      socket.off("stop_node", onStopNode);
      socket.off("update_stream", onUpdateStream);
      socket.off("update_node", onUpdateNode);
      socket.off("update_edge", onUpdateEdge);
      socket.off("delete_node", onDeleteNode);
      socket.off("lock_node", onLockNode);
      socket.off("unlock_node", onUnlockNode);
      socket.off("update_remote_cursor", remoteCursorData);
      socket.off("chat_complete", onChatComplete);
      socket.off("add_comment", onAddComment);
      socket.disconnect();
    };
  }, [graph, comments, setNodes, setEdges, user, focusNodeId]);

  useEffect(() => {
    if (actionType === "UNKNOWN" && focusNodeId && graph.id) {
      socketRef.current?.emit("update_graph", "LOCK_NODE", focusNodeId, graph.id);
    }
  }, [actionType, focusNodeId, graph.id]);

  useEffect(() => {
    if (actionType === "ADD" && focusNodeId && graph.id && nodeType) {
      const position = screenToFlowPosition({ x: 0, y: 0 });
      const nodeData: FyloNode = {
        id: uuidv4(),
        graph_id: graph.id,
        type: "Default",
        position: position,
        data: {
          id: `Node ${nodes.length + 1}`,
          node_type: nodeType,
          description: ""
        }
      };
      const edgeData: FyloEdge = {
        id: uuidv4(),
        graph_id: graph.id,
        type: "floating",
        source: focusNodeId || uuidv4(),
        target: nodeData.id,
        data: {
          label: "Default",
          description: ""
        }
      };
      socketRef.current?.emit("add_node_edge", nodeData, edgeData, graph.id);
      stopEditing();
    }
  }, [actionType, focusNodeId, graph.id, nodeType, nodes, screenToFlowPosition, clear]);

  useEffect(() => {
    if (actionType === "DELETE" && focusNodeId && graph.id) {
      socketRef.current?.emit("update_graph", "DELETE_NODE", focusNodeId, graph.id);

      setNodes(prev => prev.filter(node => node.id !== focusNodeId));
      stopEditing();
    }
  }, [actionType, focusNodeId, graph.id, setNodes, clear]);

  useEffect(() => {
    if (
      actionType === "UPDATE" &&
      focusNodeId &&
      graph.id &&
      nodeTitle &&
      nodeType &&
      nodeDescription
    ) {
      setNodes(prevNodes => {
        const nodeToUpdate = prevNodes.find(node => node.id === focusNodeId);
        if (!nodeToUpdate) return prevNodes;
        
        const updatedData = {
          ...nodeToUpdate,
          data: {
            ...nodeToUpdate.data,
            id: nodeTitle,
            nodeType: nodeType,
            description: nodeDescription
          }
        };
        
        const updatedNodes = prevNodes.map(node => {
          if (node.id === focusNodeId) {
            return updatedData;
          } else {
            return node;
          }
        });
        
        // Emit socket update with the updated node data
        socketRef.current?.emit("update_graph", "UPDATE_NODE", updatedData, graph.id);
        
        return updatedNodes;
      });
    }
  }, [actionType, focusNodeId, graph.id, nodeTitle, nodeType, nodeDescription]);

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, params: FinalConnectionState) => {
      if (params.fromNode && !params.isValid) {
        const clientX =
          event instanceof MouseEvent
            ? event.clientX
            : event.touches?.[0].clientX || event.changedTouches?.[0]?.clientX || 0;

        const clientY =
          event instanceof MouseEvent
            ? event.clientY
            : event.touches?.[0].clientY || event.changedTouches?.[0]?.clientY || 0;

        const position = screenToFlowPosition({
          x: clientX,
          y: clientY
        });

        const sourceNodeElement = document.querySelector(`[data-id="${params.fromNode.id}"]`);
        if (sourceNodeElement) {
          const sourceNodeRect = sourceNodeElement.getBoundingClientRect();
          const isCursorOverSourceNode =
            clientX + 20 >= sourceNodeRect.left &&
            clientX - 20 <= sourceNodeRect.right &&
            clientY + 20 >= sourceNodeRect.top &&
            clientY - 20 <= sourceNodeRect.bottom;

          if (isCursorOverSourceNode) {
            toast.error("Targeting the source node", { position: "bottom-right" });
            return;
          }
        }

        const nodeData: FyloNode = {
          id: uuidv4(),
          graph_id: graph.id,
          type: "Default",
          position: position,
          data: {
            id: `Node ${nodes.length + 1}`,
            node_type: "",
            description: ""
          }
        };

        const edgeData: FyloEdge = {
          id: uuidv4(),
          graph_id: graph.id,
          type: "floating",
          source: params.fromNode.id,
          target: nodeData.id,
          data: {
            label: "Default",
            description: ""
          }
        };
        socketRef.current?.emit("add_node_edge", nodeData, edgeData, graph.id);
      }
    },
    [screenToFlowPosition, graph.id, nodes.length]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(undefined);
    setSidePanelIsOpen(false);
    setTool(ToolType.DEFAULT);
  }, [setSidePanelIsOpen, setSelectedNode]);

  const onNodeDrag = useCallback(
    (event: React.MouseEvent<Element, MouseEvent>, node: Node) => {
      if (user === SignInStatus.NOT_SIGNED || user === SignInStatus.UNKNOWN) return;
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });
      socketRef.current?.emit("user_cursor_move", {
        x: position.x,
        y: position.y,
        userId: user.id,
        color: user.profile_color,
        name: user.name,
        graphId: graph.id
      });
      updateNodePosition(node.id, node.position);
      socketRef.current?.emit(
        "update_graph",
        "MOVE_NODE",
        {
          ...node,
          data: {
            ...node.data,
            is_moving: true,
            picker_color: user.profile_color,
            profile_name: user.name
          }
        },
        graph.id
      );
    },
    [updateNodePosition, graph, user, screenToFlowPosition]
  );

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent<Element, MouseEvent>, node: Node) => {
      setNodes(prevNodes =>
        prevNodes.map(nd =>
          node.id === nd.id
            ? {
                ...nd,
                dragging: false,
                selected: false,
                data: {
                  ...node.data,
                  is_moving: false,
                  picker_color: "",
                  profile_name: ""
                }
              }
            : nd
        )
      );
      socketRef.current?.emit("update_graph", "STOP_NODE", node, graph.id);
      releaseFixedNode(node.id);
    },
    [setNodes, graph, releaseFixedNode]
  );

  const onMouseMove = useCallback(
    (event: React.MouseEvent<Element, MouseEvent>, node: Node) => {
      if (user === SignInStatus.NOT_SIGNED || user === SignInStatus.UNKNOWN) return;
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });
      socketRef.current?.emit("user_cursor_move", {
        x: position.x,
        y: position.y,
        userId: user.id,
        color: user.profile_color,
        name: user.name,
        graphId: graph.id
      });
      updateNodePosition(node.id, node.position);
    },
    [updateNodePosition, graph, user, screenToFlowPosition]
  );

  const handleDownload = () => {
    const graphData = {
      nodes: nodes,
      edges: edges
    };

    const jsonString = JSON.stringify(graphData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${graph.title || "graph"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // eslint-disable-next-line
  const handleUpload = (graphData: any) => {
    setNodes(graphData.nodes);
    setEdges(graphData.edges);
  };

  const [selectedTool, setTool] = useState<ToolType>(ToolType.DEFAULT);
  const type = useCommentStore(state => state.type);
  const nodeId = useCommentStore(state => state.nodeId);
  const text = useCommentStore(state => state.text);
  const submitting = useCommentStore(state => state.submitting);
  const setType = useCommentStore(state => state.setType);
  const resetFields = useCommentStore(state => state.resetFields);
  const completeSubmission = useCommentStore(state => state.completeSubmission);

  useEffect(() => {
    if (selectedTool === ToolType.NOTE) {
      setType("Note");
    } else if (selectedTool === ToolType.COMMENT) {
      setType("Cmnt");
    } else {
      resetFields();
    }
  }, [selectedTool, setType, resetFields]);

  useEffect(() => {
    if (submitting) {
      if (user === SignInStatus.NOT_SIGNED || user === SignInStatus.UNKNOWN) return;

      if (type.endsWith("Note")) {
        axios.post(`${API_URL}/api/note`, {
          author: user?.name || "",
          nodeId,
          text
        });
        setNotes(prev => [
          ...prev,
          {
            id: uuidv4(),
            created_at: new Date(),
            author: user?.name || "",
            node_id: nodeId,
            text: text
          }
        ]);
      } else if (type.endsWith("Cmnt")) {
        socketRef.current?.emit(
          "ADD_COMMENT",
          graph.id,
          user?.name || "",
          user?.profile_color,
          nodeId,
          text
        );
      }
      completeSubmission();
    }
  }, [
    graph,
    type,
    nodeId,
    text,
    submitting,
    resetFields,
    completeSubmission,
    user,
    notes,
    setNotes
  ]);

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: DefaultNodeProps | EntityNode) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  return (
    <div className="h-screen w-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onPaneClick={onPaneClick}
        onConnectEnd={onConnectEnd}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={handleNodeClick}
        edgeTypes={edgeTypes}
        connectionLineComponent={FloatingConnectionLine}
        connectionLineType={ConnectionLineType.SimpleBezier}
        className={
          selectedTool === ToolType.NOTE || selectedTool === ToolType.COMMENT ? "none-cursor" : ""
        }
      >
        {selectedNode && sidePanelIsOpen && !selectedTool && (
          <Panel
            position="top-right"
            style={{
              marginTop: "100px",
              marginRight: "30px",
              borderRadius: "8px"
            }}
          >
            <DetailSidePanel
              id={selectedNode.id}
              data={selectedNode.data}
              close={() => setSidePanelIsOpen(false)}
            />
          </Panel>
        )}
        {windowSize === WindowSize.DESKTOP && (
          <>
            {user !== SignInStatus.NOT_SIGNED && user !== SignInStatus.UNKNOWN && (
              <>
                <CommentCursor />
                <Cursors remoteCursors={remoteCursors} currentUserId={user.id} />
                {isContributor && (
                  <Toolbar tool={selectedTool} onToolChange={setTool} onSubmit={sendMessage} />
                )}
                <div className="absolute z-50 top-[25px] right-[30px] flex flex-row justify-center items-center gap-4">
                  {graph.type === "PUBLIC" && graph.creator_id !== user.id && (
                    <ForkGraphButton graphId={graph.id} graphName={graph.title} />
                  )}
                  {graph.creator_id === user.id && <ShareGraphButton graphId={graph.id} />}
                  <UserInformation />
                </div>
                <CommentInformation
                  graphId={graph.id}
                  color={user.profile_color}
                  selectedTool={selectedTool}
                  notes={notes}
                  comments={comments}
                  nodes={graphNodes}
                  edges={edges}
                />
              </>
            )}
            <div className="mt-5 flex flex-col justify-center items-center">
              {graph.type === "PUBLIC" && <p className="text-gray-500">PUBLIC GRAPH</p>}
              <p className="font-bold text-black text-xl">{graph.title}</p>
            </div>
            <GraphInformation
              graphName={graph.title}
              documents={graphDocuments}
              nodes={graphNodes}
              downloadGraph={handleDownload}
              uploadGraphDataFromJSON={handleUpload}
            />
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
            <button
              onClick={() => router.push("/dashboard")}
              className="fixed left-20 bottom-5 z-50 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
          </>
        )}
      </ReactFlow>
    </div>
  );
};

export default ForceDirectedFlow;
