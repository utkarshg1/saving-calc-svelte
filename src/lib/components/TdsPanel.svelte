<script lang="ts">
	import type { TdsInputs, TdsResult } from '$lib/calculations/tds';
	import { formatINR, formatPercent } from '$lib/utils/format';

	interface Props {
		inputs: TdsInputs;
		result: TdsResult;
	}

	let { inputs = $bindable(), result }: Props = $props();
</script>

<section class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
	<div class="mb-5">
		<h2 class="font-display text-lg font-semibold text-slate-800">TDS on RD Maturity</h2>
		<p class="mt-1 text-sm text-slate-500">
			Section 194A — tax on interest, including direct RD → FD rollover
		</p>
	</div>

	<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
		<label class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 transition hover:border-teal-200">
			<input
				type="checkbox"
				bind:checked={inputs.isSeniorCitizen}
				class="rounded border-slate-300 text-teal-600 focus:ring-teal-400"
			/>
			<span class="text-sm text-slate-700">Senior citizen (₹50,000 threshold)</span>
		</label>

		<label class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 transition hover:border-teal-200">
			<input
				type="checkbox"
				bind:checked={inputs.hasPAN}
				class="rounded border-slate-300 text-teal-600 focus:ring-teal-400"
			/>
			<span class="text-sm text-slate-700">PAN linked (10% TDS rate)</span>
		</label>

		<label class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 transition hover:border-teal-200 sm:col-span-2">
			<input
				type="checkbox"
				bind:checked={inputs.form15GHSubmitted}
				class="rounded border-slate-300 text-teal-600 focus:ring-teal-400"
			/>
			<span class="text-sm text-slate-700">Form 15G / 15H submitted (nil TDS)</span>
		</label>

		<div class="sm:col-span-2">
			<label for="other-interest" class="mb-1.5 block text-sm font-medium text-slate-700">
				Other FD/RD interest this financial year
			</label>
			<div class="relative">
				<span class="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400">₹</span>
				<input
					id="other-interest"
					type="number"
					inputmode="decimal"
					min="0"
					step="1000"
					bind:value={inputs.otherInterestThisFY}
					class="w-full max-w-full rounded-xl border-slate-200 bg-white py-3 pr-4 pl-8 text-slate-800 shadow-sm transition focus:border-teal-400 focus:ring-teal-400"
				/>
			</div>
			<p class="mt-1 text-xs text-slate-400">
				Aggregate FY interest: {formatINR(result.aggregateInterestThisFY)} (threshold: {formatINR(result.threshold)})
			</p>
		</div>
	</div>

	<div class="space-y-2 rounded-xl border border-slate-100 bg-slate-50/40 p-4">
		<div class="flex items-center justify-between gap-4 text-sm">
			<span class="text-slate-500">Gross Maturity</span>
			<span class="font-mono-num font-medium text-slate-800">{formatINR(result.grossMaturity)}</span>
		</div>
		<div class="flex items-center justify-between gap-4 text-sm">
			<span class="text-slate-500">Interest Earned</span>
			<span class="font-mono-num font-medium text-slate-800">{formatINR(result.totalInterest)}</span>
		</div>
		<div class="flex items-center justify-between gap-4 text-sm">
			<span class="text-slate-500">TDS Deducted</span>
			<span class="font-mono-num font-medium text-rose-700">
				{formatINR(result.tdsDeducted)}
				{#if result.tdsApplicable}
					<span class="ml-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] text-rose-600">
						{formatPercent(result.tdsRate * 100, 0)}
					</span>
				{/if}
			</span>
		</div>
		<div
			class="flex items-center justify-between gap-4 rounded-lg border px-3 py-2.5
				{result.tdsApplicable
				? 'border-teal-200 bg-teal-50/80'
				: 'border-slate-200 bg-white'}"
		>
			<span class="text-sm font-semibold text-slate-700">Net Maturity after TDS</span>
			<span class="font-mono-num text-lg font-bold text-teal-800">
				{formatINR(result.netMaturityAfterTds)}
			</span>
		</div>
	</div>

	<p class="mt-4 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
		When your RD matures and is directly reinvested into a new FD, the bank still credits
		the interest for TDS purposes — tax is deducted even though no cash reaches your savings
		account.
	</p>
</section>