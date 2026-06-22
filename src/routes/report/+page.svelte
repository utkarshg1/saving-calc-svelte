<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import PdfReport from '$lib/components/PdfReport.svelte';
	import { DEFAULT_INPUTS } from '$lib/calculations/savings';
	import type { ReportPayload } from '$lib/pdf/buildReportPayload';
	import { clearReportPayload, loadReportPayload } from '$lib/pdf/generatePdf';
	import { claimPrintSession, waitForPrintDialogClose } from '$lib/pdf/printFlow';

	let payload = $state<ReportPayload | null>(null);
	let error = $state<string | null>(null);
	let printing = $state(true);

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
			if (reportId) clearReportPayload(reportId);
		}

		void (async () => {
			try {
				const raw = loadReportPayload(reportId);

				if (!raw) {
					error = 'Report data not found. Please export again from the calculator.';
					printing = false;
					return;
				}

				const parsed = JSON.parse(raw) as ReportPayload;
				if (!parsed.inputs.investmentPath) {
					parsed.inputs.investmentPath = 'rd';
				}
				if (parsed.inputs.sipReturnRatePercent === undefined) {
					parsed.inputs.sipReturnRatePercent = DEFAULT_INPUTS.sipReturnRatePercent;
				}
				if (parsed.cgtResult === undefined) parsed.cgtResult = null;
				if (parsed.tdsResult === undefined) parsed.tdsResult = null;
				if (parsed.sipSensitivity === undefined) parsed.sipSensitivity = [];
				if (parsed.xirrPercent === undefined) parsed.xirrPercent = null;
				payload = parsed;

				await tick();
				if (document.fonts?.ready) {
					await document.fonts.ready;
				}
				await new Promise<void>((resolve) =>
					requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
				);

				if (!reportId || !claimPrintSession(reportId)) {
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
		<a href="/">Back to calculator</a>
	</div>
{:else if payload}
	<div class="report-actions">
		{#if printing}
			<p class="report-actions-hint">
				In the print dialog, choose <strong>Save as PDF</strong> as the destination.
			</p>
		{/if}
		<button type="button" class="report-back-btn" onclick={() => goto('/')}>
			Back to Calculator
		</button>
	</div>
	<PdfReport
		inputs={payload.inputs}
		tdsInputs={payload.tdsInputs}
		result={payload.result}
		tdsResult={payload.tdsResult}
		cgtResult={payload.cgtResult}
		sipSensitivity={payload.sipSensitivity}
		xirrPercent={payload.xirrPercent}
		comparisonItems={payload.comparisonItems}
		generatedAt={new Date(payload.generatedAt)}
	/>
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

	@media print {
		.report-hint,
		.report-actions {
			display: none !important;
		}
	}
</style>