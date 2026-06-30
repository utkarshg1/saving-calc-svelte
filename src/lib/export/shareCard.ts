import { formatINR, formatPercent } from '$lib/utils/format';

export interface ShareCardData {
	goalName: string;
	targetAmount: number;
	monthlyInvestment: number;
	netMaturity: number;
	xirrPercent: number | null;
	path: string;
	years: number;
	stepUpTopUp?: number;
	stepUpCap?: number;
}

export function renderShareCard(data: ShareCardData): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = 1200;
	canvas.height = 630;
	const ctx = canvas.getContext('2d')!;

	const grad = ctx.createLinearGradient(0, 0, 1200, 630);
	grad.addColorStop(0, '#0f172a');
	grad.addColorStop(0.5, '#134e4a');
	grad.addColorStop(1, '#312e81');
	ctx.fillStyle = grad;
	ctx.fillRect(0, 0, 1200, 630);

	ctx.fillStyle = 'rgba(255,255,255,0.08)';
	ctx.beginPath();
	ctx.arc(1000, 100, 200, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(150, 500, 150, 0, Math.PI * 2);
	ctx.fill();

	ctx.fillStyle = '#ffffff';
	ctx.font = '600 28px system-ui, sans-serif';
	ctx.fillText("Utkarsh's Savings Calculator", 60, 70);

	ctx.font = '700 52px system-ui, sans-serif';
	ctx.fillText(data.goalName, 60, 150);

	ctx.fillStyle = 'rgba(255,255,255,0.7)';
	ctx.font = '400 24px system-ui, sans-serif';
	ctx.fillText(
		`Target ${formatINR(data.targetAmount)} · ${data.years} years · ${data.path.toUpperCase()}`,
		60,
		195
	);

	const metrics = [
		{ label: 'Monthly Investment', value: formatINR(data.monthlyInvestment) },
		{ label: 'Net Maturity', value: formatINR(data.netMaturity) },
		{
			label: 'XIRR',
			value: data.xirrPercent !== null ? formatPercent(data.xirrPercent) : '—'
		}
	];

	metrics.forEach((m, i) => {
		const x = 60 + i * 380;
		const y = 320;
		ctx.fillStyle = 'rgba(255,255,255,0.5)';
		ctx.font = '500 18px system-ui, sans-serif';
		ctx.fillText(m.label.toUpperCase(), x, y);
		ctx.fillStyle = '#5eead4';
		ctx.font = '700 40px ui-monospace, monospace';
		ctx.fillText(m.value, x, y + 55);
	});

	if (data.stepUpTopUp !== undefined && data.stepUpCap !== undefined) {
		ctx.fillStyle = 'rgba(255,255,255,0.5)';
		ctx.font = '500 16px system-ui, sans-serif';
		ctx.fillText('STEP-UP SIP', 60, 440);
		ctx.fillStyle = '#fbbf24';
		ctx.font = '600 26px ui-monospace, monospace';
		ctx.fillText(`+${formatINR(data.stepUpTopUp)}/yr → cap ${formatINR(data.stepUpCap)}/mo`, 60, 475);
	}

	ctx.fillStyle = 'rgba(255,255,255,0.35)';
	ctx.font = '400 18px system-ui, sans-serif';
	ctx.fillText('saving-calc-svelte.vercel.app', 60, 580);

	return canvas;
}

export function downloadShareCard(data: ShareCardData, filename = 'savings-plan.png'): void {
	const canvas = renderShareCard(data);
	canvas.toBlob((blob) => {
		if (!blob) return;
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	});
}