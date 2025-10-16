export interface Settings {
    initialBankroll: number;
    totalEvents: number;
    expectedWins: number;
    profitTargetPerc: number;
    maxDrawdownPerc: number;
    reinvestmentPerc: number;
    isLayOnly: boolean;
    referenceOdds: number;
    stopOnTarget: boolean;
    lossRecoveryPerc: number;
    profitCalculationMode: ProfitCalculationMode;
}

export enum ProfitCalculationMode {
    SERIES = 'SERIES',
    STEP = 'STEP',
}

export enum BetType {
    BACK = 'BACK',
    LAY = 'LAY',
}

export enum BetOutcome {
    NotPlayed = 'Non giocata',
    Won = 'Vinta',
    Lost = 'Persa',
    Cashout = 'Cashout',
}

export enum CalculationMode {
    FIXED_PROFIT = 'PROFIT',
    FIXED_STAKE = 'STAKE',
}

export interface ProgressionRow {
    id: number;
    eventNumber: number | string;
    description: string;
    startBankroll: number;
    odds: number;
    type: BetType;
    outcome: BetOutcome;
    cashout: number;
    stake: number;
    liability: number;
    potentialWin: number;
    endBankroll: number;
    remainingWins: number;
    status: string;
    calculationMode: CalculationMode;
}
