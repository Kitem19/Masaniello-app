import { useState, useEffect, useCallback } from 'react';
import { Settings, ProgressionRow, BetType, BetOutcome, CalculationMode } from '../types';

const useProgression = (settings: Settings) => {
    const [progression, setProgression] = useState<ProgressionRow[]>([]);

    const calculateRow = useCallback((
        prevRow: ProgressionRow | null, 
        initialBankroll: number, 
        stopLossBankroll: number, 
        profitPerWin: number, 
        winsNeeded: number, 
        lossToRecover: number,
        currentRow: ProgressionRow
    ): Pick<ProgressionRow, 'status' | 'startBankroll' | 'endBankroll' | 'stake' | 'liability' | 'potentialWin'> & { remainingWins: number } => {
        
        const { odds: currentOdds, type: currentType, calculationMode } = currentRow;
        const startBankroll = prevRow ? prevRow.endBankroll : initialBankroll;
        
        if (winsNeeded <= 0 && settings.stopOnTarget) {
            return { status: 'Obiettivo Raggiunto', startBankroll, endBankroll: startBankroll, stake: 0, liability: 0, potentialWin: 0, remainingWins: 0 };
        }
        if (startBankroll <= stopLossBankroll) {
            return { status: 'Stop Loss', startBankroll, endBankroll: startBankroll, stake: 0, liability: 0, potentialWin: 0, remainingWins: winsNeeded };
        }
        
        if (!currentOdds || currentOdds <= 1) {
             return { status: 'Inserire Quota', startBankroll, endBankroll: startBankroll, stake: 0, liability: 0, potentialWin: 0, remainingWins: winsNeeded };
        }

        const targetForBet = profitPerWin + lossToRecover;

        let stake = 0;
        let liability = 0;
        let potentialWin = 0;

        if (calculationMode === CalculationMode.FIXED_STAKE) {
            if (currentType === BetType.LAY) {
                // For LAY, the user fixes the liability. The value is passed in the liability property.
                liability = currentRow.liability;
                stake = (currentOdds > 1) ? liability / (currentOdds - 1) : 0;
                potentialWin = stake;
            } else { // BACK
                // For BACK, the user fixes the stake. The value is passed in the stake property.
                stake = currentRow.stake;
                liability = stake;
                potentialWin = (currentOdds > 1) ? stake * (currentOdds - 1) : 0;
            }
        } else { // FIXED_PROFIT
            if (currentType === BetType.LAY) {
                stake = targetForBet > 0 ? targetForBet : 0;
                potentialWin = stake;
                liability = stake * (currentOdds - 1);
            } else { // BetType.BACK
                stake = targetForBet > 0 ? targetForBet / (currentOdds - 1) : 0;
                potentialWin = stake * (currentOdds - 1);
                liability = stake;
            }
        }
        
        const calculatedLiability = currentType === BetType.LAY ? liability : stake;
        if (calculatedLiability > startBankroll) {
            return { status: 'Banca Insufficiente', startBankroll, endBankroll: startBankroll, stake: 0, liability: 0, potentialWin: 0, remainingWins: winsNeeded };
        }

        return {
            startBankroll,
            stake: stake > 0 ? stake : 0,
            liability: liability > 0 ? liability : 0,
            potentialWin: potentialWin > 0 ? potentialWin : 0,
            endBankroll: startBankroll,
            remainingWins: winsNeeded,
            status: 'Attivo',
        };
    }, [settings.stopOnTarget]);

    const recalculateFullProgression = useCallback((baseProgression: ProgressionRow[], currentSettings: Settings): ProgressionRow[] => {
        const { initialBankroll, expectedWins, profitTargetPerc, maxDrawdownPerc, lossRecoveryPerc } = currentSettings;
        const profitTarget = initialBankroll * (profitTargetPerc / 100);
        const profitPerWin = expectedWins > 0 ? profitTarget / expectedWins : 0;
        const stopLossBankroll = initialBankroll * (1 - (maxDrawdownPerc / 100));

        let winsCounter = expectedWins as number;
        const lossAmortizationQueue: number[] = [];

        const recalculatedProgression: ProgressionRow[] = [];

        for (const currentRow of baseProgression) {
            const prevRow = recalculatedProgression.length > 0 ? recalculatedProgression[recalculatedProgression.length - 1] : null;
            
            const recoveryAmountForThisBet = lossAmortizationQueue.shift() || 0;

            let updatedRow: ProgressionRow;

            if (currentRow.outcome === BetOutcome.NotPlayed) {
                const calculatedFields = calculateRow(prevRow, initialBankroll, stopLossBankroll, profitPerWin, winsCounter, recoveryAmountForThisBet, currentRow);
                updatedRow = { ...currentRow, ...calculatedFields };
            } else {
                const startBankroll = prevRow ? prevRow.endBankroll : initialBankroll;
                let endBankroll = startBankroll;
                
                if (currentRow.outcome === BetOutcome.Won) {
                    endBankroll = startBankroll + currentRow.potentialWin;
                    
                    if (currentRow.calculationMode === CalculationMode.FIXED_STAKE && profitPerWin > 0) {
                        const winsFulfilled = currentRow.potentialWin / profitPerWin;
                        winsCounter = Math.max(0, winsCounter - winsFulfilled);
                    } else {
                        winsCounter = Math.max(0, winsCounter - 1);
                    }

                } else if (currentRow.outcome === BetOutcome.Lost) {
                    endBankroll = startBankroll - currentRow.liability;
                    if (recoveryAmountForThisBet > 0) {
                        lossAmortizationQueue.unshift(recoveryAmountForThisBet);
                    }
                    
                    if (lossRecoveryPerc > 0 && currentRow.liability > 0) {
                        const newLoss = currentRow.liability;
                        const recoverySpread = Math.max(1, Math.round(100 / lossRecoveryPerc));
                        const chunkAmount = newLoss / recoverySpread;
                        for (let i = 0; i < recoverySpread; i++) {
                            lossAmortizationQueue.push(chunkAmount);
                        }
                    }
                } else if (currentRow.outcome === BetOutcome.Cashout) {
                    endBankroll = startBankroll + currentRow.cashout;
                     // Assuming cashout is like a win for progression purposes
                    winsCounter = Math.max(0, winsCounter - 1);
                }
                updatedRow = { ...currentRow, startBankroll, endBankroll, remainingWins: winsCounter };
            }
            
            recalculatedProgression.push(updatedRow);
        }
        return recalculatedProgression;
    }, [calculateRow]);


    const generateProgression = useCallback(() => {
        const {
            totalEvents, isLayOnly, referenceOdds
        } = settings;

        const newProgression: ProgressionRow[] = [];
        const initialType = isLayOnly ? BetType.LAY : BetType.BACK;
        
        for (let i = 0; i < totalEvents; i++) {
            const newRow: ProgressionRow = {
                id: i + 1,
                eventNumber: i + 1,
                description: `Evento ${i + 1}`,
                outcome: BetOutcome.NotPlayed,
                cashout: 0,
                odds: referenceOdds,
                type: initialType,
                startBankroll: 0, stake: 0, liability: 0, potentialWin: 0, endBankroll: 0,
                remainingWins: 0, status: '',
                calculationMode: CalculationMode.FIXED_PROFIT,
            };
            newProgression.push(newRow);
        }
        setProgression(recalculateFullProgression(newProgression, settings));
    }, [settings, recalculateFullProgression]);


    useEffect(() => {
        generateProgression();
    }, [generateProgression]);

    const updateProgressionRow = (id: number, newValues: Partial<ProgressionRow>) => {
        setProgression(currentProgression => {
            const progressionWithUserChanges = currentProgression.map(row =>
                row.id === id ? { ...row, ...newValues } : row
            );
            return recalculateFullProgression(progressionWithUserChanges, settings);
        });
    };

    const addRow = useCallback(() => {
        setProgression(currentProgression => {
            if (currentProgression.length === 0) return currentProgression;

            const { referenceOdds, isLayOnly } = settings;
            const initialType = isLayOnly ? BetType.LAY : BetType.BACK;
            const lastRow = currentProgression[currentProgression.length - 1];

            const newId = (lastRow?.id ?? 0) + 1;
            const newEventNumber = currentProgression.length + 1;

            const newRow: ProgressionRow = {
                id: newId,
                eventNumber: newEventNumber,
                description: `Evento ${newEventNumber}`,
                outcome: BetOutcome.NotPlayed,
                cashout: 0,
                odds: referenceOdds > 1 ? referenceOdds : 0,
                type: lastRow?.type || initialType,
                startBankroll: 0, stake: 0, liability: 0, potentialWin: 0, endBankroll: 0,
                remainingWins: 0, status: '',
                calculationMode: CalculationMode.FIXED_PROFIT,
            };

            const newProgression = [...currentProgression, newRow];
            return recalculateFullProgression(newProgression, settings);
        });
    }, [settings, recalculateFullProgression]);

    const deleteRow = (id: number) => {
        setProgression(currentProgression => {
             const rowToDelete = currentProgression.find(row => row.id === id);
             const preservedDescription = rowToDelete?.description.replace(/^Evento \d+/, '').trim();

            const progressionWithRowRemoved = currentProgression
                .filter(row => row.id !== id)
                .map((row, index) => {
                    // Preserve custom description if it exists
                    const currentDesc = row.description;
                    const defaultDesc = `Evento ${index + 1}`;
                    if (currentDesc.startsWith('Evento ')) {
                         return { ...row, eventNumber: index + 1, description: defaultDesc };
                    }
                    return { ...row, eventNumber: index + 1 };
                });

            if (progressionWithRowRemoved.length === 0) {
                return [];
            }
            return recalculateFullProgression(progressionWithRowRemoved, settings);
        });
    };

    return { progression, updateProgressionRow, generateProgression, addRow, deleteRow };
};

export default useProgression;