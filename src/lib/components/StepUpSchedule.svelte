<script lang="ts">
	import { formatINR } from '$lib/utils/format';

	interface Props {
		baseMonthly: number;
		topUpAmount: number;
		cap: number;
		years: number;
	}

	let { baseMonthly, topUpAmount, cap, years }: Props = $props();

	const rows = $derived.by(() => {
		const result: Array<{ year: number; monthly: number; annual: number; cumulative: number }> = [];
		let cumulative = 0;
		for (let y = 1; y <= years; y++) {
			const monthly = Math.min(baseMonthly + topUpAmount * (y - 1), cap);
			const annual = monthly * 12;
			cumulative += annual;
			result.push({ year: y, monthly, annual, cumulative });
		}
		return result;
	});
</script>

<div class="overflow-x-auto rounded-xl border border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-800/80">
	<table class="w-full text-left text-sm">
		<thead>
			<tr class="border-b border-slate-100 dark:border-slate-700">
				<th class="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Year</th>
				<th class="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Monthly SIP</th>
				<th class="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Annual Deposit</th>
				<th class="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Cumulative Principal</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row}
				<tr class="border-b border-slate-50 last:border-0 dark:border-slate-700/50">
					<td class="px-4 py-2.5 text-slate-500">{row.year}</td>
					<td class="px-4 py-2.5 font-mono-num font-medium text-slate-800 dark:text-slate-200">{formatINR(row.monthly)}</td>
					<td class="px-4 py-2.5 font-mono-num font-medium text-slate-800 dark:text-slate-200">{formatINR(row.annual)}</td>
					<td class="px-4 py-2.5 font-mono-num font-medium text-slate-800 dark:text-slate-200">{formatINR(row.cumulative)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
