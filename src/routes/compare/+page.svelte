<script lang="ts">
	import SectionHero from '$lib/components/SectionHero.svelte';
	import DualPathComparison from '$lib/components/DualPathComparison.svelte';
	import InstrumentComparisonTable from '$lib/components/InstrumentComparisonTable.svelte';
	import DualGrowthChart from '$lib/components/DualGrowthChart.svelte';
	import ChartCard from '$lib/components/ChartCard.svelte';
	import { scenario } from '$lib/stores/scenario.svelte';

	const calc = $derived(scenario.suite);
</script>

<SectionHero
	title="Compare Instruments"
	description="Side-by-side RD vs SIP and full comparison across PPF, NSC, and Debt MF."
	accent="indigo"
/>

<section class="mb-8">
	<h2 class="font-display mb-4 text-lg font-semibold text-slate-800">RD vs SIP</h2>
	<DualPathComparison compare={calc.suite.compare} />
</section>

<section class="mb-8">
	<ChartCard title="Growth Overlay" description="RD vs SIP balance over time (principal reference)" compact tall>
		<DualGrowthChart inputs={scenario.inputs} compare={calc.suite.compare} monthly={calc.result.roundedMonthly} />
	</ChartCard>
</section>

<section>
	<h2 class="font-display mb-1 text-lg font-semibold text-slate-800">All Instruments</h2>
	<p class="mb-4 text-sm text-slate-500">
		PPF @ 7.10% p.a. · NSC @ 7.7% p.a. (India govt. small savings, quarterly notified rates)
	</p>
	<InstrumentComparisonTable compare={calc.suite.compare} />
</section>