import { calculateSavings, type SavingsInputs } from '$lib/calculations/savings';
import { calculateTds, type TdsInputs } from '$lib/calculations/tds';

export interface ComparisonItem {
	label: string;
	value: number;
	color: string;
}

export interface ReportPayload {
	inputs: SavingsInputs;
	tdsInputs: TdsInputs;
	result: ReturnType<typeof calculateSavings>;
	tdsResult: ReturnType<typeof calculateTds>;
	comparisonItems: ComparisonItem[];
	generatedAt: string;
}

export function buildReportPayload(inputs: SavingsInputs, tdsInputs: TdsInputs): ReportPayload {
	const result = calculateSavings(inputs);
	const tdsResult = calculateTds({
		totalInterest: result.interestEarned,
		grossMaturity: result.rdMaturity,
		otherInterestThisFY: tdsInputs.otherInterestThisFY,
		isSeniorCitizen: tdsInputs.isSeniorCitizen,
		hasPAN: tdsInputs.hasPAN,
		form15GHSubmitted: tdsInputs.form15GHSubmitted
	});

	const tdsApplies = tdsResult.tdsApplicable;
	const comparisonItems: ComparisonItem[] = [
		{ label: 'Target', value: inputs.targetAmount, color: '#94a3b8' },
		{ label: 'Infl. Adj.', value: result.inflationAdjusted, color: '#8b5cf6' },
		{ label: 'Estimated', value: result.estimatedAmount, color: '#6366f1' },
		{
			label: tdsApplies ? 'Net Mat.' : 'Maturity',
			value: tdsApplies ? tdsResult.netMaturityAfterTds : result.rdMaturity,
			color: '#0d9488'
		}
	];

	return {
		inputs,
		tdsInputs,
		result,
		tdsResult,
		comparisonItems,
		generatedAt: new Date().toISOString()
	};
}