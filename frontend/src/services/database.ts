/**
 * Abstract Database Layer
 *
 * On Desktop (Tauri): Uses the Tauri SQL plugin / Rust backend to access SQLite directly.
 * On Mobile (Capacitor): Will use the @capacitor-community/sqlite plugin.
 *
 * This abstraction means the rest of the app (charts, OMS, alerts) calls ONE function
 * regardless of which platform it's running on.
 */

export interface OrderRecord {
    id?: number;
    symbol: string;
    type: 'BUY' | 'SELL';
    qty: number;
    price: number;
    status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
    timestamp: number;
}

export interface AlertRecord {
    id?: number;
    symbol: string;
    condition: 'ABOVE' | 'BELOW';
    targetPrice: number;
    triggered: boolean;
    createdAt: number;
}

export interface CandleRecord {
    symbol: string;
    timeframe: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    timestamp: number;
}

// Detect which platform we are running on
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

// ─────────────────────────────────────────────────────────
// PLATFORM: BROWSER / DEVELOPMENT FALLBACK (IndexedDB / localStorage)
// This is used during development and is replaced by SQLite calls
// on production Tauri/Capacitor builds.
// ─────────────────────────────────────────────────────────
const _storageKey = (table: string) => `tradedash_${table}`;

function _readTable<T>(table: string): T[] {
    const raw = localStorage.getItem(_storageKey(table));
    return raw ? JSON.parse(raw) : [];
}

function _writeTable<T>(table: string, data: T[]) {
    localStorage.setItem(_storageKey(table), JSON.stringify(data));
}

// ─────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────
export async function saveOrder(order: OrderRecord): Promise<void> {
    if (isTauri) {
        // TODO: Replace with Tauri SQL plugin call when Tauri backend is fully configured
        // await invoke('save_order', { order });
        console.log('[DB/Tauri] saveOrder called, native handler pending:', order);
    }
    const orders = _readTable<OrderRecord>('orders');
    order.id = Date.now();
    orders.push(order);
    _writeTable('orders', orders);
}

export async function getOrders(): Promise<OrderRecord[]> {
    if (isTauri) {
        // TODO: Return from Tauri SQL
    }
    return _readTable<OrderRecord>('orders');
}

export async function updateOrderStatus(id: number, status: OrderRecord['status']): Promise<void> {
    const orders = _readTable<OrderRecord>('orders');
    const idx = orders.findIndex((o) => o.id === id);
    if (idx !== -1) {
        orders[idx].status = status;
        _writeTable('orders', orders);
    }
}

// ─────────────────────────────────────────────────────────
// ALERTS
// ─────────────────────────────────────────────────────────
export async function saveAlert(alert: AlertRecord): Promise<void> {
    const alerts = _readTable<AlertRecord>('alerts');
    alert.id = Date.now();
    alerts.push(alert);
    _writeTable('alerts', alerts);
}

export async function getAlerts(): Promise<AlertRecord[]> {
    return _readTable<AlertRecord>('alerts');
}

export async function deleteAlert(id: number): Promise<void> {
    const alerts = _readTable<AlertRecord>('alerts').filter((a) => a.id !== id);
    _writeTable('alerts', alerts);
}

export async function markAlertTriggered(id: number): Promise<void> {
    const alerts = _readTable<AlertRecord>('alerts');
    const idx = alerts.findIndex((a) => a.id === id);
    if (idx !== -1) {
        alerts[idx].triggered = true;
        _writeTable('alerts', alerts);
    }
}

// ─────────────────────────────────────────────────────────
// CANDLE HISTORY (Tick Storage)
// ─────────────────────────────────────────────────────────
export async function saveCandle(candle: CandleRecord): Promise<void> {
    const key = `candles_${candle.symbol}_${candle.timeframe}`;
    const candles = _readTable<CandleRecord>(key);
    // Keep maximum 5000 candles per symbol-timeframe pair to avoid memory bloat
    if (candles.length >= 5000) candles.shift();
    candles.push(candle);
    _writeTable(key, candles);
}

export async function getCandles(symbol: string, timeframe: string): Promise<CandleRecord[]> {
    return _readTable<CandleRecord>(`candles_${symbol}_${timeframe}`);
}
