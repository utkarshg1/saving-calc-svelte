import type { MonthlyDataPoint } from './savings';
import { monthlyRateFromAnnual, type SipSensitivityRow } from './sip';
import { calculateCapitalGainsTax, LTCG_HOLDING_MONTHS, type CapitalGainsResult, type InstallmentGain } from './capitalGains';

const DEFAULT_SENSITIVITY_DELTAS = [-3, -2, -1, 0, 1, 2, 3] as const;

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

/* ===== Fixed rupee step-up (Step-Up SIP mode) ===== */

export function monthlyDepositForFixedStepUp(
	baseMonthly: number,
	month: number,
	topUpAmount: number,
	cap: number
): number {
	if (topUpAmount <= 0) return baseMonthly;
	const yearIndex = Math.floor((month - 1) / 12);
	return Math.min(baseMonthly + topUpAmount * yearIndex, cap);
}

export function totalDepositsWithFixedStepUp(
	baseMonthly: number,
	months: number,
	topUpAmount: number,
	cap: number
): number {
	let total = 0;
	for (let m = 1; m <= months; m++) {
		total += monthlyDepositForFixedStepUp(baseMonthly, m, topUpAmount, cap);
	}
	return total;
}

export function calculateFixedStepUpSipMaturity(
	baseMonthly: number,
	years: number,
	annualPercent: number,
	topUpAmount: number,
	cap: number
): number {
	const months = years * 12;
	const i = monthlyRateFromAnnual(annualPercent);
	let balance = 0;
	for (let m = 1; m <= months; m++) {
		const deposit = monthlyDepositForFixedStepUp(baseMonthly, m, topUpAmount, cap);
		balance = balance * (1 + i) + deposit;
	}
	return balance;
}

export function buildFixedStepUpSipSeries(
	baseMonthly: number,
	years: number,
	annualPercent: number,
	topUpAmount: number,
	cap: number
): MonthlyDataPoint[] {
	const months = years * 12;
	const i = monthlyRateFromAnnual(annualPercent);
	const series: MonthlyDataPoint[] = [];
	let balance = 0;
	let principal = 0;
	for (let m = 1; m <= months; m++) {
		const deposit = monthlyDepositForFixedStepUp(baseMonthly, m, topUpAmount, cap);
		balance = balance * (1 + i) + deposit;
		principal += deposit;
		series.push({ month: m, year: Math.ceil(m / 12), principal, balance });
	}
	return series;
}

export function buildFixedStepUpInstallmentGains(
	baseMonthly: number,
	years: number,
	annualPercent: number,
	topUpAmount: number,
	cap: number
): InstallmentGain[] {
	const months = years * 12;
	const i = monthlyRateFromAnnual(annualPercent);
	const installments: InstallmentGain[] = [];
	for (let k = 1; k <= months; k++) {
		const deposit = monthlyDepositForFixedStepUp(baseMonthly, k, topUpAmount, cap);
		const remainingMonths = months - k + 1;
		const futureValue = deposit * Math.pow(1 + i, remainingMonths);
		const gain = futureValue - deposit;
		installments.push({
			installment: k,
			holdingMonths: remainingMonths,
			principal: deposit,
			futureValue,
			gain,
			classification: remainingMonths > LTCG_HOLDING_MONTHS ? 'ltcg' : 'stcg'
		});
	}
	return installments;
}

export function calculateFixedStepUpCapitalGains(
	baseMonthly: number,
	years: number,
	annualPercent: number,
	topUpAmount: number,
	cap: number
): CapitalGainsResult {
	const maturity = calculateFixedStepUpSipMaturity(baseMonthly, years, annualPercent, topUpAmount, cap);
	const installments = buildFixedStepUpInstallmentGains(baseMonthly, years, annualPercent, topUpAmount, cap);
	return calculateCapitalGainsTax(installments, maturity);
}

export function buildFixedStepUpSipSensitivityTable(
	baseMonthly: number,
	years: number,
	baseReturnPercent: number,
	topUpAmount: number,
	cap: number,
	deltas: readonly number[] = DEFAULT_SENSITIVITY_DELTAS
): SipSensitivityRow[] {
	return deltas.map((delta) => {
		const annualReturnPercent = Math.max(0, baseReturnPercent + delta);
		const cgt = calculateFixedStepUpCapitalGains(baseMonthly, years, annualReturnPercent, topUpAmount, cap);
		return {
			annualReturnPercent,
			deltaPercent: delta,
			isBase: delta === 0,
			grossMaturity: cgt.grossMaturity,
			capitalGains: cgt.totalGains,
			totalTax: cgt.totalTax,
			netCapitalGains: cgt.netCapitalGainsAfterTax,
			netMaturity: cgt.netAfterTax
		};
	});
}