<script lang="ts">
	import type { InstallmentGain } from '$lib/calculations/capitalGains';
	import { formatINR } from '$lib/utils/format';

	interface Props {
		installments: InstallmentGain[];
	}

	interface YearlyCgtRow {
		year: number;
		deposits: number;
		principal: number;
		futureValue: number;
		gain: number;
		stcgCount: number;
		ltcgCount: number;
	}

	let { installments }: Props = $props();

	const yearlyRows = $derived.by(() => {
		const byYear = new Map<number, YearlyCgtRow>();

		for (const row of installments) {
			const year = Math.ceil(row.installment / 12);
			const existing = byYear.get(year) ?? {
				year,
				deposits: 0,
				principal: 0,
				futureValue: 0,
				gain: 0,
				stcgCount: 0,
				ltcgCount: 0
			};

			existing.deposits += 1;
			existing.principal += row.principal;
			existing.futureValue += row.futureValue;
			existing.gain += row.gain;
			if (row.classification === 'stcg') existing.stcgCount += 1;
			else existing.ltcgCount += 1;

			byYear.set(year, existing);
		}

		return [...byYear.values()].sort((a, b) => a.year - b.year);
	});
</script>

{#if installments.length > 0}
	<div class="overflow-x-auto rounded-xl border border-slate-200/80">
		<table class="w-full min-w-[640px] text-left text-sm">
			<thead class="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
				<tr>
					<th class="px-3 py-2">Year</th>
					<th class="px-3 py-2">Deposits</th>
					<th class="px-3 py-2">Principal</th>
					<th class="px-3 py-2">FV</th>
					<th class="px-3 py-2">Gain</th>
					<th class="px-3 py-2">STCG / LTCG</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-100">
				{#each yearlyRows as row}
					<tr class="bg-white">
						<td class="px-3 py-2 font-medium text-slate-800">Y{row.year}</td>
						<td class="px-3 py-2">{row.deposits}</td>
						<td class="px-3 py-2 font-mono-num">{formatINR(row.principal)}</td>
						<td class="px-3 py-2 font-mono-num">{formatINR(row.futureValue)}</td>
						<td class="px-3 py-2 font-mono-num">{formatINR(row.gain)}</td>
						<td class="px-3 py-2 text-xs text-slate-600">
							{row.stcgCount} STCG · {row.ltcgCount} LTCG
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="text-sm text-slate-400">CGT ledger available for SIP path only.</p>
{/if}