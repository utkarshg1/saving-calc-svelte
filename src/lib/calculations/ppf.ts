import type { InstrumentResult } from './types';
import { PPF_ANNUAL_RATE_PERCENT } from './govRates';
import { simulateGovSavingsYearly, xirrFromYearlyDeposits } from './govSavings';

const PPF_ANNUAL_CAP = 150_000;

export function calculatePpf(
	monthlyDeposit: number,
	years: number,
	annualRatePercent = PPF_ANNUAL_RATE_PERCENT
): InstrumentResult {
	const { grossMaturity, principalSaved, yearlyDeposits } = simulateGovSavingsYearly(
		monthlyDeposit,
		years,
		annualRatePercent,
		PPF_ANNUAL_CAP
	);
	const gainsEarned = grossMaturity - principalSaved;
	const yearlyDeposit = yearlyDeposits[0] ?? 0;

	return {
		id: 'ppf',
		label: 'PPF',
		riskLevel: 'low',
		netMaturity: grossMaturity,
		grossMaturity,
		principalSaved,
		gainsEarned,
		taxAmount: 0,
		xirrPercent: xirrFromYearlyDeposits(yearlyDeposits, grossMaturity),
		monthlyDeposit: yearlyDeposit / 12
	};
}