const inrFormatter = new Intl.NumberFormat('en-IN', {
	style: 'currency',
	currency: 'INR',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

const inrCompactFormatter = new Intl.NumberFormat('en-IN', {
	style: 'currency',
	currency: 'INR',
	notation: 'compact',
	maximumFractionDigits: 1
});

export function formatINR(value: number): string {
	return inrFormatter.format(value);
}

export function formatINRCompact(value: number): string {
	return inrCompactFormatter.format(value);
}

export function formatPercent(value: number, decimals = 2): string {
	return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals = 2): string {
	return value.toLocaleString('en-IN', {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	});
}