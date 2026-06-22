import { describe, expect, it } from 'vitest';
import { buildInflationSensitivityTable } from './inflationSensitivity';
import { DEFAULT_INPUTS } from './savings';

describe('buildInflationSensitivityTable', () => {
	it('centers sensitivity on the user inflation input', () => {
		const rows = buildInflationSensitivityTable({
			...DEFAULT_INPUTS,
			inflationRatePercent: 8
		});

		const baseRow = rows.find((row) => row.isBase);
		expect(baseRow?.inflationPercent).toBe(8);
		expect(rows.map((row) => row.inflationPercent)).toEqual([5, 6, 7, 8, 9, 10, 11]);
	});

	it('does not use years as the base inflation rate', () => {
		const rows = buildInflationSensitivityTable({
			...DEFAULT_INPUTS,
			years: 5,
			inflationRatePercent: 8
		});

		expect(rows.find((row) => row.isBase)?.inflationPercent).toBe(8);
	});
});