import { create } from 'zustand';
import type { MarketTick } from '../services/websocket';

// --- Navigation / Layout ---
type ActiveTab = 'charts' | 'options' | 'orders' | 'alerts' | 'history';

// --- Connection ---
type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'idle';

interface AppState {
    // Layout
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    activeTab: ActiveTab;
    setActiveTab: (tab: ActiveTab) => void;

    // Connection
    connectionStatus: ConnectionStatus;
    setConnectionStatus: (status: ConnectionStatus) => void;

    // Live Market Data
    watchlist: string[];
    ticks: Record<string, MarketTick>;       // symbol -> latest tick
    addToWatchlist: (symbol: string) => void;
    removeFromWatchlist: (symbol: string) => void;
    updateTick: (tick: MarketTick) => void;

    // Active Chart Symbol
    activeSymbol: string;
    setActiveSymbol: (symbol: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
    // Layout
    isSidebarOpen: true,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    activeTab: 'charts',
    setActiveTab: (activeTab) => set({ activeTab }),

    // Connection
    connectionStatus: 'idle',
    setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

    // Live Market Data
    watchlist: ['NIFTY', 'BANKNIFTY', 'RELIANCE', 'TCS'],
    ticks: {},
    addToWatchlist: (symbol) =>
        set((state) => ({
            watchlist: state.watchlist.includes(symbol)
                ? state.watchlist
                : [...state.watchlist, symbol],
        })),
    removeFromWatchlist: (symbol) =>
        set((state) => ({
            watchlist: state.watchlist.filter((s) => s !== symbol),
        })),
    updateTick: (tick) =>
        set((state) => ({
            ticks: { ...state.ticks, [tick.symbol]: tick },
        })),

    // Active Chart Symbol
    activeSymbol: 'NIFTY',
    setActiveSymbol: (activeSymbol) => set({ activeSymbol }),
}));
