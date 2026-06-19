<script lang="ts">
	import type { SipSensitivityRow } from '$lib/calculations/sip';
	import { formatINR, formatPercent } from '$lib/utils/format';

	interface Props {
		rows: SipSensitivityRow[];
		baseReturnPercent: number;
		/** PDF/print layout */
		compact?: boolean;
	}

	let { rows, baseReturnPercent, compact = false }: Props = $props();

	function deltaLabel(delta: number): string {
		if (delta === 0) return 'base';
		return delta > 0 ? `+${delta}` : `${delta}`;
	}
</script>

<div class="{compact ? 'pdf-sensitivity' : 'rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6'}">
	<div class="{compact ? 'mb-3' : 'mb-5'}">
		<h2 class="font-display {compact ? 'text-base' : 'text-lg'} font-semibold text-slate-800">
			Return Sensitivity (±3%)
		</h2>
		<p class="mt-1 {compact ? 'text-[10px]' : 'text-sm'} text-slate-500">
			Illustrative scenarios around {formatPercent(baseReturnPercent)} expected return; monthly
			investment unchanged.
		</p>
	</div>

	<div class="overflow-x-auto">
		<table class="w-full min-w-[640px] border-collapse {compact ? 'pdf-sensitivity-table' : ''}">
			<thead>
				<tr class="border-b border-slate-200 text-left">
					<th class="px-3 py-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Return</th>
					<th class="px-3 py-2 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">
						SIP Maturity
					</th>
					<th class="px-3 py-2 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">
						Capital Gains
					</th>
					<th class="px-3 py-2 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">
						STCG + LTCG
					</th>
					<th class="px-3 py-2 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">
						Net Capital Gains
					</th>
					<th class="px-3 py-2 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">
						Net Maturity
					</th>
				</tr>
			</thead>
			<tbody>
				{#each rows as row (row.deltaPercent)}
					<tr
						class="border-b border-slate-100 transition
							{row.isBase ? 'bg-teal-50/80 font-medium' : 'hover:bg-slate-50/60'}"
					>
						<td class="px-3 py-2.5 text-sm text-slate-700">
							<span class="font-mono-num font-semibold">{formatPercent(row.annualReturnPercent)}</span>
							<span class="ml-1 text-xs text-slate-400">({deltaLabel(row.deltaPercent)})</span>
						</td>
						<td class="font-mono-num px-3 py-2.5 text-right text-sm text-slate-800">
							{formatINR(row.grossMaturity)}
						</td>
						<td class="font-mono-num px-3 py-2.5 text-right text-sm text-slate-800">
							{formatINR(row.capitalGains)}
						</td>
						<td class="font-mono-num px-3 py-2.5 text-right text-sm text-rose-700">
							{formatINR(row.totalTax)}
						</td>
						<td class="font-mono-num px-3 py-2.5 text-right text-sm text-emerald-700">
							{formatINR(row.netCapitalGains)}
						</td>
						<td class="font-mono-num px-3 py-2.5 text-right text-sm font-semibold text-teal-800">
							{formatINR(row.netMaturity)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<p class="mt-4 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2.5 {compact ? 'text-[9px]' : 'text-xs'} leading-relaxed text-amber-900">
		Assumes constant annual return over the full tenure. Does not model market volatility, step-up
		SIP, or early redemption. Tax uses simplified equity MF STCG/LTCG rules.
	</p>
</div>