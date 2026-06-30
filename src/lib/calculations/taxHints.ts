import type { SavingsInputs, SavingsResult } from './savings';
import type { TaxHint } from './types';

export function buildTaxHints(inputs: SavingsInputs, result: SavingsResult): TaxHint[] {
	const yearlyInvestment = result.roundedMonthly * 12;
	const isSip = inputs.investmentPath === 'sip' || inputs.investmentPath === 'stepup-sip';

	const hints: TaxHint[] = [
		{
			id: '80c',
			title: 'Section 80C (PPF / ELSS / NSC)',
			description:
				'Investments in PPF, ELSS, NSC, and certain other instruments qualify for deduction up to ₹1.5 lakh per financial year under Section 80C.',
			applicable: yearlyInvestment <= 150_000,
			estimatedBenefit: yearlyInvestment <= 150_000 ? yearlyInvestment * 0.3 : 45_000
		},
		{
			id: '80tta',
			title: 'Section 80TTA (Savings interest)',
			description:
				'Interest from savings accounts is deductible up to ₹10,000/year for individuals below 60. Not applicable to RD interest directly.',
			applicable: !isSip,
			estimatedBenefit: 10_000
		},
		{
			id: '80ttb',
			title: 'Section 80TTB (Senior citizens)',
			description:
				'Senior citizens can claim deduction up to ₹50,000 on interest income from deposits (including RD/FD).',
			applicable: !isSip,
			estimatedBenefit: 50_000
		},
		{
			id: 'ltcg-exemption',
			title: 'LTCG exemption (Equity MF)',
			description: `Long-term capital gains on equity mutual funds enjoy a ₹1.25 lakh annual exemption before 12.5% tax applies.`,
			applicable: isSip,
			estimatedBenefit: 125_000 * 0.125
		}
	];

	return hints;
}