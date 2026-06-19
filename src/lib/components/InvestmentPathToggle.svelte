<script lang="ts">
	import type { InvestmentPath } from '$lib/calculations/savings';

	interface Props {
		path: InvestmentPath;
		onchange?: (path: InvestmentPath) => void;
		compact?: boolean;
	}

	let { path, onchange, compact = false }: Props = $props();

	function select(next: InvestmentPath) {
		onchange?.(next);
	}

	const subtitle = $derived(
		path === 'rd'
			? 'Quarterly RD compounding with TDS on interest'
			: 'Equity SIP at expected return → full redemption → FD principal'
	);
</script>

<div class="{compact ? '' : 'mb-5'}">
	{#if !compact}
		<p class="mb-2 text-center text-xs font-semibold tracking-widest text-slate-400 uppercase">
			Investment Path
		</p>
	{/if}
	<div
		class="mx-auto flex max-w-md rounded-xl border border-slate-200 bg-slate-50/80 p-1 {compact
			? 'max-w-xs'
			: ''}"
		role="group"
		aria-label="Investment path"
	>
		<button
			type="button"
			class="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition
				{path === 'rd'
				? 'bg-white text-teal-700 shadow-sm'
				: 'text-slate-500 hover:text-slate-700'}"
			aria-pressed={path === 'rd'}
			onclick={() => select('rd')}
		>
			RD
		</button>
		<button
			type="button"
			class="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition
				{path === 'sip'
				? 'bg-white text-teal-700 shadow-sm'
				: 'text-slate-500 hover:text-slate-700'}"
			aria-pressed={path === 'sip'}
			onclick={() => select('sip')}
		>
			SIP
		</button>
	</div>
	{#if !compact}
		<p class="mt-2 text-center text-xs text-slate-500">{subtitle}</p>
	{/if}
</div>