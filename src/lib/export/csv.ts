export function rowsToCsv(rows: Record<string, string | number>[]): string {
	if (rows.length === 0) return '';
	const headers = Object.keys(rows[0]);
	const escape = (v: string | number) => {
		const s = String(v);
		return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
	};
	const lines = [headers.join(',')];
	for (const row of rows) {
		lines.push(headers.map((h) => escape(row[h] ?? '')).join(','));
	}
	return lines.join('\n');
}

export function downloadCsv(filename: string, rows: Record<string, string | number>[]): void {
	const blob = new Blob([rowsToCsv(rows)], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}