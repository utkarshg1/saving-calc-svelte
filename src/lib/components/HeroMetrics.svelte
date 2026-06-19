<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { SavingsResult } from '$lib/calculations/savings';
	import type { TdsResult } from '$lib/calculations/tds';
	import type { CapitalGainsResult } from '$lib/calculations/capitalGains';
	import { formatINR, formatPercent } from '$lib/utils/format';

	interface Props {
		result: SavingsResult;
		tdsResult?: TdsResult;
		cgtResult?: CapitalGainsResult | null;
		xirrPercent?: number | null;
		/** Print/PDF layout — no animations, pdf-kpi classes */
		pdf?: boolean;
	}

	let { result, tdsResult, cgtResult = null, xirrPercent = null, pdf = false }: Props = $props();

	const isSip = $derived(result.investmentPath === 'sip');
	const tdsApplies = $derived(!isSip && (tdsResult?.tdsApplicable ?? false));
	const cgtApplies = $derived(isSip && cgtResult !== null && cgtResult.totalTax > 0);

	const PDF_LABELS: Record<string, string> = {
		'Gross Maturity (before TDS)': 'Gross Maturity',
		'Net Maturity (after TDS)': 'Net Maturity',
		'Net Interest after TDS': 'Net Interest',
		'Gross SIP Value': 'Gross SIP',
		'Net SIP Value (After Tax)': 'Net SIP',
		'Capital Gains Tax': 'CGT',
		'Net Capital Gains After Tax': 'Net Gains'
	};

	function metricLabel(label: string): string {
		return pdf ? (PDF_LABELS[label] ?? label) : label;
	}

	const metrics = $derived.by(() => {
		const monthly = {
			id: 'monthly',
			label: 'Monthly Investment',
			value: formatINR(result.roundedMonthly),
			subtitle: 'Rounded to nearest ₹1,000',
			accent: 'bento-glow-amber'
		};

		const principal = {
			id: 'principal',
			label: 'Principal Saved',
			value: formatINR(result.principalSaved),
			subtitle: `${result.monthlySeries.length} monthly deposits`,
			accent: 'bento-glow-violet'
		};

		const maturityBlock = isSip
			? cgtResult
				? [
						{
							id: 'gross-maturity',
							label: 'Gross SIP Value',
							value: formatINR(result.grossMaturity),
							subtitle: 'Before capital gains tax',
							accent: 'bento-glow-sky'
						},
						{
							id: 'net-maturity',
							label: 'Net SIP Value (After Tax)',
							value: formatINR(cgtResult.netAfterTax),
							subtitle: 'After STCG / LTCG on redemption',
							accent: 'bento-glow-teal'
						}
					]
				: [
						{
							id: 'maturity',
							label: 'SIP Maturity',
							value: formatINR(result.grossMaturity),
							subtitle: 'Projected corpus at tenure end',
							accent: 'bento-glow-teal'
						}
					]
			: tdsApplies
				? [
						{
							id: 'gross-maturity',
							label: 'Gross Maturity (before TDS)',
							value: formatINR(result.grossMaturity),
							subtitle: 'RD value before tax',
							accent: 'bento-glow-sky'
						},
						{
							id: 'net-maturity',
							label: 'Net Maturity (after TDS)',
							value: formatINR(tdsResult!.netMaturityAfterTds),
							subtitle: 'After Section 194A TDS',
							accent: 'bento-glow-teal'
						}
					]
				: [
						{
							id: 'maturity',
							label: 'Maturity Amount',
							value: formatINR(result.grossMaturity),
							subtitle: 'RD final value',
							accent: 'bento-glow-teal'
						}
					];

		const gains = {
			id: 'gains',
			label: isSip ? 'Capital Gains' : 'Interest Earned',
			value: formatINR(result.gainsEarned),
			subtitle: formatPercent(result.percentageGains) + ' of principal',
			accent: 'bento-glow-emerald'
		};

		const taxBlock = isSip
			? cgtResult && cgtResult.totalTax > 0
				? [
						{
							id: 'cgt',
							label: 'Capital Gains Tax',
							value: formatINR(cgtResult.totalTax),
							subtitle: `STCG ${formatINR(cgtResult.stcgTax)} + LTCG ${formatINR(cgtResult.ltcgTax)}`,
							accent: 'bento-glow-rose'
						}
					]
				: []
			: tdsApplies && tdsResult
				? [
						{
							id: 'tds',
							label: 'TDS Deducted',
							value: formatINR(tdsResult.tdsDeducted),
							subtitle: `${formatPercent(tdsResult.tdsRate * 100, 0)} on interest (Sec. 194A)`,
							accent: 'bento-glow-rose'
						},
						{
							id: 'net-interest',
							label: 'Net Interest after TDS',
							value: formatINR(tdsResult.netInterestAfterTds),
							subtitle: `Gross: ${formatINR(result.gainsEarned)}`,
							accent: 'bento-glow-cyan'
						}
					]
				: [];

		const netGainsBlock =
			isSip && cgtResult
				? [
						{
							id: 'net-gains',
							label: 'Net Capital Gains After Tax',
							value: formatINR(cgtResult.netCapitalGainsAfterTax),
							subtitle: 'Gross gains − STCG/LTCG tax',
							accent: 'bento-glow-cyan'
						}
					]
				: [];

		const xirr = {
			id: 'xirr',
			label: 'XIRR',
			value: xirrPercent !== null ? formatPercent(xirrPercent) : '—',
			subtitle: 'Net after-tax annualized return',
			accent: 'bento-glow-indigo'
		};

		return [monthly, principal, ...maturityBlock, gains, ...taxBlock, ...netGainsBlock, xirr];
	});
</script>

<div
	class="{pdf
		? 'pdf-kpi-grid'
		: 'hero-metrics grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'}"
>
	{#each metrics as metric, i (metric.id)}
		<div
			class="{pdf
				? `pdf-kpi pdf-kpi-card ${metric.accent}`
				: `hero-kpi group relative min-w-0 overflow-hidden rounded-2xl border border-white/60 bg-white/90 p-3 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-5 ${metric.accent}`}"
			style={pdf ? undefined : `animation-delay: ${i * 80}ms`}
		>
			<p
				class="{pdf
					? 'pdf-kpi-label'
					: 'text-[10px] font-semibold tracking-widest text-slate-400 uppercase sm:text-xs'}"
			>
				{metricLabel(metric.label)}
			</p>
			{#if pdf}
				<p class="pdf-kpi-value">{metric.value}</p>
			{:else}
				{#key metric.value}
					<p
						in:fly={{ y: 10, duration: 350 }}
						class="font-mono-num mt-1.5 text-base font-bold tracking-tight break-words text-slate-900 sm:mt-2 sm:text-xl lg:text-2xl"
					>
						{metric.value}
					</p>
				{/key}
			{/if}
			<p class="{pdf ? 'pdf-kpi-sub' : 'mt-1 text-[10px] text-slate-400 sm:text-xs'}">
				{metric.subtitle}
			</p>
		</div>
	{/each}
</div>