<script lang="ts">
	import type { CompareResult } from '$lib/calculations/types';
	import type { SavingsInputs } from '$lib/calculations/savings';
	import { formatINR, formatPercent } from '$lib/utils/format';
	import { gainsExcessSummary, sipExcessToneClasses } from '$lib/utils/compareLabels';

	interface Props {
		compare: CompareResult;
		inputs?: SavingsInputs;
		compact?: boolean;
	}

	let { compare, inputs, compact = false }: Props = $props();

	const instruments = $derived(
		[compare.rd, compare.sip, compare.stepupSip].filter((x): x is NonNullable<typeof x> => x != null)
	);

	const netGains = $derived(
		Object.fromEntries(
			instruments.map((inst) => [inst.id + (inst.label === 'Step-Up SIP' ? '-su' : ''), inst.gainsEarned - inst.taxAmount])
		)
	);

	const bestId = $derived(
		instruments.reduce((best, inst) => {
			const key = inst.id + (inst.label === 'Step-Up SIP' ? '-su' : '');
			return (netGains[key] ?? 0) > (netGains[best.id + (best.label === 'Step-Up SIP' ? '-su' : '')] ?? 0) ? inst : best
		}, instruments[0]).id ?? null
	);

	const sipVsRdSummary = $derived(
		gainsExcessSummary(
			compare.sip.gainsEarned - compare.sip.taxAmount,
			compare.rd.gainsEarned - compare.rd.taxAmount,
			'SIP',
			'RD'
		)
	);

	const stepupVsRdSummary = $derived(
		compare.stepupSip
			? gainsExcessSummary(
					compare.stepupSip.gainsEarned - compare.stepupSip.taxAmount,
					compare.rd.gainsEarned - compare.rd.taxAmount,
					'Step-Up SIP',
					'RD'
				)
			: null
	);

	const stepupVsSipSummary = $derived(
		compare.stepupSip
			? gainsExcessSummary(
					compare.stepupSip.gainsEarned - compare.stepupSip.taxAmount,
					compare.sip.gainsEarned - compare.sip.taxAmount,
					'Step-Up SIP',
					'SIP'
				)
			: null
	);

	function instKey(inst: NonNullable<typeof instruments[number]>): string {
		return inst.id + (inst.label === 'Step-Up SIP' ? '-su' : '');
	}

	function isBest(inst: NonNullable<typeof instruments[number]>): boolean {
		const key = instKey(inst);
		return (netGains[key] ?? 0) >= Math.max(...Object.values(netGains).filter(v => v !== undefined));
	}
</script>

<div class="{compact ? 'space-y-1.5' : 'space-y-4'}">
	<div class="grid grid-cols-1 {compact ? 'gap-2' : 'gap-4 sm:grid-cols-2 lg:grid-cols-3'}">
		{#each instruments as inst (instKey(inst))}
			<div
				class="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white {compact ? 'p-3' : 'p-5'} dark:border-slate-700 dark:bg-slate-800/80 {isBest(inst) ? 'ring-2 ring-teal-400' : ''}"
			>
				{#if isBest(inst)}
					<span class="absolute right-3 top-3 rounded-full bg-teal-100 px-2 py-0.5 {compact ? 'text-[9px]' : 'text-[10px]'} font-bold uppercase text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">Best</span>
				{/if}
				<h3 class="font-display {compact ? 'text-sm' : 'text-lg'} font-bold text-slate-900 dark:text-white">{inst.label}</h3>
				<p class="mt-1 {compact ? 'text-[10px]' : 'text-xs'} text-slate-400 capitalize">{inst.riskLevel} risk</p>
				<div class="mt-3 {compact ? 'space-y-1.5' : 'space-y-3'}">
					<div>
						<p class="{compact ? 'text-[10px]' : 'text-xs'} text-slate-400">Net Maturity</p>
						<p class="font-mono-num {compact ? 'text-base' : 'text-2xl'} font-bold text-teal-600 dark:text-teal-400">{formatINR(inst.netMaturity)}</p>
					</div>
					<div class="grid grid-cols-2 {compact ? 'gap-1 text-[10px]' : 'gap-3 text-sm'}">
						<div><p class="{compact ? 'text-[9px]' : 'text-xs'} text-slate-400">Gross</p><p class="font-mono-num font-semibold">{formatINR(inst.grossMaturity)}</p></div>
						<div><p class="{compact ? 'text-[9px]' : 'text-xs'} text-slate-400">Tax</p><p class="font-mono-num font-semibold text-rose-500">{formatINR(inst.taxAmount)}</p></div>
						<div><p class="{compact ? 'text-[9px]' : 'text-xs'} text-slate-400">Principal</p><p class="font-mono-num font-semibold">{formatINR(inst.principalSaved)}</p></div>
						<div><p class="{compact ? 'text-[9px]' : 'text-xs'} text-slate-400">Net Gains</p><p class="font-mono-num font-semibold text-emerald-600">{formatINR(inst.gainsEarned - inst.taxAmount)}</p></div>
						<div><p class="{compact ? 'text-[9px]' : 'text-xs'} text-slate-400">XIRR</p><p class="font-mono-num font-semibold">{inst.xirrPercent !== null ? formatPercent(inst.xirrPercent) : '—'}</p></div>
					</div>
					<div class="{compact ? 'text-[9px]' : 'text-xs'} text-slate-400">
						Monthly: {formatINR(inst.monthlyDeposit)}
						{#if inst.label === 'Step-Up SIP' && inputs}
							<span class="ml-1">+ {formatINR(inputs.stepUpTopUpAmount)}/yr → cap {inputs.stepUpCapEnabled ? formatINR(inputs.stepUpCapAmount) : '-'}</span>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>

	<div class="{compact ? 'space-y-1' : 'space-y-2'}">
		<div
			class="rounded-xl border border-slate-200/80 bg-slate-50/80 {compact ? 'px-3 py-2' : 'px-4 py-3'} text-center dark:border-slate-700 dark:bg-slate-800/50"
			aria-live="polite"
		>
			<p class="{compact ? 'text-[9px]' : 'text-xs'} text-slate-500 dark:text-slate-400">{sipVsRdSummary.label}</p>
			<p class="font-mono-num mt-1 {compact ? 'text-sm' : 'text-lg'} font-semibold {sipExcessToneClasses(sipVsRdSummary.tone)}">
				{sipVsRdSummary.amount}
			</p>
		</div>
		{#if stepupVsRdSummary}
			<div
				class="rounded-xl border border-slate-200/80 bg-slate-50/80 {compact ? 'px-3 py-2' : 'px-4 py-3'} text-center dark:border-slate-700 dark:bg-slate-800/50"
				aria-live="polite"
			>
				<p class="{compact ? 'text-[9px]' : 'text-xs'} text-slate-500 dark:text-slate-400">{stepupVsRdSummary.label}</p>
				<p class="font-mono-num mt-1 {compact ? 'text-sm' : 'text-lg'} font-semibold {sipExcessToneClasses(stepupVsRdSummary.tone)}">
					{stepupVsRdSummary.amount}
				</p>
			</div>
		{/if}
		{#if stepupVsSipSummary}
			<div
				class="rounded-xl border border-slate-200/80 bg-slate-50/80 {compact ? 'px-3 py-2' : 'px-4 py-3'} text-center dark:border-slate-700 dark:bg-slate-800/50"
				aria-live="polite"
			>
				<p class="{compact ? 'text-[9px]' : 'text-xs'} text-slate-500 dark:text-slate-400">{stepupVsSipSummary.label}</p>
				<p class="font-mono-num mt-1 {compact ? 'text-sm' : 'text-lg'} font-semibold {sipExcessToneClasses(stepupVsSipSummary.tone)}">
					{stepupVsSipSummary.amount}
				</p>
			</div>
		{/if}
	</div>
</div>
