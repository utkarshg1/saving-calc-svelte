<script lang="ts">
	import SectionHero from '$lib/components/SectionHero.svelte';
	import ChartCard from '$lib/components/ChartCard.svelte';
	import ChartModal from '$lib/components/ChartModal.svelte';
	import GrowthChart from '$lib/components/GrowthChart.svelte';
	import ComparisonChart from '$lib/components/ComparisonChart.svelte';
	import BreakdownChart from '$lib/components/BreakdownChart.svelte';
	import InflationSensitivityTable from '$lib/components/InflationSensitivityTable.svelte';
	import SipSensitivityTable from '$lib/components/SipSensitivityTable.svelte';
	import CashflowTable from '$lib/components/CashflowTable.svelte';
	import CgtLedgerTable from '$lib/components/CgtLedgerTable.svelte';
	import CalculationFlow from '$lib/components/CalculationFlow.svelte';
	import StepUpSchedule from '$lib/components/StepUpSchedule.svelte';
	import { scenario } from '$lib/stores/scenario.svelte';
	const calc = $derived(scenario.suite);
	const isSip = $derived(scenario.inputs.investmentPath === 'sip' || scenario.inputs.investmentPath === 'stepup-sip');
	const isStepUp = $derived(scenario.inputs.investmentPath === 'stepup-sip');
	const tdsApplies = $derived(calc.tdsResult?.tdsApplicable ?? false);
	const cgtApplies = $derived(isSip && calc.result.cgtResult !== null && (calc.result.cgtResult?.totalTax ?? 0) > 0);

	type ChartId = 'growth' | 'comparison' | 'breakdown' | null;
	let maximizedChart = $state<ChartId>(null);

	const chartTitles = $derived({
		growth: isSip ? (cgtApplies ? 'SIP Growth (Net after CGT)' : 'SIP Growth') : tdsApplies ? 'RD Growth (Net after TDS)' : 'RD Growth',
		comparison: 'Amount Comparison',
		breakdown: isSip ? 'Principal, Gains & CGT' : 'Principal, Interest & TDS'
	});
</script>

<SectionHero title="Analyze" description="Charts, sensitivity tables, and detailed cashflow." accent="emerald" />

<section class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
	<ChartCard title="Growth" description={chartTitles.growth} onmaximize={() => (maximizedChart = 'growth')}>
		<GrowthChart data={calc.result.monthlySeries} tdsResult={calc.tdsResult ?? undefined} cgtResult={calc.result.cgtResult} />
	</ChartCard>
	<ChartCard title="Comparison" description={chartTitles.comparison} onmaximize={() => (maximizedChart = 'comparison')}>
		<ComparisonChart items={calc.comparisonItems} />
	</ChartCard>
	<ChartCard title="Breakdown" description={chartTitles.breakdown} onmaximize={() => (maximizedChart = 'breakdown')}>
		<BreakdownChart principal={calc.result.principalSaved} interest={calc.result.gainsEarned} tdsResult={calc.tdsResult ?? undefined} cgtResult={calc.result.cgtResult} gainsLabel="gains" />
	</ChartCard>
</section>

{#if isStepUp}
	<section class="mb-8">
		<h2 class="font-display mb-4 text-lg font-semibold text-slate-800">Step-Up SIP Schedule</h2>
		<StepUpSchedule
			baseMonthly={calc.result.roundedMonthly}
			topUpAmount={scenario.inputs.stepUpTopUpAmount}
			cap={scenario.inputs.stepUpCapAmount}
			years={scenario.inputs.years}
		/>
	</section>
{/if}

<section class="mb-8">
	<h2 class="font-display mb-4 text-lg font-semibold text-slate-800">Inflation Sensitivity</h2>
	<InflationSensitivityTable rows={calc.suite.inflationSensitivity} baseInflationPercent={scenario.inputs.inflationRatePercent} />
</section>

{#if isSip && calc.sipSensitivity.length > 0}
	<section class="mb-8">
		<h2 class="font-display mb-4 text-lg font-semibold text-slate-800">SIP Return Sensitivity</h2>
		<SipSensitivityTable rows={calc.sipSensitivity} baseReturnPercent={scenario.inputs.sipReturnRatePercent} />
	</section>
{/if}

<section class="mb-8">
	<h2 class="font-display mb-4 text-lg font-semibold text-slate-800">Year-by-Year Cashflow</h2>
	<CashflowTable rows={calc.suite.cashflow} />
</section>

<section class="mb-8">
	<h2 class="font-display mb-1 text-lg font-semibold text-slate-800">CGT Yearly Ledger</h2>
	<p class="mb-4 text-sm text-slate-500">Deposits aggregated by year</p>
	<CgtLedgerTable installments={calc.suite.installments} />
</section>

<section class="rounded-3xl border border-slate-200/60 bg-slate-50/60 p-5 backdrop-blur-sm sm:p-8">
	<CalculationFlow inputs={scenario.inputs} result={calc.result} tdsResult={calc.tdsResult ?? undefined} cgtResult={calc.result.cgtResult} />
</section>

{#if maximizedChart}
	<ChartModal open={true} title={chartTitles[maximizedChart]} onclose={() => (maximizedChart = null)}>
		{#if maximizedChart === 'growth'}
			<GrowthChart data={calc.result.monthlySeries} tdsResult={calc.tdsResult ?? undefined} cgtResult={calc.result.cgtResult} large={true} />
		{:else if maximizedChart === 'comparison'}
			<ComparisonChart items={calc.comparisonItems} large={true} />
		{:else}
			<BreakdownChart principal={calc.result.principalSaved} interest={calc.result.gainsEarned} tdsResult={calc.tdsResult ?? undefined} cgtResult={calc.result.cgtResult} gainsLabel="gains" large={true} />
		{/if}
	</ChartModal>
{/if}