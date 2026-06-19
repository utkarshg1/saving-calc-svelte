<script lang="ts">
	import type { TdsResult } from '$lib/calculations/tds';
	import type { CapitalGainsResult } from '$lib/calculations/capitalGains';
	import { formatINR, formatPercent } from '$lib/utils/format';
	import ChartTooltip from './ChartTooltip.svelte';

	interface Props {
		principal: number;
		interest: number;
		tdsResult?: TdsResult;
		cgtResult?: CapitalGainsResult | null;
		gainsLabel?: string;
		large?: boolean;
		static?: boolean;
	}

	let {
		principal,
		interest,
		tdsResult,
		cgtResult = null,
		gainsLabel = 'interest',
		large = false,
		static: isStatic = false
	}: Props = $props();

	type Segment = 'principal' | 'interest' | 'tds';

	let hovered: Segment | null = $state(null);
	let pinned: Segment | null = $state(null);

	const active = $derived(pinned ?? hovered);
	const tdsApplies = $derived(tdsResult?.tdsApplicable ?? false);
	const cgtApplies = $derived(cgtResult !== null && cgtResult.totalTax > 0);
	const taxApplies = $derived(tdsApplies || cgtApplies);

	const netInterest = $derived(
		tdsApplies && tdsResult ? tdsResult.netInterestAfterTds : interest
	);
	const taxAmount = $derived(
		tdsApplies && tdsResult ? tdsResult.tdsDeducted : cgtApplies && cgtResult ? cgtResult.totalTax : 0
	);
	const grossTotal = $derived(principal + interest);
	const netTotal = $derived(
		tdsApplies && tdsResult
			? tdsResult.netMaturityAfterTds
			: cgtApplies && cgtResult
				? cgtResult.netAfterTax
				: grossTotal
	);
	const principalPct = $derived(grossTotal > 0 ? (principal / grossTotal) * 100 : 0);
	const interestPct = $derived(grossTotal > 0 ? (netInterest / grossTotal) * 100 : 0);
	const taxPct = $derived(grossTotal > 0 ? (taxAmount / grossTotal) * 100 : 0);

	const VB = 160;
	const cx = VB / 2;
	const cy = VB / 2;
	const radius = VB / 2 - 6;
	const innerRadius = radius * 0.58;

	function arcPath(startAngle: number, endAngle: number, outer: number, inner: number): string {
		const startOuter = polarToCartesian(cx, cy, outer, endAngle);
		const endOuter = polarToCartesian(cx, cy, outer, startAngle);
		const startInner = polarToCartesian(cx, cy, inner, startAngle);
		const endInner = polarToCartesian(cx, cy, inner, endAngle);
		const largeArc = endAngle - startAngle > 180 ? 1 : 0;

		return [
			`M ${startOuter.x} ${startOuter.y}`,
			`A ${outer} ${outer} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y}`,
			`L ${startInner.x} ${startInner.y}`,
			`A ${inner} ${inner} 0 ${largeArc} 1 ${endInner.x} ${endInner.y}`,
			'Z'
		].join(' ');
	}

	function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
		const rad = ((angle - 90) * Math.PI) / 180;
		return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
	}

	function selectSegment(segment: Segment) {
		pinned = pinned === segment ? null : segment;
	}

	function dimmed(segment: Segment): boolean {
		return active !== null && active !== segment;
	}

	const principalEnd = $derived((principalPct / 100) * 360);
	const interestEnd = $derived(principalEnd + (interestPct / 100) * 360);

	const tooltipTitle = $derived(
		active === 'principal'
			? 'Principal'
			: active === 'interest'
				? cgtApplies
					? 'Gains'
					: 'Net Interest'
				: active === 'tds'
					? cgtApplies
						? 'CGT'
						: 'TDS'
					: undefined
	);

	const tooltipXPercent = $derived(
		active === 'principal' ? 28 : active === 'interest' ? 55 : active === 'tds' ? 78 : 50
	);

	const tooltipLines = $derived(
		active === 'principal'
			? [
					{ text: formatINR(principal), color: '#4f46e5' },
					{ text: formatPercent(principalPct, 1) + ' of total', color: '#64748b' }
				]
			: active === 'interest'
				? [
						{ text: formatINR(netInterest), color: '#0d9488' },
						{ text: formatPercent(interestPct, 1) + ' of total', color: '#64748b' },
						...(tdsApplies
							? [{ text: `Gross interest: ${formatINR(interest)}`, color: '#94a3b8' }]
							: [])
					]
				: active === 'tds'
					? [
							{ text: formatINR(taxAmount), color: '#e11d48' },
							{ text: formatPercent(taxPct, 1) + ' of gross', color: '#64748b' }
						]
					: []
	);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
	class="flex h-full w-full flex-col items-center justify-center"
	onclick={isStatic ? undefined : () => (pinned = null)}
	role="presentation"
>
	<div
		class="chart-svg-area relative flex w-full items-center justify-center {large ? 'h-full max-w-none' : 'max-w-[180px] flex-1'}"
	>
		{#if !isStatic}
			<ChartTooltip
				visible={active !== null}
				title={tooltipTitle}
				xPercent={tooltipXPercent}
				lines={tooltipLines}
			/>
		{/if}

		<svg
			viewBox="0 0 {VB} {VB}"
			width="100%"
			height="100%"
			preserveAspectRatio="xMidYMid meet"
			class="block h-full max-h-full w-full"
		>
			<path
				d={arcPath(0, principalEnd, radius, innerRadius)}
				fill="#4f46e5"
				opacity={isStatic || !dimmed('principal') ? 1 : 0.35}
				role="presentation"
				onmouseenter={isStatic ? undefined : () => (hovered = 'principal')}
				onmouseleave={isStatic ? undefined : () => (hovered = null)}
				onclick={isStatic
					? undefined
					: (e) => {
							e.stopPropagation();
							selectSegment('principal');
						}}
			/>
			<path
				d={arcPath(principalEnd, interestEnd, radius, innerRadius)}
				fill="#0d9488"
				opacity={isStatic || !dimmed('interest') ? 1 : 0.35}
				role="presentation"
				onmouseenter={isStatic ? undefined : () => (hovered = 'interest')}
				onmouseleave={isStatic ? undefined : () => (hovered = null)}
				onclick={isStatic
					? undefined
					: (e) => {
							e.stopPropagation();
							selectSegment('interest');
						}}
			/>
			{#if taxApplies}
				<path
					d={arcPath(interestEnd, 360, radius, innerRadius)}
					fill="#e11d48"
					opacity={isStatic || !dimmed('tds') ? 1 : 0.35}
					role="presentation"
					onmouseenter={isStatic ? undefined : () => (hovered = 'tds')}
					onmouseleave={isStatic ? undefined : () => (hovered = null)}
					onclick={isStatic
						? undefined
						: (e) => {
								e.stopPropagation();
								selectSegment('tds');
							}}
				/>
			{/if}
			<text x={cx} y={cy - 4} text-anchor="middle" fill="#334155" font-size="11" font-weight="600">
				{taxApplies ? 'Net Total' : 'Total'}
			</text>
			<text x={cx} y={cy + 10} text-anchor="middle" fill="#64748b" font-size="7">
				{formatINR(netTotal)}
			</text>
		</svg>
	</div>

	<div class="mt-2 flex w-full shrink-0 flex-wrap justify-center gap-2">
		{#if isStatic}
			<span class="flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[10px]">
				<span class="h-2 w-2 rounded-full bg-indigo-500"></span>
				<span class="text-slate-600">{formatPercent(principalPct, 1)} principal</span>
			</span>
			<span class="flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[10px]">
				<span class="h-2 w-2 rounded-full bg-teal-500"></span>
				<span class="text-slate-600">
					{formatPercent(interestPct, 1)} {cgtApplies ? gainsLabel : tdsApplies ? 'net int.' : 'interest'}
				</span>
			</span>
			{#if taxApplies}
				<span class="flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[10px]">
					<span class="h-2 w-2 rounded-full bg-rose-500"></span>
					<span class="text-slate-600">{formatPercent(taxPct, 1)} {cgtApplies ? 'CGT' : 'TDS'}</span>
				</span>
			{/if}
		{:else}
			<button
				type="button"
				class="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] transition
					{active === 'principal' ? 'border-indigo-200 bg-indigo-50' : 'border-slate-100 bg-slate-50'}"
				onmouseenter={() => (hovered = 'principal')}
				onmouseleave={() => (hovered = null)}
				onclick={(e) => {
					e.stopPropagation();
					selectSegment('principal');
				}}
			>
				<span class="h-2 w-2 rounded-full bg-indigo-500"></span>
				<span class="text-slate-600">{formatPercent(principalPct, 1)} principal</span>
			</button>
			<button
				type="button"
				class="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] transition
					{active === 'interest' ? 'border-teal-200 bg-teal-50' : 'border-slate-100 bg-slate-50'}"
				onmouseenter={() => (hovered = 'interest')}
				onmouseleave={() => (hovered = null)}
				onclick={(e) => {
					e.stopPropagation();
					selectSegment('interest');
				}}
			>
				<span class="h-2 w-2 rounded-full bg-teal-500"></span>
				<span class="text-slate-600">
					{formatPercent(interestPct, 1)} {cgtApplies ? gainsLabel : tdsApplies ? 'net int.' : 'interest'}
				</span>
			</button>
			{#if taxApplies}
				<button
					type="button"
					class="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] transition
						{active === 'tds' ? 'border-rose-200 bg-rose-50' : 'border-slate-100 bg-slate-50'}"
					onmouseenter={() => (hovered = 'tds')}
					onmouseleave={() => (hovered = null)}
					onclick={(e) => {
						e.stopPropagation();
						selectSegment('tds');
					}}
				>
					<span class="h-2 w-2 rounded-full bg-rose-500"></span>
					<span class="text-slate-600">{formatPercent(taxPct, 1)} {cgtApplies ? 'CGT' : 'TDS'}</span>
				</button>
			{/if}
		{/if}
	</div>
</div>