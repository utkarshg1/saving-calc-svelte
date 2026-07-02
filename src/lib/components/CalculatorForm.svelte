<script lang="ts">
	import type { SavingsInputs } from '$lib/calculations/savings';
	import { formatINR } from '$lib/utils/format';
	import NumericInput from './NumericInput.svelte';

	interface Props {
		inputs: SavingsInputs;
		onchange?: (inputs: SavingsInputs) => void;
	}

	let { inputs = $bindable(), onchange }: Props = $props();

	function commit<K extends keyof SavingsInputs>(key: K, value: number) {
		inputs = { ...inputs, [key]: value };
		onchange?.(inputs);
	}
</script>

<div class="space-y-5">
	<div>
		<label for="target" class="mb-1.5 block text-sm font-medium text-slate-700">
			Amount to Save
		</label>
		<NumericInput
			id="target"
			value={inputs.targetAmount}
			min={0}
			step={1000}
			prefix="₹"
			oncommit={(n) => commit('targetAmount', n)}
		/>
		<p class="mt-1 text-xs text-slate-400">{formatINR(inputs.targetAmount)}</p>
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
		<div>
			<label for="years" class="mb-1.5 block text-sm font-medium text-slate-700">Years</label>
			<NumericInput
				id="years"
				value={inputs.years}
				min={1}
				max={50}
				integer
				oncommit={(n) => commit('years', n)}
			/>
		</div>
		<div>
			<label for="inflation" class="mb-1.5 block text-sm font-medium text-slate-700">
				Inflation Rate
			</label>
			<NumericInput
				id="inflation"
				value={inputs.inflationRatePercent}
				min={0}
				max={100}
				step={0.1}
				suffix="%"
				oncommit={(n) => commit('inflationRatePercent', n)}
			/>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
		<div>
			<label for="fd-loan" class="mb-1.5 block text-sm font-medium text-slate-700">
				FD Loan %
			</label>
			<NumericInput
				id="fd-loan"
				value={inputs.fdLoanPercent}
				min={1}
				max={100}
				step={1}
				suffix="%"
				oncommit={(n) => commit('fdLoanPercent', n)}
			/>
		</div>
		<div>
			{#if inputs.investmentPath === 'rd'}
				<label for="rd-rate" class="mb-1.5 block text-sm font-medium text-slate-700">
					RD Interest Rate
				</label>
				<NumericInput
					id="rd-rate"
					value={inputs.rdInterestRatePercent}
					min={0}
					max={30}
					step={0.1}
					suffix="%"
					oncommit={(n) => commit('rdInterestRatePercent', n)}
				/>
			{:else}
				<label for="sip-rate" class="mb-1.5 block text-sm font-medium text-slate-700">
					SIP Expected Return
				</label>
				<NumericInput
					id="sip-rate"
					value={inputs.sipReturnRatePercent}
					min={0}
					max={30}
					step={0.1}
					suffix="%"
					oncommit={(n) => commit('sipReturnRatePercent', n)}
				/>
			{/if}
		</div>
	</div>

	{#if inputs.investmentPath === 'stepup-sip'}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div>
				<label for="top-up" class="mb-1.5 block text-sm font-medium text-slate-700">
					Annual Top-up
				</label>
				<NumericInput
					id="top-up"
					value={inputs.stepUpTopUpAmount}
					min={0}
					step={1}
					prefix="₹"
					oncommit={(n) => commit('stepUpTopUpAmount', n)}
				/>
				<p class="mt-1 text-xs text-slate-400">Fixed amount added to monthly installment each year</p>
			</div>
			<div>
				<label class="mb-1.5 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 transition hover:border-teal-200">
					<input
						type="checkbox"
						bind:checked={inputs.stepUpCapEnabled}
						class="rounded border-slate-300 text-teal-600 focus:ring-teal-400"
					/>
					<span class="text-sm text-slate-700">Enable amount cap</span>
				</label>
				<NumericInput
					id="cap"
					value={inputs.stepUpCapAmount}
					min={0}
					step={1}
					prefix="₹"
					disabled={!inputs.stepUpCapEnabled}
					oncommit={(n) => commit('stepUpCapAmount', n)}
				/>
				<p class="mt-1 text-xs text-slate-400">Maximum monthly installment amount</p>
			</div>
		</div>
	{/if}
</div>