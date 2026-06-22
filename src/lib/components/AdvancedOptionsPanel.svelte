<script lang="ts">
	import type { AdvancedInputs } from '$lib/calculations/types';
	import NumericInput from './NumericInput.svelte';

	interface Props {
		advanced: AdvancedInputs;
		onchange: (advanced: AdvancedInputs) => void;
	}

	let { advanced, onchange }: Props = $props();
	let open = $state(false);

	function patch<K extends keyof AdvancedInputs>(key: K, value: AdvancedInputs[K]) {
		onchange({ ...advanced, [key]: value });
	}
</script>

<div class="rounded-xl border border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-800/80">
	<button
		type="button"
		class="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200"
		onclick={() => (open = !open)}
	>
		Advanced Options
		<svg class="h-4 w-4 transition {open ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
	</button>

	{#if open}
		<div class="space-y-4 border-t border-slate-100 px-4 py-4 dark:border-slate-700">
			{#if advanced.mode === 'reverse'}
				<div>
					<label for="monthly-budget" class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Monthly Budget</label>
					<NumericInput
						id="monthly-budget"
						value={advanced.monthlyBudget}
						min={1000}
						step={1000}
						prefix="₹"
						oncommit={(n) => patch('monthlyBudget', n)}
					/>
				</div>
			{/if}

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div>
					<label for="lumpsum" class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Lumpsum (start)</label>
					<NumericInput
						id="lumpsum"
						value={advanced.lumpsumAmount}
						min={0}
						step={10000}
						prefix="₹"
						oncommit={(n) => patch('lumpsumAmount', n)}
					/>
				</div>
				<div>
					<label for="step-up" class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Annual Step-up</label>
					<NumericInput
						id="step-up"
						value={advanced.stepUpPercentAnnual}
						min={0}
						max={50}
						step={1}
						suffix="%"
						oncommit={(n) => patch('stepUpPercentAnnual', n)}
					/>
				</div>
			</div>
		</div>
	{/if}
</div>