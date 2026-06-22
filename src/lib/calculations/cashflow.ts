import type { SavingsResult } from './savings';
import type { TdsResult } from './tds';
import type { CapitalGainsResult } from './capitalGains';
import type { CashflowYearRow } from './types';

export function buildYearlyCashflow(
	result: SavingsResult,
	netMaturity: number,
	tdsResult?: TdsResult,
	cgtResult?: CapitalGainsResult | null
): CashflowYearRow[] {
	const years = Math.ceil(result.monthlySeries.length / 12);
	const rows: CashflowYearRow[] = [];
	const monthlyDeposit = result.roundedMonthly;
	const tdsApplies = tdsResult?.tdsApplicable ?? false;
	const cgtApplies = cgtResult !== null && (cgtResult?.totalTax ?? 0) > 0;
	const totalTax = tdsApplies
		? (tdsResult?.tdsDeducted ?? 0)
		: cgtApplies
			? (cgtResult?.totalTax ?? 0)
			: 0;

	let cumulativeDeposits = 0;

	for (let y = 1; y <= years; y++) {
		const deposits = monthlyDeposit * 12;
		cumulativeDeposits += deposits;
		const lastMonthOfYear = result.monthlySeries.find((p) => p.year === y && p.month === y * 12)
			?? result.monthlySeries.filter((p) => p.year === y).at(-1);
		const grossBalance = lastMonthOfYear?.balance ?? cumulativeDeposits;
		const isFinal = y === years;
		const tax = isFinal ? totalTax : 0;
		const netBalance = isFinal ? netMaturity : grossBalance;

		rows.push({
			year: y,
			deposits,
			cumulativeDeposits,
			grossBalance,
			tax,
			netBalance
		});
	}

	return rows;
}