import { goto } from '$app/navigation';
import type { SavingsInputs } from '$lib/calculations/savings';
import type { TdsInputs } from '$lib/calculations/tds';
import { buildReportPayload } from './buildReportPayload';

export const REPORT_STORAGE_KEY = 'savings-report-payload';

function storageKey(reportId: string): string {
	return `${REPORT_STORAGE_KEY}:${reportId}`;
}

/** Navigate to /report in the same tab (no pop-up required). */
export async function openPrintReport(
	inputs: SavingsInputs,
	tdsInputs: TdsInputs
): Promise<void> {
	const payload = buildReportPayload(inputs, tdsInputs);
	const reportId = crypto.randomUUID();
	localStorage.setItem(storageKey(reportId), JSON.stringify(payload));
	await goto(`/report?id=${reportId}`);
}

export function loadReportPayload(reportId: string | null): string | null {
	if (!reportId) return null;
	return localStorage.getItem(storageKey(reportId));
}

export function clearReportPayload(reportId: string): void {
	localStorage.removeItem(storageKey(reportId));
}