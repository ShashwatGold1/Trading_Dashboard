import React from 'react';
import { Topbar } from './components/Topbar';
import { Sidebar } from './components/Sidebar';
import { ChartPanel } from './components/ChartPanel';
import { WatchlistPanel } from './components/WatchlistPanel';
import { OptionChain } from './components/OptionChain';
import { OrderPanel } from './components/OrderPanel';
import { AlertsPanel } from './components/AlertsPanel';
import { useAppStore } from './store/useAppStore';

const App: React.FC = () => {
  const { activeTab, activeSymbol, ticks } = useAppStore();
  const currentPrice = ticks[activeSymbol]?.ltp;

  const renderMainContent = () => {
    switch (activeTab) {
      case 'charts':
        return (
          <div className="flex h-full">
            {/* Chart takes main area */}
            <div className="flex-1 min-w-0 h-full">
              <ChartPanel />
            </div>
            {/* Watchlist sidebar */}
            <div className="w-52 flex-shrink-0 hidden lg:block">
              <WatchlistPanel />
            </div>
          </div>
        );

      case 'options':
        return (
          <div className="flex h-full">
            <div className="flex-1 min-w-0 h-full overflow-hidden">
              <OptionChain underlyingPrice={currentPrice} />
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="h-full">
            <OrderPanel />
          </div>
        );

      case 'alerts':
        return (
          <div className="h-full">
            <AlertsPanel />
          </div>
        );

      case 'history':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-text-muted">
              <p className="text-lg font-semibold text-text mb-1">Order History</p>
              <p className="text-sm">Full history view — coming in next phase</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-full bg-background flex flex-col text-text overflow-hidden">
      <Topbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 min-w-0 overflow-hidden bg-[#131722]">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
