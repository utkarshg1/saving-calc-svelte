<script lang="ts">
	import { HISTORICAL_PRESETS } from '$lib/presets/historicalPresets';
	import type { HistoricalPreset } from '$lib/presets/historicalPresets';

	interface Props {
		onselect: (preset: HistoricalPreset) => void;
	}

	let { onselect }: Props = $props();
</script>

<div class="flex flex-wrap gap-2">
	{#each HISTORICAL_PRESETS as preset}
		<button
			type="button"
			class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/30"
			title={preset.source}
			onclick={() => onselect(preset)}
		>
			{preset.label}
		</button>
	{/each}
</div>