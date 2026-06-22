import { describe, it, expect } from 'vitest';
import { calculatePpf } from './ppf';
import { calculateNsc } from './nsc';
import { PPF_ANNUAL_RATE_PERCENT, NSC_ANNUAL_RATE_PERCENT } from './govRates';
import { calculateSavings, DEFAULT_INPUTS } from './savings';
import { applyTemplate } from '$lib/presets/goalTemplates';

function expectXirrNear(actual: number | null, expected: number, tolerance = 0.3) {
	expect(actual).not.toBeNull();
	expect(actual!).toBeGreaterThanOrEqual(expected - tolerance);
	expect(actual!).toBeLessThanOrEqual(expected + tolerance);
}

describe('government savings rates', () => {
	it('uses current PPF and NSC nominal rates', () => {
		expect(PPF_ANNUAL_RATE_PERCENT).toBe(7.1);
		expect(NSC_ANNUAL_RATE_PERCENT).toBe(7.7);
	});

	it('PPF XIRR is computed from yearly deposits near 7.10%', () => {
		const defaultMonthly = calculateSavings(DEFAULT_INPUTS).roundedMonthly;
		const ppfDefault = calculatePpf(defaultMonthly, DEFAULT_INPUTS.years);
		expectXirrNear(ppfDefault.xirrPercent, 7.1);
		expect(ppfDefault.xirrPercent).not.toBe(PPF_ANNUAL_RATE_PERCENT);

		const carInputs = applyTemplate('car');
		const carMonthly = calculateSavings(carInputs).roundedMonthly;
		expectXirrNear(calculatePpf(carMonthly, carInputs.years).xirrPercent, 7.1);
	});

	it('NSC XIRR is computed from yearly deposits near 7.7%', () => {
		const defaultMonthly = calculateSavings(DEFAULT_INPUTS).roundedMonthly;
		const nscDefault = calculateNsc(defaultMonthly, DEFAULT_INPUTS.years);
		expectXirrNear(nscDefault.xirrPercent, 7.7);
		expect(nscDefault.xirrPercent).not.toBe(NSC_ANNUAL_RATE_PERCENT);

		const carInputs = applyTemplate('car');
		const carMonthly = calculateSavings(carInputs).roundedMonthly;
		expectXirrNear(calculateNsc(carMonthly, carInputs.years).xirrPercent, 7.7);
	});

	it('all goal templates keep PPF and NSC XIRR near notified rates', () => {
		const templates = ['car', 'home', 'wedding', 'education', 'emergency'] as const;
		for (const id of templates) {
			const inputs = applyTemplate(id);
			const monthly = calculateSavings(inputs).roundedMonthly;
			expectXirrNear(calculatePpf(monthly, inputs.years).xirrPercent, 7.1);
			expectXirrNear(calculateNsc(monthly, inputs.years).xirrPercent, 7.7);
		}
	});
});