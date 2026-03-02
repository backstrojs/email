import { describe, expect, it } from 'vitest';
import { convertToPx, parsePadding } from '../../src/utils/parse-padding.js';

describe('convertToPx', () => {
	it('returns 0 for undefined', () => {
		expect(convertToPx(undefined)).toBe(0);
	});

	it('returns 0 for empty string', () => {
		expect(convertToPx('')).toBe(0);
	});

	it('returns the number directly for numeric values', () => {
		expect(convertToPx(20)).toBe(20);
	});

	it('parses px strings', () => {
		expect(convertToPx('16px')).toBe(16);
		expect(convertToPx('1.5px')).toBe(1.5);
	});

	it('converts em to px (base 16)', () => {
		expect(convertToPx('1em')).toBe(16);
		expect(convertToPx('2em')).toBe(32);
	});

	it('converts rem to px (base 16)', () => {
		expect(convertToPx('1rem')).toBe(16);
	});

	it('converts % to px (base 600px container)', () => {
		expect(convertToPx('50%')).toBe(300);
		expect(convertToPx('100%')).toBe(600);
	});

	it('returns 0 for unrecognised unit', () => {
		expect(convertToPx('10vw')).toBe(0);
	});
});

describe('parsePadding', () => {
	it('returns undefined values when no padding is provided', () => {
		const result = parsePadding({});
		expect(result.paddingTop).toBeUndefined();
		expect(result.paddingRight).toBeUndefined();
		expect(result.paddingBottom).toBeUndefined();
		expect(result.paddingLeft).toBeUndefined();
	});

	it('expands a single shorthand padding number to all sides', () => {
		const result = parsePadding({ padding: 12 });
		expect(result.paddingTop).toBe(12);
		expect(result.paddingRight).toBe(12);
		expect(result.paddingBottom).toBe(12);
		expect(result.paddingLeft).toBe(12);
	});

	it('expands "12px 20px" shorthand (vertical / horizontal)', () => {
		const result = parsePadding({ padding: '12px 20px' });
		expect(result.paddingTop).toBe(12);
		expect(result.paddingBottom).toBe(12);
		expect(result.paddingRight).toBe(20);
		expect(result.paddingLeft).toBe(20);
	});

	it('expands 4-value shorthand "10px 20px 30px 40px"', () => {
		const result = parsePadding({ padding: '10px 20px 30px 40px' });
		expect(result.paddingTop).toBe(10);
		expect(result.paddingRight).toBe(20);
		expect(result.paddingBottom).toBe(30);
		expect(result.paddingLeft).toBe(40);
	});

	it('individual side props take precedence over shorthand', () => {
		const result = parsePadding({ padding: '10px', paddingTop: '5px' });
		expect(result.paddingTop).toBe(5);
		expect(result.paddingRight).toBe(10);
	});

	it('returns 0 for sides not specified when only one side is given', () => {
		const result = parsePadding({ paddingTop: '8px' });
		expect(result.paddingTop).toBe(8);
		expect(result.paddingRight).toBeUndefined();
		expect(result.paddingBottom).toBeUndefined();
		expect(result.paddingLeft).toBeUndefined();
	});
});
