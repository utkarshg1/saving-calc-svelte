import type { SavingsInputs } from './savings';
import { roundUpToNearestThousand } from './savings';
import type { InflationSensitivityRow } from './types';

const DEFAULT_DELTAS = [-3, -2, -1, 0, 1, 2, 3] as const;

export function buildInflationSensitivityTable(
	inputs: SavingsInputs,
	deltas: readonly number[] = DEFAULT_DELTAS
): InflationSensitivityRow[] {
	return deltas.map((delta) => {
		const inflationPercent = Math.max(0, inputs.inflationRatePercent + delta);
		const inflationRate = inflationPercent / 100;
		const fdLoanRatio = inputs.fdLoanPercent / 100;
		const inflationAdjusted = inputs.targetAmount * Math.pow(1 + inflationRate, inputs.years);
		const estimatedAmount = inflationAdjusted / fdLoanRatio;
		const yearlyAmount = estimatedAmount / inputs.years;
		const monthlyNeeded = yearlyAmount / 12;
		const roundedMonthly = roundUpToNearestThousand(monthlyNeeded);

		return {
			inflationPercent,
			deltaPercent: delta,
			isBase: delta === 0,
			inflationAdjusted,
			estimatedAmount,
			monthlyNeeded,
			roundedMonthly
		};
	});
}