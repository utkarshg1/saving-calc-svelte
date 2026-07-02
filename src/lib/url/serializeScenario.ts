import type { SavingsInputs } from '$lib/calculations/savings';
import { DEFAULT_INPUTS } from '$lib/calculations/savings';
import type { TdsInputs } from '$lib/calculations/tds';
import { DEFAULT_TDS_INPUTS } from '$lib/calculations/tds';
import type { AdvancedInputs } from '$lib/calculations/types';
import { DEFAULT_ADVANCED_INPUTS } from '$lib/calculations/types';

export interface ScenarioSnapshot {
	inputs: SavingsInputs;
	tdsInputs: TdsInputs;
	advanced: AdvancedInputs;
}

function toBase64Url(json: string): string {
	const bytes = new TextEncoder().encode(json);
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	const b64 = btoa(binary);
	return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(encoded: string): string {
	const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
	const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
	const binary = atob(padded);
	const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}

function sanitizeAdvanced(advanced: Partial<AdvancedInputs> | undefined): AdvancedInputs {
	return {
		lumpsumAmount: advanced?.lumpsumAmount ?? DEFAULT_ADVANCED_INPUTS.lumpsumAmount,
		stepUpPercentAnnual:
			advanced?.stepUpPercentAnnual ?? DEFAULT_ADVANCED_INPUTS.stepUpPercentAnnual
	};
}

function decodeLegacySnapshot(encoded: string): ScenarioSnapshot | null {
	try {
		const json = fromBase64Url(encoded);
		const parsed = JSON.parse(json) as Partial<ScenarioSnapshot>;
		return {
			inputs: { ...DEFAULT_INPUTS, ...parsed.inputs },
			tdsInputs: { ...DEFAULT_TDS_INPUTS, ...parsed.tdsInputs },
			advanced: sanitizeAdvanced(parsed.advanced)
		};
	} catch {
		return null;
	}
}

function setIfDifferent(
	params: URLSearchParams,
	key: string,
	value: string | number,
	defaultValue: string | number
) {
	if (value !== defaultValue) params.set(key, String(value));
}

export function buildCompactQuery(snapshot: ScenarioSnapshot): string {
	const { inputs, tdsInputs, advanced } = snapshot;
	const params = new URLSearchParams();

	setIfDifferent(params, 'p', inputs.investmentPath, DEFAULT_INPUTS.investmentPath);
	setIfDifferent(params, 't', inputs.targetAmount, DEFAULT_INPUTS.targetAmount);
	setIfDifferent(params, 'y', inputs.years, DEFAULT_INPUTS.years);
	setIfDifferent(params, 'inf', inputs.inflationRatePercent, DEFAULT_INPUTS.inflationRatePercent);
	setIfDifferent(params, 'fd', inputs.fdLoanPercent, DEFAULT_INPUTS.fdLoanPercent);
	setIfDifferent(params, 'rd', inputs.rdInterestRatePercent, DEFAULT_INPUTS.rdInterestRatePercent);
	setIfDifferent(params, 'sip', inputs.sipReturnRatePercent, DEFAULT_INPUTS.sipReturnRatePercent);

	if (tdsInputs.isSeniorCitizen !== DEFAULT_TDS_INPUTS.isSeniorCitizen) {
		params.set('sc', tdsInputs.isSeniorCitizen ? '1' : '0');
	}
	if (tdsInputs.hasPAN !== DEFAULT_TDS_INPUTS.hasPAN) {
		params.set('pan', tdsInputs.hasPAN ? '1' : '0');
	}
	if (tdsInputs.form15GHSubmitted !== DEFAULT_TDS_INPUTS.form15GHSubmitted) {
		params.set('g15', tdsInputs.form15GHSubmitted ? '1' : '0');
	}
	if (tdsInputs.otherInterestThisFY !== DEFAULT_TDS_INPUTS.otherInterestThisFY) {
		params.set('fy', String(tdsInputs.otherInterestThisFY));
	}

	setIfDifferent(params, 'ls', advanced.lumpsumAmount, DEFAULT_ADVANCED_INPUTS.lumpsumAmount);
	setIfDifferent(params, 'su', advanced.stepUpPercentAnnual, DEFAULT_ADVANCED_INPUTS.stepUpPercentAnnual);
	setIfDifferent(params, 'tup', inputs.stepUpTopUpAmount, DEFAULT_INPUTS.stepUpTopUpAmount);
	setIfDifferent(params, 'cap', inputs.stepUpCapAmount, DEFAULT_INPUTS.stepUpCapAmount);
	if (inputs.stepUpCapEnabled !== DEFAULT_INPUTS.stepUpCapEnabled) {
		params.set('capen', inputs.stepUpCapEnabled ? '1' : '0');
	}

	return params.toString();
}

export function parseCompactQuery(searchParams: URLSearchParams): ScenarioSnapshot | null {
	if ([...searchParams.keys()].length === 0) return null;

	const num = (key: string, fallback: number) => {
		const v = searchParams.get(key);
		return v !== null ? Number(v) : fallback;
	};
	const bool = (key: string, fallback: boolean) => {
		const v = searchParams.get(key);
		if (v === null) return fallback;
		return v === '1' || v === 'true';
	};

	const path = searchParams.get('p');

	return {
		inputs: {
			...DEFAULT_INPUTS,
			investmentPath: path === 'sip' ? 'sip' : path === 'stepup-sip' ? 'stepup-sip' : path === 'rd' ? 'rd' : DEFAULT_INPUTS.investmentPath,
			targetAmount: num('t', DEFAULT_INPUTS.targetAmount),
			years: num('y', DEFAULT_INPUTS.years),
			inflationRatePercent: num('inf', DEFAULT_INPUTS.inflationRatePercent),
			fdLoanPercent: num('fd', DEFAULT_INPUTS.fdLoanPercent),
			rdInterestRatePercent: num('rd', DEFAULT_INPUTS.rdInterestRatePercent),
			sipReturnRatePercent: num('sip', DEFAULT_INPUTS.sipReturnRatePercent),
			stepUpTopUpAmount: num('tup', DEFAULT_INPUTS.stepUpTopUpAmount),
			stepUpCapAmount: num('cap', DEFAULT_INPUTS.stepUpCapAmount),
			stepUpCapEnabled: bool('capen', DEFAULT_INPUTS.stepUpCapEnabled)
		},
		tdsInputs: {
			...DEFAULT_TDS_INPUTS,
			isSeniorCitizen: bool('sc', DEFAULT_TDS_INPUTS.isSeniorCitizen),
			hasPAN: bool('pan', DEFAULT_TDS_INPUTS.hasPAN),
			form15GHSubmitted: bool('g15', DEFAULT_TDS_INPUTS.form15GHSubmitted),
			otherInterestThisFY: num('fy', DEFAULT_TDS_INPUTS.otherInterestThisFY)
		},
		advanced: {
			lumpsumAmount: num('ls', DEFAULT_ADVANCED_INPUTS.lumpsumAmount),
			stepUpPercentAnnual: num('su', DEFAULT_ADVANCED_INPUTS.stepUpPercentAnnual)
		}
	};
}

export function parseScenarioFromUrl(url: URL): ScenarioSnapshot | null {
	const legacy = url.searchParams.get('s');
	if (legacy) return decodeLegacySnapshot(legacy);
	return parseCompactQuery(url.searchParams);
}

/** @deprecated Use buildCompactQuery — kept for legacy encode if needed */
export function serializeScenario(snapshot: ScenarioSnapshot): string {
	return toBase64Url(JSON.stringify(snapshot));
}

export function buildShareUrl(snapshot: ScenarioSnapshot, baseUrl?: string): string {
	const origin = baseUrl ?? (typeof window !== 'undefined' ? window.location.origin : '');
	const query = buildCompactQuery(snapshot);
	return query ? `${origin}/?${query}` : `${origin}/`;
}

export function isDefaultSnapshot(snapshot: ScenarioSnapshot): boolean {
	return buildCompactQuery(snapshot) === '';
}