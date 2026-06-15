<script lang="ts">
	import { fade } from 'svelte/transition';

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
</script>

{#if visible}
	<div
		class="pointer-events-none absolute top-2 z-20 max-w-[90%] -translate-x-1/2 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm"
		style="left: {xPercent}%"
		transition:fade={{ duration: 150 }}
	>
		{#if title}
			<p class="mb-1 text-xs font-semibold text-slate-700">{title}</p>
		{/if}
		<div class="space-y-0.5">
			{#each lines as line}
				<p class="font-mono-num text-[11px] text-slate-600" style:color={line.color}>
					{line.text}
				</p>
			{/each}
		</div>
	</div>
{/if}