<script lang="ts">
	import type { InflationSensitivityRow } from '$lib/calculations/types';
	import { formatINR, formatPercent } from '$lib/utils/format';

	interface Props {
		rows: InflationSensitivityRow[];
		baseInflationPercent: number;
	}

	let { rows, baseInflationPercent }: Props = $props();
</script>

<div class="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-700">
	<table class="w-full min-w-[520px] text-left text-sm">
		<thead class="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800">
			<tr>
				<th class="px-4 py-3">Inflation</th>
				<th class="px-4 py-3">Δ</th>
				<th class="px-4 py-3">Infl. Adjusted</th>
				<th class="px-4 py-3">Estimated Need</th>
				<th class="px-4 py-3">Monthly (rounded)</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-slate-100 dark:divide-slate-700">
			{#each rows as row}
				<tr class="{row.isBase ? 'bg-violet-50/60 dark:bg-violet-900/20' : 'bg-white dark:bg-slate-900/50'}">
					<td class="px-4 py-3 font-mono-num">{formatPercent(row.inflationPercent)}</td>
					<td class="px-4 py-3 font-mono-num {row.deltaPercent > 0 ? 'text-rose-500' : row.deltaPercent < 0 ? 'text-emerald-500' : ''}">
						{row.deltaPercent > 0 ? '+' : ''}{row.deltaPercent}%
					</td>
					<td class="px-4 py-3 font-mono-num">{formatINR(row.inflationAdjusted)}</td>
					<td class="px-4 py-3 font-mono-num">{formatINR(row.estimatedAmount)}</td>
					<td class="px-4 py-3 font-mono-num font-semibold">{formatINR(row.roundedMonthly)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<p class="mt-2 text-xs text-slate-400">Base inflation: {formatPercent(baseInflationPercent)}</p>
</div>