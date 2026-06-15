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

	const showNetMaturity = $derived(tdsResult?.tdsApplicable ?? false);

	const metrics = $derived([
		{
			id: 'monthly',
			label: 'Monthly Investment',
			value: formatINR(result.roundedMonthly),
			subtitle: 'Rounded to nearest ₹1,000',
			accent: 'bento-glow-amber'
		},
		{
			id: 'maturity',
			label: showNetMaturity ? 'Net Maturity (after TDS)' : 'Maturity Amount',
			value: formatINR(
				showNetMaturity ? tdsResult!.netMaturityAfterTds : result.rdMaturity
			),
			subtitle: showNetMaturity
				? `Gross: ${formatINR(result.rdMaturity)} · TDS: ${formatINR(tdsResult!.tdsDeducted)}`
				: 'RD final value',
			accent: 'bento-glow-teal'
		},
		{
			id: 'interest',
			label: 'Interest Earned',
			value: formatINR(result.interestEarned),
			subtitle: formatPercent(result.percentageInterest) + ' of principal',
			accent: 'bento-glow-emerald'
		},
		{
			id: 'compound',
			label: 'Effective Compounding',
			value: formatPercent(result.compoundedEstimate),
			subtitle: 'Annual return estimate',
			accent: 'bento-glow-indigo'
		}
	]);
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