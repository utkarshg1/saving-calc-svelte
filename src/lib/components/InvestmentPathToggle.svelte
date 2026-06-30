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
			: path === 'sip'
				? 'Equity SIP at expected return → full redemption → net SIP value after tax'
				: 'Step-Up SIP with annual fixed top-up and installment cap'
	);
</script>

<div class="{compact ? '' : ''}">
	{#if !compact}
		<div class="mb-2 text-center">
			<p class="text-xs font-semibold tracking-widest text-slate-500 uppercase">Investment Path</p>
			<p class="mt-0.5 text-[11px] text-slate-400">Tap RD, SIP or Step-Up SIP to compare</p>
		</div>
	{/if}
	<div
		class="flex w-full rounded-xl border-2 border-teal-200/90 bg-white/90 p-1 shadow-md ring-4 ring-teal-50/60 transition-shadow hover:shadow-lg {compact
			? 'max-w-xs mx-auto'
			: 'max-w-lg mx-auto'}"
		role="group"
		aria-label="Investment path"
	>
		<button
			type="button"
			class="flex-1 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold transition
				{path === 'rd'
				? 'bg-white text-teal-700 shadow-md ring-1 ring-teal-100'
				: 'text-slate-500 hover:bg-white/70 hover:text-slate-700'}"
			aria-pressed={path === 'rd'}
			onclick={() => select('rd')}
		>
			RD
		</button>
		<button
			type="button"
			class="flex-1 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold transition
				{path === 'sip'
				? 'bg-white text-teal-700 shadow-md ring-1 ring-teal-100'
				: 'text-slate-500 hover:bg-white/70 hover:text-slate-700'}"
			aria-pressed={path === 'sip'}
			onclick={() => select('sip')}
		>
			SIP
		</button>
		<button
			type="button"
			class="flex-1 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold transition
				{path === 'stepup-sip'
				? 'bg-white text-teal-700 shadow-md ring-1 ring-teal-100'
				: 'text-slate-500 hover:bg-white/70 hover:text-slate-700'}"
			aria-pressed={path === 'stepup-sip'}
			onclick={() => select('stepup-sip')}
		>
			Step-Up SIP
		</button>
	</div>
	{#if !compact}
		<p class="mt-2 text-center text-xs text-slate-500">{subtitle}</p>
	{/if}
</div>
