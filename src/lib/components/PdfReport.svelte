<script lang="ts">
	import AppLogo from '$lib/components/AppLogo.svelte';
	import HeroMetrics from '$lib/components/HeroMetrics.svelte';
	import GrowthChart from '$lib/components/GrowthChart.svelte';
	import ComparisonChart from '$lib/components/ComparisonChart.svelte';
	import BreakdownChart from '$lib/components/BreakdownChart.svelte';
	import CalculationFlow from '$lib/components/CalculationFlow.svelte';
	import SipSensitivityTable from '$lib/components/SipSensitivityTable.svelte';
	import StepUpSchedule from '$lib/components/StepUpSchedule.svelte';
	import type { SavingsInputs, SavingsResult } from '$lib/calculations/savings';
	import type { TdsInputs, TdsResult } from '$lib/calculations/tds';
	import type { CapitalGainsResult } from '$lib/calculations/capitalGains';
	import { LTCG_EXEMPTION } from '$lib/calculations/capitalGains';
	import type { SipSensitivityRow } from '$lib/calculations/sip';
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
		tdsResult?: TdsResult | null;
		cgtResult?: CapitalGainsResult | null;
		comparisonItems: ComparisonItem[];
		sipSensitivity?: SipSensitivityRow[];
		stepupSensitivity?: SipSensitivityRow[];
		xirrPercent?: number | null;
		generatedAt?: Date;
	}

	let {
		inputs,
		tdsInputs,
		result,
		tdsResult,
		cgtResult,
		comparisonItems,
		sipSensitivity = [],
		stepupSensitivity = [],
		xirrPercent = null,
		generatedAt = new Date()
	}: Props = $props();

	const isSip = $derived(inputs.investmentPath === 'sip' || inputs.investmentPath === 'stepup-sip');
	const isStepUp = $derived(inputs.investmentPath === 'stepup-sip');
	const tdsApplies = $derived(tdsResult?.tdsApplicable ?? false);
	const cgtApplies = $derived(cgtResult != null && cgtResult.totalTax > 0);
	const dateStr = $derived(
		generatedAt.toLocaleDateString('en-IN', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		})
	);
</script>

{#snippet pageFooter()}
	<p class="pdf-page-footer">Utkarsh's Savings Calculator · {dateStr}</p>
{/snippet}

<div class="pdf-root">
	<section class="pdf-page pdf-page--summary pdf-page-break">
		<header class="pdf-header">
			<AppLogo framed size="sm" />
			<div>
				<p class="pdf-eyebrow pdf-eyebrow--script">by Utkarsh Gaikwad</p>
				<h1 class="pdf-title">Utkarsh's Savings Calculator</h1>
				<p class="pdf-subtitle">
					Inflation-adjusted targets, FD loan coverage, RD or SIP investment paths.
				</p>
				<p class="pdf-meta">Report generated on {dateStr}</p>
			</div>
		</header>

		<div class="pdf-card">
			<h2 class="pdf-card-title">Input Parameters</h2>
			<div class="pdf-kv-grid">
				<div class="pdf-kv-row">
					<span class="pdf-kv-label">Investment Path</span>
					<span class="pdf-kv-value">{inputs.investmentPath === 'stepup-sip' ? 'Step-Up SIP' : isSip ? 'SIP' : 'RD'}</span>
				</div>
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
					<span class="pdf-kv-label">{isSip ? 'SIP Expected Return' : 'RD Interest Rate'}</span>
					<span class="pdf-kv-value">
						{formatPercent(isSip ? inputs.sipReturnRatePercent : inputs.rdInterestRatePercent)}
					</span>
				</div>
				<div class="pdf-kv-row">
					<span class="pdf-kv-label">Monthly Investment</span>
					<span class="pdf-kv-value">{formatINR(result.roundedMonthly)}</span>
				</div>
				{#if inputs.investmentPath === 'stepup-sip'}
					<div class="pdf-kv-row">
						<span class="pdf-kv-label">Annual Top-up</span>
						<span class="pdf-kv-value">+{formatINR(inputs.stepUpTopUpAmount)}/yr</span>
					</div>
				<div class="pdf-kv-row">
					<span class="pdf-kv-label">Monthly Cap</span>
					<span class="pdf-kv-value">{inputs.stepUpCapEnabled ? formatINR(inputs.stepUpCapAmount) + '/mo' : '-'}</span>
				</div>
				{/if}
			</div>
		</div>

		{#if isSip && cgtResult}
			<div class="pdf-card">
				<h2 class="pdf-card-title">Capital Gains on SIP Redemption</h2>
				<p class="pdf-card-desc">Equity MF — FIFO per installment, full redemption → net SIP value after tax</p>

				<div class="pdf-kv-grid pdf-kv-grid--spaced">
					<div class="pdf-kv-row">
						<span class="pdf-kv-label">STCG installments</span>
						<span class="pdf-kv-value">{cgtResult.stcgInstallmentCount} (≤12 mo)</span>
					</div>
					<div class="pdf-kv-row">
						<span class="pdf-kv-label">LTCG installments</span>
						<span class="pdf-kv-value">{cgtResult.ltcgInstallmentCount} (&gt;12 mo)</span>
					</div>
				</div>

				<div class="pdf-kv-grid">
					<div class="pdf-kv-row">
						<span class="pdf-kv-label">Gross SIP Value</span>
						<span class="pdf-kv-value">{formatINR(cgtResult.grossMaturity)}</span>
					</div>
					<div class="pdf-kv-row">
						<span class="pdf-kv-label">Capital Gains</span>
						<span class="pdf-kv-value">{formatINR(cgtResult.totalGains)}</span>
					</div>
					<div class="pdf-kv-row">
						<span class="pdf-kv-label">STCG Tax</span>
						<span class="pdf-kv-value pdf-kv-value--danger">{formatINR(cgtResult.stcgTax)}</span>
					</div>
					<div class="pdf-kv-row">
						<span class="pdf-kv-label">LTCG Exemption</span>
						<span class="pdf-kv-value">−{formatINR(cgtResult.ltcgExemptionApplied)}</span>
					</div>
					<div class="pdf-kv-row">
						<span class="pdf-kv-label">LTCG Tax</span>
						<span class="pdf-kv-value pdf-kv-value--danger">{formatINR(cgtResult.ltcgTax)}</span>
					</div>
				</div>

				<div class="pdf-tds-highlight">
					<div class="pdf-kv-row pdf-kv-row--flush">
						<span class="pdf-kv-label pdf-kv-label--emphasis">Net SIP Value (After Tax)</span>
						<span class="pdf-kv-value pdf-kv-value--net">{formatINR(cgtResult.netAfterTax)}</span>
					</div>
				</div>

				<p class="pdf-note">
					LTCG taxed at 12.5% above {formatINR(LTCG_EXEMPTION)} exemption; STCG at 20% on installments
					held 12 months or less.
				</p>
			</div>
		{:else if tdsResult}
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
		{/if}

		<div class="pdf-card pdf-results-block">
			<h2 class="pdf-card-title">Key Results</h2>
			<HeroMetrics
				{result}
				tdsResult={tdsResult ?? undefined}
				cgtResult={cgtResult}
				{xirrPercent}
				pdf
			/>
		</div>

		{@render pageFooter()}
	</section>

	<section class="pdf-page pdf-page--charts pdf-page-break">
		<h2 class="pdf-card-title pdf-charts-heading">Visual Analysis</h2>

		{#if isStepUp}
			<div class="pdf-sensitivity-block">
				<StepUpSchedule
					baseMonthly={result.roundedMonthly}
					topUpAmount={inputs.stepUpTopUpAmount}
					cap={inputs.stepUpCapAmount}
					years={inputs.years}
				/>
			</div>
			<div class="pdf-sensitivity-block">
				<SipSensitivityTable
					rows={stepupSensitivity}
					baseReturnPercent={inputs.sipReturnRatePercent}
					compact
				/>
			</div>
		{:else if isSip && sipSensitivity.length > 0}
			<div class="pdf-sensitivity-block">
				<SipSensitivityTable
					rows={sipSensitivity}
					baseReturnPercent={inputs.sipReturnRatePercent}
					compact
				/>
			</div>
		{/if}

		<div class="pdf-charts-stack">
			<div class="pdf-chart-card pdf-chart-card--stacked">
				<p class="pdf-chart-title">Growth</p>
				<p class="pdf-chart-desc">
					{isSip
						? cgtApplies
							? 'Principal vs net balance after CGT'
							: 'Principal vs SIP balance'
						: tdsApplies
							? 'Principal vs net balance after TDS'
							: 'Principal vs RD balance'}
				</p>
				<div class="pdf-chart-area pdf-chart-area--stacked">
					<GrowthChart
						data={result.monthlySeries}
						tdsResult={tdsResult ?? undefined}
						{cgtResult}
						static
						large
					/>
				</div>
			</div>

			<div class="pdf-chart-card pdf-chart-card--stacked">
				<p class="pdf-chart-title">Comparison</p>
				<p class="pdf-chart-desc">
					{isSip
						? cgtApplies
							? 'Target to net SIP value after tax'
							: 'Target to SIP maturity'
						: tdsApplies
							? 'Target to net maturity'
							: 'Target to maturity'}
				</p>
				<div class="pdf-chart-area pdf-chart-area--stacked">
					<ComparisonChart items={comparisonItems} static large />
				</div>
			</div>

			<div class="pdf-chart-card pdf-chart-card--stacked pdf-chart-card--breakdown">
				<p class="pdf-chart-title">Breakdown</p>
				<p class="pdf-chart-desc">
					{isSip
						? cgtApplies
							? 'Principal, gains & CGT'
							: 'Principal vs gains'
						: tdsApplies
							? 'Principal, net interest & TDS'
							: 'Principal vs interest'}
				</p>
				<div class="pdf-chart-area pdf-chart-area--stacked pdf-chart-area--breakdown">
					<BreakdownChart
						principal={result.principalSaved}
						interest={result.gainsEarned}
						tdsResult={tdsResult ?? undefined}
						{cgtResult}
						gainsLabel="gains"
						static
						large
					/>
				</div>
			</div>
		</div>

		{@render pageFooter()}
	</section>

	<section class="pdf-page">
		<CalculationFlow
			{inputs}
			{result}
			tdsResult={tdsResult ?? undefined}
			{cgtResult}
			compact
		/>
		{@render pageFooter()}
	</section>
</div>