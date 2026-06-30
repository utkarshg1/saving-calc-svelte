import type { CapitalGainsResult } from './capitalGains';
import {
	buildSipMonthlySeries,
	calculateSipCapitalGains,
	calculateSipMaturity
} from './sip';
import {
	buildFixedStepUpSipSeries,
	calculateFixedStepUpCapitalGains,
	calculateFixedStepUpSipMaturity,
	totalDepositsWithFixedStepUp
} from './stepUp';

export type InvestmentPath = 'rd' | 'sip' | 'stepup-sip';

export interface SavingsInputs {
	targetAmount: number;
	years: number;
	/** Annual inflation rate as percentage, e.g. 8 for 8% */
	inflationRatePercent: number;
	/** FD loan percentage, e.g. 85 for 85% */
	fdLoanPercent: number;
	/** RD annual interest rate as percentage, e.g. 6.4 for 6.4% */
	rdInterestRatePercent: number;
	/** SIP expected annual return as percentage, e.g. 10 for 10% */
	sipReturnRatePercent: number;
	investmentPath: InvestmentPath;
	/** Step-Up SIP: fixed rupee amount added to monthly installment each year */
	stepUpTopUpAmount: number;
	/** Step-Up SIP: maximum monthly installment cap */
	stepUpCapAmount: number;
}

export interface MonthlyDataPoint {
	month: number;
	year: number;
	principal: number;
	balance: number;
}

export interface SavingsResult {
	inflationAdjusted: number;
	estimatedAmount: number;
	yearlyAmount: number;
	monthlyAmount: number;
	roundedMonthly: number;
	investmentPath: InvestmentPath;
	grossMaturity: number;
	principalSaved: number;
	gainsEarned: number;
	percentageGains: number;
	monthlySeries: MonthlyDataPoint[];
	/** RD-specific */
	quarterlyRate: number;
	quarters: number;
	onePlusI: number;
	onePlusIN: number;
	onePlusINegThird: number;
	rdMaturity: number;
	interestEarned: number;
	percentageInterest: number;
	/** SIP-specific */
	sipMaturity: number;
	monthlyRate: number;
	sipMonths: number;
	cgtResult: CapitalGainsResult | null;
}

export function roundUpToNearestThousand(amount: number): number {
	return Math.ceil(amount / 1000) * 1000;
}

/**
 * RD maturity with quarterly compounding.
 * n = years × 4 quarters, i = rate / 400
 * M = R × [((1 + i)^n − 1) / (1 − (1 + i)^(−1/3))]
 */
export function calculateRdMaturity(
	monthlyDeposit: number,
	years: number,
	rdInterestRatePercent: number
): {
	maturity: number;
	quarterlyRate: number;
	quarters: number;
	onePlusI: number;
	onePlusIN: number;
	onePlusINegThird: number;
} {
	const quarters = years * 4;
	const i = rdInterestRatePercent / 400;
	const onePlusI = 1 + i;
	const onePlusIN = Math.pow(onePlusI, quarters);
	const onePlusINegThird = Math.pow(onePlusI, -1 / 3);
	const maturity =
		monthlyDeposit * ((onePlusIN - 1) / (1 - onePlusINegThird));

	return {
		maturity,
		quarterlyRate: i,
		quarters,
		onePlusI,
		onePlusIN,
		onePlusINegThird
	};
}

/** Build month-by-month cumulative principal and projected RD balance for charts. */
export function buildMonthlySeries(
	monthlyDeposit: number,
	years: number,
	rdInterestRatePercent: number
): MonthlyDataPoint[] {
	const totalMonths = years * 12;
	const series: MonthlyDataPoint[] = [];

	for (let month = 1; month <= totalMonths; month++) {
		const completedQuarters = Math.floor(month / 3);
		const monthsInCurrentQuarter = month % 3;

		let balance = 0;

		if (completedQuarters > 0) {
			const fullQuarterMaturity = calculateRdMaturity(
				monthlyDeposit,
				completedQuarters / 4,
				rdInterestRatePercent
			).maturity;
			balance = fullQuarterMaturity;
		}

		balance += monthlyDeposit * monthsInCurrentQuarter;

		series.push({
			month,
			year: Math.ceil(month / 12),
			principal: monthlyDeposit * month,
			balance
		});
	}

	const finalMaturity = calculateRdMaturity(monthlyDeposit, years, rdInterestRatePercent).maturity;
	if (series.length > 0) {
		series[series.length - 1].balance = finalMaturity;
	}

	return series;
}

export function calculateSavings(inputs: SavingsInputs): SavingsResult {
	const {
		targetAmount,
		years,
		inflationRatePercent,
		fdLoanPercent,
		rdInterestRatePercent,
		sipReturnRatePercent,
		investmentPath
	} = inputs;

	const inflationRate = inflationRatePercent / 100;
	const fdLoanRatio = fdLoanPercent / 100;

	const inflationAdjusted = targetAmount * Math.pow(1 + inflationRate, years);
	const estimatedAmount = inflationAdjusted / fdLoanRatio;
	const yearlyAmount = estimatedAmount / years;
	const monthlyAmount = yearlyAmount / 12;
	const roundedMonthly = roundUpToNearestThousand(monthlyAmount);
	const principalSaved = roundedMonthly * years * 12;

	if (investmentPath === 'sip') {
		const sip = calculateSipMaturity(roundedMonthly, years, sipReturnRatePercent);
		const cgtResult = calculateSipCapitalGains(roundedMonthly, years, sipReturnRatePercent);
		const gainsEarned = sip.maturity - principalSaved;
		const percentageGains = principalSaved > 0 ? (gainsEarned / principalSaved) * 100 : 0;
		const monthlySeries = buildSipMonthlySeries(roundedMonthly, years, sipReturnRatePercent);

		return {
			inflationAdjusted,
			estimatedAmount,
			yearlyAmount,
			monthlyAmount,
			roundedMonthly,
			investmentPath,
			grossMaturity: sip.maturity,
			principalSaved,
			gainsEarned,
			percentageGains,
			monthlySeries,
			quarterlyRate: 0,
			quarters: 0,
			onePlusI: 0,
			onePlusIN: 0,
			onePlusINegThird: 0,
			rdMaturity: 0,
			interestEarned: 0,
			percentageInterest: 0,
			sipMaturity: sip.maturity,
			monthlyRate: sip.monthlyRate,
			sipMonths: sip.months,
			cgtResult
		};
	}

	if (investmentPath === 'stepup-sip') {
		const principalSavedStepUp = totalDepositsWithFixedStepUp(roundedMonthly, years * 12, inputs.stepUpTopUpAmount, inputs.stepUpCapAmount);
		const maturity = calculateFixedStepUpSipMaturity(roundedMonthly, years, sipReturnRatePercent, inputs.stepUpTopUpAmount, inputs.stepUpCapAmount);
		const cgtResult = calculateFixedStepUpCapitalGains(roundedMonthly, years, sipReturnRatePercent, inputs.stepUpTopUpAmount, inputs.stepUpCapAmount);
		const gainsEarned = maturity - principalSavedStepUp;
		const percentageGains = principalSavedStepUp > 0 ? (gainsEarned / principalSavedStepUp) * 100 : 0;
		const monthlySeries = buildFixedStepUpSipSeries(roundedMonthly, years, sipReturnRatePercent, inputs.stepUpTopUpAmount, inputs.stepUpCapAmount);

		return {
			inflationAdjusted,
			estimatedAmount,
			yearlyAmount,
			monthlyAmount,
			roundedMonthly,
			investmentPath,
			grossMaturity: maturity,
			principalSaved: principalSavedStepUp,
			gainsEarned,
			percentageGains,
			monthlySeries,
			quarterlyRate: 0,
			quarters: 0,
			onePlusI: 0,
			onePlusIN: 0,
			onePlusINegThird: 0,
			rdMaturity: 0,
			interestEarned: 0,
			percentageInterest: 0,
			sipMaturity: maturity,
			monthlyRate: 0,
			sipMonths: years * 12,
			cgtResult
		};
	}

	const rd = calculateRdMaturity(roundedMonthly, years, rdInterestRatePercent);
	const interestEarned = rd.maturity - principalSaved;
	const percentageInterest = principalSaved > 0 ? (interestEarned / principalSaved) * 100 : 0;
	const monthlySeries = buildMonthlySeries(roundedMonthly, years, rdInterestRatePercent);

	return {
		inflationAdjusted,
		estimatedAmount,
		yearlyAmount,
		monthlyAmount,
		roundedMonthly,
		investmentPath,
		grossMaturity: rd.maturity,
		principalSaved,
		gainsEarned: interestEarned,
		percentageGains: percentageInterest,
		monthlySeries,
		quarterlyRate: rd.quarterlyRate,
		quarters: rd.quarters,
		onePlusI: rd.onePlusI,
		onePlusIN: rd.onePlusIN,
		onePlusINegThird: rd.onePlusINegThird,
		rdMaturity: rd.maturity,
		interestEarned,
		percentageInterest,
		sipMaturity: 0,
		monthlyRate: 0,
		sipMonths: 0,
		cgtResult: null
	};
}

export const DEFAULT_INPUTS: SavingsInputs = {
	targetAmount: 200_000,
	years: 5,
	inflationRatePercent: 8,
	fdLoanPercent: 85,
	rdInterestRatePercent: 6.4,
	sipReturnRatePercent: 10,
	investmentPath: 'rd',
	stepUpTopUpAmount: 1500,
	stepUpCapAmount: 23_000
};