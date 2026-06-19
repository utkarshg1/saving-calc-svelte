<script lang="ts">
	import type { CapitalGainsResult } from '$lib/calculations/capitalGains';
	import { formatINR, formatPercent } from '$lib/utils/format';
	import { LTCG_EXEMPTION, LTCG_RATE, STCG_RATE } from '$lib/calculations/capitalGains';

	interface Props {
		result: CapitalGainsResult;
	}

	let { result }: Props = $props();
</script>

<section class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
	<div class="mb-5">
		<h2 class="font-display text-lg font-semibold text-slate-800">Capital Gains on SIP Redemption</h2>
		<p class="mt-1 text-sm text-slate-500">
			Equity MF — FIFO per installment, full corpus redeemed at tenure end
		</p>
	</div>

	<div class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
		<div class="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
			<p class="text-xs text-slate-400">STCG installments (≤12 mo)</p>
			<p class="font-mono-num mt-1 text-sm font-semibold text-slate-800">
				{result.stcgInstallmentCount} @ {formatPercent(STCG_RATE * 100, 0)}
			</p>
		</div>
		<div class="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
			<p class="text-xs text-slate-400">LTCG installments (&gt;12 mo)</p>
			<p class="font-mono-num mt-1 text-sm font-semibold text-slate-800">
				{result.ltcgInstallmentCount} @ {formatPercent(LTCG_RATE * 100, 1)}
			</p>
		</div>
	</div>

	<div class="space-y-2 rounded-xl border border-slate-100 bg-slate-50/40 p-4">
		<div class="flex items-center justify-between gap-4 text-sm">
			<span class="text-slate-500">Gross SIP Value</span>
			<span class="font-mono-num font-medium text-slate-800">{formatINR(result.grossMaturity)}</span>
		</div>
		<div class="flex items-center justify-between gap-4 text-sm">
			<span class="text-slate-500">Capital Gains</span>
			<span class="font-mono-num font-medium text-slate-800">{formatINR(result.totalGains)}</span>
		</div>
		<div class="flex items-center justify-between gap-4 text-sm">
			<span class="text-slate-500">STCG Tax</span>
			<span class="font-mono-num font-medium text-rose-700">{formatINR(result.stcgTax)}</span>
		</div>
		<div class="flex items-center justify-between gap-4 text-sm">
			<span class="text-slate-500">LTCG Exemption</span>
			<span class="font-mono-num font-medium text-slate-600">
				−{formatINR(result.ltcgExemptionApplied)} (of {formatINR(LTCG_EXEMPTION)})
			</span>
		</div>
		<div class="flex items-center justify-between gap-4 text-sm">
			<span class="text-slate-500">LTCG Tax</span>
			<span class="font-mono-num font-medium text-rose-700">{formatINR(result.ltcgTax)}</span>
		</div>
		<div
			class="flex items-center justify-between gap-4 rounded-lg border border-teal-200 bg-teal-50/80 px-3 py-2.5"
		>
			<span class="text-sm font-semibold text-slate-700">Net SIP Value (After Tax)</span>
			<span class="font-mono-num text-lg font-bold text-teal-800">
				{formatINR(result.netAfterTax)}
			</span>
		</div>
	</div>

	<p class="mt-4 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
		Each SIP installment is taxed by its holding period at redemption (FIFO). STCG applies to gains
		from installments held 12 months or less; LTCG at 12.5% applies above the ₹1.25 lakh annual
		exemption. STT and surcharge excluded.
	</p>
</section>