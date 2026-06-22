import { monthlyRateFromAnnual } from './sip';

export function futureValueLumpsum(
	amount: number,
	years: number,
	annualPercent: number,
	compounding: 'monthly' | 'annual' = 'monthly'
): number {
	if (amount <= 0 || years <= 0) return 0;
	if (compounding === 'annual') {
		return amount * Math.pow(1 + annualPercent / 100, years);
	}
	const months = years * 12;
	const i = monthlyRateFromAnnual(annualPercent);
	return amount * Math.pow(1 + i, months);
}

export function combineLumpsumAndRecurring(
	lumpsum: number,
	recurringMaturity: number,
	lumpsumFv: number
): { grossMaturity: number; lumpsumGrowth: number } {
	return {
		grossMaturity: recurringMaturity + lumpsumFv,
		lumpsumGrowth: lumpsumFv - lumpsum
	};
}