<script lang="ts">
	import type { CompareResult } from '$lib/calculations/types';
	import { formatINR, formatPercent } from '$lib/utils/format';
	import { sipExcessAfterTaxSummary, sipExcessToneClasses } from '$lib/utils/compareLabels';

	interface Props {
		compare: CompareResult;
	}

	let { compare }: Props = $props();
	const winner = $derived(compare.rd.netMaturity >= compare.sip.netMaturity ? 'rd' : 'sip');
	const excessSummary = $derived(
		sipExcessAfterTaxSummary(compare.sip.netMaturity, compare.rd.netMaturity)
	);
</script>

<div class="space-y-4">
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		{#each [compare.rd, compare.sip] as inst}
			<div class="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/80 {inst.id === winner ? 'ring-2 ring-teal-400' : ''}">
				{#if inst.id === winner}
					<span class="absolute right-3 top-3 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">Winner</span>
				{/if}
				<h3 class="font-display text-lg font-bold text-slate-900 dark:text-white">{inst.label}</h3>
				<p class="mt-1 text-xs text-slate-400 capitalize">{inst.riskLevel} risk</p>
				<div class="mt-4 space-y-3">
					<div>
						<p class="text-xs text-slate-400">Net Maturity</p>
						<p class="font-mono-num text-2xl font-bold text-teal-600 dark:text-teal-400">{formatINR(inst.netMaturity)}</p>
					</div>
					<div class="grid grid-cols-2 gap-3 text-sm">
						<div><p class="text-xs text-slate-400">Gross</p><p class="font-mono-num font-semibold">{formatINR(inst.grossMaturity)}</p></div>
						<div><p class="text-xs text-slate-400">Tax</p><p class="font-mono-num font-semibold text-rose-500">{formatINR(inst.taxAmount)}</p></div>
						<div><p class="text-xs text-slate-400">Gains</p><p class="font-mono-num font-semibold">{formatINR(inst.gainsEarned)}</p></div>
						<div><p class="text-xs text-slate-400">XIRR</p><p class="font-mono-num font-semibold">{inst.xirrPercent !== null ? formatPercent(inst.xirrPercent) : '—'}</p></div>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<div
		class="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-center dark:border-slate-700 dark:bg-slate-800/50"
		aria-live="polite"
	>
		<p class="text-xs text-slate-500 dark:text-slate-400">{excessSummary.label}</p>
		<p class="font-mono-num mt-1 text-lg font-semibold {sipExcessToneClasses(excessSummary.tone)}">
			{excessSummary.amount}
		</p>
	</div>
</div>