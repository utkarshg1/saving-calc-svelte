<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { calculateSuite } from '$lib/calculations/index';
	import DualPathComparison from '$lib/components/DualPathComparison.svelte';
	import DualGrowthChart from '$lib/components/DualGrowthChart.svelte';
	import { formatINR } from '$lib/utils/format';
	import type { SavingsInputs } from '$lib/calculations/savings';
	import type { TdsInputs } from '$lib/calculations/tds';
	import type { AdvancedInputs } from '$lib/calculations/types';
	import { claimPrintSession, waitForPrintDialogClose } from '$lib/pdf/printFlow';

	const COMPARE_KEY = 'savings-compare-report';

	interface StoredPayload {
		inputs: SavingsInputs;
		tdsInputs: TdsInputs;
		advanced: AdvancedInputs;
	}

	let error = $state<string | null>(null);
	let printing = $state(true);
	let compare = $state<ReturnType<typeof calculateSuite>['suite']['compare'] | null>(null);
	let monthly = $state(0);
	let inputs = $state<SavingsInputs | null>(null);

	onMount(() => {
		const reportId = page.url.searchParams.get('id');
		let printFlowDone = false;
		let detachPrintHandlers: (() => void) | undefined;

		function finishPrintFlow() {
			if (printFlowDone) return;
			printFlowDone = true;
			detachPrintHandlers?.();
			detachPrintHandlers = undefined;
			printing = false;
			if (reportId) localStorage.removeItem(`${COMPARE_KEY}:${reportId}`);
		}

		void (async () => {
			try {
				if (!reportId) {
					error = 'No report ID. Please export again from the compare page.';
					printing = false;
					return;
				}

				const raw = localStorage.getItem(`${COMPARE_KEY}:${reportId}`);
				if (!raw) {
					error = 'Report data not found. Please export again from the compare page.';
					printing = false;
					return;
				}

				const payload = JSON.parse(raw) as StoredPayload;
				const suite = calculateSuite(payload.inputs, payload.tdsInputs, payload.advanced);
				compare = suite.suite.compare;
				monthly = suite.result.roundedMonthly;
				inputs = payload.inputs;

				await tick();
				if (document.fonts?.ready) {
					await document.fonts.ready;
				}
				await new Promise<void>((resolve) =>
					requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
				);

				if (!claimPrintSession(reportId)) {
					printing = false;
					return;
				}

				detachPrintHandlers = waitForPrintDialogClose(() => finishPrintFlow());
				window.print();
			} catch {
				error = 'Failed to load report data.';
				printing = false;
			}
		})();

		return () => {
			detachPrintHandlers?.();
		};
	});
</script>

{#if error}
	<div class="report-error">
		<p>{error}</p>
		<a href="/compare">Back to compare</a>
	</div>
{:else if compare && inputs}
	<div class="report-actions">
		{#if printing}
			<p class="report-actions-hint">
				In the print dialog, choose <strong>Save as PDF</strong> as the destination.
			</p>
		{/if}
		<button type="button" class="report-back-btn" onclick={() => goto('/compare')}>
			Back to Compare
		</button>
	</div>

	<div class="report-content">
		<section class="mb-8">
			<h2 class="font-display mb-4 text-lg font-semibold text-slate-800">RD vs SIP{inputs.investmentPath === 'stepup-sip' ? ' vs Step-Up SIP' : ''}</h2>
			{#if inputs.investmentPath === 'stepup-sip'}
				<div class="mb-4 rounded-lg border border-amber-200/80 bg-amber-50/60 px-4 py-2.5 text-xs text-amber-800">
					Base SIP {formatINR(monthly)} + {formatINR(inputs.stepUpTopUpAmount)}/yr top-up
					<span class="mx-2 text-amber-300">·</span>
					capped at {formatINR(inputs.stepUpCapAmount)}/mo
				</div>
			{/if}
			<DualPathComparison {compare} {inputs} compact />
		</section>

		<section class="chart-section mb-8">
			<DualGrowthChart
				{inputs}
				{compare}
				monthly={monthly}
				title="Growth Overlay"
				description="RD vs SIP{inputs.investmentPath === 'stepup-sip' ? ' vs Step-Up SIP' : ''} balance over time (principal reference)"
				static
			/>
		</section>
	</div>
{:else}
	<p class="report-hint" aria-live="polite">Preparing report…</p>
{/if}

<style>
	.report-hint {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 50;
		margin: 0;
		padding: 10px 16px;
		text-align: center;
		font-size: 13px;
		color: #0f766e;
		background: #f0fdfa;
		border-bottom: 1px solid #99f6e4;
	}

	.report-error {
		display: flex;
		min-height: 100dvh;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 24px;
		text-align: center;
		color: #334155;
	}

	.report-error a {
		color: #0d9488;
		font-weight: 600;
	}

	.report-actions {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 50;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 10px 16px;
		padding: 10px 16px;
		background: #f0fdfa;
		border-bottom: 1px solid #99f6e4;
	}

	.report-actions-hint {
		margin: 0;
		font-size: 13px;
		color: #0f766e;
	}

	.report-back-btn {
		border: none;
		border-radius: 999px;
		background: #0d9488;
		color: #ffffff;
		font-size: 13px;
		font-weight: 600;
		padding: 8px 18px;
		cursor: pointer;
		transition: background-color 0.15s ease;
	}

	.report-back-btn:hover {
		background: #0f766e;
	}

	.report-content {
		padding: 20px;
	}

	@media print {
		.report-hint,
		.report-actions {
			display: none !important;
		}
		section.chart-section {
			page-break-before: always;
		}
	}
</style>
