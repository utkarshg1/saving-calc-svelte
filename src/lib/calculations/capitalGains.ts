/** Equity MF capital gains tax (Budget 2024 rules, simplified). */

export const STCG_RATE = 0.2;
export const LTCG_RATE = 0.125;
export const LTCG_EXEMPTION = 125_000;
export const LTCG_HOLDING_MONTHS = 12;

export interface InstallmentGain {
	installment: number;
	holdingMonths: number;
	principal: number;
	futureValue: number;
	gain: number;
	classification: 'stcg' | 'ltcg';
}

export interface CapitalGainsResult {
	grossMaturity: number;
	totalPrincipal: number;
	totalGains: number;
	stcgGain: number;
	ltcgGain: number;
	stcgTax: number;
	ltcgExemptionApplied: number;
	taxableLtcg: number;
	ltcgTax: number;
	totalTax: number;
	/** Capital gains remaining after STCG + LTCG tax */
	netCapitalGainsAfterTax: number;
	netAfterTax: number;
	stcgInstallmentCount: number;
	ltcgInstallmentCount: number;
	installments: InstallmentGain[];
}

export function calculateCapitalGainsTax(
	installments: InstallmentGain[],
	grossMaturity: number
): CapitalGainsResult {
	const totalPrincipal = installments.reduce((sum, row) => sum + row.principal, 0);
	const stcgGain = installments
		.filter((row) => row.classification === 'stcg')
		.reduce((sum, row) => sum + row.gain, 0);
	const ltcgGain = installments
		.filter((row) => row.classification === 'ltcg')
		.reduce((sum, row) => sum + row.gain, 0);

	const stcgTax = stcgGain * STCG_RATE;
	const ltcgExemptionApplied = Math.min(ltcgGain, LTCG_EXEMPTION);
	const taxableLtcg = Math.max(0, ltcgGain - LTCG_EXEMPTION);
	const ltcgTax = taxableLtcg * LTCG_RATE;
	const totalTax = stcgTax + ltcgTax;
	const totalGains = grossMaturity - totalPrincipal;

	return {
		grossMaturity,
		totalPrincipal,
		totalGains,
		stcgGain,
		ltcgGain,
		stcgTax,
		ltcgExemptionApplied,
		taxableLtcg,
		ltcgTax,
		totalTax,
		netCapitalGainsAfterTax: totalGains - totalTax,
		netAfterTax: grossMaturity - totalTax,
		stcgInstallmentCount: installments.filter((row) => row.classification === 'stcg').length,
		ltcgInstallmentCount: installments.filter((row) => row.classification === 'ltcg').length,
		installments
	};
}