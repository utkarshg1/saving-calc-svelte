<script lang="ts">
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		size?: 'sm' | 'md' | 'lg';
		framed?: boolean;
		class?: ClassValue;
	}

	let { size = 'md', framed = false, class: className = '' }: Props = $props();

	const uid = `logo-${crypto.randomUUID().slice(0, 8)}`;

	const px = $derived(size === 'sm' ? 36 : size === 'lg' ? 72 : 52);
</script>

{#if framed}
	<div
		class="logo-badge flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-teal-200/90 p-0 shadow-lg ring-4 ring-teal-50/80 transition-transform duration-300 hover:scale-105 sm:h-20 sm:w-20 {className}"
	>
		{@render logoSvg(true)}
	</div>
{:else}
	{@render logoSvg(false)}
{/if}

{#snippet logoSvg(fullSize: boolean)}
	<svg
		width={fullSize ? '100%' : px}
		height={fullSize ? '100%' : px}
		viewBox="0 0 128 128"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		role="img"
		aria-label="Utkarsh's Savings Calculator"
		preserveAspectRatio="xMidYMid meet"
		class="logo-mark block {!framed && !fullSize ? 'shrink-0 transition-transform duration-300 hover:scale-105' : ''} {className}"
	>
		<title>र — Savings Calculator</title>
		<defs>
			<radialGradient id="{uid}-bg" cx="64" cy="64" r="62" gradientUnits="userSpaceOnUse">
				<stop offset="0%" stop-color="#f0fdfa" />
				<stop offset="45%" stop-color="#ecfeff" />
				<stop offset="100%" stop-color="#e0e7ff" />
			</radialGradient>
			<linearGradient id="{uid}-ra" x1="36" y1="28" x2="92" y2="100" gradientUnits="userSpaceOnUse">
				<stop offset="0%" stop-color="#0d9488" />
				<stop offset="45%" stop-color="#14b8a6" />
				<stop offset="100%" stop-color="#4f46e5" />
			</linearGradient>
			<linearGradient id="{uid}-strike" x1="20" y1="58" x2="108" y2="58" gradientUnits="userSpaceOnUse">
				<stop offset="0%" stop-color="#b45309" />
				<stop offset="50%" stop-color="#f59e0b" />
				<stop offset="100%" stop-color="#fbbf24" />
			</linearGradient>
			<linearGradient id="{uid}-ring" x1="16" y1="16" x2="112" y2="112" gradientUnits="userSpaceOnUse">
				<stop offset="0%" stop-color="#0d9488" stop-opacity="0.5" />
				<stop offset="100%" stop-color="#4f46e5" stop-opacity="0.4" />
			</linearGradient>
			<filter id="{uid}-glow" x="-20%" y="-20%" width="140%" height="140%">
				<feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#0d9488" flood-opacity="0.35" />
			</filter>
		</defs>

		<circle cx="64" cy="64" r="62" fill="url(#{uid}-bg)" />
		<circle cx="64" cy="64" r="58" stroke="url(#{uid}-ring)" stroke-width="1.5" opacity="0.35" />
		<circle
			cx="64"
			cy="64"
			r="54"
			stroke="url(#{uid}-ring)"
			stroke-width="2"
			stroke-dasharray="8 6"
			opacity="0.45"
		/>

		<path
			d="M 16 104 A 76 76 0 0 1 108 28"
			stroke="#14b8a6"
			stroke-width="2.5"
			stroke-linecap="round"
			opacity="0.25"
		/>

		<line
			x1="18"
			y1="58"
			x2="110"
			y2="58"
			stroke="url(#{uid}-strike)"
			stroke-width="4.5"
			stroke-linecap="round"
			opacity="0.92"
		/>

		<text
			x="64"
			y="84"
			text-anchor="middle"
			font-family="'Noto Sans Devanagari', sans-serif"
			font-size="82"
			font-weight="700"
			fill="url(#{uid}-ra)"
			filter="url(#{uid}-glow)"
		>
			र
		</text>
	</svg>
{/snippet}

<style>
	.logo-mark {
		filter: drop-shadow(0 3px 10px rgba(13, 148, 136, 0.2));
	}
</style>