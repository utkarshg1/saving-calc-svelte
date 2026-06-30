const MAX_ITERATIONS = 100;
const TOLERANCE = 1e-7;

function npv(rate: number, amounts: number[], datesInYears: number[]): number {
	let total = 0;
	for (let i = 0; i < amounts.length; i++) {
		total += amounts[i] / Math.pow(1 + rate, datesInYears[i]);
	}
	return total;
}

function npvDerivative(rate: number, amounts: number[], datesInYears: number[]): number {
	let total = 0;
	for (let i = 0; i < amounts.length; i++) {
		const t = datesInYears[i];
		total -= (t * amounts[i]) / Math.pow(1 + rate, t + 1);
	}
	return total;
}

/** Excel-style XIRR. Returns annual rate as decimal (e.g. 0.0337), or null if unsolvable. */
export function calculateXirr(amounts: number[], datesInYears: number[]): number | null {
	if (amounts.length !== datesInYears.length || amounts.length < 2) return null;

	const hasPositive = amounts.some((a) => a > 0);
	const hasNegative = amounts.some((a) => a < 0);
	if (!hasPositive || !hasNegative) return null;

	let rate = 0.1;

	for (let i = 0; i < MAX_ITERATIONS; i++) {
		const f = npv(rate, amounts, datesInYears);
		if (Math.abs(f) < TOLERANCE) return rate;

		const fPrime = npvDerivative(rate, amounts, datesInYears);
		if (Math.abs(fPrime) < TOLERANCE) break;

		const next = rate - f / fPrime;
		if (!Number.isFinite(next) || next <= -1) break;
		rate = next;
	}

	// Fallback: bisection between -99% and 1000%
	let low = -0.99;
	let high = 10;
	let fLow = npv(low, amounts, datesInYears);
	let fHigh = npv(high, amounts, datesInYears);
	if (fLow * fHigh > 0) return null;

	for (let i = 0; i < MAX_ITERATIONS; i++) {
		const mid = (low + high) / 2;
		const fMid = npv(mid, amounts, datesInYears);
		if (Math.abs(fMid) < TOLERANCE) return mid;
		if (fLow * fMid < 0) {
			high = mid;
			fHigh = fMid;
		} else {
			low = mid;
			fLow = fMid;
		}
	}

	return null;
}

/**
 * XIRR for equal monthly investments at period start, net maturity at tenure end.
 * Returns annualized rate as percentage (e.g. 3.37), or null.
 */
export function calculateMonthlyInvestmentXirr(
	monthlyDeposit: number,
	years: number,
	netMaturity: number
): number | null {
	const months = years * 12;
	if (months <= 0 || monthlyDeposit <= 0 || netMaturity <= 0) return null;

	const amounts: number[] = [];
	const dates: number[] = [];

	for (let i = 0; i < months; i++) {
		amounts.push(-monthlyDeposit);
		dates.push(i / 12);
	}

	amounts.push(netMaturity);
	dates.push(months / 12);

	const rate = calculateXirr(amounts, dates);
	return rate !== null ? rate * 100 : null;
}

/**
 * XIRR for varying monthly deposits, net maturity at tenure end.
 */
export function calculateVariableMonthlyXirr(
	deposits: number[],
	netMaturity: number
): number | null {
	const months = deposits.length;
	if (months <= 0 || netMaturity <= 0) return null;

	const amounts: number[] = [];
	const dates: number[] = [];

	for (let i = 0; i < months; i++) {
		if (deposits[i] <= 0) continue;
		amounts.push(-deposits[i]);
		dates.push(i / 12);
	}

	if (amounts.length === 0) return null;

	amounts.push(netMaturity);
	dates.push(months / 12);

	const rate = calculateXirr(amounts, dates);
	return rate !== null ? rate * 100 : null;
}