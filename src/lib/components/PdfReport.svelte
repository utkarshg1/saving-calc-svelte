<script lang="ts">
	import AppLogo from '$lib/components/AppLogo.svelte';
	import HeroMetrics from '$lib/components/HeroMetrics.svelte';
	import GrowthChart from '$lib/components/GrowthChart.svelte';
	import ComparisonChart from '$lib/components/ComparisonChart.svelte';
	import BreakdownChart from '$lib/components/BreakdownChart.svelte';
	import CalculationFlow from '$lib/components/CalculationFlow.svelte';
	import type { SavingsInputs, SavingsResult } from '$lib/calculations/savings';
	import type { TdsInputs, TdsResult } from '$lib/calculations/tds';
	import { formatINR, formatPercent } from '$lib/utils/format';
	import '$lib/pdf/pdf-report.css';

	interface ComparisonItem {
		label: string;
		value: number;
		color: string;
	}

	interface Props {
		inputs: SavingsInputs;
		tdsInputs: TdsInputs;
		result: SavingsResult;
		tdsResult: TdsResult;
		comparisonItems: ComparisonItem[];
		generatedAt?: Date;
	}

	let {
		inputs,
		tdsInputs,
		result,
		tdsResult,
		comparisonItems,
		generatedAt = new Date()
	}: Props = $props();

	const tdsApplies = $derived(tdsResult.tdsApplicable);
	const dateStr = $derived(
		generatedAt.toLocaleDateString('en-IN', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		})
	);
</script>

{#snippet pageFooter()}
	<p class="pdf-page-footer">Purchase Savings Calculator · {dateStr}</p>
{/snippet}

<div class="pdf-root">
	<!-- Page 1: Cover, inputs, TDS, and key results -->
	<section class="pdf-page pdf-page--summary pdf-page-break">
		<header class="pdf-header">
			<AppLogo framed size="sm" />
			<div>
				<p class="pdf-eyebrow">FD-Backed Savings Planner</p>
				<h1 class="pdf-title">Purchase Savings Calculator</h1>
				<p class="pdf-subtitle">
					Inflation-adjusted targets, FD loan coverage, and quarterly RD compounding.
				</p>
				<p class="pdf-meta">Report generated on {dateStr}</p>
			</div>
		</header>

		<div class="pdf-card">
			<h2 class="pdf-card-title">Input Parameters</h2>
			<div class="pdf-kv-grid">
				<div class="pdf-kv-row">
					<span class="pdf-kv-label">Amount to Save</span>
					<span class="pdf-kv-value">{formatINR(inputs.targetAmount)}</span>
				</div>
				<div class="pdf-kv-row">
					<span class="pdf-kv-label">Years</span>
					<span class="pdf-kv-value">{inputs.years}</span>
				</div>
				<div class="pdf-kv-row">
					<span class="pdf-kv-label">Inflation Rate</span>
					<span class="pdf-kv-value">{formatPercent(inputs.inflationRatePercent)}</span>
				</div>
				<div class="pdf-kv-row">
					<span class="pdf-kv-label">FD Loan %</span>
					<span class="pdf-kv-value">{formatPercent(inputs.fdLoanPercent)}</span>
				</div>
				<div class="pdf-kv-row">
					<span class="pdf-kv-label">RD Interest Rate</span>
					<span class="pdf-kv-value">{formatPercent(inputs.rdInterestRatePercent)}</span>
				</div>
				<div class="pdf-kv-row">
					<span class="pdf-kv-label">Monthly Investment</span>
					<span class="pdf-kv-value">{formatINR(result.roundedMonthly)}</span>
				</div>
			</div>
		</div>

		<div class="pdf-card">
			<h2 class="pdf-card-title">TDS on RD Maturity (Section 194A)</h2>
			<p class="pdf-card-desc">Tax on interest, including direct RD → FD rollover</p>

			<div class="pdf-kv-grid pdf-kv-grid--spaced">
				<div class="pdf-kv-row">
					<span class="pdf-kv-label">Senior citizen</span>
					<span class="pdf-kv-value">
						<span class="pdf-badge {tdsInputs.isSeniorCitizen ? 'pdf-badge--yes' : 'pdf-badge--no'}">
							{tdsInputs.isSeniorCitizen ? 'Yes (₹50k threshold)' : 'No (₹40k threshold)'}
						</span>
					</span>
				</div>
				<div class="pdf-kv-row">
					<span class="pdf-kv-label">PAN linked</span>
					<span class="pdf-kv-value">
						<span class="pdf-badge {tdsInputs.hasPAN ? 'pdf-badge--yes' : 'pdf-badge--no'}">
							{tdsInputs.hasPAN ? 'Yes (10% TDS)' : 'No (20% TDS)'}
						</span>
					</span>
				</div>
				<div class="pdf-kv-row">
					<span class="pdf-kv-label">Form 15G / 15H</span>
					<span class="pdf-kv-value">
						<span class="pdf-badge {tdsInputs.form15GHSubmitted ? 'pdf-badge--yes' : 'pdf-badge--no'}">
							{tdsInputs.form15GHSubmitted ? 'Submitted' : 'Not submitted'}
						</span>
					</span>
				</div>
				<div class="pdf-kv-row">
					<span class="pdf-kv-label">Other FY interest</span>
					<span class="pdf-kv-value">{formatINR(tdsInputs.otherInterestThisFY)}</span>
				</div>
				<div class="pdf-kv-row">
					<span class="pdf-kv-label">Aggregate FY interest</span>
					<span class="pdf-kv-value">{formatINR(tdsResult.aggregateInterestThisFY)}</span>
				</div>
				<div class="pdf-kv-row">
					<span class="pdf-kv-label">Threshold</span>
					<span class="pdf-kv-value">{formatINR(tdsResult.threshold)}</span>
				</div>
			</div>

			<div class="pdf-kv-grid">
				<div class="pdf-kv-row">
					<span class="pdf-kv-label">Gross Maturity</span>
					<span class="pdf-kv-value">{formatINR(tdsResult.grossMaturity)}</span>
				</div>
				<div class="pdf-kv-row">
					<span class="pdf-kv-label">Interest Earned</span>
					<span class="pdf-kv-value">{formatINR(tdsResult.totalInterest)}</span>
				</div>
				<div class="pdf-kv-row">
					<span class="pdf-kv-label">TDS Deducted</span>
					<span class="pdf-kv-value pdf-kv-value--danger">
						{formatINR(tdsResult.tdsDeducted)}
						{#if tdsApplies}
							({formatPercent(tdsResult.tdsRate * 100, 0)})
						{/if}
					</span>
				</div>
			</div>

			<div class="pdf-tds-highlight">
				<div class="pdf-kv-row pdf-kv-row--flush">
					<span class="pdf-kv-label pdf-kv-label--emphasis">Net Maturity after TDS</span>
					<span class="pdf-kv-value pdf-kv-value--net">{formatINR(tdsResult.netMaturityAfterTds)}</span>
				</div>
			</div>

			<p class="pdf-note">
				RD→FD rollover: interest is credited for TDS even when no cash is paid out.
			</p>
		</div>

		<div class="pdf-card pdf-results-block">
			<h2 class="pdf-card-title">Key Results</h2>
			<HeroMetrics {result} {tdsResult} pdf />
		</div>

		{@render pageFooter()}
	</section>

	<!-- Page 2: All charts stacked vertically -->
	<section class="pdf-page pdf-page--charts pdf-page-break">
		<h2 class="pdf-card-title pdf-charts-heading">Visual Analysis</h2>

		<div class="pdf-charts-stack">
			<div class="pdf-chart-card pdf-chart-card--stacked">
				<p class="pdf-chart-title">Growth</p>
				<p class="pdf-chart-desc">
					{tdsApplies ? 'Principal vs net balance after TDS' : 'Principal vs RD balance'}
				</p>
				<div class="pdf-chart-area pdf-chart-area--stacked">
					<GrowthChart data={result.monthlySeries} {tdsResult} static large />
				</div>
			</div>

			<div class="pdf-chart-card pdf-chart-card--stacked">
				<p class="pdf-chart-title">Comparison</p>
				<p class="pdf-chart-desc">
					{tdsApplies ? 'Target to net maturity' : 'Target to maturity'}
				</p>
				<div class="pdf-chart-area pdf-chart-area--stacked">
					<ComparisonChart items={comparisonItems} static large />
				</div>
			</div>

			<div class="pdf-chart-card pdf-chart-card--stacked pdf-chart-card--breakdown">
				<p class="pdf-chart-title">Breakdown</p>
				<p class="pdf-chart-desc">
					{tdsApplies ? 'Principal, net interest & TDS' : 'Principal vs interest'}
				</p>
				<div class="pdf-chart-area pdf-chart-area--stacked pdf-chart-area--breakdown">
					<BreakdownChart
						principal={result.principalSaved}
						interest={result.interestEarned}
						{tdsResult}
						static
						large
					/>
				</div>
			</div>
		</div>

		{@render pageFooter()}
	</section>

	<!-- Page 3+: Calculation flow -->
	<section class="pdf-page">
		<CalculationFlow {inputs} {result} {tdsResult} compact />
		{@render pageFooter()}
	</section>
</div>