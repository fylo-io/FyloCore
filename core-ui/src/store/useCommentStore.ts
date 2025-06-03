import { create } from "zustand";

interface CommentState {
  type: string;
  nodeId: string;
  text: string;
  submitting: boolean;
  setType: (newType: string) => void;
  setNodeId: (newNodeId: string) => void;
  setText: (newText: string) => void;
  resetFields: () => void;
  markAsReady: () => void;
  completeSubmission: () => void;
}

const useCommentStore = create<CommentState>(set => ({
  type: "",
  nodeId: "",
  text: "",
  submitting: false,
  setType: (newType: string) => set({ type: newType }),
  setNodeId: (newNodeId: string) => set({ nodeId: newNodeId }),
  setText: (newText: string) => set({ text: newText }),
  resetFields: () => set({ type: "", nodeId: "", text: "" }),
  markAsReady: () => set({ submitting: true }),
  completeSubmission: () => set({ submitting: false })
}));

export default useCommentStore;
