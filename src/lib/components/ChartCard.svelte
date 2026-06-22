<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		onmaximize?: () => void;
		/** Tighter body padding for full-bleed charts */
		compact?: boolean;
		/** Taller card for full-width overlay charts */
		tall?: boolean;
		children: Snippet;
	}

	let { title, description, onmaximize, compact = false, tall = false, children }: Props = $props();
</script>

<div
	class="chart-card flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50 {tall
		? 'min-h-[400px] sm:min-h-[440px]'
		: ''}"
>
	<div class="flex shrink-0 items-start justify-between gap-2 border-b border-slate-100 px-3 py-2.5 sm:px-4">
		<div class="min-w-0">
			<h3 class="font-display truncate text-sm font-semibold text-slate-800">{title}</h3>
			{#if description}
				<p class="truncate text-[10px] text-slate-400 sm:text-xs">{description}</p>
			{/if}
		</div>
		{#if onmaximize}
			<button
				type="button"
				onclick={onmaximize}
				class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-600"
				aria-label="Maximize chart"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
				</svg>
			</button>
		{/if}
	</div>
	<div
		class="flex min-h-0 flex-1 flex-col overflow-hidden {compact
			? 'p-2 sm:px-3 sm:pb-0 sm:pt-1'
			: 'p-3 sm:p-4'}"
	>
		{@render children()}
	</div>
</div>