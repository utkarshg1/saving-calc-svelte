export const CHART_VB = { w: 480, h: 220 } as const;

export const CHART_PADDING = { top: 12, right: 16, bottom: 30, left: 44 } as const;

export const CHART_TYPO = {
	axisFontSize: 9,
	legendClass: 'text-[10px]',
	tooltipTitleClass: 'text-[10px] font-medium',
	tooltipLineClass: 'text-[10px]'
} as const;

export const CHART_COLORS = {
	plotFill: '#f8fafc',
	grid: '#e2e8f0',
	axis: '#64748b',
	axisMuted: '#94a3b8',
	teal: '#0d9488',
	tealLight: 'rgba(13,148,136,0.18)',
	indigo: '#4f46e5',
	amber: '#f59e0b',
	rose: '#e11d48'
} as const;

export const CHART_GRID = {
	strokeOpacity: 0.6,
	dashArray: '5 5'
} as const;

export function chartPlotWidth(vbW = CHART_VB.w): number {
	return vbW - CHART_PADDING.left - CHART_PADDING.right;
}

export function chartPlotHeight(vbH = CHART_VB.h): number {
	return vbH - CHART_PADDING.top - CHART_PADDING.bottom;
}

export function yPos(value: number, maxY: number, vbH = CHART_VB.h): number {
	const chartHeight = chartPlotHeight(vbH);
	return CHART_PADDING.top + chartHeight - (value / maxY) * chartHeight;
}

export function yTicks(maxY: number, steps = 3): number[] {
	return Array.from({ length: steps + 1 }, (_, i) => (i / steps) * maxY);
}