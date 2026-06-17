<script lang="ts">
	import HeroHexCollide from './HeroHexCollide.svelte';
</script>

<div class="geo-hero pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
	<svg class="absolute inset-0 h-full w-full" viewBox="0 0 1200 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
		<defs>
			<pattern id="geo-grid" width="32" height="32" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
				<path d="M 32 0 L 0 0 0 32" fill="none" stroke="#94a3b8" stroke-width="0.4" opacity="0.35" />
			</pattern>
			<linearGradient id="geo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stop-color="#0d9488" stop-opacity="0.12" />
				<stop offset="100%" stop-color="#4f46e5" stop-opacity="0.06" />
			</linearGradient>
		</defs>
		<rect width="1200" height="200" fill="url(#geo-grid)" />
		<polygon points="0,0 1200,0 1000,200 0,200" fill="url(#geo-grad-1)" />
		<circle cx="1000" cy="50" r="60" fill="none" stroke="#0d9488" stroke-width="0.5" opacity="0.25" />
		<circle cx="1000" cy="50" r="38" fill="none" stroke="#4f46e5" stroke-width="0.5" opacity="0.2" />
	</svg>

	<HeroHexCollide />

	<div class="geo-ring geo-ring-1 absolute top-2 right-4 h-24 w-24 rounded-full border border-teal-300/25 sm:right-8 sm:h-28 sm:w-28"></div>
	<div class="geo-ring geo-ring-2 absolute bottom-4 left-4 h-16 w-16 rounded-full border border-indigo-300/20 sm:h-20 sm:w-20"></div>
</div>