<script lang="ts">
	import { buildShareUrl } from '$lib/url/serializeScenario';
	import { downloadCsv } from '$lib/export/csv';
	import { downloadShareCard } from '$lib/export/shareCard';
	import type { ScenarioSnapshot } from '$lib/url/serializeScenario';
	import type { CalculationSuite } from '$lib/calculations/index';
	import { openPrintReport } from '$lib/pdf/generatePdf';

	interface Props {
		snapshot: ScenarioSnapshot;
		suite: CalculationSuite;
	}

	let { snapshot, suite }: Props = $props();
	let copied = $state(false);
	let pdfError = $state<string | null>(null);

	async function copyLink() {
		const url = buildShareUrl(snapshot);
		await navigator.clipboard.writeText(url);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function exportCsv() {
		const rows = suite.suite.cashflow.map((r) => ({
			year: r.year,
			deposits: r.deposits,
			cumulative: r.cumulativeDeposits,
			gross: r.grossBalance,
			tax: r.tax,
			net: r.netBalance
		}));
		downloadCsv('savings-cashflow.csv', rows);
	}

	function exportPng() {
		const isStepUp = snapshot.inputs.investmentPath === 'stepup-sip';
		downloadShareCard({
			goalName: snapshot.inputs.investmentPath.toUpperCase() + ' Plan',
			targetAmount: snapshot.inputs.targetAmount,
			monthlyInvestment: suite.result.roundedMonthly,
			netMaturity: suite.netMaturity,
			xirrPercent: suite.xirrPercent,
			path: snapshot.inputs.investmentPath,
			years: snapshot.inputs.years,
			...isStepUp ? { stepUpTopUp: snapshot.inputs.stepUpTopUpAmount, stepUpCap: snapshot.inputs.stepUpCapAmount, stepUpCapEnabled: snapshot.inputs.stepUpCapEnabled } : {}
		});
	}

	async function exportPdf() {
		pdfError = null;
		try {
			await openPrintReport(snapshot.inputs, snapshot.tdsInputs);
		} catch (e) {
			pdfError = e instanceof Error ? e.message : 'PDF export failed';
		}
	}
</script>

<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
	<button type="button" class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" onclick={copyLink}>{copied ? 'Copied!' : 'Copy Share Link'}</button>
	<button type="button" class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" onclick={exportCsv}>Download CSV</button>
	<button type="button" class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" onclick={exportPng}>Share Card PNG</button>
	<button type="button" class="rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg" onclick={exportPdf}>Export PDF</button>
</div>
{#if pdfError}<p class="mt-2 text-sm text-rose-600">{pdfError}</p>{/if}