import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Trash2, Plus } from 'lucide-react';
import { saveAlert, getAlerts, deleteAlert, type AlertRecord } from '../services/database';
import { useAppStore } from '../store/useAppStore';

export const AlertsPanel: React.FC = () => {
    const { activeSymbol, ticks } = useAppStore();
    const [alerts, setAlerts] = useState<AlertRecord[]>([]);
    const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
    const [targetPrice, setTargetPrice] = useState('');

    const currentPrice = ticks[activeSymbol]?.ltp ?? 0;

    const refreshAlerts = async () => {
        setAlerts(await getAlerts());
    };

    useEffect(() => {
        refreshAlerts();
    }, []);

    // Alert engine: Check all active alerts on every tick
    useEffect(() => {
        alerts.forEach(async (alert) => {
            if (alert.triggered) return;
            const tick = ticks[alert.symbol];
            if (!tick) return;
            const triggered =
                (alert.condition === 'ABOVE' && tick.ltp >= alert.targetPrice) ||
                (alert.condition === 'BELOW' && tick.ltp <= alert.targetPrice);
            if (triggered) {
                // Trigger browser notification
                if (Notification.permission === 'granted') {
                    new Notification(`🔔 Alert: ${alert.symbol}`, {
                        body: `Price ${alert.condition === 'ABOVE' ? 'crossed above' : 'dropped below'} ${alert.targetPrice}. Current: ${tick.ltp.toFixed(2)}`,
                    });
                }
                await refreshAlerts();
            }
        });
    }, [ticks, alerts]);

    const handleAdd = async () => {
        const price = parseFloat(targetPrice);
        if (!price) return;
        await saveAlert({
            symbol: activeSymbol,
            condition,
            targetPrice: price,
            triggered: false,
            createdAt: Date.now(),
        });
        setTargetPrice('');
        await refreshAlerts();
    };

    const handleDelete = async (id: number) => {
        await deleteAlert(id);
        await refreshAlerts();
    };

    const requestNotificationPermission = () => {
        if (Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    };

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="p-4 border-b border-border bg-surface flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-text text-sm">Price Alerts</h3>
                    <button
                        onClick={requestNotificationPermission}
                        className="text-xs text-text-muted hover:text-brand flex items-center gap-1"
                    >
                        <Bell size={12} /> Enable Notifications
                    </button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <span className="font-semibold text-sm text-brand">{activeSymbol}</span>
                    {currentPrice > 0 && (
                        <span className="text-xs text-text-muted">@ {currentPrice.toFixed(2)}</span>
                    )}
                </div>

                <div className="flex gap-2 mb-3">
                    {(['ABOVE', 'BELOW'] as const).map((c) => (
                        <button
                            key={c}
                            onClick={() => setCondition(c)}
                            className={`px-3 py-1.5 text-xs rounded font-medium transition-colors
                ${condition === c
                                    ? c === 'ABOVE' ? 'bg-bullish text-white' : 'bg-bearish text-white'
                                    : 'bg-surface-hover text-text-muted hover:text-text'
                                }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <input
                        type="number"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        placeholder={`Target price (${condition})`}
                        className="flex-1 bg-background border border-border rounded px-2 py-1.5 text-sm text-text focus:outline-none focus:border-brand"
                    />
                    <button
                        onClick={handleAdd}
                        className="px-3 py-1.5 bg-brand hover:bg-brand-hover text-white rounded text-xs font-medium flex items-center gap-1"
                    >
                        <Plus size={14} /> Add
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="px-3 py-2 text-xs font-semibold text-text-muted border-b border-border">
                    ACTIVE ALERTS ({alerts.filter((a) => !a.triggered).length})
                </div>

                {alerts.length === 0 && (
                    <p className="text-center text-text-muted text-xs mt-8">No alerts set</p>
                )}

                {alerts.map((alert) => (
                    <div
                        key={alert.id}
                        className={`flex items-center justify-between p-2 px-3 border-b border-border/40
              ${alert.triggered ? 'opacity-50' : 'hover:bg-surface-hover'}`}
                    >
                        <div className="flex items-center gap-2">
                            {alert.triggered ? <BellOff size={12} className="text-text-muted" /> : <Bell size={12} className="text-brand" />}
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-text">{alert.symbol}</span>
                                <span className={`text-[10px] font-medium ${alert.condition === 'ABOVE' ? 'text-bullish' : 'text-bearish'}`}>
                                    {alert.condition} {alert.targetPrice.toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {alert.triggered && (
                                <span className="text-[10px] text-yellow-400 font-medium">TRIGGERED</span>
                            )}
                            <button
                                onClick={() => handleDelete(alert.id!)}
                                className="text-text-muted hover:text-bearish transition-colors"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
