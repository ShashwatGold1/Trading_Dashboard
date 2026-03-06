import React from 'react';
import { Topbar } from './components/Topbar';
import { Sidebar } from './components/Sidebar';
import { useAppStore } from './store/useAppStore';

const App: React.FC = () => {
  const activeTab = useAppStore((state) => state.activeTab);

  return (
    <div className="h-screen w-full bg-background flex flex-col text-text overflow-hidden">
      <Topbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 flex flex-col relative bg-[#131722]">
          {/* Main workspace area */}
          <div className="flex-1 p-4 lg:p-6 overflow-y-auto w-full h-full">
            <div className="h-full w-full rounded-xl border border-border bg-surface/50 shadow-inner flex flex-col items-center justify-center">
              <h2 className="text-2xl font-semibold mb-2 text-brand">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} View
              </h2>
              <p className="text-text-muted">
                Component scaffolding in progress...
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
