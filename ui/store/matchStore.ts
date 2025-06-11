import { create } from 'zustand';

type MatchStore = {
  selectedUserId: number | null;
  setSelectedUserId: (id: number) => void;
  resetSelectedUserId: () => void;
};

export const useMatchStore = create<MatchStore>((set) => ({
  selectedUserId: null,
  setSelectedUserId: (id) => set({ selectedUserId: id }),
  resetSelectedUserId: () => set({ selectedUserId: null }),
}));
