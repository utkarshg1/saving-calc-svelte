import type { InstrumentResult } from './types';
import { NSC_ANNUAL_RATE_PERCENT } from './govRates';
import { calculateMonthlyInvestmentXirr } from './xirr';

/**
 * NSC interest compounds annually (same deposit pattern as PPF for fair monthly-plan comparison).
 * Nominal rate: 7.7% p.a. (NSC VIII, Govt. of India small savings).
 */
export function calculateNsc(
	monthlyDeposit: number,
	years: number,
	annualRatePercent = NSC_ANNUAL_RATE_PERCENT
): InstrumentResult {
	const yearlyDeposit = monthlyDeposit * 12;
	const principalSaved = yearlyDeposit * years;
	let grossMaturity = 0;

	for (let y = 1; y <= years; y++) {
		grossMaturity = (grossMaturity + yearlyDeposit) * (1 + annualRatePercent / 100);
	}

	const gainsEarned = grossMaturity - principalSaved;

	return {
		id: 'nsc',
		label: 'NSC',
		riskLevel: 'low',
		netMaturity: grossMaturity,
		grossMaturity,
		principalSaved,
		gainsEarned,
		taxAmount: 0,
		xirrPercent: calculateMonthlyInvestmentXirr(monthlyDeposit, years, grossMaturity),
		monthlyDeposit
	};
}