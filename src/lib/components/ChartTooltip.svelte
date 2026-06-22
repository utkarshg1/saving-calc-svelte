<script lang="ts">
	import { fade } from 'svelte/transition';
	import { CHART_TYPO } from '$lib/chart/chartTheme';

	interface TooltipLine {
		text: string;
		color?: string;
	}

	interface Props {
		visible: boolean;
		title?: string;
		lines: TooltipLine[];
		xPercent?: number;
	}

	let { visible, title, lines, xPercent = 50 }: Props = $props();

	let tooltipEl = $state<HTMLDivElement | null>(null);
	let clampedLeft = $state(50);

	$effect(() => {
		const target = xPercent;
		if (!visible || !tooltipEl) {
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

		const pad = 8;
		const idealLeft = (target / 100) * containerW;
		const half = tooltipW / 2;
		const clampedPx = Math.max(half + pad, Math.min(containerW - half - pad, idealLeft));
		clampedLeft = (clampedPx / containerW) * 100;
	});
</script>

{#if visible}
	<div
		bind:this={tooltipEl}
		class="pointer-events-none absolute top-2 z-20 max-w-[90%] -translate-x-1/2 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm"
		style="left: {clampedLeft}%"
		transition:fade={{ duration: 150 }}
	>
		{#if title}
			<p class="mb-1 {CHART_TYPO.tooltipTitleClass} text-slate-700">{title}</p>
		{/if}
		<div class="space-y-0.5">
			{#each lines as line}
				<p class="font-mono-num {CHART_TYPO.tooltipLineClass} text-slate-600" style:color={line.color}>
					{line.text}
				</p>
			{/each}
		</div>
	</div>
{/if}