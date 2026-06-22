<script lang="ts">
	import SectionHero from '$lib/components/SectionHero.svelte';
	import ShareToolbar from '$lib/components/ShareToolbar.svelte';
	import ShareLinkBar from '$lib/components/ShareLinkBar.svelte';
	import HeroMetrics from '$lib/components/HeroMetrics.svelte';
	import { scenario } from '$lib/stores/scenario.svelte';

	const calc = $derived(scenario.suite);
</script>

<SectionHero title="Export & Share" description="Copy a shareable link, download CSV, generate a PNG card, or export a PDF report." accent="rose" />

<section class="mb-8">
	<ShareLinkBar snapshot={scenario.snapshot} />
</section>

<section class="mb-8">
	<ShareToolbar snapshot={scenario.snapshot} suite={calc} />
</section>

<section>
	<h2 class="font-display mb-4 text-lg font-semibold text-slate-800">Summary Preview</h2>
	<HeroMetrics result={calc.result} tdsResult={calc.tdsResult ?? undefined} cgtResult={calc.result.cgtResult} xirrPercent={calc.xirrPercent} />
</section>