import { EntityNode } from "@/components/nodes";
import { DefaultNodeProps } from "@/types/detailSidePanel";
import { create } from "zustand";

interface SelectedNodeProps {
  selectedNode: DefaultNodeProps | EntityNode | undefined;
  setSelectedNode: (params: DefaultNodeProps | EntityNode | undefined) => void;
}

export const useSelectedNodeStore = create<SelectedNodeProps>(set => ({
  selectedNode: undefined,
  setSelectedNode: params => set({ selectedNode: params })
}));
