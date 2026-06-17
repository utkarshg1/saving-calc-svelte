<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { SavingsResult } from '$lib/calculations/savings';
	import type { TdsResult } from '$lib/calculations/tds';
	import { formatINR, formatPercent } from '$lib/utils/format';

	interface Props {
		result: SavingsResult;
		tdsResult?: TdsResult;
	}

	let { result, tdsResult }: Props = $props();

	const tdsApplies = $derived(tdsResult?.tdsApplicable ?? false);

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

		const maturityBlock = tdsApplies
			? [
					{
						id: 'gross-maturity',
						label: 'Gross Maturity (before TDS)',
						value: formatINR(result.rdMaturity),
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
						value: formatINR(result.rdMaturity),
						subtitle: 'RD final value',
						accent: 'bento-glow-teal'
					}
				];

		const interest = {
			id: 'interest',
			label: 'Interest Earned',
			value: formatINR(result.interestEarned),
			subtitle: formatPercent(result.percentageInterest) + ' of principal',
			accent: 'bento-glow-emerald'
		};

		const tdsBlock =
			tdsApplies && tdsResult
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
							subtitle: `Gross: ${formatINR(result.interestEarned)}`,
							accent: 'bento-glow-cyan'
						}
					]
				: [];

		const compound = {
			id: 'compound',
			label: 'Effective Compounding',
			value: formatPercent(result.compoundedEstimate),
			subtitle: 'Annual return estimate',
			accent: 'bento-glow-indigo'
		};

		return [monthly, principal, ...maturityBlock, interest, ...tdsBlock, compound];
	});
</script>

<div class="hero-metrics grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
	{#each metrics as metric, i (metric.id)}
		<div
			class="hero-kpi group relative min-w-0 overflow-hidden rounded-2xl border border-white/60 bg-white/90 p-3 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-5
				{metric.accent}"
			style="animation-delay: {i * 80}ms"
		>
			<p class="text-[10px] font-semibold tracking-widest text-slate-400 uppercase sm:text-xs">
				{metric.label}
			</p>
			{#key metric.value}
				<p
					in:fly={{ y: 10, duration: 350 }}
					class="font-mono-num mt-1.5 text-base font-bold tracking-tight break-words text-slate-900 sm:mt-2 sm:text-xl lg:text-2xl"
				>
					{metric.value}
				</p>
			{/key}
			<p class="mt-1 text-[10px] text-slate-400 sm:text-xs">{metric.subtitle}</p>
		</div>
	{/each}
</div>