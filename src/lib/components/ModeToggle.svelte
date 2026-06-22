<script lang="ts">
	import type { CalculationMode } from '$lib/calculations/types';

	interface Props {
		mode: CalculationMode;
		onchange: (mode: CalculationMode) => void;
	}

	let { mode, onchange }: Props = $props();
</script>

<div class="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-600 dark:bg-slate-800" role="group" aria-label="Calculation mode">
	<button
		type="button"
		class="flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition {mode === 'forward' ? 'bg-white text-teal-700 shadow-sm dark:bg-slate-700 dark:text-teal-300' : 'text-slate-500 dark:text-slate-400'}"
		aria-pressed={mode === 'forward'}
		onclick={() => onchange('forward')}
	>
		Forward
		<span class="mt-0.5 block text-[10px] font-normal opacity-70">Goal → Monthly</span>
	</button>
	<button
		type="button"
		class="flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition {mode === 'reverse' ? 'bg-white text-teal-700 shadow-sm dark:bg-slate-700 dark:text-teal-300' : 'text-slate-500 dark:text-slate-400'}"
		aria-pressed={mode === 'reverse'}
		onclick={() => onchange('reverse')}
	>
		Reverse
		<span class="mt-0.5 block text-[10px] font-normal opacity-70">Budget → Years</span>
	</button>
</div>