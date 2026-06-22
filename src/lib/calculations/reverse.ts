import type { SavingsInputs } from './savings';
import { calculateRdMaturity, roundUpToNearestThousand } from './savings';
import { calculateSipMaturity } from './sip';
import type { ReverseResult } from './types';

function inflationAdjustedTarget(inputs: SavingsInputs): number {
	const inflationRate = inputs.inflationRatePercent / 100;
	const fdLoanRatio = inputs.fdLoanPercent / 100;
	const adjusted = inputs.targetAmount * Math.pow(1 + inflationRate, inputs.years);
	return adjusted / fdLoanRatio;
}

function maturityForYears(
	inputs: SavingsInputs,
	monthly: number,
	years: number
): number {
	if (inputs.investmentPath === 'sip') {
		return calculateSipMaturity(monthly, years, inputs.sipReturnRatePercent).maturity;
	}
	return calculateRdMaturity(monthly, years, inputs.rdInterestRatePercent).maturity;
}

export function calculateReverse(inputs: SavingsInputs, monthlyBudget: number): ReverseResult {
	if (monthlyBudget <= 0) {
		return {
			feasible: false,
			yearsNeeded: null,
			monthsNeeded: null,
			message: 'Enter a monthly budget greater than zero.'
		};
	}

	const target = inflationAdjustedTarget(inputs);
	const maxYears = 50;

	for (let years = 1; years <= maxYears; years++) {
		const rounded = roundUpToNearestThousand(monthlyBudget);
		const maturity = maturityForYears(inputs, rounded, years);
		if (maturity >= target) {
			return {
				feasible: true,
				yearsNeeded: years,
				monthsNeeded: years * 12,
				message: `Reach your goal in ${years} year${years === 1 ? '' : 's'} at ₹${rounded.toLocaleString('en-IN')}/month.`
			};
		}
	}

	return {
		feasible: false,
		yearsNeeded: null,
		monthsNeeded: null,
		message: `Goal not reachable within ${maxYears} years at this monthly budget. Try increasing SIP return or monthly amount.`
	};
}