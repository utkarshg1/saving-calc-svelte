import { calculateXirr } from './xirr';

export interface GovSavingsSimulation {
	grossMaturity: number;
	principalSaved: number;
	yearlyDeposits: number[];
}

/**
 * One yearly lump-sum deposit per year with interest compounded annually (PPF / NSC style).
 */
export function simulateGovSavingsYearly(
	monthlyDeposit: number,
	years: number,
	annualRatePercent: number,
	annualCap = Infinity
): GovSavingsSimulation {
	const yearlyDeposit = Math.min(monthlyDeposit * 12, annualCap);
	const yearlyDeposits = Array.from({ length: years }, () => yearlyDeposit);
	const rateFactor = 1 + annualRatePercent / 100;
	let grossMaturity = 0;

	for (const deposit of yearlyDeposits) {
		grossMaturity = (grossMaturity + deposit) * rateFactor;
	}

	return {
		grossMaturity,
		principalSaved: yearlyDeposit * years,
		yearlyDeposits
	};
}

export function xirrFromYearlyDeposits(
	yearlyDeposits: number[],
	netMaturity: number
): number | null {
	if (yearlyDeposits.length === 0 || netMaturity <= 0) return null;

	const amounts: number[] = [];
	const dates: number[] = [];

	for (let y = 0; y < yearlyDeposits.length; y++) {
		const deposit = yearlyDeposits[y];
		if (deposit <= 0) continue;
		amounts.push(-deposit);
		dates.push(y);
	}

	if (amounts.length === 0) return null;

	amounts.push(netMaturity);
	dates.push(yearlyDeposits.length);

	const rate = calculateXirr(amounts, dates);
	return rate !== null ? rate * 100 : null;
}