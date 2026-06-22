export interface HistoricalPreset {
	id: string;
	label: string;
	inflationRatePercent?: number;
	rdInterestRatePercent?: number;
	sipReturnRatePercent?: number;
	source: string;
}

export const HISTORICAL_PRESETS: HistoricalPreset[] = [
	{
		id: 'cpi-high',
		label: 'CPI avg (2010–15)',
		inflationRatePercent: 6.2,
		source: 'RBI / MOSPI historical CPI'
	},
	{
		id: 'cpi-mid',
		label: 'CPI avg (2016–20)',
		inflationRatePercent: 5.5,
		source: 'RBI / MOSPI historical CPI'
	},
	{
		id: 'cpi-low',
		label: 'CPI avg (2021–25)',
		inflationRatePercent: 4.1,
		source: 'RBI / MOSPI historical CPI'
	},
	{
		id: 'sbi-rd',
		label: 'SBI RD (5Y)',
		rdInterestRatePercent: 6.5,
		source: 'SBI recurring deposit rates'
	},
	{
		id: 'hdfc-rd',
		label: 'HDFC RD (5Y)',
		rdInterestRatePercent: 6.6,
		source: 'HDFC Bank RD rates'
	}
];