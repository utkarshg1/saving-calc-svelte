import { describe, it, expect } from 'vitest';
import { calculateReverse } from './reverse';
import { DEFAULT_INPUTS } from './savings';

describe('calculateReverse', () => {
	it('finds feasible years for reasonable budget', () => {
		const result = calculateReverse({ ...DEFAULT_INPUTS, investmentPath: 'rd' }, 6_000);
		expect(result.feasible).toBe(true);
		expect(result.yearsNeeded).toBeGreaterThan(0);
	});

	it('returns infeasible for zero budget', () => {
		const result = calculateReverse(DEFAULT_INPUTS, 0);
		expect(result.feasible).toBe(false);
	});
});