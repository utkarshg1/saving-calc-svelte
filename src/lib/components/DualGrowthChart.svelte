<script lang="ts">
	import type { CompareResult } from '$lib/calculations/types';
	import type { SavingsInputs } from '$lib/calculations/savings';
	import { buildMonthlySeries } from '$lib/calculations/savings';
	import { buildSipMonthlySeries } from '$lib/calculations/sip';
	import { formatINR, formatINRCompact } from '$lib/utils/format';
	import { sipExcessAfterTaxSummary, sipExcessToneClasses } from '$lib/utils/compareLabels';
	import { fade } from 'svelte/transition';

	export interface GrowthOverlayPoint {
		month: number;
		year: number;
		principal: number;
		rdBalance: number;
		sipBalance: number;
	}

	export interface GrowthOverlaySeries {
		points: GrowthOverlayPoint[];
		rdNetMaturity: number;
		sipNetMaturity: number;
	}

	interface TooltipRow {
		key: string;
		label: string;
		value: string;
		dotClass: string;
		highlight?: boolean;
		tone?: 'sip' | 'rd' | 'neutral';
	}

	interface Props {
		inputs: SavingsInputs;
		compare: CompareResult;
		monthly: number;
		title?: string;
		description?: string;
		/** PDF/static export — no tooltips or interaction */
		static?: boolean;
	}

	let {
		inputs,
		compare,
		monthly,
		title = 'Growth Overlay',
		description = 'RD vs SIP balance over time (principal reference)',
		static: isStatic = false
	}: Props = $props();

	const VB_W = 520;
	const VB_H = 320;
	const padding = { top: 16, right: 16, bottom: 44, left: 72 };
	const axisFontSize = 11;
	const axisFill = '#9ca3af';

	let hoveredIndex = $state<number | null>(null);
	let pinnedIndex = $state<number | null>(null);
	let tooltipEl = $state<HTMLDivElement | null>(null);
	let clampedLeft = $state(50);

	const activeIndex = $derived(pinnedIndex ?? hoveredIndex);

	const rdSeries = $derived(buildMonthlySeries(monthly, inputs.years, inputs.rdInterestRatePercent));
	const sipSeries = $derived(buildSipMonthlySeries(monthly, inputs.years, inputs.sipReturnRatePercent));

	const dataLen = $derived(Math.max(rdSeries.length, sipSeries.length));
	const lastIndex = $derived(Math.max(dataLen - 1, 0));

	const overlaySeries = $derived.by((): GrowthOverlaySeries => {
		const points: GrowthOverlayPoint[] = [];
		for (let i = 0; i < dataLen; i++) {
			const rd = rdSeries[i];
			const sip = sipSeries[i];
			if (!rd || !sip) continue;
			points.push({
				month: rd.month,
				year: rd.year,
				principal: rd.principal,
				rdBalance: i === lastIndex ? compare.rd.netMaturity : rd.balance,
				sipBalance: i === lastIndex ? compare.sip.netMaturity : sip.balance
			});
		}
		return {
			points,
			rdNetMaturity: compare.rd.netMaturity,
			sipNetMaturity: compare.sip.netMaturity
		};
	});

	const excessSummary = $derived(
		sipExcessAfterTaxSummary(compare.sip.netMaturity, compare.rd.netMaturity)
	);

	const chartWidth = $derived(VB_W - padding.left - padding.right);
	const chartHeight = $derived(VB_H - padding.top - padding.bottom);
	const baseY = $derived(padding.top + chartHeight);

	const maxY = $derived(
		Math.max(
			...overlaySeries.points.map((d) => Math.max(d.rdBalance, d.sipBalance, d.principal)),
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

	function buildLinePath(key: 'rdBalance' | 'sipBalance' | 'principal'): string {
		const pts = overlaySeries.points;
		if (pts.length === 0) return '';
		return pts.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i)} ${yPos(d[key])}`).join(' ');
	}

	function buildAreaPath(key: 'rdBalance' | 'sipBalance'): string {
		const pts = overlaySeries.points;
		if (pts.length === 0) return '';
		const line = pts.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i)} ${yPos(d[key])}`).join(' ');
		const lastX = xPos(pts.length - 1);
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
		const data = overlaySeries.points;
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

	const activePoint = $derived(
		activeIndex !== null ? overlaySeries.points[activeIndex] : null
	);

	const tooltipRows = $derived.by((): TooltipRow[] => {
		if (!activePoint) return [];
		const delta = activePoint.sipBalance - activePoint.rdBalance;
		const rows: TooltipRow[] = [
			{
				key: 'principal',
				label: 'Principal',
				value: formatINR(activePoint.principal),
				dotClass: 'border border-gray-300 bg-white'
			},
			{
				key: 'rd',
				label: 'RD',
				value: formatINR(activePoint.rdBalance),
				dotClass: 'bg-teal-500'
			},
			{
				key: 'sip',
				label: 'SIP',
				value: formatINR(activePoint.sipBalance),
				dotClass: 'bg-indigo-500'
			}
		];

		if (delta > 0) {
			rows.push({
				key: 'delta',
				label: 'SIP ahead',
				value: `+${formatINR(delta)}`,
				dotClass: 'bg-indigo-500',
				highlight: true,
				tone: 'sip'
			});
		} else if (delta < 0) {
			rows.push({
				key: 'delta',
				label: 'RD ahead',
				value: `+${formatINR(Math.abs(delta))}`,
				dotClass: 'bg-teal-500',
				highlight: true,
				tone: 'rd'
			});
		} else {
			rows.push({
				key: 'delta',
				label: 'Difference',
				value: formatINR(0),
				dotClass: 'bg-gray-300',
				highlight: true,
				tone: 'neutral'
			});
		}

		return rows;
	});

	$effect(() => {
		const target = activeIndex !== null ? xPercent(activeIndex) : 50;
		if (!activePoint || !tooltipEl || isStatic) {
			clampedLeft = target;
			return;
		}

		const container = tooltipEl.parentElement;
		if (!container) {
			clampedLeft = target;
			return;
		}

		const containerW = container.clientWidth;
		const tooltipW = tooltipEl.offsetWidth;
		if (containerW <= 0 || tooltipW <= 0) {
			clampedLeft = target;
			return;
		}

		const pad = 12;
		const idealLeft = (target / 100) * containerW;
		const half = tooltipW / 2;
		const clampedPx = Math.max(half + pad, Math.min(containerW - half - pad, idealLeft));
		clampedLeft = (clampedPx / containerW) * 100;
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
	class="mx-auto w-full max-w-5xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
	onclick={isStatic ? undefined : () => (pinnedIndex = null)}
	role="presentation"
>
	<header class="mb-5">
		<h3 class="text-xl font-semibold text-gray-800">{title}</h3>
		{#if description}
			<p class="mt-1 text-xs text-gray-400">{description}</p>
		{/if}
	</header>

	<div class="relative h-[450px] w-full">
		{#if !isStatic && activePoint}
			<div
				bind:this={tooltipEl}
				class="pointer-events-none absolute top-3 z-20 min-w-[12.5rem] -translate-x-1/2 rounded-lg bg-white px-4 py-3 shadow-md ring-1 ring-gray-100"
				style="left: {clampedLeft}%"
				transition:fade={{ duration: 120 }}
			>
				<p class="mb-2.5 text-sm text-gray-500">
					Month {activePoint.month}
					<span class="text-gray-300">·</span>
					Year {activePoint.year}
				</p>
				<div class="space-y-2">
					{#each tooltipRows as row (row.key)}
						<div
							class="flex items-center justify-between gap-5 {row.highlight
								? 'mt-2.5 border-t border-gray-100 pt-2.5'
								: ''}"
						>
							<span class="flex items-center gap-2 text-sm text-gray-600">
								<span class="h-2.5 w-2.5 shrink-0 rounded-full {row.dotClass}"></span>
								{row.label}
							</span>
							<span
								class="font-mono-num tabular-nums text-base font-medium text-right {row.highlight
									? row.tone === 'sip'
										? 'text-indigo-600'
										: row.tone === 'rd'
											? 'text-teal-600'
											: 'text-gray-800'
									: 'text-gray-800'}"
							>
								{row.value}
							</span>
						</div>
					{/each}
				</div>
			</div>
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
				<linearGradient id="growthRdFill" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#14b8a6" stop-opacity="0.12" />
					<stop offset="100%" stop-color="#14b8a6" stop-opacity="0" />
				</linearGradient>
				<linearGradient id="growthSipFill" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#6366f1" stop-opacity="0.1" />
					<stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
				</linearGradient>
			</defs>

			{#each yTicks as tick}
				<line
					x1={padding.left}
					y1={yPos(tick)}
					x2={padding.left + chartWidth}
					y2={yPos(tick)}
					stroke="#f3f4f6"
					stroke-width="1"
					stroke-dasharray="4 6"
				/>
				<text
					x={padding.left - 14}
					y={yPos(tick)}
					text-anchor="end"
					dominant-baseline="middle"
					class="select-none"
					fill={axisFill}
					font-size={axisFontSize}
					font-weight="400"
				>
					{formatINRCompact(tick)}
				</text>
			{/each}

			<path d={buildAreaPath('rdBalance')} fill="url(#growthRdFill)" />
			<path d={buildAreaPath('sipBalance')} fill="url(#growthSipFill)" />

			<path
				d={buildLinePath('principal')}
				fill="none"
				stroke="#9ca3af"
				stroke-width="2"
				stroke-dasharray="6 5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path
				d={buildLinePath('rdBalance')}
				fill="none"
				stroke="#14b8a6"
				stroke-width="3.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path
				d={buildLinePath('sipBalance')}
				fill="none"
				stroke="#6366f1"
				stroke-width="3.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>

			{#if !isStatic && activeIndex !== null && activePoint}
				<circle
					cx={xPos(activeIndex)}
					cy={yPos(activePoint.principal)}
					r="4"
					fill="#fff"
					stroke="#9ca3af"
					stroke-width="2"
				/>
				<circle
					cx={xPos(activeIndex)}
					cy={yPos(activePoint.rdBalance)}
					r="4.5"
					fill="#14b8a6"
					stroke="#fff"
					stroke-width="2"
				/>
				<circle
					cx={xPos(activeIndex)}
					cy={yPos(activePoint.sipBalance)}
					r="4.5"
					fill="#6366f1"
					stroke="#fff"
					stroke-width="2"
				/>
			{/if}

			{#if !isStatic}
				{#each overlaySeries.points as _, i}
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

			{#each xLabels as point}
				<text
					x={xPos(point.month - 1)}
					y={VB_H - 14}
					text-anchor="middle"
					class="select-none"
					fill={axisFill}
					font-size={axisFontSize}
					font-weight="400"
				>
					Y{point.year}
				</text>
			{/each}
		</svg>
	</div>

	<div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
			<span class="flex items-center gap-1.5">
				<span class="h-0 w-3.5 border-t border-dashed border-gray-400"></span>
				Principal
			</span>
			<span class="flex items-center gap-1.5">
				<span class="h-1 w-3 rounded-full bg-teal-500"></span>
				RD
			</span>
			<span class="flex items-center gap-1.5">
				<span class="h-1 w-3 rounded-full bg-indigo-500"></span>
				SIP
			</span>
		</div>
		<p class="text-right text-xs text-gray-500" aria-live="polite">
			<span>{excessSummary.label}:</span>
			<span class="font-mono-num ml-1 tabular-nums font-medium {sipExcessToneClasses(excessSummary.tone)}">
				{excessSummary.amount}
			</span>
		</p>
	</div>
</div>