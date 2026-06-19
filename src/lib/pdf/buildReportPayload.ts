import { calculateSavings, type SavingsInputs } from '$lib/calculations/savings';
import { calculateTds, type TdsInputs, type TdsResult } from '$lib/calculations/tds';
import type { CapitalGainsResult } from '$lib/calculations/capitalGains';
import { buildSipSensitivityTable, type SipSensitivityRow } from '$lib/calculations/sip';
import { calculateMonthlyInvestmentXirr } from '$lib/calculations/xirr';

export interface ComparisonItem {
	label: string;
	value: number;
	color: string;
}

export interface ReportPayload {
	inputs: SavingsInputs;
	tdsInputs: TdsInputs;
	result: ReturnType<typeof calculateSavings>;
	tdsResult: TdsResult | null;
	cgtResult: CapitalGainsResult | null;
	comparisonItems: ComparisonItem[];
	sipSensitivity: SipSensitivityRow[];
	xirrPercent: number | null;
	generatedAt: string;
}

export function buildReportPayload(inputs: SavingsInputs, tdsInputs: TdsInputs): ReportPayload {
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
	const cgtApplies = cgtResult !== null && cgtResult.totalTax > 0;
	const netMaturity = isSip
		? cgtResult?.netAfterTax ?? result.grossMaturity
		: tdsApplies
			? tdsResult!.netMaturityAfterTds
			: result.grossMaturity;

	const comparisonItems: ComparisonItem[] = [
		{ label: 'Target', value: inputs.targetAmount, color: '#94a3b8' },
		{ label: 'Infl. Adj.', value: result.inflationAdjusted, color: '#8b5cf6' },
		{ label: 'Estimated', value: result.estimatedAmount, color: '#6366f1' },
		{
			label: isSip ? (cgtApplies ? 'Net SIP' : 'SIP Mat.') : tdsApplies ? 'Net Mat.' : 'Maturity',
			value: netMaturity,
			color: '#0d9488'
		}
	];

	const sipSensitivity = isSip
		? buildSipSensitivityTable(
				result.roundedMonthly,
				inputs.years,
				inputs.sipReturnRatePercent
			)
		: [];

	const xirrPercent = calculateMonthlyInvestmentXirr(
		result.roundedMonthly,
		inputs.years,
		netMaturity
	);

	return {
		inputs,
		tdsInputs,
		result,
		tdsResult,
		cgtResult,
		comparisonItems,
		sipSensitivity,
		xirrPercent,
		generatedAt: new Date().toISOString()
	};
}