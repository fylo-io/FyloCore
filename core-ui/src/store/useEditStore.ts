import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EditStore {
  focusNodeId: string | null;
  actionType: "ADD" | "DELETE" | "UPDATE" | "UNKNOWN" | null;
  nodeType: string;
  nodeTitle: string;
  nodeDescription: string;
  startEditing: (id: string) => void;
  stopEditing: () => void;
  setAddAction: (id: string, newType: string) => void;
  setDeleteAction: (id: string) => void;
  setUpdateAction: (id: string, newType: string, newTitle: string, newDescription: string) => void;
  clear: () => void;
}

export const useEditStore = create<EditStore>()(
  persist(
    set => ({
      focusNodeId: null,
      actionType: null,
      nodeType: "",
      nodeTitle: "",
      nodeDescription: "",
      startEditing: (id: string) => set({ focusNodeId: id, actionType: "UNKNOWN" }),
      stopEditing: () => set({ actionType: null }),
      setAddAction: (id: string, newType: string) =>
        set({ focusNodeId: id, actionType: "ADD", nodeType: newType }),
      setDeleteAction: (id: string) => set({ focusNodeId: id, actionType: "DELETE" }),
      setUpdateAction: (id: string, newType: string, newTitle: string, newDescription: string) =>
        set({
          focusNodeId: id,
          actionType: "UPDATE",
          nodeType: newType,
          nodeTitle: newTitle,
          nodeDescription: newDescription
        }),
      clear: () => set({ focusNodeId: null, actionType: null })
    }),
    { name: "edit-store" }
  )
);
