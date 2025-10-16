import React, { useState } from 'react';

interface InstructionsModalProps {
    onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
    const [lang, setLang] = useState('it');

    const activeLangClass = 'bg-cyan-600 text-white';
    const inactiveLangClass = 'bg-slate-700 text-slate-300 hover:bg-slate-600';

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="instructions-title"
        >
            <div 
                className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-600"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 id="instructions-title" className="text-xl font-bold text-cyan-300">Istruzioni / Instructions</h2>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-white text-2xl"
                        aria-label="Close instructions"
                    >
                        &times;
                    </button>
                </header>
                <div className="p-4 border-b border-slate-700">
                    <div className="flex justify-center items-center gap-2">
                        <button onClick={() => setLang('it')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${lang === 'it' ? activeLangClass : inactiveLangClass}`}>
                            Italiano
                        </button>
                        <button onClick={() => setLang('en')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${lang === 'en' ? activeLangClass : inactiveLangClass}`}>
                            English
                        </button>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto text-slate-300 prose prose-sm prose-invert max-w-none prose-headings:text-cyan-400 prose-strong:text-yellow-300">
                    {lang === 'it' ? <ItalianInstructions /> : <EnglishInstructions />}
                </div>
                 <footer className="p-4 border-t border-slate-700 text-right">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-colors duration-300"
                    >
                        Chiudi
                    </button>
                </footer>
            </div>
        </div>
    );
};

const ItalianInstructions: React.FC = () => (
    <>
        <h3>Benvenuto nel Calcolatore Masaniello!</h3>
        <p>Questa guida ti aiuterà a sfruttare al massimo tutte le funzionalità del programma.</p>
        
        <h4>1. Impostazioni Principali</h4>
        <ul>
            <li><strong>Banca Iniziale:</strong> Il tuo capitale di partenza.</li>
            <li><strong>Numero totale degli eventi:</strong> Il numero di scommesse che compongono la progressione.</li>
            <li><strong>Numero minimo di eventi attesi:</strong> Il numero di scommesse che prevedi di vincere. È il cuore del Masaniello.</li>
            <li><strong>Obiettivo Utile (%):</strong> La percentuale di profitto che vuoi ottenere rispetto alla tua banca iniziale.</li>
            <li><strong>Max Drawdown (%):</strong> La massima perdita percentuale che sei disposto a subire prima di fermare la progressione (Stop Loss).</li>
            <li><strong>Tipo Progressione (BACK/LAY):</strong> Seleziona il tipo di scommessa predefinito per la progressione.</li>
            <li><strong>Quota di riferimento:</strong> Una quota predefinita per tutti gli eventi. Impostala a <strong>0</strong> o <strong>1</strong> per non usare una quota di riferimento e inserirle manually.</li>
        </ul>

        <h4>2. Impostazioni Avanzate</h4>
        <ul>
            <li><strong>Continua dopo obiettivo:</strong> Se attivata, la progressione non si fermerà una volta raggiunto l'obiettivo, ma continuerà a calcolare le puntate per generare ulteriore profitto.</li>
            <li><strong>Recupero Perdite (%):</strong> Definisce su quante scommesse future verrà <strong>distribuita una perdita</strong>. Esempio: <strong>50%</strong> significa che la perdita sarà recuperata nelle successive <strong>2</strong> scommesse (100/50=2). <strong>25%</strong> la distribuirà su <strong>4</strong> scommesse.</li>
        </ul>

        <h4>3. La Tabella della Progressione</h4>
        <p>Una volta impostati i parametri, la tabella si popolerà automaticamente. Qui puoi interagire con ogni singola scommessa:</p>
        <ul>
            <li><strong>Descrizione:</strong> Puoi cliccare sul nome dell'evento (es. "Evento 1") per modificarlo e dargli un nome personalizzato.</li>
            <li><strong>Quota:</strong> Puoi modificare la quota di ogni evento non ancora giocato. L'input accetta sia la <strong>virgola (,)</strong> che il <strong>punto (.)</strong> come separatore decimale.</li>
            <li><strong>Tipo:</strong> Puoi cambiare il tipo di scommessa da BACK a LAY (o viceversa) per ogni singolo evento.</li>
            <li><strong>Modalità (Lucchetto):</strong> Clicca sull'icona del lucchetto per cambiare la modalità di calcolo per quella scommessa:
                <ul>
                    <li><strong>Lucchetto Aperto (Utile Fisso):</strong> Il programma calcola la puntata/responsabilità per te. I campi non sono modificabili.</li>
                    <li><strong>Lucchetto Chiuso (Puntata/Respons. Fissa):</strong> Ti permette di inserire manualmente un importo. Per le scommesse <strong>BACK</strong>, il campo "Puntata" diventa modificabile. Per le scommesse <strong>LAY</strong>, il campo "Responsab." diventa modificabile, permettendoti di fissare il rischio.</li>
                </ul>
            </li>
            <li><strong>Esito:</strong> Imposta l'esito di una scommessa (Vinta, Persa, Non giocata). La tabella si ricalcolerà istantaneamente.</li>
            <li><strong>Azioni (Cestino):</strong> Clicca sull'icona del cestino per eliminare un evento dalla progressione.</li>
        </ul>

        <h4>4. Gestire la Progressione</h4>
        <ul>
            <li><strong>Ricrea Progressione:</strong> Questo pulsante resetta la tabella e la ricalcola usando i parametri attualmente inseriti.</li>
            <li><strong>Aggiungi Evento:</strong> Clicca questo pulsante in fondo alla tabella per aggiungere una nuova riga alla tua progressione.</li>
            <li><strong>Messaggi di Fine Progressione:</strong> Nel riquadro "Riepilogo", apparirà un messaggio chiaro quando la progressione termina, sia per aver raggiunto l'obiettivo sia per essere andata in Stop Loss.</li>
        </ul>
         <h4>5. Extra</h4>
        <p>Il <strong>Betfair Calculator</strong> è un piccolo strumento per calcolare rapidamente la quota BACK netta (scontando la commissione) o per invertire una quota LAY e trovare la sua controparte BACK, utile per le tue analisi.</p>
    </>
);

const EnglishInstructions: React.FC = () => (
    <>
        <h3>Welcome to the Masaniello Calculator!</h3>
        <p>This guide will help you make the most of all the application's features.</p>
        
        <h4>1. Main Settings</h4>
        <ul>
            <li><strong>Initial Bankroll:</strong> Your starting capital.</li>
            <li><strong>Total number of events:</strong> The number of bets that make up the progression.</li>
            <li><strong>Minimum number of expected events:</strong> The number of bets you expect to win. This is the core of the Masaniello method.</li>
            <li><strong>Profit Target (%):</strong> The percentage of profit you want to achieve relative to your initial bankroll.</li>
            <li><strong>Max Drawdown (%):</strong> The maximum percentage loss you are willing to tolerate before stopping the progression (Stop Loss).</li>
            <li><strong>Progression Type (BACK/LAY):</strong> Select the default bet type for the progression.</li>
            <li><strong>Reference Odds:</strong> A default odds value for all events. Set it to <strong>0</strong> or <strong>1</strong> to not use a reference odds and enter them manually.</li>
        </ul>

        <h4>2. Advanced Settings</h4>
        <ul>
            <li><strong>Continue after target:</strong> If enabled, the progression will not stop once the target is reached, but will continue to calculate stakes to generate further profit.</li>
            <li><strong>Loss Recovery (%):</strong> Defines over how many future bets a <strong>loss will be spread</strong>. Example: <strong>50%</strong> means the loss will be recovered over the next <strong>2</strong> bets (100/50=2). <strong>25%</strong> will spread it over <strong>4</strong> bets.</li>
        </ul>

        <h4>3. The Progression Table</h4>
        <p>Once the parameters are set, the table will populate automatically. Here you can interact with each individual bet:</p>
        <ul>
            <li><strong>Description:</strong> You can click on the event name (e.g., "Event 1") to edit it and give it a custom name.</li>
            <li><strong>Odds:</strong> You can change the odds for any event that has not yet been played. The input accepts both a <strong>comma (,)</strong> and a <strong>dot (.)</strong> as a decimal separator.</li>
            <li><strong>Type:</strong> You can change the bet type from BACK to LAY (or vice versa) for each individual event.</li>
            <li><strong>Mode (Lock Icon):</strong> Click the lock icon to change the calculation mode for that bet:
                <ul>
                    <li><strong>Unlocked (Fixed Profit):</strong> The application calculates the stake/liability for you. The fields are not editable.</li>
                    <li><strong>Locked (Fixed Stake/Liability):</strong> Allows you to manually enter an amount. For <strong>BACK</strong> bets, the "Puntata" (Stake) field becomes editable. For <strong>LAY</strong> bets, the "Responsab." (Liability) field becomes editable, allowing you to lock in your risk.</li>
                </ul>
            </li>
            <li><strong>Outcome:</strong> Set the outcome of a bet (Won, Lost, Not Played). The table will instantly recalculate.</li>
            <li><strong>Actions (Trash Can):</strong> Click the trash can icon to delete an event from the progression.</li>
        </ul>

        <h4>4. Managing the Progression</h4>
        <ul>
            <li><strong>Recreate Progression:</strong> This button resets the table and recalculates it using the currently entered parameters.</li>
            <li><strong>Add Event:</strong> Click this button at the bottom of the table to add a new row to your progression.</li>
            <li><strong>End of Progression Messages:</strong> In the "Summary" panel, a clear message will appear when the progression ends, either by reaching the target or hitting the Stop Loss.</li>
        </ul>
        <h4>5. Extras</h4>
        <p>The <strong>Betfair Calculator</strong> is a small tool to quickly calculate the net BACK odds (after commission) or to invert LAY odds to find their BACK equivalent, useful for your analysis.</p>
    </>
);


export default InstructionsModal;