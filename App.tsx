import React, { useState, useEffect } from 'react';
import SettingsPanel from './components/SettingsPanel';
import ProgressionTable from './components/ProgressionTable';
import SummaryDisplay from './components/SummaryDisplay';
import InstructionsModal from './components/InstructionsModal';
import useProgression from './hooks/useProgression';
import { Settings, ProgressionRow, ProfitCalculationMode } from './types';

const App: React.FC = () => {
    const [settings, setSettings] = useState<Settings>({
        initialBankroll: 500,
        totalEvents: 10,
        expectedWins: 7,
        profitTargetPerc: 20,
        maxDrawdownPerc: 30,
        reinvestmentPerc: 0,
        isLayOnly: true,
        referenceOdds: 5,
        stopOnTarget: true,
        lossRecoveryPerc: 100,
        profitCalculationMode: ProfitCalculationMode.SERIES,
    });
    const [isInstructionsVisible, setIsInstructionsVisible] = useState(false);

    const handleSettingsChange = (newSettings: Partial<Settings>) => {
        setSettings((prevSettings) => ({
            ...prevSettings,
            ...newSettings,
        }));
    };

    const { progression, setProgression, updateProgressionRow, generateProgression, addRow, deleteRow } = useProgression(settings);

    useEffect(() => {
        generateProgression();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLoadProgression = (loadedSettings: Settings, loadedProgression: ProgressionRow[]) => {
        setSettings(loadedSettings);
        setProgression(loadedProgression);
    };

    return (
        <div className="bg-slate-900 text-white min-h-screen font-sans p-4 lg:p-8">
            {isInstructionsVisible && <InstructionsModal onClose={() => setIsInstructionsVisible(false)} />}
            <header className="text-center mb-8">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <h1 className="text-4xl font-bold text-cyan-400">Masaniello by Kitem</h1>
                    <button onClick={() => setIsInstructionsVisible(true)} className="text-cyan-400 hover:text-cyan-200" aria-label="Show instructions">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <a 
                        href="https://ko-fi.com/Kitem19" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-2 px-4 rounded-full flex items-center transition-colors duration-300 shadow-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        Offrimi una Free bet
                    </a>
                </div>
                <p className="text-slate-400 mt-2">A tool to manage your betting progressions.</p>
            </header>
            <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                    <SettingsPanel 
                        settings={settings} 
                        progression={progression}
                        onSettingsChange={handleSettingsChange} 
                        onRegenerate={generateProgression}
                        onLoad={handleLoadProgression}
                    />
                </div>
                <div className="lg:col-span-3 space-y-6">
                    <SummaryDisplay settings={settings} rows={progression} />
                    <div className="min-h-[400px] h-[60vh] lg:h-[600px]">
                      <ProgressionTable rows={progression} onUpdateRow={updateProgressionRow} onAddRow={addRow} onDeleteRow={deleteRow} />
                    </div>
                </div>
            </main>
            <footer className="text-center mt-8 py-4 border-t border-slate-700">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 px-4">
                     <p className="text-sm text-slate-500 text-left">
                        Questo programma è gratuito. Se ti è stato venduto, sei stato truffato.
                    </p>
                    <a 
                        href="https://t.me/Kitem" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 transition-colors duration-300 whitespace-nowrap"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        Contattami su Telegram
                    </a>
                </div>
            </footer>
        </div>
    );
};

export default App;
