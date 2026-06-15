<script lang="ts">
	import { fly } from 'svelte/transition';

	interface Props {
		label: string;
		value: string;
		highlight?: boolean;
		subtitle?: string;
		delay?: number;
	}

	let { label, value, highlight = false, subtitle, delay = 0 }: Props = $props();
</script>

<div
	class="result-card group rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg
		{highlight
		? 'border-amber-200 bg-amber-50 shadow-md shadow-amber-100/80'
		: 'border-slate-200/80 bg-white shadow-sm shadow-slate-200/50'}"
	style="animation-delay: {delay}ms"
>
	<p class="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</p>
	{#key value}
		<p
			in:fly={{ y: 8, duration: 300 }}
			class="font-mono-num mt-1 text-xl font-semibold tracking-tight
				{highlight ? 'text-amber-800' : 'text-slate-800'}"
		>
			{value}
		</p>
	{/key}
	{#if subtitle}
		<p class="mt-1 text-xs text-slate-400">{subtitle}</p>
	{/if}
</div>