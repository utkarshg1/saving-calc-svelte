import { calculateSavings, type SavingsInputs, type SavingsResult } from './savings';
import { calculateTds, type TdsInputs } from './tds';
import { buildSipSensitivityTable } from './sip';
import { calculateMonthlyInvestmentXirr } from './xirr';
import { calculateReverse } from './reverse';
import { calculateCompare } from './compare';
import { buildYearlyCashflow } from './cashflow';
import { buildTaxHints } from './taxHints';
import { buildInflationSensitivityTable } from './inflationSensitivity';
import type { AdvancedInputs, SuiteResult } from './types';
import { DEFAULT_ADVANCED_INPUTS } from './types';

export interface CalculationSuite {
	inputs: SavingsInputs;
	tdsInputs: TdsInputs;
	advanced: AdvancedInputs;
	result: SavingsResult;
	tdsResult: ReturnType<typeof calculateTds> | null;
	netMaturity: number;
	xirrPercent: number | null;
	sipSensitivity: ReturnType<typeof buildSipSensitivityTable>;
	suite: SuiteResult;
	comparisonItems: Array<{ label: string; value: number; color: string }>;
}

export function calculateSuite(
	inputs: SavingsInputs,
	tdsInputs: TdsInputs,
	advanced: AdvancedInputs = DEFAULT_ADVANCED_INPUTS
): CalculationSuite {
	const result = calculateSavings(inputs);
	const isSip = inputs.investmentPath === 'sip';

	const tdsResult = isSip
		? null
		: calculateTds({
				totalInterest: result.gainsEarned,
				grossMaturity: result.grossMaturity,
				otherInterestThisFY: tdsInputs.otherInterestThisFY,
				isSeniorCitizen: tdsInputs.isSeniorCitizen,
				hasPAN: tdsInputs.hasPAN,
				form15GHSubmitted: tdsInputs.form15GHSubmitted
			});

	const cgtResult = result.cgtResult;
	const tdsApplies = tdsResult?.tdsApplicable ?? false;
	const cgtApplies = cgtResult !== null && (cgtResult?.totalTax ?? 0) > 0;

	const netMaturity = isSip
		? (cgtResult?.netAfterTax ?? result.grossMaturity)
		: tdsApplies
			? tdsResult!.netMaturityAfterTds
			: result.grossMaturity;

	const xirrPercent = calculateMonthlyInvestmentXirr(
		result.roundedMonthly,
		inputs.years,
		netMaturity
	);

	const compare = calculateCompare(inputs, tdsInputs, advanced);
	const reverse =
		advanced.mode === 'reverse'
			? calculateReverse(inputs, advanced.monthlyBudget)
			: null;

	const suite: SuiteResult = {
		reverse,
		compare,
		cashflow: buildYearlyCashflow(result, netMaturity, tdsResult ?? undefined, cgtResult),
		taxHints: buildTaxHints(inputs, result),
		inflationSensitivity: buildInflationSensitivityTable(inputs),
		installments: cgtResult?.installments ?? []
	};

	const sipSensitivity = isSip
		? buildSipSensitivityTable(result.roundedMonthly, inputs.years, inputs.sipReturnRatePercent)
		: [];

	const comparisonItems = [
		{ label: 'Target', value: inputs.targetAmount, color: '#94a3b8' },
		{ label: 'Infl. Adj.', value: result.inflationAdjusted, color: '#8b5cf6' },
		{ label: 'Estimated', value: result.estimatedAmount, color: '#6366f1' },
		{
			label: isSip
				? cgtApplies
					? 'Net SIP'
					: 'SIP Mat.'
				: tdsApplies
					? 'Net Mat.'
					: 'Maturity',
			value: netMaturity,
			color: '#0d9488'
		}
	];

	return {
		inputs,
		tdsInputs,
		advanced,
		result,
		tdsResult,
		netMaturity,
		xirrPercent,
		sipSensitivity,
		suite,
		comparisonItems
	};
}

export * from './savings';
export * from './tds';
export type {
	CalculationMode,
	AdvancedInputs,
	CompareResult,
	SuiteResult,
	TaxHint,
	CashflowYearRow,
	InflationSensitivityRow,
	InstrumentId,
	InstrumentResult
} from './types';
export { DEFAULT_ADVANCED_INPUTS } from './types';
export { calculateSuite as default };