import type { CapitalGainsResult } from './capitalGains';
import type { TdsResult } from './tds';
import type { MonthlyDataPoint } from './savings';
import type { InvestmentPath } from './savings';

export type CalculationMode = 'forward' | 'reverse';
export type { InvestmentPath };
export type InstrumentId = 'rd' | 'sip' | 'ppf' | 'nsc' | 'debt_mf';

export interface AdvancedInputs {
	mode: CalculationMode;
	monthlyBudget: number;
	lumpsumAmount: number;
	stepUpPercentAnnual: number;
}

export const DEFAULT_ADVANCED_INPUTS: AdvancedInputs = {
	mode: 'forward',
	monthlyBudget: 6_000,
	lumpsumAmount: 0,
	stepUpPercentAnnual: 0
};

export interface ReverseResult {
	feasible: boolean;
	yearsNeeded: number | null;
	monthsNeeded: number | null;
	message: string;
}

export interface InstrumentResult {
	id: InstrumentId;
	label: string;
	riskLevel: 'low' | 'medium' | 'high';
	netMaturity: number;
	grossMaturity: number;
	principalSaved: number;
	gainsEarned: number;
	taxAmount: number;
	xirrPercent: number | null;
	monthlyDeposit: number;
}

export interface CompareResult {
	rd: InstrumentResult;
	sip: InstrumentResult;
	ppf: InstrumentResult;
	nsc: InstrumentResult;
	debtMf: InstrumentResult;
	bestNetReturn: InstrumentId;
	lowestRisk: InstrumentId;
}

export interface CashflowYearRow {
	year: number;
	deposits: number;
	cumulativeDeposits: number;
	grossBalance: number;
	tax: number;
	netBalance: number;
}

export interface TaxHint {
	id: string;
	title: string;
	description: string;
	applicable: boolean;
	estimatedBenefit?: number;
}

export interface InflationSensitivityRow {
	inflationPercent: number;
	deltaPercent: number;
	isBase: boolean;
	inflationAdjusted: number;
	estimatedAmount: number;
	monthlyNeeded: number;
	roundedMonthly: number;
}

export interface SuiteResult {
	reverse: ReverseResult | null;
	compare: CompareResult;
	cashflow: CashflowYearRow[];
	taxHints: TaxHint[];
	inflationSensitivity: InflationSensitivityRow[];
	installments: CapitalGainsResult['installments'];
}

export type { MonthlyDataPoint, CapitalGainsResult, TdsResult };