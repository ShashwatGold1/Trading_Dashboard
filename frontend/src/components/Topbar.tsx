import React from 'react';
import { Menu, Activity } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const Topbar: React.FC = () => {
    const toggleSidebar = useAppStore((state) => state.toggleSidebar);

    return (
        <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-4 sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <button
                    onClick={toggleSidebar}
                    className="p-1 hover:bg-surface-hover rounded-md text-text-muted hover:text-text transition-colors"
                >
                    <Menu size={20} />
                </button>
                <div className="flex items-center gap-2 text-brand font-bold text-lg">
                    <Activity size={24} />
                    <span>TradeDash</span>
                </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-text-muted">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-bullish"></span>
                    <span>Broker: Connected</span>
                </div>
            </div>
        </header>
    );
};
