import { describe, it, expect } from 'vitest';
import {
	buildCompactQuery,
	buildShareUrl,
	isDefaultSnapshot,
	parseCompactQuery,
	parseScenarioFromUrl,
	serializeScenario
} from './serializeScenario';
import { DEFAULT_INPUTS } from '$lib/calculations/savings';
import { DEFAULT_TDS_INPUTS } from '$lib/calculations/tds';
import { DEFAULT_ADVANCED_INPUTS } from '$lib/calculations/types';

const customSnapshot = {
	inputs: {
		...DEFAULT_INPUTS,
		targetAmount: 1_000_000,
		years: 10,
		inflationRatePercent: 9,
		investmentPath: 'sip' as const,
		sipReturnRatePercent: 12
	},
	tdsInputs: DEFAULT_TDS_INPUTS,
	advanced: DEFAULT_ADVANCED_INPUTS
};

describe('compact share URLs', () => {
	it('omits defaults for empty query', () => {
		const snapshot = {
			inputs: DEFAULT_INPUTS,
			tdsInputs: DEFAULT_TDS_INPUTS,
			advanced: DEFAULT_ADVANCED_INPUTS
		};
		expect(buildCompactQuery(snapshot)).toBe('');
		expect(isDefaultSnapshot(snapshot)).toBe(true);
	});

	it('round-trips compact params', () => {
		const query = buildCompactQuery(customSnapshot);
		const params = new URLSearchParams(query);
		const restored = parseCompactQuery(params);
		expect(restored?.inputs.targetAmount).toBe(1_000_000);
		expect(restored?.inputs.years).toBe(10);
		expect(restored?.inputs.investmentPath).toBe('sip');
		expect(restored?.inputs.sipReturnRatePercent).toBe(12);
	});

	it('produces short share URL', () => {
		const url = buildShareUrl(customSnapshot, 'https://example.com');
		expect(url.length).toBeLessThan(120);
		expect(url).toContain('p=sip');
		expect(url).toContain('t=1000000');
	});

	it('still decodes legacy ?s= blob', () => {
		const encoded = serializeScenario(customSnapshot);
		const url = new URL(`https://example.com/?s=${encoded}`);
		const restored = parseScenarioFromUrl(url);
		expect(restored?.inputs.targetAmount).toBe(1_000_000);
	});
});