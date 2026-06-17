<script lang="ts">
	import type { MonthlyDataPoint } from '$lib/calculations/savings';
	import type { TdsResult } from '$lib/calculations/tds';
	import { formatINR, formatINRCompact } from '$lib/utils/format';
	import ChartTooltip from './ChartTooltip.svelte';

	interface Props {
		data: MonthlyDataPoint[];
		tdsResult?: TdsResult;
		large?: boolean;
		/** PDF/static export — no tooltips or interaction */
		static?: boolean;
	}

	let { data, tdsResult, large = false, static: isStatic = false }: Props = $props();

	const VB_W = 400;
	const VB_H = 220;
	const padding = { top: 16, right: 12, bottom: 28, left: 48 };
	let hoveredIndex = $state<number | null>(null);
	let pinnedIndex = $state<number | null>(null);

	const activeIndex = $derived(pinnedIndex ?? hoveredIndex);
	const tdsApplies = $derived(tdsResult?.tdsApplicable ?? false);
	const lastIndex = $derived(Math.max(data.length - 1, 0));

	const displayData = $derived(
		data.map((point, i) =>
			tdsApplies && i === lastIndex && tdsResult
				? { ...point, balance: tdsResult.netMaturityAfterTds, grossBalance: point.balance }
				: { ...point, grossBalance: point.balance }
		)
	);

	const chartWidth = $derived(VB_W - padding.left - padding.right);
	const chartHeight = $derived(VB_H - padding.top - padding.bottom);

	const maxY = $derived(
		Math.max(
			...displayData.map((d) => Math.max(d.principal, d.grossBalance)),
			1
		)
	);

	function xPos(i: number): number {
		return padding.left + (i / Math.max(data.length - 1, 1)) * chartWidth;
	}

	function yPos(value: number): number {
		return padding.top + chartHeight - (value / maxY) * chartHeight;
	}

	function xPercent(i: number): number {
		return (xPos(i) / VB_W) * 100;
	}

	function buildPath(key: 'principal' | 'balance'): string {
		if (displayData.length === 0) return '';
		return displayData
			.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i)} ${yPos(d[key])}`)
			.join(' ');
	}

	function buildArea(key: 'principal' | 'balance'): string {
		if (displayData.length === 0) return '';
		const line = displayData
			.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i)} ${yPos(d[key])}`)
			.join(' ');
		const lastX = xPos(displayData.length - 1);
		const firstX = xPos(0);
		const baseY = padding.top + chartHeight;
		return `${line} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
	}

	function selectIndex(i: number) {
		pinnedIndex = pinnedIndex === i ? null : i;
	}

	function clearHover() {
		hoveredIndex = null;
		if (pinnedIndex === null) return;
	}

	const yTicks = $derived([0, 0.5, 1].map((t) => t * maxY));
	const xLabels = $derived.by(() => {
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
		const point = displayData[activeIndex];
		const isFinalWithTds = tdsApplies && activeIndex === lastIndex && tdsResult;

		if (isFinalWithTds) {
			return [
				{ text: `Principal: ${formatINR(point.principal)}`, color: '#4f46e5' },
				{ text: `Gross: ${formatINR(point.grossBalance)}`, color: '#94a3b8' },
				{ text: `TDS: −${formatINR(tdsResult.tdsDeducted)}`, color: '#e11d48' },
				{ text: `Net: ${formatINR(point.balance)}`, color: '#0d9488' }
			];
		}

		return [
			{ text: `Principal: ${formatINR(point.principal)}`, color: '#4f46e5' },
			{ text: `Balance: ${formatINR(point.balance)}`, color: '#0d9488' }
		];
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
	class="flex w-full flex-col {large ? 'h-full' : 'h-full min-h-0'}"
	onclick={isStatic ? undefined : () => (pinnedIndex = null)}
	role="presentation"
>
	<div class="chart-svg-area relative min-h-0 {large ? 'h-full' : 'flex-1'}">
		{#if !isStatic}
			<ChartTooltip
				visible={activeIndex !== null}
				title={activeIndex !== null ? `Month ${data[activeIndex].month}` : undefined}
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
		>
			<defs>
				<linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#0d9488" stop-opacity="0.35" />
					<stop offset="100%" stop-color="#0d9488" stop-opacity="0.02" />
				</linearGradient>
				<linearGradient id="principalGrad" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#4f46e5" stop-opacity="0.25" />
					<stop offset="100%" stop-color="#4f46e5" stop-opacity="0.02" />
				</linearGradient>
				<linearGradient id="tdsCutGrad" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#e11d48" stop-opacity="0.45" />
					<stop offset="100%" stop-color="#e11d48" stop-opacity="0.12" />
				</linearGradient>
			</defs>

			{#each yTicks as tick}
				<line
					x1={padding.left}
					y1={yPos(tick)}
					x2={padding.left + chartWidth}
					y2={yPos(tick)}
					stroke="#e2e8f0"
					stroke-width="1"
					stroke-dasharray="3 3"
				/>
				<text
					x={padding.left - 6}
					y={yPos(tick)}
					text-anchor="end"
					dominant-baseline="middle"
					fill="#94a3b8"
					font-size="9"
				>
					{formatINRCompact(tick)}
				</text>
			{/each}

			<path d={buildArea('principal')} fill="url(#principalGrad)" />
			<path d={buildArea('balance')} fill="url(#balanceGrad)" />
			<path d={buildPath('principal')} fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" />
			<path d={buildPath('balance')} fill="none" stroke="#0d9488" stroke-width="2.5" stroke-linecap="round" />

			{#if tdsApplies && tdsResult && data.length > 0}
				{@const last = displayData[lastIndex]}
				{@const x = xPos(lastIndex)}
				{@const yNet = yPos(last.balance)}
				{@const yGross = yPos(last.grossBalance)}
				{@const cutWidth = Math.max(chartWidth / data.length * 0.4, 6)}
				<rect
					x={x - cutWidth / 2}
					y={yGross}
					width={cutWidth}
					height={yNet - yGross}
					fill="url(#tdsCutGrad)"
					rx="2"
				/>
				<line
					x1={x - cutWidth / 2 - 2}
					y1={yGross}
					x2={x + cutWidth / 2 + 2}
					y2={yGross}
					stroke="#e11d48"
					stroke-width="1.5"
					stroke-dasharray="3 2"
				/>
			{/if}

			{#if !isStatic}
				{#each data as point, i}
					<rect
						x={xPos(i) - chartWidth / data.length / 2}
						y={padding.top}
						width={chartWidth / data.length}
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
				{@const point = displayData[activeIndex]}
				<line
					x1={xPos(activeIndex)}
					y1={padding.top}
					x2={xPos(activeIndex)}
					y2={padding.top + chartHeight}
					stroke="#94a3b8"
					stroke-width="1"
					stroke-dasharray="3 3"
				/>
				<circle cx={xPos(activeIndex)} cy={yPos(point.balance)} r="4" fill="#0d9488" />
				<circle cx={xPos(activeIndex)} cy={yPos(point.principal)} r="3" fill="#4f46e5" />
				{#if tdsApplies && activeIndex === lastIndex}
					<circle cx={xPos(activeIndex)} cy={yPos(point.grossBalance)} r="3" fill="#e11d48" opacity="0.7" />
				{/if}
			{/if}

			{#each xLabels as point}
				<text
					x={xPos(point.month - 1)}
					y={VB_H - 6}
					text-anchor="middle"
					fill="#94a3b8"
					font-size="9"
				>
					Y{point.year}
				</text>
			{/each}
		</svg>
	</div>

	<div class="mt-1.5 flex shrink-0 flex-wrap gap-3 text-[10px] text-slate-500">
		<span class="flex items-center gap-1">
			<span class="h-1.5 w-3 rounded-full bg-indigo-500"></span>
			Principal
		</span>
		<span class="flex items-center gap-1">
			<span class="h-1.5 w-3 rounded-full bg-teal-500"></span>
			{tdsApplies ? 'Net Balance' : 'Balance'}
		</span>
		{#if tdsApplies}
			<span class="flex items-center gap-1">
				<span class="h-1.5 w-3 rounded-full bg-rose-500"></span>
				TDS Cut
			</span>
		{/if}
	</div>
</div>