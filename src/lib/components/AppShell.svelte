<script lang="ts">
	import { page } from '$app/stores';
	import AppLogo from './AppLogo.svelte';
	import AppNavLinks from './AppNavLinks.svelte';
	import GitHubLink, { GITHUB_REPO_URL } from './GitHubLink.svelte';
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
			<a
				href="/"
				class="group flex items-center gap-2.5"
				aria-label="Utkarsh's Savings Calculator by Utkarsh Gaikwad"
			>
				<div class="transition-transform duration-200 group-hover:scale-[1.02]">
					<AppLogo size="sm" />
				</div>
				<div class="hidden min-w-0 flex-col sm:flex">
					<span class="font-script text-base leading-none whitespace-nowrap text-teal-700 sm:text-lg">
						by Utkarsh Gaikwad
					</span>
					<span class="font-display mt-0.5 text-sm leading-tight font-semibold text-slate-800">
						Savings Calculator
					</span>
				</div>
			</a>

			<AppNavLinks variant="header" />

			<div class="flex items-center gap-2">
				<GitHubLink />
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
				<a
					href={GITHUB_REPO_URL}
					target="_blank"
					rel="noopener noreferrer"
					class="mt-2 flex items-center gap-2 rounded-lg border-t border-slate-200/60 px-3 py-2.5 text-sm font-medium text-slate-600"
					onclick={() => (menuOpen = false)}
				>
					<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path
							d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
						/>
					</svg>
					View on GitHub
				</a>
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