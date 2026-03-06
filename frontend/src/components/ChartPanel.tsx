import React, { useEffect, useRef } from 'react';
import {
    createChart,
    CandlestickSeries,
    type IChartApi,
    type ISeriesApi,
    type CandlestickData,
    type Time,
    ColorType,
} from 'lightweight-charts';
import { useAppStore } from '../store/useAppStore';
import { getCandles } from '../services/database';

const TIMEFRAMES = ['1m', '3m', '5m', '15m', '30m', '1h', '4h', '1D'];

export const ChartPanel: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const { activeSymbol, ticks } = useAppStore();
    const [timeframe, setTimeframe] = React.useState('5m');

    // Initialize the chart once
    useEffect(() => {
        if (!containerRef.current) return;

        const chart = createChart(containerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#131722' },
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: { color: '#1e2633' },
                horzLines: { color: '#1e2633' },
            },
            crosshair: { mode: 1 },
            rightPriceScale: { borderColor: '#334155' },
            timeScale: {
                borderColor: '#334155',
                timeVisible: true,
                secondsVisible: false,
            },
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
        });

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderUpColor: '#22c55e',
            borderDownColor: '#ef4444',
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        });

        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;

        const handleResize = () => {
            if (containerRef.current) {
                chart.applyOptions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    // Load historical candles when symbol or timeframe changes
    useEffect(() => {
        const loadCandles = async () => {
            if (!candleSeriesRef.current) return;
            const candles = await getCandles(activeSymbol, timeframe);
            if (candles.length > 0) {
                const chartData: CandlestickData<Time>[] = candles.map((c) => ({
                    time: (c.timestamp / 1000) as Time,
                    open: c.open,
                    high: c.high,
                    low: c.low,
                    close: c.close,
                }));
                candleSeriesRef.current.setData(chartData);
            }
        };
        loadCandles();
    }, [activeSymbol, timeframe]);

    // Update chart with latest live tick
    useEffect(() => {
        const tick = ticks[activeSymbol];
        if (!tick || !candleSeriesRef.current) return;
        candleSeriesRef.current.update({
            time: Math.floor(tick.timestamp / 1000) as Time,
            open: tick.open,
            high: tick.high,
            low: tick.low,
            close: tick.ltp,
        });
    }, [ticks, activeSymbol]);

    const activeTick = ticks[activeSymbol];

    return (
        <div className="flex flex-col h-full w-full">
            {/* Symbol & Timeframe Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface flex-shrink-0 flex-wrap gap-2">
                <div className="flex items-center gap-4">
                    <span className="font-bold text-text text-lg">{activeSymbol}</span>
                    {activeTick && (
                        <div className="flex items-center gap-3 text-sm">
                            <span className={`font-semibold text-base ${activeTick.ltp >= activeTick.open ? 'text-bullish' : 'text-bearish'}`}>
                                {activeTick.ltp.toFixed(2)}
                            </span>
                            <span className="text-text-muted hidden sm:inline">O: {activeTick.open.toFixed(2)}</span>
                            <span className="text-text-muted hidden sm:inline">H: <span className="text-bullish">{activeTick.high.toFixed(2)}</span></span>
                            <span className="text-text-muted hidden sm:inline">L: <span className="text-bearish">{activeTick.low.toFixed(2)}</span></span>
                            <span className="text-text-muted hidden md:inline">V: {(activeTick.volume / 1000).toFixed(1)}K</span>
                        </div>
                    )}
                </div>

                {/* Timeframe Selector */}
                <div className="flex items-center gap-1">
                    {TIMEFRAMES.map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${timeframe === tf
                                    ? 'bg-brand text-white font-medium'
                                    : 'text-text-muted hover:text-text hover:bg-surface-hover'
                                }`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart Canvas */}
            <div ref={containerRef} className="flex-1 w-full" id="chart-container" />
        </div>
    );
};
