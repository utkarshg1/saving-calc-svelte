import { formatINR } from './format';

export type SipExcessTone = 'sip' | 'rd' | 'neutral';

export function sipExcessAfterTaxSummary(
	sipNetMaturity: number,
	rdNetMaturity: number
): { label: string; amount: string; text: string; tone: SipExcessTone } {
	const excess = sipNetMaturity - rdNetMaturity;
	const label = 'SIP excess vs RD (after tax)';
	if (excess > 0) {
		const amount = `+${formatINR(excess)}`;
		return { label, amount, text: `${label}: ${amount}`, tone: 'sip' };
	}
	if (excess < 0) {
		const amount = `−${formatINR(Math.abs(excess))}`;
		return { label, amount, text: `${label}: ${amount}`, tone: 'rd' };
	}
	const amount = formatINR(0);
	return { label, amount, text: `${label}: ${amount}`, tone: 'neutral' };
}

export function sipExcessToneClasses(tone: SipExcessTone): string {
	if (tone === 'sip') {
		return 'text-indigo-700 dark:text-indigo-300';
	}
	if (tone === 'rd') {
		return 'text-teal-700 dark:text-teal-300';
	}
	return 'text-slate-600 dark:text-slate-300';
}