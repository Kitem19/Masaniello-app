import React from 'react';
import { ProgressionRow, Settings, BetOutcome } from '../types';

interface SummaryDisplayProps {
    rows: ProgressionRow[];
    settings: Settings;
}

const formatCurrency = (value: number) => {
    return (value ?? 0).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
};

const ProgressionEndMessage: React.FC<{ rows: ProgressionRow[] }> = ({ rows }) => {
    const firstUnplayedRow = rows.find(r => r.outcome === BetOutcome.NotPlayed);
    const endStatus = firstUnplayedRow?.status;

    if (endStatus === 'Obiettivo Raggiunto') {
        return (
            <div className="mt-6 p-4 bg-green-900/50 border border-green-700 rounded-lg text-center shadow-lg">
                <h3 className="font-bold text-lg text-green-300">🎉 Congratulazioni! Obiettivo Raggiunto! 🎉</h3>
                <p className="text-green-400 mt-1">La progressione si è conclusa con successo.</p>
            </div>
        );
    }

    if (endStatus === 'Stop Loss') {
         return (
            <div className="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-center shadow-lg">
                <h3 className="font-bold text-lg text-red-300">⚠️ Attenzione: Stop Loss Raggiunto ⚠️</h3>
                <p className="text-red-400 mt-1">La progressione è stata interrotta per limitare le perdite.</p>
            </div>
        );
    }
    
    return null;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ rows, settings }) => {
    if (!rows || rows.length === 0) {
        return null;
    }

    const { initialBankroll, profitTargetPerc } = settings;
    const targetBankroll = initialBankroll * (1 + profitTargetPerc / 100);
    
    const playedRows = rows.filter(r => r.outcome !== BetOutcome.NotPlayed && r.outcome !== BetOutcome.Cashout);
    const lastPlayedRow = [...playedRows].pop();
    const currentBankroll = lastPlayedRow ? lastPlayedRow.endBankroll : initialBankroll;
    
    const profit = currentBankroll - initialBankroll;
    const profitPerc = initialBankroll > 0 ? (profit / initialBankroll) * 100 : 0;
    
    const wins = playedRows.filter(r => r.outcome === BetOutcome.Won).length;
    const losses = playedRows.filter(r => r.outcome === BetOutcome.Lost).length;
    const winRate = playedRows.length > 0 ? (wins / playedRows.length) * 100 : 0;
    
    const progress = profitTargetPerc > 0 ? (profitPerc / profitTargetPerc) * 100 : 0;

    return (
        <div className="bg-slate-800/70 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-slate-700">
            <h2 className="text-xl font-bold text-cyan-300 mb-4 border-b border-cyan-800 pb-2">Riepilogo</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <StatCard label="Banca Attuale" value={formatCurrency(currentBankroll)} />
                <StatCard label="Obiettivo Banca" value={formatCurrency(targetBankroll)} />
                <StatCard label="Utile / Perdita" value={formatCurrency(profit)} isPositive={profit >= 0} />
                <StatCard label="Utile / Perdita (%)" value={`${profitPerc.toFixed(2)}%`} isPositive={profit >= 0} />
                <StatCard label="Eventi Giocati" value={`${playedRows.length}`} />
                <StatCard label="Vittorie" value={`${wins}`} />
                <StatCard label="Sconfitte" value={`${losses}`} />
                <StatCard label="Win Rate" value={playedRows.length > 0 ? `${winRate.toFixed(1)}%` : 'N/A'} />
            </div>
            <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-300 mb-1">Progresso Obiettivo</h3>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}></div>
                </div>
            </div>
             <ProgressionEndMessage rows={rows} />
        </div>
    );
};

interface StatCardProps {
    label: string;
    value: string | number;
    isPositive?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, isPositive }) => {
    const valueColor = isPositive === undefined
        ? 'text-yellow-300'
        : isPositive ? 'text-green-400' : 'text-red-400';

    return (
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400 uppercase">{label}</p>
            <p className={`text-lg font-bold ${valueColor}`}>{value}</p>
        </div>
    );
};


export default SummaryDisplay;