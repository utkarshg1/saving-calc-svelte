export interface SavingsInputs {
	targetAmount: number;
	years: number;
	/** Annual inflation rate as percentage, e.g. 8 for 8% */
	inflationRatePercent: number;
	/** FD loan percentage, e.g. 85 for 85% */
	fdLoanPercent: number;
	/** RD annual interest rate as percentage, e.g. 6.4 for 6.4% */
	rdInterestRatePercent: number;
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
	quarterlyRate: number;
	quarters: number;
	onePlusI: number;
	onePlusIN: number;
	onePlusINegThird: number;
	rdMaturity: number;
	principalSaved: number;
	interestEarned: number;
	percentageInterest: number;
	compoundedEstimate: number;
	monthlySeries: MonthlyDataPoint[];
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
		rdInterestRatePercent
	} = inputs;

	const inflationRate = inflationRatePercent / 100;
	const fdLoanRatio = fdLoanPercent / 100;

	const inflationAdjusted = targetAmount * Math.pow(1 + inflationRate, years);
	const estimatedAmount = inflationAdjusted / fdLoanRatio;
	const yearlyAmount = estimatedAmount / years;
	const monthlyAmount = yearlyAmount / 12;
	const roundedMonthly = roundUpToNearestThousand(monthlyAmount);

	const rd = calculateRdMaturity(roundedMonthly, years, rdInterestRatePercent);
	const principalSaved = roundedMonthly * years * 12;
	const interestEarned = rd.maturity - principalSaved;
	const percentageInterest = principalSaved > 0 ? (interestEarned / principalSaved) * 100 : 0;
	const compoundedEstimate =
		principalSaved > 0 ? (Math.pow(rd.maturity / principalSaved, 1 / years) - 1) * 100 : 0;

	const monthlySeries = buildMonthlySeries(roundedMonthly, years, rdInterestRatePercent);

	return {
		inflationAdjusted,
		estimatedAmount,
		yearlyAmount,
		monthlyAmount,
		roundedMonthly,
		quarterlyRate: rd.quarterlyRate,
		quarters: rd.quarters,
		onePlusI: rd.onePlusI,
		onePlusIN: rd.onePlusIN,
		onePlusINegThird: rd.onePlusINegThird,
		rdMaturity: rd.maturity,
		principalSaved,
		interestEarned,
		percentageInterest,
		compoundedEstimate,
		monthlySeries
	};
}

export const DEFAULT_INPUTS: SavingsInputs = {
	targetAmount: 200_000,
	years: 5,
	inflationRatePercent: 8,
	fdLoanPercent: 85,
	rdInterestRatePercent: 6.4
};