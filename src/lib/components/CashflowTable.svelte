<script lang="ts">
	import type { CashflowYearRow } from '$lib/calculations/types';
	import { formatINR } from '$lib/utils/format';

	interface Props {
		rows: CashflowYearRow[];
	}

	let { rows }: Props = $props();
</script>

<div class="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-700">
	<table class="w-full min-w-[560px] text-left text-sm">
		<thead class="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800">
			<tr>
				<th class="px-4 py-3">Year</th>
				<th class="px-4 py-3">Deposits</th>
				<th class="px-4 py-3">Cumulative</th>
				<th class="px-4 py-3">Gross</th>
				<th class="px-4 py-3">Tax</th>
				<th class="px-4 py-3">Net</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-slate-100 dark:divide-slate-700">
			{#each rows as row}
				<tr class="bg-white dark:bg-slate-900/50">
					<td class="px-4 py-3 font-semibold">Y{row.year}</td>
					<td class="px-4 py-3 font-mono-num">{formatINR(row.deposits)}</td>
					<td class="px-4 py-3 font-mono-num">{formatINR(row.cumulativeDeposits)}</td>
					<td class="px-4 py-3 font-mono-num">{formatINR(row.grossBalance)}</td>
					<td class="px-4 py-3 font-mono-num text-rose-500">{row.tax > 0 ? formatINR(row.tax) : '—'}</td>
					<td class="px-4 py-3 font-mono-num font-semibold text-teal-600">{formatINR(row.netBalance)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>