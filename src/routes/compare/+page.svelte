<script lang="ts">
	import SectionHero from '$lib/components/SectionHero.svelte';
	import DualPathComparison from '$lib/components/DualPathComparison.svelte';
	import DualGrowthChart from '$lib/components/DualGrowthChart.svelte';
	import NumericInput from '$lib/components/NumericInput.svelte';
	import { scenario } from '$lib/stores/scenario.svelte';

	const calc = $derived(scenario.suite);
	const hasStepUpSip = $derived(!!calc.suite.compare.stepupSip);
</script>

<SectionHero
	title="Compare RD vs SIP{hasStepUpSip ? ' vs Step-Up SIP' : ''}"
	description="Side-by-side comparison of net maturity, tax, gains, and XIRR for {hasStepUpSip ? 'recurring deposits, mutual fund SIPs, and step-up SIPs' : 'recurring deposits vs mutual fund SIPs'}."
	accent="indigo"
/>

<section class="mb-8">
	<h2 class="font-display mb-4 text-lg font-semibold text-slate-800">RD vs SIP{hasStepUpSip ? ' vs Step-Up SIP' : ''}</h2>

	<div class="mb-6 rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/80">
		<p class="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Step-Up SIP Settings</p>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div>
				<label for="cmp-topup" class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Annual Top-up</label>
				<NumericInput
					id="cmp-topup"
					value={scenario.inputs.stepUpTopUpAmount}
					min={0}
					step={100}
					prefix="₹"
					oncommit={(n) => scenario.inputs = { ...scenario.inputs, stepUpTopUpAmount: n }}
				/>
			</div>
			<div>
				<label for="cmp-cap" class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Monthly Cap</label>
				<NumericInput
					id="cmp-cap"
					value={scenario.inputs.stepUpCapAmount}
					min={0}
					step={1000}
					prefix="₹"
					oncommit={(n) => scenario.inputs = { ...scenario.inputs, stepUpCapAmount: n }}
				/>
			</div>
		</div>
	</div>

	<DualPathComparison compare={calc.suite.compare} inputs={scenario.inputs} />
</section>

<section class="mb-8">
	<DualGrowthChart
		inputs={scenario.inputs}
		compare={calc.suite.compare}
		monthly={calc.result.roundedMonthly}
		title="Growth Overlay"
		description="RD vs SIP{hasStepUpSip ? ' vs Step-Up SIP' : ''} balance over time (principal reference)"
	/>
</section>