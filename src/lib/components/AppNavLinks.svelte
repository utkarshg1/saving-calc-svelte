<script lang="ts">
	import { page } from '$app/stores';
	import {
		APP_NAV,
		isNavActive,
		navAccentClasses,
		navBottomBarClasses,
		navBottomBarIconClasses,
		type NavAccent
	} from '$lib/nav/appNav';

	interface Props {
		variant: 'header' | 'footer' | 'bottom-bar';
		onnavigate?: () => void;
	}

	let { variant, onnavigate }: Props = $props();

	const icons: Record<NavAccent, string> = {
		teal: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
		indigo: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
		emerald: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
		rose: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z'
	};
</script>

{#if variant === 'header'}
	<nav class="hidden items-center gap-1 md:flex">
		{#each APP_NAV as item}
			{@const active = isNavActive($page.url.pathname, item.href)}
			<a
				href={item.href}
				class="rounded-lg px-3 py-2 text-sm font-medium transition {navAccentClasses(item.accent, active)}"
			>
				{item.label}
			</a>
		{/each}
	</nav>
{:else if variant === 'footer'}
	<nav
		class="mt-10 flex flex-wrap items-center justify-center gap-2 border-t border-slate-200/70 pt-6"
		aria-label="Page navigation"
	>
		<p class="mb-1 w-full text-center text-xs font-medium uppercase tracking-wide text-slate-400">Continue to</p>
		{#each APP_NAV as item}
			{@const active = isNavActive($page.url.pathname, item.href)}
			<a
				href={item.href}
				class="rounded-xl px-4 py-2.5 text-sm font-medium transition {navAccentClasses(item.accent, active)}"
			>
				{item.label}
			</a>
		{/each}
	</nav>
{:else}
	<nav
		class="grid grid-cols-4 border-t border-slate-200/80 bg-white/90 px-1 pt-1.5 backdrop-blur-xl"
		style="padding-bottom: max(0.375rem, env(safe-area-inset-bottom));"
		aria-label="Mobile navigation"
	>
		{#each APP_NAV as item}
			{@const active = isNavActive($page.url.pathname, item.href)}
			<a
				href={item.href}
				class="flex flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[10px] font-medium transition {navBottomBarClasses(item.accent, active)}"
				onclick={onnavigate}
			>
				<svg
					class="h-5 w-5 {navBottomBarIconClasses(item.accent, active)}"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					stroke-width="1.75"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d={icons[item.accent]} />
				</svg>
				<span>{item.label}</span>
			</a>
		{/each}
	</nav>
{/if}