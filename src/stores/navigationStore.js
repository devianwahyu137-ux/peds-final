import { create } from "zustand";

export const useNavigationStore = create((set) => ({
  activeTab: "home",
  setTab: (tab) => set({ activeTab: tab }),
}));
