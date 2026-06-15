<script lang="ts">
	import type { SavingsInputs } from '$lib/calculations/savings';
	import { formatINR } from '$lib/utils/format';

	interface Props {
		inputs: SavingsInputs;
		onchange?: (inputs: SavingsInputs) => void;
	}

	let { inputs = $bindable(), onchange }: Props = $props();

	function update<K extends keyof SavingsInputs>(key: K, raw: string) {
		const parsed = parseFloat(raw);
		if (!Number.isFinite(parsed) || parsed < 0) return;
		inputs = { ...inputs, [key]: parsed };
		onchange?.(inputs);
	}
</script>

<div class="space-y-5">
	<div>
		<label for="target" class="mb-1.5 block text-sm font-medium text-slate-700">
			Amount to Save
		</label>
		<div class="relative">
			<span class="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400">₹</span>
			<input
				id="target"
				type="number"
				inputmode="decimal"
				min="0"
				step="1000"
				value={inputs.targetAmount}
				oninput={(e) => update('targetAmount', e.currentTarget.value)}
				class="w-full max-w-full rounded-xl border-slate-200 bg-white py-3 pr-4 pl-8 text-slate-800 shadow-sm transition focus:border-teal-400 focus:ring-teal-400"
			/>
		</div>
		<p class="mt-1 text-xs text-slate-400">{formatINR(inputs.targetAmount)}</p>
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
		<div>
			<label for="years" class="mb-1.5 block text-sm font-medium text-slate-700">Years</label>
			<input
				id="years"
				type="number"
				inputmode="numeric"
				min="1"
				max="50"
				step="1"
				value={inputs.years}
				oninput={(e) => update('years', e.currentTarget.value)}
				class="w-full max-w-full rounded-xl border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-sm transition focus:border-teal-400 focus:ring-teal-400"
			/>
		</div>
		<div>
			<label for="inflation" class="mb-1.5 block text-sm font-medium text-slate-700">
				Inflation Rate
			</label>
			<div class="relative">
				<input
					id="inflation"
					type="number"
					inputmode="decimal"
					min="0"
					max="100"
					step="0.1"
					value={inputs.inflationRatePercent}
					oninput={(e) => update('inflationRatePercent', e.currentTarget.value)}
					class="w-full max-w-full rounded-xl border-slate-200 bg-white py-3 pr-8 pl-4 text-slate-800 shadow-sm transition focus:border-teal-400 focus:ring-teal-400"
				/>
				<span class="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-400">%</span>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
		<div>
			<label for="fd-loan" class="mb-1.5 block text-sm font-medium text-slate-700">
				FD Loan %
			</label>
			<div class="relative">
				<input
					id="fd-loan"
					type="number"
					inputmode="decimal"
					min="1"
					max="100"
					step="1"
					value={inputs.fdLoanPercent}
					oninput={(e) => update('fdLoanPercent', e.currentTarget.value)}
					class="w-full max-w-full rounded-xl border-slate-200 bg-white py-3 pr-8 pl-4 text-slate-800 shadow-sm transition focus:border-teal-400 focus:ring-teal-400"
				/>
				<span class="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-400">%</span>
			</div>
		</div>
		<div>
			<label for="rd-rate" class="mb-1.5 block text-sm font-medium text-slate-700">
				RD Interest Rate
			</label>
			<div class="relative">
				<input
					id="rd-rate"
					type="number"
					inputmode="decimal"
					min="0"
					max="30"
					step="0.1"
					value={inputs.rdInterestRatePercent}
					oninput={(e) => update('rdInterestRatePercent', e.currentTarget.value)}
					class="w-full max-w-full rounded-xl border-slate-200 bg-white py-3 pr-8 pl-4 text-slate-800 shadow-sm transition focus:border-teal-400 focus:ring-teal-400"
				/>
				<span class="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-400">%</span>
			</div>
		</div>
	</div>
</div>