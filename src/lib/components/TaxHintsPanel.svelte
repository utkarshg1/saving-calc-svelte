<script lang="ts">
	import type { TaxHint } from '$lib/calculations/types';
	import { formatINR } from '$lib/utils/format';

	interface Props {
		hints: TaxHint[];
	}

	let { hints }: Props = $props();
</script>

<div class="space-y-3">
	<p class="text-xs text-slate-400 italic">Informational only — not tax advice. Consult a CA for your situation.</p>
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
		{#each hints as hint}
			<div class="rounded-xl border p-4 {hint.applicable ? 'border-teal-200 bg-teal-50/50 dark:border-teal-800 dark:bg-teal-900/20' : 'border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50'}">
				<div class="flex items-start justify-between gap-2">
					<h4 class="text-sm font-semibold text-slate-800 dark:text-slate-100">{hint.title}</h4>
					{#if hint.applicable}
						<span class="shrink-0 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">May apply</span>
					{/if}
				</div>
				<p class="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{hint.description}</p>
				{#if hint.estimatedBenefit && hint.applicable}
					<p class="mt-2 text-xs font-semibold text-teal-600 dark:text-teal-400">Est. benefit up to {formatINR(hint.estimatedBenefit)}</p>
				{/if}
			</div>
		{/each}
	</div>
</div>