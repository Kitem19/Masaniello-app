import React, { useState, useMemo } from 'react';
import { Settings } from '../types';

interface ControlPanelProps {
    settings: Settings;
    onSettingsChange: (newSettings: Partial<Settings>) => void;
    onRegenerate: () => void;
}

const formatCurrency = (value: number) => {
    return (value ?? 0).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
};

const BetfairCalculator: React.FC = () => {
    const [commission, setCommission] = useState(5);
    const [backOdds, setBackOdds] = useState(2.0);
    const [layOdds, setLayOdds] = useState(2.1);

    const netBackOdds = useMemo(() => (backOdds - 1) * (1 - commission / 100) + 1, [backOdds, commission]);
    const inverseLayOdds = useMemo(() => layOdds / (layOdds - 1), [layOdds]);

    return (
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></svg>
                Betfair Calculator
            </h3>
            <div className="space-y-3">
                <CalcInput label="Commissione (%)" value={commission} onChange={e => setCommission(parseFloat(e.target.value) || 0)} />
                <hr className="border-slate-700" />
                <div>
                    <h4 className="font-semibold text-gray-300 text-sm mb-2">Quota BACK Netta</h4>
                    <CalcInput label="Quota BACK" value={backOdds} onChange={e => setBackOdds(parseFloat(e.target.value) || 0)} />
                    <p className="text-sm mt-2">Quota Netta: <span className="font-bold text-yellow-300">{netBackOdds.toFixed(2)}</span></p>
                </div>
                <hr className="border-slate-700" />
                <div>
                    <h4 className="font-semibold text-gray-300 text-sm mb-2">Inversione Quota LAY</h4>
                     <CalcInput label="Quota LAY" value={layOdds} onChange={e => setLayOdds(parseFloat(e.target.value) || 0)} />
                    <p className="text-sm mt-2">Quota Inversa (BACK): <span className="font-bold text-yellow-300">{inverseLayOdds.toFixed(2)}</span></p>
                </div>
            </div>
        </div>
    );
};

const CalcInput: React.FC<{label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;}> = ({label, value, onChange}) => (
    <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
        <input type="number" step="0.01" value={value} onChange={onChange} className="w-full bg-slate-800 border-slate-600 rounded px-2 py-1 text-sm text-yellow-300 focus:ring-cyan-500 focus:border-cyan-500" />
    </div>
);


const SettingsPanel: React.FC<ControlPanelProps> = ({ settings, onSettingsChange, onRegenerate }) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            onSettingsChange({ [name]: checked });
        } else {
            onSettingsChange({ [name]: parseFloat(value) || 0 });
        }
    };

    return (
        <div className="bg-slate-800/70 backdrop-blur-sm p-4 rounded-lg shadow-lg h-full space-y-6 border border-slate-700">
            <div>
                 <h2 className="text-xl font-bold text-cyan-300 mb-4 border-b border-cyan-800 pb-2">Impostazioni</h2>
                <div className="space-y-3">
                    <Input label="Banca Iniziale (€)" name="initialBankroll" value={settings.initialBankroll} onChange={handleInputChange} />
                    <Input label="Numero totale degli eventi" name="totalEvents" value={settings.totalEvents} onChange={handleInputChange} />
                    <Input label="Numero minimo di eventi attesi" name="expectedWins" value={settings.expectedWins} onChange={handleInputChange} />
                    <Input label="Obiettivo Utile (%)" name="profitTargetPerc" value={settings.profitTargetPerc} onChange={handleInputChange} />
                    <Input label="Max Drawdown (%)" name="maxDrawdownPerc" value={settings.maxDrawdownPerc} onChange={handleInputChange} />
                    <Input label="Reinvestimento (%)" name="reinvestmentPerc" value={settings.reinvestmentPerc} onChange={handleInputChange} />
                    <div>
                        <Input label="Quota di riferimento" name="referenceOdds" value={settings.referenceOdds} onChange={handleInputChange} />
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
                        onChange={handleInputChange} 
                    />
                    <button
                        onClick={onRegenerate}
                        className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-800"
                    >
                        Ricrea Progressione
                    </button>
                </div>
            </div>

             <BetfairCalculator />
        </div>
    );
};


const Input: React.FC<{label: string; name: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;}> = ({ label, name, value, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            type="number"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            step="any"
            className="w-full bg-slate-900 border border-slate-600 text-yellow-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 px-3 py-2 text-center"
        />
    </div>
);

export default SettingsPanel;