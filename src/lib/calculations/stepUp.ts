import type { MonthlyDataPoint } from './savings';
import { monthlyRateFromAnnual } from './sip';

export function monthlyDepositForMonth(
	baseMonthly: number,
	month: number,
	stepUpPercentAnnual: number
): number {
	if (stepUpPercentAnnual <= 0) return baseMonthly;
	const yearIndex = Math.floor((month - 1) / 12);
	return baseMonthly * Math.pow(1 + stepUpPercentAnnual / 100, yearIndex);
}

export function totalDepositsWithStepUp(
	baseMonthly: number,
	months: number,
	stepUpPercentAnnual: number
): number {
	let total = 0;
	for (let m = 1; m <= months; m++) {
		total += monthlyDepositForMonth(baseMonthly, m, stepUpPercentAnnual);
	}
	return total;
}

export function calculateStepUpSipMaturity(
	baseMonthly: number,
	years: number,
	annualPercent: number,
	stepUpPercentAnnual: number
): number {
	const months = years * 12;
	const i = monthlyRateFromAnnual(annualPercent);
	let balance = 0;

	for (let m = 1; m <= months; m++) {
		const deposit = monthlyDepositForMonth(baseMonthly, m, stepUpPercentAnnual);
		balance = balance * (1 + i) + deposit;
	}

	return balance;
}

export function buildStepUpSipSeries(
	baseMonthly: number,
	years: number,
	annualPercent: number,
	stepUpPercentAnnual: number
): MonthlyDataPoint[] {
	const months = years * 12;
	const i = monthlyRateFromAnnual(annualPercent);
	const series: MonthlyDataPoint[] = [];
	let balance = 0;
	let principal = 0;

	for (let m = 1; m <= months; m++) {
		const deposit = monthlyDepositForMonth(baseMonthly, m, stepUpPercentAnnual);
		balance = balance * (1 + i) + deposit;
		principal += deposit;
		series.push({ month: m, year: Math.ceil(m / 12), principal, balance });
	}

	return series;
}

export function calculateStepUpRdMaturity(
	baseMonthly: number,
	years: number,
	rdRatePercent: number,
	stepUpPercentAnnual: number
): number {
	const quarters = years * 4;
	const i = rdRatePercent / 400;
	let maturity = 0;

	for (let q = 1; q <= quarters; q++) {
		const monthInPlan = q * 3;
		const deposit = monthlyDepositForMonth(baseMonthly, monthInPlan, stepUpPercentAnnual);
		const remainingQuarters = quarters - q + 1;
		maturity += deposit * ((Math.pow(1 + i, remainingQuarters) - 1) / (1 - Math.pow(1 + i, -1 / 3)));
	}

	return maturity;
}