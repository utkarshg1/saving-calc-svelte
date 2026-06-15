/** Section 194A TDS rules — June 2026 (interest on FD/RD, including rollover). */

export const TDS_THRESHOLD_NON_SENIOR = 40_000;
export const TDS_THRESHOLD_SENIOR = 50_000;
export const TDS_RATE_WITH_PAN = 0.1;
export const TDS_RATE_WITHOUT_PAN = 0.2;

export interface TdsInputs {
	isSeniorCitizen: boolean;
	hasPAN: boolean;
	/** Form 15G (non-senior) or 15H (senior) — nil TDS declaration */
	form15GHSubmitted: boolean;
	/** Other bank FD/RD interest already earned in current financial year */
	otherInterestThisFY: number;
}

export interface TdsParams {
	/** Interest earned on this RD/FD */
	totalInterest: number;
	/** Gross maturity = principal + interest */
	grossMaturity: number;
	otherInterestThisFY?: number;
	isSeniorCitizen: boolean;
	hasPAN?: boolean;
	form15GHSubmitted: boolean;
}

export interface TdsResult {
	grossMaturity: number;
	totalInterest: number;
	aggregateInterestThisFY: number;
	threshold: number;
	/** 0, 0.10, or 0.20 */
	tdsRate: number;
	tdsApplicable: boolean;
	tdsDeducted: number;
	netMaturityAfterTds: number;
	netInterestAfterTds: number;
}

export const DEFAULT_TDS_INPUTS: TdsInputs = {
	isSeniorCitizen: false,
	hasPAN: true,
	form15GHSubmitted: false,
	otherInterestThisFY: 0
};

/**
 * Calculate TDS on RD/FD interest at maturity.
 *
 * TDS applies when aggregate FY interest exceeds the threshold, even if maturity
 * is directly reinvested (RD → FD rollover) without crediting a savings account.
 */
export function calculateTds(params: TdsParams): TdsResult {
	const {
		totalInterest,
		grossMaturity,
		otherInterestThisFY = 0,
		isSeniorCitizen,
		hasPAN = true,
		form15GHSubmitted
	} = params;

	const threshold = isSeniorCitizen ? TDS_THRESHOLD_SENIOR : TDS_THRESHOLD_NON_SENIOR;
	const aggregateInterestThisFY = totalInterest + otherInterestThisFY;

	// Form 15G/15H or zero interest → no TDS
	if (form15GHSubmitted || totalInterest <= 0) {
		return {
			grossMaturity,
			totalInterest,
			aggregateInterestThisFY,
			threshold,
			tdsRate: 0,
			tdsApplicable: false,
			tdsDeducted: 0,
			netMaturityAfterTds: grossMaturity,
			netInterestAfterTds: totalInterest
		};
	}

	// Below FY aggregate threshold → no TDS
	if (aggregateInterestThisFY <= threshold) {
		return {
			grossMaturity,
			totalInterest,
			aggregateInterestThisFY,
			threshold,
			tdsRate: 0,
			tdsApplicable: false,
			tdsDeducted: 0,
			netMaturityAfterTds: grossMaturity,
			netInterestAfterTds: totalInterest
		};
	}

	const tdsRate = hasPAN ? TDS_RATE_WITH_PAN : TDS_RATE_WITHOUT_PAN;
	const tdsDeducted = totalInterest * tdsRate;

	return {
		grossMaturity,
		totalInterest,
		aggregateInterestThisFY,
		threshold,
		tdsRate,
		tdsApplicable: true,
		tdsDeducted,
		netMaturityAfterTds: grossMaturity - tdsDeducted,
		netInterestAfterTds: totalInterest - tdsDeducted
	};
}