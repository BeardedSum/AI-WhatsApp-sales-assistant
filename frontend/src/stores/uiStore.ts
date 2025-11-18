/**
 * UI Store - Zustand
 * Manages UI state (sidebar, modals, selected items, etc.)
 */
import { create } from 'zustand';
import type { UIState } from '../types';

interface UIStoreState extends UIState {
  // Additional UI state
  isMobileMenuOpen: boolean;
  activeModal: string | null;

  // Actions
  setIsMobileMenuOpen: (open: boolean) => void;
  setActiveModal: (modal: string | null) => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  // State
  sidebarOpen: false,
  selectedConversationId: null,
  isMobileMenuOpen: false,
  activeModal: null,

  // Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setSelectedConversation: (id) => set({ selectedConversationId: id }),

  setIsMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

  setActiveModal: (modal) => set({ activeModal: modal }),
}));
