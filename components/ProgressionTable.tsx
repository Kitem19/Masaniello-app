import React, { useState, useEffect } from 'react';
import { ProgressionRow, BetType, BetOutcome, CalculationMode } from '../types';

interface ProgressionTableProps {
    rows: ProgressionRow[];
    onUpdateRow: (id: number, newValues: Partial<ProgressionRow>) => void;
    onAddRow: () => void;
    onDeleteRow: (id: number) => void;
}

const formatCurrency = (value: number) => {
    return (value ?? 0).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
};

const EditableCell: React.FC<{ value: string; onSave: (newValue: string) => void; disabled: boolean }> = ({ value, onSave, disabled }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const handleSave = () => {
        onSave(currentValue);
        setIsEditing(false);
    };

    if (disabled) {
        return <span className="px-2 py-1 truncate">{value}</span>;
    }

    if (isEditing) {
        return (
            <input
                type="text"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="bg-slate-700 text-white w-full px-2 py-1 rounded border border-slate-600 focus:ring-cyan-500 focus:border-cyan-500"
                autoFocus
            />
        );
    }

    return (
        <button onClick={() => setIsEditing(true)} className="w-full text-left px-2 py-1 rounded hover:bg-slate-700 transition-colors truncate">
            {value}
        </button>
    );
};

const ProgressionTable: React.FC<ProgressionTableProps> = ({ rows, onUpdateRow, onAddRow, onDeleteRow }) => {
    const isRowEditable = (row: ProgressionRow) => row.outcome === BetOutcome.NotPlayed;

    return (
        <div className="bg-slate-800/70 backdrop-blur-sm rounded-lg shadow-lg h-full flex flex-col border border-slate-700 overflow-hidden">
            <div className="flex-grow overflow-auto">
                <table className="w-full text-sm text-left text-slate-300 table-fixed">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                            <th scope="col" className="p-3 w-12 text-center">#</th>
                            <th scope="col" className="p-3 w-48">Descrizione</th>
                            <th scope="col" className="p-3 w-28 text-right">Cassa Iniz.</th>
                            <th scope="col" className="p-3 w-24 text-center">Quota</th>
                            <th scope="col" className="p-3 w-24 text-center">Tipo</th>
                            <th scope="col" className="p-3 w-16 text-center">Mod.</th>
                            <th scope="col" className="p-3 w-28 text-right">Puntata</th>
                            <th scope="col" className="p-3 w-28 text-right">Responsab.</th>
                            <th scope="col" className="p-3 w-28 text-right">Vincita Pot.</th>
                            <th scope="col" className="p-3 w-32 text-center">Esito</th>
                            <th scope="col" className="p-3 w-28 text-right">Cassa Fine</th>
                            <th scope="col" className="p-3 w-24 text-center">Win Rim.</th>
                            <th scope="col" className="p-3 w-32">Stato</th>
                            <th scope="col" className="p-3 w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {rows.map((row) => {
                            const editable = isRowEditable(row);
                            const isFixedStake = row.calculationMode === CalculationMode.FIXED_STAKE;

                            return (
                                <tr key={row.id} className="hover:bg-slate-700/50 transition-colors duration-150">
                                    <td className="p-3 font-medium text-slate-400 text-center">{row.eventNumber}</td>
                                    <td className="p-1">
                                        <EditableCell 
                                            value={row.description} 
                                            onSave={(val) => onUpdateRow(row.id, { description: val })}
                                            disabled={!editable}
                                        />
                                    </td>
                                    <td className="p-3 text-right">{formatCurrency(row.startBankroll)}</td>
                                    <td className="p-1">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={String(row.odds).replace('.', ',')}
                                            onChange={(e) => onUpdateRow(row.id, { odds: parseFloat(e.target.value.replace(',', '.')) || 0 })}
                                            disabled={!editable}
                                            className="w-full bg-slate-800 border-slate-600 rounded px-2 py-1 text-yellow-300 disabled:bg-transparent disabled:border-transparent disabled:text-slate-300 text-center"
                                        />
                                    </td>
                                    <td className="p-1">
                                        <button
                                            onClick={() => onUpdateRow(row.id, { type: row.type === BetType.BACK ? BetType.LAY : BetType.BACK })}
                                            disabled={!editable}
                                            className={`w-full py-1 text-xs font-bold rounded transition-colors ${row.type === BetType.BACK ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-pink-600 text-white hover:bg-pink-500'} disabled:bg-slate-600 disabled:opacity-50`}
                                        >
                                            {row.type}
                                        </button>
                                    </td>
                                    <td className="p-1 text-center">
                                         <button 
                                            onClick={() => onUpdateRow(row.id, { calculationMode: isFixedStake ? CalculationMode.FIXED_PROFIT : CalculationMode.FIXED_STAKE })}
                                            disabled={!editable}
                                            className="p-2 rounded-full hover:bg-slate-600 disabled:opacity-50"
                                            aria-label={isFixedStake ? "Modalità fissa" : "Modalità automatica"}
                                        >
                                            {isFixedStake ? 
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg> :
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.906-.75 1 1 0 001.732-1A5.002 5.002 0 0010 2z" /></svg>
                                            }
                                        </button>
                                    </td>
                                    <td className="p-1">
                                         <input
                                            type="text"
                                            inputMode="decimal"
                                            value={String(row.stake).replace('.', ',')}
                                            onChange={(e) => onUpdateRow(row.id, { stake: parseFloat(e.target.value.replace(',', '.')) || 0 })}
                                            disabled={!editable || !isFixedStake || row.type !== BetType.BACK}
                                            className="w-full bg-slate-800 border-slate-600 rounded px-2 py-1 text-yellow-300 disabled:bg-transparent disabled:border-transparent disabled:text-slate-300 text-right"
                                        />
                                    </td>
                                    <td className="p-1">
                                         <input
                                            type="text"
                                            inputMode="decimal"
                                            value={String(row.liability).replace('.', ',')}
                                            onChange={(e) => onUpdateRow(row.id, { liability: parseFloat(e.target.value.replace(',', '.')) || 0 })}
                                            disabled={!editable || !isFixedStake || row.type !== BetType.LAY}
                                            className="w-full bg-slate-800 border-slate-600 rounded px-2 py-1 text-red-400 disabled:bg-transparent disabled:border-transparent disabled:text-slate-300 text-right"
                                        />
                                    </td>
                                    <td className="p-3 text-right text-green-400">{formatCurrency(row.potentialWin)}</td>
                                    <td className="p-1">
                                        <select 
                                            value={row.outcome}
                                            onChange={(e) => onUpdateRow(row.id, { outcome: e.target.value as BetOutcome })}
                                            className="w-full bg-slate-800 border-slate-600 rounded px-2 py-1"
                                        >
                                            {Object.values(BetOutcome).map(outcome => (
                                                <option key={outcome} value={outcome}>{outcome}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-3 font-semibold text-right">{formatCurrency(row.endBankroll)}</td>
                                    <td className="p-3 text-center">{typeof row.remainingWins === 'number' ? row.remainingWins.toFixed(2) : row.remainingWins}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            row.status === 'Attivo' ? 'bg-blue-900 text-blue-300' :
                                            row.status === 'Obiettivo Raggiunto' ? 'bg-green-900 text-green-300' :
                                            row.status === 'Stop Loss' ? 'bg-red-900 text-red-300' :
                                            row.status === 'Banca Insufficiente' ? 'bg-yellow-900 text-yellow-300' :
                                            'bg-slate-700 text-slate-300'
                                        }`}>{row.status}</span>
                                    </td>
                                    <td className="p-1 text-center">
                                        <button 
                                            onClick={() => onDeleteRow(row.id)} 
                                            className="p-2 rounded-full text-slate-500 hover:bg-red-900 hover:text-red-300 transition-colors"
                                            aria-label="Elimina evento"
                                        >
                                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-slate-700 bg-slate-800/70">
                <button
                    onClick={onAddRow}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-cyan-300 font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                    + Aggiungi Evento
                </button>
            </div>
        </div>
    );
};

export default ProgressionTable;
