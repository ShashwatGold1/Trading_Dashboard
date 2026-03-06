import React from 'react';
import { LineChart, LayoutDashboard, History, Settings, Bell } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const NAV_ITEMS = [
    { id: 'charts', label: 'Charts', icon: LineChart },
    { id: 'options', label: 'Option Chain', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: History },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
] as const;

export const Sidebar: React.FC = () => {
    const { isSidebarOpen, activeTab, setActiveTab } = useAppStore();

    if (!isSidebarOpen) return null;

    return (
        <aside className="w-64 border-r border-border bg-surface h-[calc(100vh-3.5rem)] overflow-y-auto flex-shrink-0 flex flex-col hidden md:flex">
            <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left
              ${activeTab === item.id
                                ? 'bg-brand/10 text-brand font-medium'
                                : 'text-text-muted hover:bg-surface-hover hover:text-text'
                            }`}
                    >
                        <item.icon size={20} className={activeTab === item.id ? 'text-brand' : ''} />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-border mt-auto">
                <div className="text-xs text-text-muted">
                    Local Storage: Active<br />
                    Latency: ~12ms
                </div>
            </div>
        </aside>
    );
};
