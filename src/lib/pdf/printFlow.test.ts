import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { claimPrintSession, printSessionKey, releasePrintSession } from './printFlow';

function createSessionStorageMock(): Storage {
	const store = new Map<string, string>();
	return {
		get length() {
			return store.size;
		},
		clear() {
			store.clear();
		},
		getItem(key: string) {
			return store.get(key) ?? null;
		},
		key(index: number) {
			return [...store.keys()][index] ?? null;
		},
		removeItem(key: string) {
			store.delete(key);
		},
		setItem(key: string, value: string) {
			store.set(key, value);
		}
	};
}

describe('claimPrintSession', () => {
	beforeEach(() => {
		Object.defineProperty(globalThis, 'sessionStorage', {
			value: createSessionStorageMock(),
			configurable: true
		});
	});

	afterEach(() => {
		sessionStorage.clear();
	});

	it('claims once per report id', () => {
		expect(claimPrintSession('abc')).toBe(true);
		expect(claimPrintSession('abc')).toBe(false);
	});

	it('allows different report ids independently', () => {
		expect(claimPrintSession('one')).toBe(true);
		expect(claimPrintSession('two')).toBe(true);
		expect(claimPrintSession('one')).toBe(false);
	});

	it('can be released for a new export attempt', () => {
		expect(claimPrintSession('abc')).toBe(true);
		releasePrintSession('abc');
		expect(sessionStorage.getItem(printSessionKey('abc'))).toBeNull();
		expect(claimPrintSession('abc')).toBe(true);
	});
});