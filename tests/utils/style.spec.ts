import { describe, expect, it } from 'vitest';
import { mergeStyles, styleToString } from '../../src/utils/style.js';

describe('styleToString', () => {
	it('converts camelCase properties to kebab-case', () => {
		expect(styleToString({ backgroundColor: '#fff' })).toBe('background-color: #fff');
	});

	it('appends px to numeric values for dimensional properties', () => {
		expect(styleToString({ fontSize: 14 })).toBe('font-size: 14px');
	});

	it('does NOT append px to unitless properties', () => {
		expect(styleToString({ fontWeight: 700 })).toBe('font-weight: 700');
		expect(styleToString({ lineHeight: 1.5 })).toBe('line-height: 1.5');
		expect(styleToString({ opacity: 0.5 })).toBe('opacity: 0.5');
	});

	it('joins multiple properties with semicolons', () => {
		const result = styleToString({ color: 'red', fontSize: 12 });
		expect(result).toContain('color: red');
		expect(result).toContain('font-size: 12px');
	});

	it('filters out null and undefined values', () => {
		const result = styleToString({ color: 'red', backgroundColor: undefined, border: null });
		expect(result).toBe('color: red');
	});

	it('filters out empty string values', () => {
		expect(styleToString({ color: '' })).toBe('');
	});

	it('handles an empty object', () => {
		expect(styleToString({})).toBe('');
	});

	it('converts multi-word camelCase correctly', () => {
		expect(styleToString({ msoPaddingAlt: '0px' })).toBe('mso-padding-alt: 0px');
	});

	it('keeps string values that already include a unit', () => {
		expect(styleToString({ padding: '12px 20px' })).toBe('padding: 12px 20px');
	});
});

describe('mergeStyles', () => {
	it('merges multiple style objects', () => {
		const result = mergeStyles({ color: 'red' }, { fontSize: 14 });
		expect(result).toContain('color: red');
		expect(result).toContain('font-size: 14px');
	});

	it('later objects overwrite earlier ones for the same property', () => {
		const result = mergeStyles({ color: 'red' }, { color: 'blue' });
		expect(result).toBe('color: blue');
	});

	it('ignores null and undefined style objects', () => {
		const result = mergeStyles(null, undefined, { color: 'red' });
		expect(result).toBe('color: red');
	});

	it('returns empty string when all inputs are empty', () => {
		expect(mergeStyles({}, null, undefined)).toBe('');
	});
});
