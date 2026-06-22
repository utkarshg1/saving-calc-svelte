<script lang="ts">
	import type { CompareResult } from '$lib/calculations/types';
	import type { SavingsInputs } from '$lib/calculations/savings';
	import { buildMonthlySeries } from '$lib/calculations/savings';
	import { buildSipMonthlySeries } from '$lib/calculations/sip';
	import { CHART_COLORS, CHART_GRID, CHART_TYPO } from '$lib/chart/chartTheme';
	import { formatINR, formatINRCompact } from '$lib/utils/format';
	import { sipExcessAfterTaxSummary, sipExcessToneClasses } from '$lib/utils/compareLabels';
	import ChartTooltip from './ChartTooltip.svelte';

	interface Props {
		inputs: SavingsInputs;
		compare: CompareResult;
		monthly: number;
		/** PDF/static export — no tooltips or interaction */
		static?: boolean;
	}

	let { inputs, compare, monthly, static: isStatic = false }: Props = $props();

	const rdSeries = $derived(buildMonthlySeries(monthly, inputs.years, inputs.rdInterestRatePercent));
	const sipSeries = $derived(buildSipMonthlySeries(monthly, inputs.years, inputs.sipReturnRatePercent));

	const VB_W = 480;
	const VB_H = 260;
	const padding = { top: 12, right: 20, bottom: 30, left: 44 };
	let hoveredIndex = $state<number | null>(null);
	let pinnedIndex = $state<number | null>(null);

	const activeIndex = $derived(pinnedIndex ?? hoveredIndex);
	const dataLen = $derived(Math.max(rdSeries.length, sipSeries.length));
	const lastIndex = $derived(Math.max(dataLen - 1, 0));

	const displayRd = $derived(
		rdSeries.map((point, i) => ({
			...point,
			balance: i === lastIndex ? compare.rd.netMaturity : point.balance
		}))
	);
	const displaySip = $derived(
		sipSeries.map((point, i) => ({
			...point,
			balance: i === lastIndex ? compare.sip.netMaturity : point.balance
		}))
	);

	const excessSummary = $derived(
		sipExcessAfterTaxSummary(compare.sip.netMaturity, compare.rd.netMaturity)
	);

	const chartWidth = $derived(VB_W - padding.left - padding.right);
	const chartHeight = $derived(VB_H - padding.top - padding.bottom);
	const baseY = $derived(padding.top + chartHeight);

	const maxY = $derived(
		Math.max(
			...displayRd.map((d) => Math.max(d.balance, d.principal)),
			...displaySip.map((d) => d.balance),
			1
		)
	);

	function xPos(i: number): number {
		return padding.left + (i / Math.max(dataLen - 1, 1)) * chartWidth;
	}

	function yPos(value: number): number {
		return padding.top + chartHeight - (value / maxY) * chartHeight;
	}

	function xPercent(i: number): number {
		return (xPos(i) / VB_W) * 100;
	}

	function buildPath(series: typeof displayRd, key: 'balance' | 'principal'): string {
		if (series.length === 0) return '';
		return series
			.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i)} ${yPos(d[key])}`)
			.join(' ');
	}

	function buildArea(series: typeof displayRd, key: 'balance' | 'principal'): string {
		if (series.length === 0) return '';
		const line = series
			.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i)} ${yPos(d[key])}`)
			.join(' ');
		const lastX = xPos(series.length - 1);
		const firstX = xPos(0);
		return `${line} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
	}

	function selectIndex(i: number) {
		pinnedIndex = pinnedIndex === i ? null : i;
	}

	function clearHover() {
		hoveredIndex = null;
	}

	const yTicks = $derived([0, 0.5, 1].map((t) => t * maxY));
	const xLabels = $derived.by(() => {
		const data = rdSeries.length >= sipSeries.length ? rdSeries : sipSeries;
		const candidates = data.filter(
			(point, i) => i === 0 || (i > 0 && point.year !== data[i - 1].year)
		);
		const last = data[data.length - 1];
		if (last && candidates[candidates.length - 1]?.month !== last.month) {
			const prev = candidates[candidates.length - 1];
			if (!prev || last.year !== prev.year) {
				candidates.push(last);
			}
		}
		return candidates;
	});

	const tooltipLines = $derived.by(() => {
		if (activeIndex === null) return [];
		const rd = displayRd[activeIndex];
		const sip = displaySip[activeIndex];
		if (!rd || !sip) return [];
		const delta = sip.balance - rd.balance;
		const deltaColor = delta > 0 ? '#6366f1' : delta < 0 ? '#0d9488' : '#64748b';
		const deltaLabel =
			delta > 0
				? `SIP ahead: +${formatINR(delta)}`
				: delta < 0
					? `RD ahead: +${formatINR(Math.abs(delta))}`
					: 'Equal at this point';
		return [
			{ text: `Principal: ${formatINR(rd.principal)}`, color: '#64748b' },
			{ text: `RD: ${formatINR(rd.balance)}`, color: '#0d9488' },
			{ text: `SIP: ${formatINR(sip.balance)}`, color: '#6366f1' },
			{ text: deltaLabel, color: deltaColor }
		];
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
	class="flex h-full min-h-[380px] w-full flex-col sm:min-h-[420px] md:min-h-[460px]"
	onclick={isStatic ? undefined : () => (pinnedIndex = null)}
	role="presentation"
>
	<div class="chart-svg-area relative min-h-0 w-full flex-[7]">
		{#if !isStatic}
			<ChartTooltip
				visible={activeIndex !== null}
				title={activeIndex !== null
					? `Month ${(rdSeries[activeIndex] ?? sipSeries[activeIndex])?.month ?? activeIndex + 1}`
					: undefined}
				xPercent={activeIndex !== null ? xPercent(activeIndex) : 50}
				lines={tooltipLines}
			/>
		{/if}

		<svg
			viewBox="0 0 {VB_W} {VB_H}"
			width="100%"
			height="100%"
			preserveAspectRatio="xMidYMid meet"
			class="block h-full w-full"
			role="img"
			aria-label="RD vs SIP growth over time with principal reference"
		>
			<defs>
				<linearGradient id="compareRdAreaGrad" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#0d9488" stop-opacity="0.16" />
					<stop offset="100%" stop-color="#0d9488" stop-opacity="0.02" />
				</linearGradient>
				<linearGradient id="compareSipAreaGrad" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#6366f1" stop-opacity="0.14" />
					<stop offset="100%" stop-color="#6366f1" stop-opacity="0.02" />
				</linearGradient>
			</defs>

			<rect
				x={padding.left}
				y={padding.top}
				width={chartWidth}
				height={chartHeight}
				fill={CHART_COLORS.plotFill}
				rx="6"
			/>

			{#each yTicks as tick}
				<line
					x1={padding.left}
					y1={yPos(tick)}
					x2={padding.left + chartWidth}
					y2={yPos(tick)}
					stroke={CHART_COLORS.grid}
					stroke-width="1"
					stroke-dasharray={CHART_GRID.dashArray}
					stroke-opacity={CHART_GRID.strokeOpacity}
				/>
				<text
					x={padding.left - 5}
					y={yPos(tick)}
					text-anchor="end"
					dominant-baseline="middle"
					fill={CHART_COLORS.axis}
					font-size={CHART_TYPO.axisFontSize}
				>
					{formatINRCompact(tick)}
				</text>
			{/each}

			<path d={buildArea(displayRd, 'balance')} fill="url(#compareRdAreaGrad)" />
			<path d={buildArea(displaySip, 'balance')} fill="url(#compareSipAreaGrad)" />

			<path
				d={buildPath(displayRd, 'principal')}
				fill="none"
				stroke="#94a3b8"
				stroke-width="1.5"
				stroke-dasharray="5 4"
				stroke-linecap="round"
			/>
			<path
				d={buildPath(displayRd, 'balance')}
				fill="none"
				stroke="#0d9488"
				stroke-width="2"
				stroke-linecap="round"
			/>
			<path
				d={buildPath(displaySip, 'balance')}
				fill="none"
				stroke="#6366f1"
				stroke-width="2"
				stroke-linecap="round"
			/>

			{#if !isStatic}
				{#each Array(dataLen) as _, i}
					<rect
						x={xPos(i) - chartWidth / dataLen / 2}
						y={padding.top}
						width={chartWidth / dataLen}
						height={chartHeight}
						fill="transparent"
						role="presentation"
						onmouseenter={() => (hoveredIndex = i)}
						onmouseleave={clearHover}
						onclick={(e) => {
							e.stopPropagation();
							selectIndex(i);
						}}
					/>
				{/each}
			{/if}

			{#if !isStatic && activeIndex !== null}
				{@const rd = displayRd[activeIndex]}
				{@const sip = displaySip[activeIndex]}
				{#if rd && sip}
					<line
						x1={xPos(activeIndex)}
						y1={padding.top}
						x2={xPos(activeIndex)}
						y2={baseY}
						stroke="#94a3b8"
						stroke-width="1"
						stroke-dasharray="3 3"
						opacity="0.7"
					/>
					<circle
						cx={xPos(activeIndex)}
						cy={yPos(rd.principal)}
						r="3"
						fill="#64748b"
						stroke="#fff"
						stroke-width="1"
					/>
					<circle
						cx={xPos(activeIndex)}
						cy={yPos(rd.balance)}
						r="3.5"
						fill="#0d9488"
						stroke="#fff"
						stroke-width="1"
					/>
					<circle
						cx={xPos(activeIndex)}
						cy={yPos(sip.balance)}
						r="3.5"
						fill="#6366f1"
						stroke="#fff"
						stroke-width="1"
					/>
				{/if}
			{/if}

			{#each xLabels as point}
				<text
					x={xPos(point.month - 1)}
					y={VB_H - 8}
					text-anchor="middle"
					fill={CHART_COLORS.axis}
					font-size={CHART_TYPO.axisFontSize}
				>
					Y{point.year}
				</text>
			{/each}
		</svg>
	</div>

	<div class="shrink-0 border-t border-slate-100 bg-slate-50/60 px-3 py-2.5">
		<div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
			<div
				class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 {CHART_TYPO.legendClass} text-slate-600 md:justify-start"
			>
				<span class="flex items-center gap-1.5">
					<span class="h-0 w-4 border-t-2 border-dashed border-slate-400"></span>
					Principal
				</span>
				<span class="flex items-center gap-1.5">
					<span class="h-1.5 w-4 rounded-full bg-teal-500"></span>
					RD {formatINRCompact(compare.rd.netMaturity)}
				</span>
				<span class="flex items-center gap-1.5">
					<span class="h-1.5 w-4 rounded-full bg-indigo-500"></span>
					SIP {formatINRCompact(compare.sip.netMaturity)}
				</span>
			</div>
			<p
				class="text-center {CHART_TYPO.legendClass} font-medium md:text-right {sipExcessToneClasses(excessSummary.tone)}"
				aria-live="polite"
			>
				{excessSummary.text}
			</p>
		</div>
	</div>
</div>