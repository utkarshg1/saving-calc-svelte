const PRINT_SESSION_PREFIX = 'report-print-started:';

export function printSessionKey(reportId: string): string {
	return `${PRINT_SESSION_PREFIX}${reportId}`;
}

/** Returns true only for the first claim per report id (survives remounts/HMR). */
export function claimPrintSession(reportId: string): boolean {
	const key = printSessionKey(reportId);
	if (sessionStorage.getItem(key)) return false;
	sessionStorage.setItem(key, '1');
	return true;
}

export function releasePrintSession(reportId: string): void {
	sessionStorage.removeItem(printSessionKey(reportId));
}

/** Attach print-dialog completion handlers. Returns a cleanup function. */
export function waitForPrintDialogClose(onDone: () => void): () => void {
	let done = false;
	let sawPrintMode = false;
	let focusDebounce: ReturnType<typeof setTimeout> | undefined;
	let safetyTimeout: ReturnType<typeof setTimeout> | undefined;

	const finish = () => {
		if (done) return;
		done = true;
		cleanup();
		onDone();
	};

	const onBeforePrint = () => {
		sawPrintMode = true;
	};

	const onAfterPrint = () => finish();

	const onPrintMediaChange = (event: MediaQueryListEvent) => {
		if (!event.matches && sawPrintMode) finish();
	};

	const onWindowFocus = () => {
		if (focusDebounce !== undefined) clearTimeout(focusDebounce);
		focusDebounce = setTimeout(() => finish(), 300);
	};

	const printMql = window.matchMedia('print');

	window.addEventListener('beforeprint', onBeforePrint);
	window.addEventListener('afterprint', onAfterPrint);
	window.addEventListener('focus', onWindowFocus);
	printMql.addEventListener('change', onPrintMediaChange);

	safetyTimeout = setTimeout(() => finish(), 600_000);

	function cleanup() {
		window.removeEventListener('beforeprint', onBeforePrint);
		window.removeEventListener('afterprint', onAfterPrint);
		window.removeEventListener('focus', onWindowFocus);
		printMql.removeEventListener('change', onPrintMediaChange);
		if (focusDebounce !== undefined) clearTimeout(focusDebounce);
		if (safetyTimeout !== undefined) clearTimeout(safetyTimeout);
	}

	return cleanup;
}