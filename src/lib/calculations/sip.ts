import type { MonthlyDataPoint } from './savings';
import {
	calculateCapitalGainsTax,
	LTCG_HOLDING_MONTHS,
	type CapitalGainsResult,
	type InstallmentGain
} from './capitalGains';

/** Effective monthly rate from annual return (compound equivalent). */
export function monthlyRateFromAnnual(annualPercent: number): number {
	return Math.pow(1 + annualPercent / 100, 1 / 12) - 1;
}

export function calculateSipMaturity(
	monthlyDeposit: number,
	years: number,
	annualPercent: number
): { maturity: number; monthlyRate: number; months: number } {
	const months = years * 12;
	const i = monthlyRateFromAnnual(annualPercent);

	if (months === 0 || monthlyDeposit === 0) {
		return { maturity: 0, monthlyRate: i, months };
	}

	const maturity =
		monthlyDeposit * (((Math.pow(1 + i, months) - 1) / i) * (1 + i));

	return { maturity, monthlyRate: i, months };
}

export function buildInstallmentGains(
	monthlyDeposit: number,
	years: number,
	annualPercent: number
): InstallmentGain[] {
	const { months, monthlyRate: i } = calculateSipMaturity(monthlyDeposit, years, annualPercent);
	const installments: InstallmentGain[] = [];

	for (let k = 1; k <= months; k++) {
		const holdingMonths = months - k + 1;
		const futureValue = monthlyDeposit * Math.pow(1 + i, holdingMonths);
		const gain = futureValue - monthlyDeposit;

		installments.push({
			installment: k,
			holdingMonths,
			principal: monthlyDeposit,
			futureValue,
			gain,
			classification: holdingMonths > LTCG_HOLDING_MONTHS ? 'ltcg' : 'stcg'
		});
	}

	return installments;
}

export function calculateSipCapitalGains(
	monthlyDeposit: number,
	years: number,
	annualPercent: number
): CapitalGainsResult {
	const { maturity } = calculateSipMaturity(monthlyDeposit, years, annualPercent);
	const installments = buildInstallmentGains(monthlyDeposit, years, annualPercent);
	return calculateCapitalGainsTax(installments, maturity);
}

/** Month-by-month cumulative principal and projected SIP balance. */
export function buildSipMonthlySeries(
	monthlyDeposit: number,
	years: number,
	annualPercent: number
): MonthlyDataPoint[] {
	const { monthlyRate: i } = calculateSipMaturity(monthlyDeposit, years, annualPercent);
	const totalMonths = years * 12;
	const series: MonthlyDataPoint[] = [];

	for (let month = 1; month <= totalMonths; month++) {
		let balance = 0;

		for (let k = 1; k <= month; k++) {
			const remaining = month - k + 1;
			balance += monthlyDeposit * Math.pow(1 + i, remaining);
		}

		series.push({
			month,
			year: Math.ceil(month / 12),
			principal: monthlyDeposit * month,
			balance
		});
	}

	return series;
}

export interface SipSensitivityRow {
	annualReturnPercent: number;
	deltaPercent: number;
	isBase: boolean;
	grossMaturity: number;
	capitalGains: number;
	totalTax: number;
	netCapitalGains: number;
	netMaturity: number;
}

const DEFAULT_SENSITIVITY_DELTAS = [-3, -2, -1, 0, 1, 2, 3] as const;

export function buildSipSensitivityTable(
	monthlyDeposit: number,
	years: number,
	baseReturnPercent: number,
	deltas: readonly number[] = DEFAULT_SENSITIVITY_DELTAS
): SipSensitivityRow[] {
	return deltas.map((delta) => {
		const annualReturnPercent = Math.max(0, baseReturnPercent + delta);
		const cgt = calculateSipCapitalGains(monthlyDeposit, years, annualReturnPercent);

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