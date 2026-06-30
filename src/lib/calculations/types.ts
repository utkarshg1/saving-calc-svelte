import type { CapitalGainsResult } from './capitalGains';
import type { TdsResult } from './tds';
import type { MonthlyDataPoint } from './savings';
import type { InvestmentPath } from './savings';

export type { InvestmentPath };
export type InstrumentId = 'rd' | 'sip';

export interface AdvancedInputs {
	lumpsumAmount: number;
	stepUpPercentAnnual: number;
}

export const DEFAULT_ADVANCED_INPUTS: AdvancedInputs = {
	lumpsumAmount: 0,
	stepUpPercentAnnual: 0
};

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
	stepupSip?: InstrumentResult;
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
	compare: CompareResult;
	cashflow: CashflowYearRow[];
	taxHints: TaxHint[];
	inflationSensitivity: InflationSensitivityRow[];
	installments: CapitalGainsResult['installments'];
}

export type { MonthlyDataPoint, CapitalGainsResult, TdsResult };