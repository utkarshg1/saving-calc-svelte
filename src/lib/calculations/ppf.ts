import type { InstrumentResult } from './types';
import { PPF_ANNUAL_RATE_PERCENT } from './govRates';
import { calculateMonthlyInvestmentXirr } from './xirr';

const PPF_ANNUAL_CAP = 150_000;

export function calculatePpf(
	monthlyDeposit: number,
	years: number,
	annualRatePercent = PPF_ANNUAL_RATE_PERCENT
): InstrumentResult {
	const yearlyDeposit = Math.min(monthlyDeposit * 12, PPF_ANNUAL_CAP);
	const effectiveMonthly = yearlyDeposit / 12;
	const principalSaved = yearlyDeposit * years;
	let grossMaturity = 0;

	for (let y = 1; y <= years; y++) {
		grossMaturity = (grossMaturity + yearlyDeposit) * (1 + annualRatePercent / 100);
	}

	const gainsEarned = grossMaturity - principalSaved;

	return {
		id: 'ppf',
		label: 'PPF',
		riskLevel: 'low',
		netMaturity: grossMaturity,
		grossMaturity,
		principalSaved,
		gainsEarned,
		taxAmount: 0,
		xirrPercent: calculateMonthlyInvestmentXirr(effectiveMonthly, years, grossMaturity),
		monthlyDeposit: effectiveMonthly
	};
}