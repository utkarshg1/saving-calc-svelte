<script lang="ts">
	import { formatINR, formatPercent } from '$lib/utils/format';
	import ChartTooltip from './ChartTooltip.svelte';

	interface Props {
		principal: number;
		interest: number;
		large?: boolean;
	}

	let { principal, interest, large = false }: Props = $props();

	let hovered: 'principal' | 'interest' | null = $state(null);
	let pinned: 'principal' | 'interest' | null = $state(null);

	const active = $derived(pinned ?? hovered);

	const total = $derived(principal + interest);
	const principalPct = $derived(total > 0 ? (principal / total) * 100 : 0);
	const interestPct = $derived(total > 0 ? (interest / total) * 100 : 0);

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

	function selectSegment(segment: 'principal' | 'interest') {
		pinned = pinned === segment ? null : segment;
	}

	const principalEnd = $derived((principalPct / 100) * 360);

	const tooltipLines = $derived(
		active === 'principal'
			? [
					{ text: formatINR(principal), color: '#4f46e5' },
					{ text: formatPercent(principalPct, 1) + ' of total', color: '#64748b' }
				]
			: active === 'interest'
				? [
						{ text: formatINR(interest), color: '#0d9488' },
						{ text: formatPercent(interestPct, 1) + ' of total', color: '#64748b' }
					]
				: []
	);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
	class="flex h-full w-full flex-col items-center justify-center"
	onclick={() => (pinned = null)}
	role="presentation"
>
	<div
		class="chart-svg-area relative flex w-full items-center justify-center {large ? 'h-full max-w-none' : 'max-w-[180px] flex-1'}"
	>
		<ChartTooltip
			visible={active !== null}
			title={active === 'principal' ? 'Principal' : active === 'interest' ? 'Interest' : undefined}
			xPercent={active === 'principal' ? 35 : active === 'interest' ? 65 : 50}
			lines={tooltipLines}
		/>

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
				opacity={active === 'interest' ? 0.35 : 1}
				role="presentation"
				onmouseenter={() => (hovered = 'principal')}
				onmouseleave={() => (hovered = null)}
				onclick={(e) => {
					e.stopPropagation();
					selectSegment('principal');
				}}
			/>
			<path
				d={arcPath(principalEnd, 360, radius, innerRadius)}
				fill="#0d9488"
				opacity={active === 'principal' ? 0.35 : 1}
				role="presentation"
				onmouseenter={() => (hovered = 'interest')}
				onmouseleave={() => (hovered = null)}
				onclick={(e) => {
					e.stopPropagation();
					selectSegment('interest');
				}}
			/>
			<text x={cx} y={cy - 4} text-anchor="middle" fill="#334155" font-size="11" font-weight="600">
				Total
			</text>
			<text x={cx} y={cy + 10} text-anchor="middle" fill="#64748b" font-size="7">
				{formatINR(total)}
			</text>
		</svg>
	</div>

	<div class="mt-2 flex w-full shrink-0 flex-wrap justify-center gap-2">
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
			<span class="text-slate-600">{formatPercent(principalPct, 0)} principal</span>
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
			<span class="text-slate-600">{formatPercent(interestPct, 0)} interest</span>
		</button>
	</div>
</div>