<script lang="ts">
	import { page } from '$app/stores';
	import AppLogo from './AppLogo.svelte';
	import AppNavLinks from './AppNavLinks.svelte';
	import { APP_NAV } from '$lib/nav/appNav';

	interface Props {
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	let menuOpen = $state(false);

	$effect(() => {
		if (typeof document === 'undefined') return;
		document.documentElement.classList.remove('dark');
		localStorage.removeItem('theme');
	});

	const routeAccent = $derived(
		APP_NAV.find(
			(n) =>
				$page.url.pathname === n.href ||
				(n.href !== '/' && $page.url.pathname.startsWith(n.href))
		)?.accent ?? 'teal'
	);
</script>

<div class="relative min-h-dvh max-w-full overflow-x-hidden" data-route-accent={routeAccent}>
	<div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,_rgba(79,70,229,0.07)_0%,_transparent_45%)]"></div>
	<div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,_rgba(13,148,136,0.06)_0%,_transparent_45%)]"></div>

	<header class="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
		<div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
			<a href="/" class="flex items-center gap-2.5">
				<AppLogo size="sm" />
				<span class="font-display hidden text-sm font-semibold text-slate-800 sm:inline">Savings Calculator</span>
			</a>

			<AppNavLinks variant="header" />

			<div class="flex items-center gap-2">
				<button
					type="button"
					class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
					onclick={() => (menuOpen = !menuOpen)}
					aria-label="Menu"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
				</button>
			</div>
		</div>

		{#if menuOpen}
			<nav class="border-t border-slate-200/60 px-4 py-3 md:hidden">
				{#each APP_NAV as item}
					<a
						href={item.href}
						class="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700"
						onclick={() => (menuOpen = false)}
					>
						{item.label}
					</a>
				{/each}
			</nav>
		{/if}
	</header>

	<main class="relative mx-auto max-w-7xl px-4 py-6 pb-20 sm:px-6 sm:py-8 md:pb-8 lg:px-8">
		{@render children()}
		<AppNavLinks variant="footer" />
	</main>

	<div class="fixed inset-x-0 bottom-0 z-40 md:hidden">
		<AppNavLinks variant="bottom-bar" />
	</div>
</div>