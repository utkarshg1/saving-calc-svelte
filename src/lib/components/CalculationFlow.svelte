<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { SavingsInputs, SavingsResult } from '$lib/calculations/savings';
	import type { TdsResult } from '$lib/calculations/tds';
	import { formatINR, formatNumber, formatPercent } from '$lib/utils/format';

	interface Props {
		inputs: SavingsInputs;
		result: SavingsResult;
		tdsResult?: TdsResult;
	}

	let { inputs, result, tdsResult }: Props = $props();

	const baseSteps = $derived([
		{
			id: 1,
			title: 'Target Amount',
			formula: 'Your purchase goal today',
			value: formatINR(inputs.targetAmount),
			color: 'from-indigo-500 to-indigo-600'
		},
		{
			id: 2,
			title: 'Inflation Adjustment',
			formula: `Target × (1 + ${inputs.inflationRatePercent}%)^${inputs.years}`,
			value: formatINR(result.inflationAdjusted),
			color: 'from-violet-500 to-violet-600'
		},
		{
			id: 3,
			title: 'FD Loan Coverage',
			formula: `Inflation Adjusted ÷ ${inputs.fdLoanPercent}%`,
			value: formatINR(result.estimatedAmount),
			color: 'from-purple-500 to-purple-600'
		},
		{
			id: 4,
			title: 'Yearly Savings',
			formula: `Estimated ÷ ${inputs.years} years`,
			value: formatINR(result.yearlyAmount),
			color: 'from-fuchsia-500 to-fuchsia-600'
		},
		{
			id: 5,
			title: 'Monthly Savings',
			formula: 'Yearly ÷ 12 months',
			value: formatINR(result.monthlyAmount),
			color: 'from-pink-500 to-pink-600'
		},
		{
			id: 6,
			title: 'Round Up',
			formula: 'ceil(Monthly ÷ 1,000) × 1,000',
			value: formatINR(result.roundedMonthly),
			color: 'from-rose-500 to-rose-600',
			highlight: true
		},
		{
			id: 7,
			title: 'RD Compounding',
			formula: `n=${result.quarters}, i=${inputs.rdInterestRatePercent}/400`,
			value: formatINR(result.rdMaturity),
			color: 'from-teal-500 to-teal-600'
		},
		{
			id: 8,
			title: 'Interest Earned',
			formula: 'Maturity − Principal',
			value: formatINR(result.interestEarned),
			color: 'from-emerald-500 to-emerald-600',
			highlight: true
		}
	]);

	const steps = $derived(
		tdsResult?.tdsApplicable
			? [
					...baseSteps,
					{
						id: 9,
						title: 'TDS Deducted',
						formula: `Interest × ${formatPercent(tdsResult.tdsRate * 100, 0)}`,
						value: formatINR(tdsResult.tdsDeducted),
						color: 'from-rose-500 to-rose-600'
					},
					{
						id: 10,
						title: 'Net Interest after TDS',
						formula: 'Interest − TDS',
						value: formatINR(tdsResult.netInterestAfterTds),
						color: 'from-cyan-500 to-cyan-600'
					},
					{
						id: 11,
						title: 'Net Maturity after TDS',
						formula: 'Gross − TDS',
						value: formatINR(tdsResult.netMaturityAfterTds),
						color: 'from-teal-500 to-teal-600',
						highlight: true
					}
				]
			: baseSteps
	);
</script>

<div class="flow-container w-full max-w-full overflow-hidden">
	<div class="mb-6">
		<h2 class="font-display text-xl font-semibold text-slate-800 sm:text-2xl">How It Works</h2>
		<p class="mt-1 text-sm text-slate-500">
			Step-by-step from your target to RD maturity with quarterly compounding
		</p>
	</div>

	<div class="relative space-y-0">
		{#each steps as step, i (step.id)}
			<div
				class="flow-step animate-fade-up"
				style="animation-delay: {i * 80}ms"
				in:fly={{ x: -20, duration: 400, delay: i * 60 }}
			>
				<div class="flex min-w-0 gap-3 sm:gap-4">
					<div class="flex shrink-0 flex-col items-center">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br {step.color} text-sm font-bold text-white shadow-lg"
						>
							{step.id}
						</div>
						{#if i < steps.length - 1}
							<div class="flow-connector my-1 min-h-[2rem] w-0.5 flex-1"></div>
						{/if}
					</div>

					<div
						class="mb-4 min-w-0 flex-1 overflow-hidden rounded-xl border p-3 transition-all duration-300 hover:shadow-md sm:p-4
							{step.highlight
							? 'border-amber-200 bg-amber-50/80'
							: 'border-slate-200/80 bg-white'}"
					>
						<div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
							<div class="min-w-0">
								<h3 class="font-medium text-slate-800">{step.title}</h3>
								<p class="font-mono-num mt-0.5 break-words text-xs text-slate-400">{step.formula}</p>
							</div>
							{#key step.value}
								<p
									in:fly={{ y: 6, duration: 250 }}
									class="font-mono-num shrink-0 text-base font-semibold text-slate-800 sm:text-lg"
								>
									{step.value}
								</p>
							{/key}
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<div class="mx-auto mt-4 max-w-3xl rounded-xl border border-teal-100 bg-teal-50/50 p-4 text-center">
		<p class="text-xs font-medium tracking-wide text-teal-700 uppercase">RD Formula</p>
		<p class="font-mono-num mt-2 break-words text-sm text-teal-900">
			M = R × [((1 + i)<sup>n</sup> − 1) / (1 − (1 + i)<sup>−1/3</sup>)]
		</p>
		<p class="font-mono-num mt-1 break-words text-xs text-teal-600">
			R = {formatINR(result.roundedMonthly)}, n = {result.quarters} quarters, i = rate/400 = {formatNumber(
				result.quarterlyRate,
				4
			)}
		</p>
	</div>
</div>