import type { SavingsInputs } from './savings';
import { calculateSavings } from './savings';
import { calculateTds, type TdsInputs } from './tds';
import { calculateSipCapitalGains } from './sip';
import { calculateMonthlyInvestmentXirr, calculateVariableMonthlyXirr } from './xirr';
import type { AdvancedInputs, CompareResult, InstrumentResult } from './types';
import {
	calculateStepUpRdMaturity,
	calculateStepUpSipMaturity,
	totalDepositsWithStepUp,
	calculateFixedStepUpSipMaturity,
	calculateFixedStepUpCapitalGains,
	totalDepositsWithFixedStepUp
} from './stepUp';
import { futureValueLumpsum, combineLumpsumAndRecurring } from './lumpsum';

function buildRdInstrument(
	inputs: SavingsInputs,
	monthly: number,
	advanced: AdvancedInputs,
	tdsInputs: TdsInputs
): InstrumentResult {
	const years = inputs.years;
	const principalSaved =
		advanced.stepUpPercentAnnual > 0
			? totalDepositsWithStepUp(monthly, years * 12, advanced.stepUpPercentAnnual)
			: monthly * years * 12;

	let grossMaturity =
		advanced.stepUpPercentAnnual > 0
			? calculateStepUpRdMaturity(monthly, years, inputs.rdInterestRatePercent, advanced.stepUpPercentAnnual)
			: calculateSavings({ ...inputs, investmentPath: 'rd' }).grossMaturity;

	if (advanced.lumpsumAmount > 0) {
		const lumpFv = futureValueLumpsum(
			advanced.lumpsumAmount,
			years,
			inputs.rdInterestRatePercent,
			'annual'
		);
		grossMaturity = combineLumpsumAndRecurring(0, grossMaturity, lumpFv).grossMaturity;
	}

	const gainsEarned = grossMaturity - principalSaved - advanced.lumpsumAmount;
	const tds = calculateTds({
		totalInterest: Math.max(0, gainsEarned),
		grossMaturity,
		otherInterestThisFY: tdsInputs.otherInterestThisFY,
		isSeniorCitizen: tdsInputs.isSeniorCitizen,
		hasPAN: tdsInputs.hasPAN,
		form15GHSubmitted: tdsInputs.form15GHSubmitted
	});

	return {
		id: 'rd',
		label: 'RD',
		riskLevel: 'low',
		netMaturity: tds.tdsApplicable ? tds.netMaturityAfterTds : grossMaturity,
		grossMaturity,
		principalSaved: principalSaved + advanced.lumpsumAmount,
		gainsEarned: Math.max(0, gainsEarned),
		taxAmount: tds.tdsDeducted,
		xirrPercent: calculateMonthlyInvestmentXirr(
			monthly,
			years,
			tds.tdsApplicable ? tds.netMaturityAfterTds : grossMaturity
		),
		monthlyDeposit: monthly
	};
}

function buildStepUpSipInstrument(
	inputs: SavingsInputs,
	monthly: number
): InstrumentResult {
	const years = inputs.years;
	const months = years * 12;
	const topUp = inputs.stepUpTopUpAmount;
	const cap = inputs.stepUpCapAmount;

	const principalSaved = totalDepositsWithFixedStepUp(monthly, months, topUp, cap);
	const grossMaturity = calculateFixedStepUpSipMaturity(monthly, years, inputs.sipReturnRatePercent, topUp, cap);

	const cgt = calculateFixedStepUpCapitalGains(monthly, years, inputs.sipReturnRatePercent, topUp, cap);
	const taxRatio = cgt.grossMaturity > 0 ? cgt.totalTax / cgt.grossMaturity : 0;
	const taxAmount = grossMaturity * taxRatio;
	const netMaturity = grossMaturity - taxAmount;
	const gainsEarned = grossMaturity - principalSaved;

	const deposits = [];
	for (let m = 1; m <= months; m++) {
		deposits.push(Math.min(monthly + topUp * Math.floor((m - 1) / 12), cap));
	}

	return {
		id: 'sip' as const,
		label: 'Step-Up SIP',
		riskLevel: 'high',
		netMaturity,
		grossMaturity,
		principalSaved,
		gainsEarned: Math.max(0, gainsEarned),
		taxAmount,
		xirrPercent: calculateVariableMonthlyXirr(deposits, netMaturity),
		monthlyDeposit: monthly
	};
}

function buildSipInstrument(
	inputs: SavingsInputs,
	monthly: number,
	advanced: AdvancedInputs
): InstrumentResult {
	const years = inputs.years;
	const principalSaved =
		advanced.stepUpPercentAnnual > 0
			? totalDepositsWithStepUp(monthly, years * 12, advanced.stepUpPercentAnnual)
			: monthly * years * 12;

	let grossMaturity =
		advanced.stepUpPercentAnnual > 0
			? calculateStepUpSipMaturity(
					monthly,
					years,
					inputs.sipReturnRatePercent,
					advanced.stepUpPercentAnnual
				)
			: calculateSavings({ ...inputs, investmentPath: 'sip' }).grossMaturity;

	if (advanced.lumpsumAmount > 0) {
		const lumpFv = futureValueLumpsum(
			advanced.lumpsumAmount,
			years,
			inputs.sipReturnRatePercent
		);
		grossMaturity = combineLumpsumAndRecurring(0, grossMaturity, lumpFv).grossMaturity;
	}

	const cgt = calculateSipCapitalGains(monthly, years, inputs.sipReturnRatePercent);
	const taxRatio = cgt.grossMaturity > 0 ? cgt.totalTax / cgt.grossMaturity : 0;
	const taxAmount = grossMaturity * taxRatio;
	const netMaturity = grossMaturity - taxAmount;
	const gainsEarned = grossMaturity - principalSaved - advanced.lumpsumAmount;

	return {
		id: 'sip',
		label: 'SIP',
		riskLevel: 'high',
		netMaturity,
		grossMaturity,
		principalSaved: principalSaved + advanced.lumpsumAmount,
		gainsEarned: Math.max(0, gainsEarned),
		taxAmount,
		xirrPercent: calculateMonthlyInvestmentXirr(monthly, years, netMaturity),
		monthlyDeposit: monthly
	};
}

export function calculateCompare(
	inputs: SavingsInputs,
	tdsInputs: TdsInputs,
	advanced: AdvancedInputs
): CompareResult {
	const base = calculateSavings(inputs);
	const monthly = base.roundedMonthly;

	const rd = buildRdInstrument(inputs, monthly, advanced, tdsInputs);
	const sip = buildSipInstrument(inputs, monthly, advanced);
	const stepupSip = inputs.stepUpTopUpAmount > 0 || inputs.stepUpCapAmount > 0
		? buildStepUpSipInstrument(inputs, monthly)
		: undefined;

	return { rd, sip, stepupSip };
}