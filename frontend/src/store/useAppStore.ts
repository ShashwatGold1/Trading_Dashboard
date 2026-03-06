import { create } from 'zustand';

interface AppState {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    activeTab: 'charts' | 'options' | 'orders' | 'alerts' | 'history';
    setActiveTab: (tab: 'charts' | 'options' | 'orders' | 'alerts' | 'history') => void;
}

export const useAppStore = create<AppState>((set) => ({
    isSidebarOpen: true,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    activeTab: 'charts',
    setActiveTab: (activeTab) => set({ activeTab }),
}));
