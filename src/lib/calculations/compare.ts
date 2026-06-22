import type { SavingsInputs } from './savings';
import { calculateSavings } from './savings';
import { calculateTds, type TdsInputs } from './tds';
import { calculateSipCapitalGains } from './sip';
import { calculateMonthlyInvestmentXirr } from './xirr';
import { calculatePpf } from './ppf';
import { calculateNsc } from './nsc';
import { calculateDebtMf } from './debtMf';
import type { AdvancedInputs, CompareResult, InstrumentId, InstrumentResult } from './types';
import {
	calculateStepUpRdMaturity,
	calculateStepUpSipMaturity,
	totalDepositsWithStepUp
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
	const ppf = calculatePpf(monthly, inputs.years);
	const nsc = calculateNsc(monthly, inputs.years);
	const debtMf = calculateDebtMf(monthly, inputs.years, inputs.rdInterestRatePercent);

	const instruments = [rd, sip, ppf, nsc, debtMf];
	const bestNetReturn = instruments.reduce((best, cur) =>
		cur.netMaturity > best.netMaturity ? cur : best
	).id;
	const lowestRisk = 'ppf' as InstrumentId;

	return { rd, sip, ppf, nsc, debtMf, bestNetReturn, lowestRisk };
}