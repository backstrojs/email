import { describe, expect, it } from 'vitest';
import { pxToPt } from '../../src/utils/px-to-pt.js';

describe('pxToPt', () => {
	it('converts 1px → 0.75pt', () => {
		expect(pxToPt(1)).toBeCloseTo(0.75);
	});

	it('converts 16px → 12pt', () => {
		expect(pxToPt(16)).toBe(12);
	});

	it('converts 0px → 0pt', () => {
		expect(pxToPt(0)).toBe(0);
	});

	it('returns undefined for undefined input', () => {
		expect(pxToPt(undefined)).toBeUndefined();
	});

	it('returns undefined for NaN', () => {
		expect(pxToPt(Number.NaN)).toBeUndefined();
	});

	it('handles fractional pixels', () => {
		expect(pxToPt(4)).toBe(3);
		expect(pxToPt(24)).toBe(18);
	});
});
