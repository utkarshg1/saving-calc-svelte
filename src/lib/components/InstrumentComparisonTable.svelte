<script lang="ts">
	import type { CompareResult } from '$lib/calculations/types';
	import { formatINR, formatPercent } from '$lib/utils/format';

	interface Props {
		compare: CompareResult;
	}

	let { compare }: Props = $props();
	const rows = $derived([compare.rd, compare.sip, compare.ppf, compare.nsc, compare.debtMf]);
</script>

<div class="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-700">
	<table class="w-full min-w-[640px] text-left text-sm">
		<thead class="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
			<tr>
				<th class="px-4 py-3">Instrument</th>
				<th class="px-4 py-3">Risk</th>
				<th class="px-4 py-3">Net Maturity</th>
				<th class="px-4 py-3">Tax</th>
				<th class="px-4 py-3">Gains</th>
				<th class="px-4 py-3">XIRR</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-slate-100 dark:divide-slate-700">
			{#each rows as row}
				<tr class="bg-white dark:bg-slate-900/50 {row.id === compare.bestNetReturn ? 'bg-teal-50/50 dark:bg-teal-900/20' : ''}">
					<td class="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">
						{row.label}
						{#if row.id === compare.bestNetReturn}<span class="ml-1 text-[10px] text-teal-600">★ Best</span>{/if}
						{#if row.id === compare.lowestRisk}<span class="ml-1 text-[10px] text-indigo-500">🛡 Safe</span>{/if}
					</td>
					<td class="px-4 py-3 capitalize text-slate-500">{row.riskLevel}</td>
					<td class="px-4 py-3 font-mono-num font-semibold">{formatINR(row.netMaturity)}</td>
					<td class="px-4 py-3 font-mono-num text-rose-500">{formatINR(row.taxAmount)}</td>
					<td class="px-4 py-3 font-mono-num">{formatINR(row.gainsEarned)}</td>
					<td class="px-4 py-3 font-mono-num">{row.xirrPercent !== null ? formatPercent(row.xirrPercent) : '—'}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>