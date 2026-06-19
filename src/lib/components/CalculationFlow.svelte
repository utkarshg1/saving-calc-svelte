<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { SavingsInputs, SavingsResult } from '$lib/calculations/savings';
	import type { TdsResult } from '$lib/calculations/tds';
	import type { CapitalGainsResult } from '$lib/calculations/capitalGains';
	import { formatINR, formatNumber, formatPercent } from '$lib/utils/format';
	import { LTCG_EXEMPTION } from '$lib/calculations/capitalGains';

	interface Props {
		inputs: SavingsInputs;
		result: SavingsResult;
		tdsResult?: TdsResult;
		cgtResult?: CapitalGainsResult | null;
		/** PDF layout — no animations, tighter spacing */
		compact?: boolean;
	}

	let { inputs, result, tdsResult, cgtResult = null, compact = false }: Props = $props();

	const isSip = $derived(inputs.investmentPath === 'sip');

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
		}
	]);

	const rdPathSteps = $derived([
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

	const sipPathSteps = $derived(
		cgtResult
			? [
					{
						id: 7,
						title: 'SIP Compounding',
						formula: `M = P × [((1+i)^n − 1) / i] × (1+i), R=${inputs.sipReturnRatePercent}%`,
						value: formatINR(result.sipMaturity),
						color: 'from-teal-500 to-teal-600'
					},
					{
						id: 8,
						title: 'Capital Gains',
						formula: 'Gross SIP − Principal (per installment FIFO)',
						value: formatINR(cgtResult.totalGains),
						color: 'from-emerald-500 to-emerald-600'
					},
					{
						id: 9,
						title: 'STCG Tax',
						formula: `≤12 mo gains × 20% (${cgtResult.stcgInstallmentCount} installments)`,
						value: formatINR(cgtResult.stcgTax),
						color: 'from-rose-500 to-rose-600'
					},
					{
						id: 10,
						title: 'LTCG Tax',
						formula: `>12 mo gains − ${formatINR(LTCG_EXEMPTION)} × 12.5%`,
						value: formatINR(cgtResult.ltcgTax),
						color: 'from-orange-500 to-orange-600'
					},
					{
						id: 11,
						title: 'Total CGT',
						formula: 'STCG tax + LTCG tax',
						value: formatINR(cgtResult.totalTax),
						color: 'from-red-500 to-red-600'
					},
					{
						id: 12,
						title: 'Net FD Principal',
						formula: 'Gross SIP − Total CGT',
						value: formatINR(cgtResult.netAfterTax),
						color: 'from-teal-500 to-teal-600',
						highlight: true
					}
				]
			: []
	);

	const rdTdsSteps = $derived(
		tdsResult?.tdsApplicable
			? [
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
			: []
	);

	const steps = $derived(
		isSip ? [...baseSteps, ...sipPathSteps] : [...baseSteps, ...rdPathSteps, ...rdTdsSteps]
	);
</script>

{#snippet stepRow(step: (typeof steps)[number], i: number)}
	<div class="flex min-w-0 gap-3 sm:gap-4">
		<div class="flex shrink-0 flex-col items-center">
			<div
				class="flex {compact
					? 'h-8 w-8 text-xs'
					: 'h-10 w-10 text-sm'} items-center justify-center rounded-full bg-gradient-to-br {step.color} font-bold text-white shadow-lg"
			>
				{step.id}
			</div>
			{#if i < steps.length - 1}
				<div class="flow-connector my-1 {compact ? 'min-h-[1.25rem]' : 'min-h-[2rem]'} w-0.5 flex-1"></div>
			{/if}
		</div>

		<div
			class="{compact ? 'mb-2 p-2.5' : 'mb-4 p-3 sm:p-4'} min-w-0 flex-1 overflow-hidden rounded-xl border transition-all duration-300
				{compact ? '' : 'hover:shadow-md'}
				{step.highlight
				? 'border-amber-200 bg-amber-50/80'
				: 'border-slate-200/80 bg-white'}"
		>
			<div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
				<div class="min-w-0">
					<h3 class="{compact ? 'text-sm' : ''} font-medium text-slate-800">{step.title}</h3>
					<p class="font-mono-num mt-0.5 break-words text-xs text-slate-400">{step.formula}</p>
				</div>
				{#if compact}
					<p class="font-mono-num shrink-0 text-sm font-semibold text-slate-800">
						{step.value}
					</p>
				{:else}
					{#key step.value}
						<p
							in:fly={{ y: 6, duration: 250 }}
							class="font-mono-num shrink-0 text-base font-semibold text-slate-800 sm:text-lg"
						>
							{step.value}
						</p>
					{/key}
				{/if}
			</div>
		</div>
	</div>
{/snippet}

<div class="flow-container w-full max-w-full overflow-hidden">
	<div class="{compact ? 'mb-4' : 'mb-6'}">
		<h2 class="font-display {compact ? 'text-lg' : 'text-xl sm:text-2xl'} font-semibold text-slate-800">
			How It Works
		</h2>
		{#if !compact}
			<p class="mt-1 text-sm text-slate-500">
				{isSip
					? 'Step-by-step from your target to SIP maturity, capital gains tax, and FD principal'
					: 'Step-by-step from your target to RD maturity with quarterly compounding'}
			</p>
		{/if}
	</div>

	<div class="relative space-y-0">
		{#each steps as step, i (step.id)}
			{#if compact}
				<div class="pdf-flow-step flow-step">
					{@render stepRow(step, i)}
				</div>
			{:else}
				<div
					class="flow-step animate-fade-up"
					style="animation-delay: {i * 80}ms"
					in:fly={{ x: -20, duration: 400, delay: i * 60 }}
				>
					{@render stepRow(step, i)}
				</div>
			{/if}
		{/each}
	</div>

	<div class="mx-auto mt-4 max-w-3xl rounded-xl border border-teal-100 bg-teal-50/50 p-4 text-center">
		{#if isSip}
			<p class="text-xs font-medium tracking-wide text-teal-700 uppercase">SIP Formula</p>
			<p class="font-mono-num mt-2 break-words text-sm text-teal-900">
				M = P × [((1 + i)<sup>n</sup> − 1) / i] × (1 + i)
			</p>
			<p class="font-mono-num mt-1 break-words text-xs text-teal-600">
				P = {formatINR(result.roundedMonthly)}, n = {result.sipMonths} months, i = (1 + R)<sup
					>1/12</sup
				> − 1 = {formatNumber(result.monthlyRate, 6)}
			</p>
		{:else}
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
		{/if}
	</div>
</div>