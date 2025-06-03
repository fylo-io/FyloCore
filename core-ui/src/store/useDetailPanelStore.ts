import { create } from "zustand";

interface DetailPanelStore {
  panelIsOpen: boolean;
  setPanelIsOpen: (isOpen: boolean) => void;
}

export const useDetailPanelStore = create<DetailPanelStore>(set => ({
  panelIsOpen: false,
  setPanelIsOpen: isOpen => set({ panelIsOpen: isOpen })
}));
