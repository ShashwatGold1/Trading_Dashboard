import React from 'react';

interface OptionData {
    strike: number;
    ce: {
        oi: number;
        oiChange: number;
        volume: number;
        ltp: number;
        iv: number;
        delta: number;
    };
    pe: {
        oi: number;
        oiChange: number;
        volume: number;
        ltp: number;
        iv: number;
        delta: number;
    };
}

// Generate placeholder option chain data for development
function generateSampleOptionChain(atm: number, numStrikes = 10): OptionData[] {
    const step = 50;
    const rows: OptionData[] = [];
    for (let i = -numStrikes; i <= numStrikes; i++) {
        const strike = atm + i * step;
        rows.push({
            strike,
            ce: {
                oi: Math.floor(Math.random() * 500000),
                oiChange: Math.floor(Math.random() * 50000 - 25000),
                volume: Math.floor(Math.random() * 100000),
                ltp: Math.max(0.05, (atm - strike) + Math.random() * 50),
                iv: 12 + Math.random() * 10,
                delta: Math.max(0, Math.min(1, 0.5 + (atm - strike) / (atm * 0.03))),
            },
            pe: {
                oi: Math.floor(Math.random() * 500000),
                oiChange: Math.floor(Math.random() * 50000 - 25000),
                volume: Math.floor(Math.random() * 100000),
                ltp: Math.max(0.05, (strike - atm) + Math.random() * 50),
                iv: 12 + Math.random() * 10,
                delta: Math.min(0, -0.5 + (atm - strike) / (atm * 0.03)),
            },
        });
    }
    return rows;
}

const fmt = (n: number) => n.toLocaleString('en-IN');
const fmtPct = (n: number) => (n >= 0 ? `+${n.toFixed(2)}` : n.toFixed(2));

export const OptionChain: React.FC<{ underlyingPrice?: number }> = ({
    underlyingPrice = 22500,
}) => {
    const atm = Math.round(underlyingPrice / 50) * 50;
    const data = React.useMemo(() => generateSampleOptionChain(atm), [atm]);

    return (
        <div className="h-full overflow-auto bg-background">
            <table className="w-full text-xs border-collapse">
                <thead className="sticky top-0 bg-surface z-10">
                    <tr>
                        <th colSpan={4} className="text-center text-brand py-2 border-b border-border font-semibold">
                            CALLS (CE)
                        </th>
                        <th className="text-center py-2 border-b border-border text-text font-bold bg-surface-hover px-3">
                            STRIKE
                        </th>
                        <th colSpan={4} className="text-center text-bearish py-2 border-b border-border font-semibold">
                            PUTS (PE)
                        </th>
                    </tr>
                    <tr className="text-text-muted border-b border-border">
                        <th className="py-1 px-2 text-right">OI</th>
                        <th className="py-1 px-2 text-right">Chg OI</th>
                        <th className="py-1 px-2 text-right">IV%</th>
                        <th className="py-1 px-2 text-right font-semibold text-brand">LTP</th>
                        <th className="py-1 px-3 text-center bg-surface-hover">Price</th>
                        <th className="py-1 px-2 text-left font-semibold text-bearish">LTP</th>
                        <th className="py-1 px-2 text-left">IV%</th>
                        <th className="py-1 px-2 text-left">Chg OI</th>
                        <th className="py-1 px-2 text-left">OI</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => {
                        const isAtm = row.strike === atm;
                        const ceItm = row.strike < atm;
                        const peItm = row.strike > atm;

                        return (
                            <tr
                                key={row.strike}
                                className={`border-b border-border/40 transition-colors hover:bg-surface-hover
                  ${isAtm ? 'bg-brand/5 font-semibold' : ''}`}
                            >
                                {/* CE Side */}
                                <td className={`py-1 px-2 text-right ${ceItm ? 'bg-brand/5' : ''}`}>
                                    {fmt(row.ce.oi)}
                                </td>
                                <td className={`py-1 px-2 text-right text-xs ${row.ce.oiChange >= 0 ? 'text-bullish' : 'text-bearish'} ${ceItm ? 'bg-brand/5' : ''}`}>
                                    {fmtPct(row.ce.oiChange / 1000)}K
                                </td>
                                <td className={`py-1 px-2 text-right text-text-muted ${ceItm ? 'bg-brand/5' : ''}`}>
                                    {row.ce.iv.toFixed(1)}
                                </td>
                                <td className={`py-1 px-2 text-right font-semibold text-brand ${ceItm ? 'bg-brand/5' : ''}`}>
                                    {row.ce.ltp.toFixed(2)}
                                </td>

                                {/* Strike Center */}
                                <td className={`py-1 px-3 text-center font-bold text-sm bg-surface-hover ${isAtm ? 'text-brand' : 'text-text'}`}>
                                    {row.strike}
                                    {isAtm && <span className="ml-1 text-[9px] bg-brand text-white rounded px-1">ATM</span>}
                                </td>

                                {/* PE Side */}
                                <td className={`py-1 px-2 text-left font-semibold text-bearish ${peItm ? 'bg-bearish/5' : ''}`}>
                                    {row.pe.ltp.toFixed(2)}
                                </td>
                                <td className={`py-1 px-2 text-left text-text-muted ${peItm ? 'bg-bearish/5' : ''}`}>
                                    {row.pe.iv.toFixed(1)}
                                </td>
                                <td className={`py-1 px-2 text-left text-xs ${row.pe.oiChange >= 0 ? 'text-bullish' : 'text-bearish'} ${peItm ? 'bg-bearish/5' : ''}`}>
                                    {fmtPct(row.pe.oiChange / 1000)}K
                                </td>
                                <td className={`py-1 px-2 text-left ${peItm ? 'bg-bearish/5' : ''}`}>
                                    {fmt(row.pe.oi)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
