import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Send } from 'lucide-react';
import { saveOrder, getOrders, type OrderRecord } from '../services/database';
import { useAppStore } from '../store/useAppStore';

const STATUS_ICON = {
    PENDING: <Clock size={12} className="text-yellow-400" />,
    EXECUTED: <CheckCircle size={12} className="text-bullish" />,
    CANCELLED: <XCircle size={12} className="text-bearish" />,
};

export const OrderPanel: React.FC = () => {
    const { activeSymbol, ticks } = useAppStore();
    const [orders, setOrders] = useState<OrderRecord[]>([]);
    const [qty, setQty] = useState('25');
    const [price, setPrice] = useState('');
    const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');

    const currentPrice = ticks[activeSymbol]?.ltp ?? 0;

    const refreshOrders = async () => {
        const all = await getOrders();
        setOrders(all.slice(-50).reverse()); // Show last 50
    };

    useEffect(() => {
        refreshOrders();
    }, []);

    const placeOrder = async (type: 'BUY' | 'SELL') => {
        const execPrice = orderType === 'MARKET' ? currentPrice : parseFloat(price);
        if (!execPrice && orderType === 'LIMIT') return;
        await saveOrder({
            symbol: activeSymbol,
            type,
            qty: parseInt(qty, 10) || 1,
            price: execPrice,
            status: orderType === 'MARKET' ? 'EXECUTED' : 'PENDING',
            timestamp: Date.now(),
        });
        await refreshOrders();
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Order Entry */}
            <div className="p-4 border-b border-border bg-surface flex-shrink-0">
                <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-text">{activeSymbol}</span>
                    {currentPrice > 0 && (
                        <span className="text-sm text-text-muted">@ {currentPrice.toFixed(2)}</span>
                    )}
                </div>

                <div className="flex gap-2 mb-3">
                    {(['MARKET', 'LIMIT'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setOrderType(t)}
                            className={`px-3 py-1.5 text-xs rounded font-medium transition-colors
                ${orderType === t ? 'bg-brand text-white' : 'bg-surface-hover text-text-muted hover:text-text'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2 mb-3">
                    <div className="flex-1">
                        <label className="text-[10px] text-text-muted mb-1 block">QTY</label>
                        <input
                            type="number"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                            className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm text-text focus:outline-none focus:border-brand"
                        />
                    </div>
                    {orderType === 'LIMIT' && (
                        <div className="flex-1">
                            <label className="text-[10px] text-text-muted mb-1 block">PRICE</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder={currentPrice.toFixed(2)}
                                className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm text-text focus:outline-none focus:border-brand"
                            />
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => placeOrder('BUY')}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-bullish hover:bg-bullish/80 text-white font-bold rounded text-sm transition-colors"
                    >
                        <Send size={14} /> BUY
                    </button>
                    <button
                        onClick={() => placeOrder('SELL')}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-bearish hover:bg-bearish/80 text-white font-bold rounded text-sm transition-colors"
                    >
                        <Send size={14} /> SELL
                    </button>
                </div>
            </div>

            {/* Order History */}
            <div className="flex-1 overflow-y-auto">
                <div className="px-3 py-2 text-xs font-semibold text-text-muted border-b border-border">
                    ORDER HISTORY
                </div>
                {orders.length === 0 && (
                    <p className="text-center text-text-muted text-xs mt-8">No orders placed yet</p>
                )}
                {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-2 px-3 border-b border-border/40 hover:bg-surface-hover">
                        <div className="flex items-center gap-2">
                            {STATUS_ICON[order.status]}
                            <div className="flex flex-col">
                                <span className={`text-xs font-bold ${order.type === 'BUY' ? 'text-bullish' : 'text-bearish'}`}>
                                    {order.type} {order.symbol}
                                </span>
                                <span className="text-[10px] text-text-muted">
                                    {new Date(order.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-semibold text-text">{order.qty} × {order.price.toFixed(2)}</span>
                            <span className={`text-[10px] font-medium
                ${order.status === 'EXECUTED' ? 'text-bullish' : order.status === 'CANCELLED' ? 'text-bearish' : 'text-yellow-400'}`}>
                                {order.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
