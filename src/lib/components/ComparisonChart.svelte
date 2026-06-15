<script lang="ts">
	import { formatINR, formatINRCompact } from '$lib/utils/format';
	import ChartTooltip from './ChartTooltip.svelte';

	interface BarItem {
		label: string;
		value: number;
		color: string;
	}

	interface Props {
		items: BarItem[];
		large?: boolean;
	}

	let { items, large = false }: Props = $props();

	const VB_W = 320;
	const VB_H = 200;
	const padding = { top: 24, right: 8, bottom: 36, left: 8 };
	let hoveredIndex = $state<number | null>(null);
	let pinnedIndex = $state<number | null>(null);

	const activeIndex = $derived(pinnedIndex ?? hoveredIndex);

	const chartWidth = $derived(VB_W - padding.left - padding.right);
	const chartHeight = $derived(VB_H - padding.top - padding.bottom);
	const maxValue = $derived(Math.max(...items.map((i) => i.value), 1));
	const barWidth = $derived((chartWidth / items.length) * 0.65);
	const gap = $derived(chartWidth / items.length);

	function barHeight(value: number): number {
		return (value / maxValue) * chartHeight;
	}

	function barX(index: number): number {
		return padding.left + index * gap + (gap - barWidth) / 2;
	}

	function barCenterPercent(index: number): number {
		return ((barX(index) + barWidth / 2) / VB_W) * 100;
	}

	function selectIndex(i: number) {
		pinnedIndex = pinnedIndex === i ? null : i;
	}

	function clearHover() {
		hoveredIndex = null;
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
	class="flex w-full flex-col {large ? 'h-full' : 'h-full min-h-0'}"
	onclick={() => (pinnedIndex = null)}
	role="presentation"
>
	<div class="chart-svg-area relative min-h-0 {large ? 'h-full' : 'flex-1'}">
		<ChartTooltip
			visible={activeIndex !== null}
			title={activeIndex !== null ? items[activeIndex].label : undefined}
			xPercent={activeIndex !== null ? barCenterPercent(activeIndex) : 50}
			lines={activeIndex !== null
				? [{ text: formatINR(items[activeIndex].value), color: items[activeIndex].color }]
				: []}
		/>

		<svg
			viewBox="0 0 {VB_W} {VB_H}"
			width="100%"
			height="100%"
			preserveAspectRatio="xMidYMid meet"
			class="block h-full w-full"
		>
			{#each items as item, i}
				{@const h = barHeight(item.value)}
				{@const x = barX(i)}
				{@const y = padding.top + chartHeight - h}
				<rect
					{x}
					{y}
					width={barWidth}
					height={h}
					rx="5"
					fill={item.color}
					opacity={activeIndex === null || activeIndex === i ? 1 : 0.35}
					role="presentation"
					onmouseenter={() => (hoveredIndex = i)}
					onmouseleave={clearHover}
					onclick={(e) => {
						e.stopPropagation();
						selectIndex(i);
					}}
				/>
				<text
					x={x + barWidth / 2}
					y={y - 5}
					text-anchor="middle"
					fill="#475569"
					font-size="8"
					font-weight="600"
				>
					{formatINRCompact(item.value)}
				</text>
				<text
					x={x + barWidth / 2}
					y={VB_H - 10}
					text-anchor="middle"
					fill="#94a3b8"
					font-size="8"
				>
					{item.label}
				</text>
			{/each}

			<line
				x1={padding.left}
				y1={padding.top + chartHeight}
				x2={padding.left + chartWidth}
				y2={padding.top + chartHeight}
				stroke="#e2e8f0"
				stroke-width="1"
			/>
		</svg>
	</div>
</div>