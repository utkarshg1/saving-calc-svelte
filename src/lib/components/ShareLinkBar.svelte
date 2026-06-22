<script lang="ts">
	import { buildShareUrl } from '$lib/url/serializeScenario';
	import type { ScenarioSnapshot } from '$lib/url/serializeScenario';

	interface Props {
		snapshot: ScenarioSnapshot;
		compact?: boolean;
	}

	let { snapshot, compact = false }: Props = $props();
	let copied = $state(false);

	const shareUrl = $derived(buildShareUrl(snapshot));

	async function copyLink() {
		await navigator.clipboard.writeText(shareUrl);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="rounded-xl border border-teal-200/60 bg-teal-50/40 p-4 dark:border-teal-800/50 dark:bg-teal-900/20 {compact ? '' : 'sm:p-5'}">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="min-w-0 flex-1">
			<p class="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">Shareable link</p>
			<p class="mt-1 break-all font-mono text-xs text-slate-600 dark:text-slate-300 sm:text-sm">{shareUrl}</p>
			<p class="mt-1 text-[10px] text-slate-400">{shareUrl.length} characters</p>
		</div>
		<button
			type="button"
			class="shrink-0 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-teal-500"
			onclick={copyLink}
		>
			{copied ? 'Copied!' : 'Copy link'}
		</button>
	</div>
</div>