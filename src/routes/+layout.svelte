<script lang="ts">
	import './layout.css';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import favicon from '$lib/assets/logo.svg';
	import AppShell from '$lib/components/AppShell.svelte';
	import { scenario } from '$lib/stores/scenario.svelte';
	import { buildCompactQuery } from '$lib/url/serializeScenario';

	let { children } = $props();

	const isReport = $derived($page.url.pathname.startsWith('/report'));

	let urlSynced = false;

	$effect(() => {
		if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

		if (import.meta.env.DEV) {
			navigator.serviceWorker.getRegistrations().then((regs) => {
				regs.forEach((r) => r.unregister());
			});
			return;
		}

		navigator.serviceWorker.register('/sw.js').catch(() => {});
	});

	$effect(() => {
		if (typeof window === 'undefined' || urlSynced) return;
		scenario.loadFromUrl($page.url);
		urlSynced = true;
	});

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	$effect(() => {
		if (typeof window === 'undefined' || isReport) return;
		const snap = scenario.snapshot;
		const query = buildCompactQuery(snap);
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			const url = new URL(window.location.href);
			url.search = '';
			if (query) {
				const params = new URLSearchParams(query);
				params.forEach((v, k) => url.searchParams.set(k, v));
			}
			const next = `${url.pathname}${url.search}`;
			const current = `${window.location.pathname}${window.location.search}`;
			if (next !== current) {
				goto(next, { replaceState: true, keepFocus: true, noScroll: true });
			}
		}, 400);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="apple-touch-icon" href={favicon} />
	<meta name="theme-color" content="#0d9488" />
	<link rel="manifest" href="/manifest.webmanifest" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500;600&family=Sora:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
	<meta
		name="description"
		content="Utkarsh's Savings Calculator — inflation-adjusted RD/SIP planning with shareable links."
	/>
	<title>Utkarsh's Savings Calculator</title>
</svelte:head>

{#if isReport}
	{@render children()}
{:else}
	<AppShell>
		{@render children()}
	</AppShell>
{/if}