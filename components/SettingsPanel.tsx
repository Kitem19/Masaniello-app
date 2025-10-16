import React, { useState, useMemo, useEffect } from 'react';
import { Settings, ProgressionRow, ProfitCalculationMode } from '../types';

interface ControlPanelProps {
    settings: Settings;
    progression: ProgressionRow[];
    onSettingsChange: (newSettings: Partial<Settings>) => void;
    onRegenerate: () => void;
    onLoad: (settings: Settings, progression: ProgressionRow[]) => void;
}

interface SavedState {
    name: string;
    settings: Settings;
    progression: ProgressionRow[];
    timestamp: number;
}

const STORAGE_KEY = 'masaniello_progressions_kitem';

const BetfairCalculator: React.FC = () => {
    const [commission, setCommission] = useState(5);
    const [backOdds, setBackOdds] = useState(2.0);
    const [layOdds, setLayOdds] = useState(2.1);

    const netBackOdds = useMemo(() => (backOdds - 1) * (1 - commission / 100) + 1, [backOdds, commission]);
    const inverseLayOdds = useMemo(() => layOdds > 1 ? layOdds / (layOdds - 1) : 0, [layOdds]);

    return (
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></svg>
                Betfair Calculator
            </h3>
            <div className="space-y-3">
                <CalcInput label="Commissione (%)" value={commission} onValueChange={setCommission} />
                <hr className="border-slate-700" />
                <div>
                    <h4 className="font-semibold text-gray-300 text-sm mb-2">Quota BACK Netta</h4>
                    <CalcInput label="Quota BACK" value={backOdds} onValueChange={setBackOdds} />
                    <p className="text-sm mt-2">Quota Netta: <span className="font-bold text-yellow-300">{netBackOdds.toFixed(2)}</span></p>
                </div>
                <hr className="border-slate-700" />
                <div>
                    <h4 className="font-semibold text-gray-300 text-sm mb-2">Inversione Quota LAY</h4>
                     <CalcInput label="Quota LAY" value={layOdds} onValueChange={setLayOdds} />
                    <p className="text-sm mt-2">Quota Inversa (BACK): <span className="font-bold text-yellow-300">{inverseLayOdds.toFixed(2)}</span></p>
                </div>
            </div>
        </div>
    );
};

const CalcInput: React.FC<{label: string; value: number; onValueChange: (value: number) => void;}> = ({label, value, onValueChange}) => {
    const [displayValue, setDisplayValue] = useState(String(value).replace('.', ','));

    useEffect(() => {
        setDisplayValue(String(value).replace('.', ','));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayValue(e.target.value);
    };

    const handleBlur = () => {
        const numericValue = parseFloat(displayValue.replace(/,/g, '.')) || 0;
        onValueChange(numericValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleBlur();
            (e.target as HTMLInputElement).blur();
        }
    };
    
    return (
        <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
            <input type="text" inputMode="decimal" value={displayValue} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} className="w-full bg-slate-800 border-slate-600 rounded px-2 py-1 text-sm text-yellow-300 focus:ring-cyan-500 focus:border-cyan-500" />
        </div>
    );
};


const SettingsPanel: React.FC<ControlPanelProps> = ({ settings, progression, onSettingsChange, onRegenerate, onLoad }) => {
    
    const [savedStates, setSavedStates] = useState<SavedState[]>([]);
    const [selectedStateName, setSelectedStateName] = useState<string>('');
    
    useEffect(() => {
        try {
            const rawData = localStorage.getItem(STORAGE_KEY);
            if (rawData) {
                const parsedData: SavedState[] = JSON.parse(rawData);
                const sanitizedData = parsedData.map(s => ({
                    ...s,
                    settings: {
                        ...s.settings,
                        profitCalculationMode: s.settings.profitCalculationMode || ProfitCalculationMode.SERIES,
                    }
                }));
                sanitizedData.sort((a, b) => b.timestamp - a.timestamp);
                setSavedStates(sanitizedData);
            }
        } catch (error) {
            console.error("Failed to load progressions from localStorage", error);
        }
    }, []);

    const handleSave = () => {
        const name = prompt('Inserisci un nome per la progressione:');
        if (!name || name.trim() === '') return;

        if (savedStates.some(s => s.name === name)) {
            if (!confirm(`Una progressione con nome "${name}" esiste già. Vuoi sovrascriverla?`)) {
                return;
            }
        }
        
        const newState: SavedState = { name, settings, progression, timestamp: Date.now() };
        const otherStates = savedStates.filter(s => s.name !== name);
        const newStates = [newState, ...otherStates];
        newStates.sort((a, b) => b.timestamp - a.timestamp);


        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newStates));
            setSavedStates(newStates);
            setSelectedStateName(name);
            alert(`Progressione "${name}" salvata!`);
        } catch (error) {
            console.error("Failed to save progression to localStorage", error);
            alert("Errore: Impossibile salvare la progressione. Lo spazio di archiviazione potrebbe essere pieno.");
        }
    };

    const handleLoad = () => {
        if (!selectedStateName) return;
        const stateToLoad = savedStates.find(s => s.name === selectedStateName);
        if (stateToLoad) {
            onLoad(stateToLoad.settings, stateToLoad.progression);
             alert(`Progressione "${selectedStateName}" caricata!`);
        }
    };

    const handleDelete = () => {
        if (!selectedStateName) return;
        if (!confirm(`Sei sicuro di voler eliminare la progressione "${selectedStateName}"? L'azione è irreversibile.`)) {
            return;
        }
        const newStates = savedStates.filter(s => s.name !== selectedStateName);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStates));
        setSavedStates(newStates);
        setSelectedStateName('');
        alert(`Progressione "${selectedStateName}" eliminata.`);
    };
    
    const handleValueChange = (name: string, value: number) => {
        onSettingsChange({ [name]: value });
    };

    return (
        <div className="bg-slate-800/70 backdrop-blur-sm p-4 rounded-lg shadow-lg h-full space-y-6 border border-slate-700">
            <div>
                 <h2 className="text-xl font-bold text-cyan-300 mb-4 border-b border-cyan-800 pb-2">Impostazioni</h2>
                <div className="space-y-3">
                    <Input label="Banca Iniziale (€)" name="initialBankroll" value={settings.initialBankroll} onValueChange={handleValueChange} />
                    <Input label="Numero totale degli eventi" name="totalEvents" value={settings.totalEvents} onValueChange={handleValueChange} />
                    <Input label="Numero minimo di eventi attesi" name="expectedWins" value={settings.expectedWins} onValueChange={handleValueChange} />
                    <Input label="Obiettivo Utile (%)" name="profitTargetPerc" value={settings.profitTargetPerc} onValueChange={handleValueChange} />
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Calcolo Obiettivo</label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-lg border border-slate-600">
                            <button
                                onClick={() => onSettingsChange({ profitCalculationMode: ProfitCalculationMode.SERIES })}
                                className={`w-full py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${settings.profitCalculationMode === ProfitCalculationMode.SERIES ? 'bg-cyan-600 text-white shadow' : 'bg-transparent text-slate-300 hover:bg-slate-700'}`}
                                aria-pressed={settings.profitCalculationMode === ProfitCalculationMode.SERIES}
                            >
                                Su Serie
                            </button>
                            <button
                                onClick={() => onSettingsChange({ profitCalculationMode: ProfitCalculationMode.STEP })}
                                className={`w-full py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${settings.profitCalculationMode === ProfitCalculationMode.STEP ? 'bg-cyan-600 text-white shadow' : 'bg-transparent text-slate-300 hover:bg-slate-700'}`}
                                aria-pressed={settings.profitCalculationMode === ProfitCalculationMode.STEP}
                            >
                                Su Step
                            </button>
                        </div>
                    </div>
                    <Input label="Max Drawdown (%)" name="maxDrawdownPerc" value={settings.maxDrawdownPerc} onValueChange={handleValueChange} />
                    <Input label="Reinvestimento (%)" name="reinvestmentPerc" value={settings.reinvestmentPerc} onValueChange={handleValueChange} />
                    <div>
                        <Input label="Quota di riferimento" name="referenceOdds" value={settings.referenceOdds} onValueChange={handleValueChange} />
                        <p className="text-xs text-slate-400 mt-1 pl-1">(Imposta a 0 per inserire le quote manualmente)</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Tipo Progressione</label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-lg border border-slate-600">
                            <button
                                onClick={() => onSettingsChange({ isLayOnly: false })}
                                className={`w-full py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${!settings.isLayOnly ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-slate-300 hover:bg-slate-700'}`}
                                aria-pressed={!settings.isLayOnly}
                            >
                                BACK
                            </button>
                            <button
                                onClick={() => onSettingsChange({ isLayOnly: true })}
                                className={`w-full py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${settings.isLayOnly ? 'bg-pink-600 text-white shadow' : 'bg-transparent text-slate-300 hover:bg-slate-700'}`}
                                aria-pressed={settings.isLayOnly}
                            >
                                LAY
                            </button>
                        </div>
                    </div>
                     <div className="flex items-center justify-between pt-2">
                        <label htmlFor="stopOnTarget" className="text-sm font-medium text-gray-300">Continua dopo obiettivo</label>
                        <label htmlFor="stopOnTarget" className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="stopOnTarget"
                                name="stopOnTarget"
                                checked={!settings.stopOnTarget}
                                onChange={(e) => onSettingsChange({ stopOnTarget: !e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                    </div>
                    <Input 
                        label="Recupero Perdite (%)" 
                        name="lossRecoveryPerc" 
                        value={settings.lossRecoveryPerc} 
                        onValueChange={handleValueChange} 
                    />
                    <div className="grid grid-cols-2 gap-2 pt-2">
                         <button
                            onClick={onRegenerate}
                            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-800 flex items-center justify-center"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                            Ricrea
                        </button>
                         <button
                            onClick={handleSave}
                            disabled={progression.length === 0}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-slate-800 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v12l-5-3-5 3V4z" /></svg>
                            Salva
                        </button>
                    </div>
                </div>
            </div>
            
            <details className="border-t border-slate-700 pt-4 group">
                <summary className="text-lg font-semibold text-cyan-300 cursor-pointer list-none flex items-center justify-between">
                    <span>Gestione Salvataggi</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </summary>
                <div className="mt-4 space-y-3">
                    {savedStates.length > 0 ? (
                        <>
                            <select 
                                value={selectedStateName} 
                                onChange={e => setSelectedStateName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 text-yellow-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 px-3 py-2"
                            >
                                <option value="">-- Seleziona una progressione --</option>
                                {savedStates.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                            </select>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={handleLoad} disabled={!selectedStateName} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed">
                                    Carica
                                </button>
                                <button onClick={handleDelete} disabled={!selectedStateName} className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed">
                                    Elimina
                                </button>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-slate-400 text-center bg-slate-900/50 p-3 rounded-md">Nessuna progressione salvata.</p>
                    )}
                </div>
            </details>

             <BetfairCalculator />
        </div>
    );
};


const Input: React.FC<{label: string; name: string; value: number; onValueChange: (name: string, value: number) => void;}> = ({ label, name, value, onValueChange }) => {
    const [displayValue, setDisplayValue] = useState(String(value).replace('.', ','));

    useEffect(() => {
        setDisplayValue(String(value).replace('.', ','));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayValue(e.target.value);
    };

    const handleBlur = () => {
        const numericValue = parseFloat(displayValue.replace(/,/g, '.')) || 0;
        onValueChange(name, numericValue);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleBlur();
            (e.target as HTMLInputElement).blur();
        }
    };

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
            <input
                type="text"
                inputMode="decimal"
                id={name}
                name={name}
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="w-full bg-slate-900 border border-slate-600 text-yellow-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 px-3 py-2 text-center"
            />
        </div>
    );
};

export default SettingsPanel;
