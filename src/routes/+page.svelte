<script lang="ts">
	import AppLogo from '$lib/components/AppLogo.svelte';
	import HeroGeometry from '$lib/components/HeroGeometry.svelte';
	import SectionHero from '$lib/components/SectionHero.svelte';
	import CalculatorForm from '$lib/components/CalculatorForm.svelte';
	import InvestmentPathToggle from '$lib/components/InvestmentPathToggle.svelte';
	import HeroMetrics from '$lib/components/HeroMetrics.svelte';
	import TdsPanel from '$lib/components/TdsPanel.svelte';
	import CgtPanel from '$lib/components/CgtPanel.svelte';
	import TaxHintsPanel from '$lib/components/TaxHintsPanel.svelte';
	import ShareLinkBar from '$lib/components/ShareLinkBar.svelte';
	import { scenario } from '$lib/stores/scenario.svelte';

	const calc = $derived(scenario.suite);
	const isSip = $derived(scenario.inputs.investmentPath === 'sip' || scenario.inputs.investmentPath === 'stepup-sip');
</script>

<header class="relative mb-6 max-w-full overflow-hidden rounded-3xl border border-slate-200/50 bg-white/70 p-5 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-800/70 sm:mb-8 sm:p-6">
	<HeroGeometry />
	<div class="relative z-10 flex items-start gap-3 sm:gap-5">
		<AppLogo framed size="md" />
		<div class="min-w-0">
			<p class="font-script text-xl text-teal-700 dark:text-teal-400 sm:text-2xl">by Utkarsh Gaikwad</p>
			<h1 class="font-display mt-2 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Utkarsh's Savings Calculator</h1>
			<p class="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">Plan · Compare · Analyze — shareable savings calculator.</p>
		</div>
	</div>
</header>

<SectionHero
	title="Plan Your Goal"
	description="Set your target and see how much to invest monthly."
	accent="teal"
/>

<section class="animate-fade-up mb-6">
	<ShareLinkBar snapshot={scenario.snapshot} />
</section>

<!-- Calculator (full width) -->
<section class="animate-fade-up mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/80 sm:p-6">
	<div>
		<InvestmentPathToggle
			path={scenario.inputs.investmentPath}
			onchange={(path) => {
				scenario.inputs = { ...scenario.inputs, investmentPath: path };
			}}
		/>
	</div>

	<h2 class="font-display mb-5 mt-6 text-lg font-semibold text-slate-800 dark:text-white">Adjust Inputs</h2>
	<CalculatorForm bind:inputs={scenario.inputs} />
</section>

<section class="animate-fade-up mb-6">
	{#if isSip && calc.result.cgtResult}
		<CgtPanel result={calc.result.cgtResult} />
	{:else if calc.tdsResult}
		<TdsPanel bind:inputs={scenario.tdsInputs} result={calc.tdsResult} />
	{/if}
</section>

<section class="animate-fade-up mb-6">
	<h2 class="font-display mb-4 text-lg font-semibold text-slate-800 dark:text-white">Key Results</h2>
	<HeroMetrics result={calc.result} tdsResult={calc.tdsResult ?? undefined} cgtResult={calc.result.cgtResult} xirrPercent={calc.xirrPercent} />
</section>

<section class="animate-fade-up mb-6">
	<h2 class="font-display mb-4 text-lg font-semibold text-slate-800 dark:text-white">Tax Hints</h2>
	<TaxHintsPanel hints={calc.suite.taxHints} />
</section>