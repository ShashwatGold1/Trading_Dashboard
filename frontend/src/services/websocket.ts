/**
 * WebSocket Connection Manager
 * Handles live market data streaming with auto-reconnect logic.
 * Runs as a persistent singleton service.
 */

type TickHandler = (data: MarketTick) => void;
type ConnectionHandler = (status: 'connected' | 'disconnected' | 'error') => void;

export interface MarketTick {
    symbol: string;
    ltp: number;       // Last Traded Price
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    timestamp: number;
}

class WebSocketManager {
    private ws: WebSocket | null = null;
    private url: string = '';
    private reconnectDelay: number = 3000;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private isManualClose: boolean = false;
    private tickHandlers: Set<TickHandler> = new Set();
    private connectionHandlers: Set<ConnectionHandler> = new Set();
    private pingInterval: ReturnType<typeof setInterval> | null = null;

    /** Connect to a broker WebSocket URL */
    connect(url: string) {
        this.url = url;
        this.isManualClose = false;
        this._createSocket();
    }

    /** Cleanly disconnect */
    disconnect() {
        this.isManualClose = true;
        this._clearTimers();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    /** Subscribe to tick updates */
    onTick(handler: TickHandler) {
        this.tickHandlers.add(handler);
        return () => this.tickHandlers.delete(handler);
    }

    /** Subscribe to connection status updates */
    onStatus(handler: ConnectionHandler) {
        this.connectionHandlers.add(handler);
        return () => this.connectionHandlers.delete(handler);
    }

    /** Send data to the WebSocket server */
    send(payload: object) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(payload));
        }
    }

    private _createSocket() {
        try {
            this.ws = new WebSocket(this.url);

            this.ws.onopen = () => {
                console.log('[WS] Connected');
                this._notifyStatus('connected');
                this._startPing();
            };

            this.ws.onmessage = (event) => {
                try {
                    const data: MarketTick = JSON.parse(event.data);
                    this.tickHandlers.forEach((handler) => handler(data));
                } catch (err) {
                    console.warn('[WS] Failed to parse message', err);
                }
            };

            this.ws.onclose = () => {
                console.log('[WS] Disconnected');
                this._notifyStatus('disconnected');
                this._clearTimers();
                if (!this.isManualClose) {
                    this._scheduleReconnect();
                }
            };

            this.ws.onerror = (err) => {
                console.error('[WS] Error', err);
                this._notifyStatus('error');
            };
        } catch (err) {
            console.error('[WS] Failed to create socket', err);
            this._scheduleReconnect();
        }
    }

    private _scheduleReconnect() {
        this.reconnectTimer = setTimeout(() => {
            console.log(`[WS] Reconnecting to ${this.url}...`);
            this._createSocket();
        }, this.reconnectDelay);
    }

    private _startPing() {
        this.pingInterval = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'ping' }));
            }
        }, 25000);
    }

    private _clearTimers() {
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        if (this.pingInterval) clearInterval(this.pingInterval);
    }

    private _notifyStatus(status: 'connected' | 'disconnected' | 'error') {
        this.connectionHandlers.forEach((h) => h(status));
    }
}

// Singleton export — ONE WebSocket connection shared across the whole app
export const wsManager = new WebSocketManager();
