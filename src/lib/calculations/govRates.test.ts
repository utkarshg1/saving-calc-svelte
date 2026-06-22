import { describe, it, expect } from 'vitest';
import { calculatePpf } from './ppf';
import { calculateNsc } from './nsc';
import { PPF_ANNUAL_RATE_PERCENT, NSC_ANNUAL_RATE_PERCENT } from './govRates';

describe('government savings rates', () => {
	it('uses current PPF and NSC nominal rates', () => {
		expect(PPF_ANNUAL_RATE_PERCENT).toBe(7.1);
		expect(NSC_ANNUAL_RATE_PERCENT).toBe(7.7);
	});

	it('PPF XIRR stays near the stated annual rate', () => {
		const result = calculatePpf(10_000, 10);
		expect(result.xirrPercent).not.toBeNull();
		expect(result.xirrPercent!).toBeGreaterThan(6.5);
		expect(result.xirrPercent!).toBeLessThan(8.5);
	});

	it('NSC XIRR stays near the stated annual rate (not lump-sum inflated)', () => {
		const result = calculateNsc(10_000, 10);
		expect(result.xirrPercent).not.toBeNull();
		expect(result.xirrPercent!).toBeGreaterThan(6.5);
		expect(result.xirrPercent!).toBeLessThan(9);
	});
});