import type { InstrumentResult } from './types';
import { NSC_ANNUAL_RATE_PERCENT } from './govRates';
import { simulateGovSavingsYearly, xirrFromYearlyDeposits } from './govSavings';

/**
 * NSC interest compounds annually (yearly lump deposit for fair comparison with RD/SIP).
 * Nominal rate: 7.7% p.a. (NSC VIII, Govt. of India small savings).
 */
export function calculateNsc(
	monthlyDeposit: number,
	years: number,
	annualRatePercent = NSC_ANNUAL_RATE_PERCENT
): InstrumentResult {
	const { grossMaturity, principalSaved, yearlyDeposits } = simulateGovSavingsYearly(
		monthlyDeposit,
		years,
		annualRatePercent
	);
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
		xirrPercent: xirrFromYearlyDeposits(yearlyDeposits, grossMaturity),
		monthlyDeposit
	};
}