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
	import CgtPanel from '$lib/components/CgtPanel.svelte';
	import SipSensitivityTable from '$lib/components/SipSensitivityTable.svelte';
	import InvestmentPathToggle from '$lib/components/InvestmentPathToggle.svelte';
	import AppLogo from '$lib/components/AppLogo.svelte';
	import { openPrintReport } from '$lib/pdf/generatePdf';
	import {
		calculateSavings,
		DEFAULT_INPUTS,
		type SavingsInputs
	} from '$lib/calculations/savings';
	import { calculateTds, DEFAULT_TDS_INPUTS, type TdsInputs } from '$lib/calculations/tds';
	import { buildSipSensitivityTable } from '$lib/calculations/sip';

	let inputs = $state<SavingsInputs>({ ...DEFAULT_INPUTS });
	let tdsInputs = $state<TdsInputs>({ ...DEFAULT_TDS_INPUTS });
	let result = $derived(calculateSavings(inputs));
	let isSip = $derived(inputs.investmentPath === 'sip');
	let cgtResult = $derived(result.cgtResult);
	let sipSensitivity = $derived(
		isSip
			? buildSipSensitivityTable(
					result.roundedMonthly,
					inputs.years,
					inputs.sipReturnRatePercent
				)
			: []
	);
	let tdsResult = $derived(
		isSip
			? undefined
			: calculateTds({
					totalInterest: result.gainsEarned,
					grossMaturity: result.grossMaturity,
					otherInterestThisFY: tdsInputs.otherInterestThisFY,
					isSeniorCitizen: tdsInputs.isSeniorCitizen,
					hasPAN: tdsInputs.hasPAN,
					form15GHSubmitted: tdsInputs.form15GHSubmitted
				})
	);

	type ChartId = 'growth' | 'comparison' | 'breakdown' | null;
	let maximizedChart = $state<ChartId>(null);
	let pdfError = $state<string | null>(null);

	async function exportPdf() {
		pdfError = null;
		try {
			await openPrintReport(inputs, tdsInputs);
		} catch (err) {
			pdfError = err instanceof Error ? err.message : 'Failed to open PDF export';
		}
	}

	const tdsApplies = $derived(tdsResult?.tdsApplicable ?? false);
	const cgtApplies = $derived(isSip && cgtResult !== null && cgtResult.totalTax > 0);
	const netMaturity = $derived(
		isSip
			? cgtResult?.netAfterTax ?? result.grossMaturity
			: tdsApplies
				? tdsResult!.netMaturityAfterTds
				: result.grossMaturity
	);

	const comparisonItems = $derived([
		{ label: 'Target', value: inputs.targetAmount, color: '#94a3b8' },
		{ label: 'Infl. Adj.', value: result.inflationAdjusted, color: '#8b5cf6' },
		{ label: 'Estimated', value: result.estimatedAmount, color: '#6366f1' },
		{
			label: isSip ? (cgtApplies ? 'Net FD' : 'SIP Mat.') : tdsApplies ? 'Net Mat.' : 'Maturity',
			value: netMaturity,
			color: '#0d9488'
		}
	]);

	const chartTitles = $derived<Record<Exclude<ChartId, null>, string>>({
		growth: isSip
			? cgtApplies
				? 'Savings Growth (Net after CGT)'
				: 'SIP Growth Over Time'
			: tdsApplies
				? 'Savings Growth (Net after TDS)'
				: 'Savings Growth Over Time',
		comparison: isSip
			? cgtApplies
				? 'Amount Comparison (Net FD)'
				: 'Amount Comparison (SIP)'
			: tdsApplies
				? 'Amount Comparison (Net Maturity)'
				: 'Amount Comparison',
		breakdown: isSip
			? cgtApplies
				? 'Principal, Gains & CGT'
				: 'Principal vs Gains'
			: tdsApplies
				? 'Principal, Net Interest & TDS'
				: 'Principal vs Interest'
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
						Inflation-adjusted targets, FD loan coverage, RD or SIP investment paths.
					</p>
				</div>
			</div>
		</header>

		<!-- Path toggle at top -->
		<section class="animate-fade-up mb-6 max-w-full sm:mb-8">
			<InvestmentPathToggle
				path={inputs.investmentPath}
				onchange={(path) => {
					inputs = { ...inputs, investmentPath: path };
				}}
			/>
		</section>

		<!-- Inputs -->
		<section
			class="animate-fade-up mb-6 max-w-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:mb-8 sm:p-6"
		>
			<h2 class="font-display mb-5 text-lg font-semibold text-slate-800">Adjust Inputs</h2>
			<CalculatorForm bind:inputs />
		</section>

		<!-- Tax panel -->
		<section class="animate-fade-up mb-6 max-w-full sm:mb-8">
			{#if isSip && cgtResult}
				<CgtPanel result={cgtResult} />
			{:else if tdsResult}
				<TdsPanel bind:inputs={tdsInputs} result={tdsResult} />
			{/if}
		</section>

		<!-- Results -->
		<section class="mb-6 max-w-full sm:mb-8">
			<div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 class="font-display text-lg font-semibold text-slate-800">Key Results</h2>
					<p class="mt-1 text-xs text-slate-400">
						In the print dialog, set destination to Save as PDF.
					</p>
				</div>
				<button
					type="button"
					class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:outline-none"
					onclick={exportPdf}
					title="Opens print dialog — choose Save as PDF"
				>
					<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
						<path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" stroke-linecap="round" stroke-linejoin="round" />
						<path d="M6 14h12v8H6z" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
					Export PDF Report
				</button>
			</div>
			{#if pdfError}
				<p class="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
					{pdfError}
				</p>
			{/if}
			<HeroMetrics {result} {tdsResult} {cgtResult} />
		</section>

		{#if isSip && sipSensitivity.length > 0}
			<section class="animate-fade-up mb-6 max-w-full sm:mb-8">
				<SipSensitivityTable
					rows={sipSensitivity}
					baseReturnPercent={inputs.sipReturnRatePercent}
				/>
			</section>
		{/if}

		<!-- Charts -->
		<section class="mb-8 grid max-w-full grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
			<ChartCard
				title="Growth"
				description={chartTitles.growth}
				onmaximize={() => (maximizedChart = 'growth')}
			>
				<GrowthChart data={result.monthlySeries} {tdsResult} {cgtResult} />
			</ChartCard>

			<ChartCard
				title="Comparison"
				description={chartTitles.comparison}
				onmaximize={() => (maximizedChart = 'comparison')}
			>
				<ComparisonChart items={comparisonItems} />
			</ChartCard>

			<ChartCard
				title="Breakdown"
				description={chartTitles.breakdown}
				onmaximize={() => (maximizedChart = 'breakdown')}
			>
				<BreakdownChart
					principal={result.principalSaved}
					interest={result.gainsEarned}
					{tdsResult}
					{cgtResult}
					gainsLabel="gains"
				/>
			</ChartCard>
		</section>

		<!-- Vertical flowchart at bottom -->
		<section
			class="animate-fade-up max-w-full rounded-3xl border border-slate-200/60 bg-slate-50/60 p-5 backdrop-blur-sm sm:p-8"
			style="animation-delay: 150ms"
		>
			<CalculationFlow {inputs} {result} {tdsResult} {cgtResult} />
		</section>

		<footer class="mt-8 text-center text-xs text-slate-400">
			{isSip
				? 'SIP monthly compounding — i = (1 + R)^(1/12) − 1'
				: 'Quarterly RD compounding — n = years × 4, i = rate ÷ 400'}
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
			<GrowthChart data={result.monthlySeries} {tdsResult} {cgtResult} large={true} />
		{:else if maximizedChart === 'comparison'}
			<ComparisonChart items={comparisonItems} large={true} />
		{:else if maximizedChart === 'breakdown'}
			<BreakdownChart
				principal={result.principalSaved}
				interest={result.gainsEarned}
				{tdsResult}
				{cgtResult}
				gainsLabel="gains"
				large={true}
			/>
		{/if}
	</ChartModal>
{/if}