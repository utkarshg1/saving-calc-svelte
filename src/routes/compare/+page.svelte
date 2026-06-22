<script lang="ts">
	import SectionHero from '$lib/components/SectionHero.svelte';
	import DualPathComparison from '$lib/components/DualPathComparison.svelte';
	import DualGrowthChart from '$lib/components/DualGrowthChart.svelte';
	import { scenario } from '$lib/stores/scenario.svelte';

	const calc = $derived(scenario.suite);
</script>

<SectionHero
	title="Compare RD vs SIP"
	description="Side-by-side comparison of net maturity, tax, gains, and XIRR for recurring deposits vs mutual fund SIPs."
	accent="indigo"
/>

<section class="mb-8">
	<h2 class="font-display mb-4 text-lg font-semibold text-slate-800">RD vs SIP</h2>
	<DualPathComparison compare={calc.suite.compare} />
</section>

<section class="mb-8">
	<DualGrowthChart
		inputs={scenario.inputs}
		compare={calc.suite.compare}
		monthly={calc.result.roundedMonthly}
		title="Growth Overlay"
		description="RD vs SIP balance over time (principal reference)"
	/>
</section>