import React from 'react';
import { TrendingUp, TrendingDown, Plus, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const WatchlistPanel: React.FC = () => {
    const { watchlist, ticks, activeSymbol, setActiveSymbol, addToWatchlist, removeFromWatchlist } =
        useAppStore();
    const [newSymbol, setNewSymbol] = React.useState('');

    const handleAdd = () => {
        const sym = newSymbol.trim().toUpperCase();
        if (sym) {
            addToWatchlist(sym);
            setNewSymbol('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-surface border-l border-border w-full">
            <div className="p-3 border-b border-border flex-shrink-0">
                <h3 className="text-sm font-semibold text-text mb-2">Watchlist</h3>
                <div className="flex gap-1">
                    <input
                        type="text"
                        placeholder="Add symbol..."
                        value={newSymbol}
                        onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs text-text placeholder:text-text-muted focus:outline-none focus:border-brand"
                    />
                    <button
                        onClick={handleAdd}
                        className="p-1 bg-brand hover:bg-brand-hover rounded text-white"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {watchlist.map((symbol) => {
                    const tick = ticks[symbol];
                    const isUp = tick ? tick.ltp >= tick.open : true;
                    const isActive = symbol === activeSymbol;
                    const change = tick ? ((tick.ltp - tick.open) / tick.open) * 100 : null;

                    return (
                        <div
                            key={symbol}
                            onClick={() => setActiveSymbol(symbol)}
                            className={`flex items-center justify-between p-2 px-3 cursor-pointer border-b border-border/50 transition-colors group
                ${isActive ? 'bg-brand/10 border-l-2 border-l-brand' : 'hover:bg-surface-hover'}`}
                        >
                            <div className="flex flex-col">
                                <span className={`text-xs font-semibold ${isActive ? 'text-brand' : 'text-text'}`}>
                                    {symbol}
                                </span>
                                {change !== null && (
                                    <span className={`text-[10px] font-medium flex items-center gap-0.5 ${isUp ? 'text-bullish' : 'text-bearish'}`}>
                                        {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                        {change.toFixed(2)}%
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {tick ? (
                                    <div className="flex flex-col items-end">
                                        <span className={`text-xs font-bold ${isUp ? 'text-bullish' : 'text-bearish'}`}>
                                            {tick.ltp.toFixed(2)}
                                        </span>
                                        <span className="text-[10px] text-text-muted">
                                            Vol: {(tick.volume / 1000).toFixed(1)}K
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-[10px] text-text-muted">No data</span>
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFromWatchlist(symbol); }}
                                    className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-bearish transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
