<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/logo.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="apple-touch-icon" href={favicon} />
	<meta name="theme-color" content="#0d9488" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500;600&family=Noto+Sans+Devanagari:wght@700&family=Sora:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
	<meta
		name="description"
		content="Utkarsh's Savings Calculator — inflation-adjusted purchase planning with FD loan coverage, RD or SIP investment paths."
	/>
	<title>Utkarsh's Savings Calculator</title>
</svelte:head>

{@render children()}