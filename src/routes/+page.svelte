<script lang="ts">
	import CalculatorForm from '$lib/components/CalculatorForm.svelte';
	import HeroGeometry from '$lib/components/HeroGeometry.svelte';
	import HeroMetrics from '$lib/components/HeroMetrics.svelte';
	import CalculationFlow from '$lib/components/CalculationFlow.svelte';
	import ChartCard from '$lib/components/ChartCard.svelte';
	import ChartModal from '$lib/components/ChartModal.svelte';
	import GrowthChart from '$lib/components/GrowthChart.svelte';
	import ComparisonChart from '$lib/components/ComparisonChart.svelte';
	import BreakdownChart from '$lib/components/BreakdownChart.svelte';
	import TdsPanel from '$lib/components/TdsPanel.svelte';
	import AppLogo from '$lib/components/AppLogo.svelte';
	import {
		calculateSavings,
		DEFAULT_INPUTS,
		type SavingsInputs
	} from '$lib/calculations/savings';
	import { calculateTds, DEFAULT_TDS_INPUTS, type TdsInputs } from '$lib/calculations/tds';

	let inputs = $state<SavingsInputs>({ ...DEFAULT_INPUTS });
	let tdsInputs = $state<TdsInputs>({ ...DEFAULT_TDS_INPUTS });
	let result = $derived(calculateSavings(inputs));
	let tdsResult = $derived(
		calculateTds({
			totalInterest: result.interestEarned,
			grossMaturity: result.rdMaturity,
			otherInterestThisFY: tdsInputs.otherInterestThisFY,
			isSeniorCitizen: tdsInputs.isSeniorCitizen,
			hasPAN: tdsInputs.hasPAN,
			form15GHSubmitted: tdsInputs.form15GHSubmitted
		})
	);

	type ChartId = 'growth' | 'comparison' | 'breakdown' | null;
	let maximizedChart = $state<ChartId>(null);

	const tdsApplies = $derived(tdsResult.tdsApplicable);

	const comparisonItems = $derived([
		{ label: 'Target', value: inputs.targetAmount, color: '#94a3b8' },
		{ label: 'Infl. Adj.', value: result.inflationAdjusted, color: '#8b5cf6' },
		{ label: 'Estimated', value: result.estimatedAmount, color: '#6366f1' },
		{
			label: tdsApplies ? 'Net Mat.' : 'Maturity',
			value: tdsApplies ? tdsResult.netMaturityAfterTds : result.rdMaturity,
			color: '#0d9488'
		}
	]);

	const chartTitles = $derived<Record<Exclude<ChartId, null>, string>>({
		growth: tdsApplies ? 'Savings Growth (Net after TDS)' : 'Savings Growth Over Time',
		comparison: tdsApplies ? 'Amount Comparison (Net Maturity)' : 'Amount Comparison',
		breakdown: tdsApplies ? 'Principal, Net Interest & TDS' : 'Principal vs Interest'
	});
</script>

<div class="relative min-h-dvh max-w-full overflow-x-hidden">
	<div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,_rgba(79,70,229,0.07)_0%,_transparent_45%)]"></div>
	<div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,_rgba(13,148,136,0.06)_0%,_transparent_45%)]"></div>

	<div class="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
		<!-- Compact hero -->
		<header class="relative mb-5 max-w-full overflow-hidden rounded-3xl border border-slate-200/50 bg-white/70 p-5 backdrop-blur-md sm:mb-6 sm:p-6">
			<HeroGeometry />
			<div class="relative z-10 flex items-start gap-3 sm:gap-5">
				<div class="animate-fade-up shrink-0">
					<AppLogo framed size="md" />
				</div>
				<div class="min-w-0">
					<p class="text-[10px] font-bold tracking-[0.2em] text-teal-600 uppercase sm:text-xs">
						FD-Backed Savings Planner
					</p>
					<h1 class="font-display mt-2 text-3xl font-bold leading-snug tracking-normal text-slate-900 sm:text-4xl">
						Purchase Savings Calculator
					</h1>
					<p class="mt-2 max-w-lg text-sm leading-relaxed text-slate-500">
						Inflation-adjusted targets, FD loan coverage, and quarterly RD compounding.
					</p>
				</div>
			</div>
		</header>

		<!-- Inputs FIRST -->
		<section
			class="animate-fade-up mb-6 max-w-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:mb-8 sm:p-6"
		>
			<h2 class="font-display mb-5 text-lg font-semibold text-slate-800">Adjust Inputs</h2>
			<CalculatorForm bind:inputs />
		</section>

		<!-- TDS settings -->
		<section class="animate-fade-up mb-6 max-w-full sm:mb-8">
			<TdsPanel bind:inputs={tdsInputs} result={tdsResult} />
		</section>

		<!-- Results -->
		<section class="mb-6 max-w-full sm:mb-8">
			<HeroMetrics {result} {tdsResult} />
		</section>

		<!-- Charts -->
		<section class="mb-8 grid max-w-full grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
			<ChartCard
				title="Growth"
				description={tdsApplies ? 'Principal vs net balance after TDS' : 'Principal vs RD balance'}
				onmaximize={() => (maximizedChart = 'growth')}
			>
				<GrowthChart data={result.monthlySeries} {tdsResult} />
			</ChartCard>

			<ChartCard
				title="Comparison"
				description={tdsApplies ? 'Target to net maturity' : 'Target to maturity'}
				onmaximize={() => (maximizedChart = 'comparison')}
			>
				<ComparisonChart items={comparisonItems} />
			</ChartCard>

			<ChartCard
				title="Breakdown"
				description={tdsApplies ? 'Principal, net interest & TDS' : 'Principal vs interest'}
				onmaximize={() => (maximizedChart = 'breakdown')}
			>
				<BreakdownChart
					principal={result.principalSaved}
					interest={result.interestEarned}
					{tdsResult}
				/>
			</ChartCard>
		</section>

		<!-- Vertical flowchart at bottom -->
		<section
			class="animate-fade-up max-w-full rounded-3xl border border-slate-200/60 bg-slate-50/60 p-5 backdrop-blur-sm sm:p-8"
			style="animation-delay: 150ms"
		>
			<CalculationFlow {inputs} {result} {tdsResult} />
		</section>

		<footer class="mt-8 text-center text-xs text-slate-400">
			Quarterly RD compounding — n = years × 4, i = rate ÷ 400
		</footer>
	</div>
</div>

{#if maximizedChart}
	<ChartModal
		open={true}
		title={chartTitles[maximizedChart]}
		onclose={() => (maximizedChart = null)}
	>
		{#if maximizedChart === 'growth'}
			<GrowthChart data={result.monthlySeries} {tdsResult} large={true} />
		{:else if maximizedChart === 'comparison'}
			<ComparisonChart items={comparisonItems} large={true} />
		{:else if maximizedChart === 'breakdown'}
			<BreakdownChart
				principal={result.principalSaved}
				interest={result.interestEarned}
				{tdsResult}
				large={true}
			/>
		{/if}
	</ChartModal>
{/if}