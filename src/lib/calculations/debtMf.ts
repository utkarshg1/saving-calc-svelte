import type { InstrumentResult } from './types';
import { calculateSipMaturity } from './sip';
import { calculateMonthlyInvestmentXirr } from './xirr';

const DEBT_TAX_RATE = 0.3;

export function calculateDebtMf(
	monthlyDeposit: number,
	years: number,
	annualRatePercent = 7
): InstrumentResult {
	const sip = calculateSipMaturity(monthlyDeposit, years, annualRatePercent);
	const principalSaved = monthlyDeposit * years * 12;
	const gainsEarned = sip.maturity - principalSaved;
	const taxAmount = Math.max(0, gainsEarned * DEBT_TAX_RATE);
	const netMaturity = sip.maturity - taxAmount;

	return {
		id: 'debt_mf',
		label: 'Debt MF',
		riskLevel: 'medium',
		netMaturity,
		grossMaturity: sip.maturity,
		principalSaved,
		gainsEarned,
		taxAmount,
		xirrPercent: calculateMonthlyInvestmentXirr(monthlyDeposit, years, netMaturity),
		monthlyDeposit
	};
}