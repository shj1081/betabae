import { create } from 'zustand';

type ChatStore = {
  conversationId: string | null;
  setConversationId: (id: string) => void;
  resetConversationId: () => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  conversationId: null,
  setConversationId: (id) => set({ conversationId: id }),
  resetConversationId: () => set({ conversationId: null }),
}));
