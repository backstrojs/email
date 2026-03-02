import { describe, expect, it } from 'vitest';
import { withMargin } from '../../src/utils/spaces.js';

describe('withMargin', () => {
	it('returns empty object when no props provided', () => {
		expect(withMargin({})).toEqual({});
	});

	it('sets margin on all sides via `m`', () => {
		expect(withMargin({ m: '16px' })).toEqual({ margin: '16px' });
	});

	it('converts numeric `m` to px string', () => {
		expect(withMargin({ m: 16 })).toEqual({ margin: '16px' });
	});

	it('sets marginLeft and marginRight via `mx`', () => {
		const result = withMargin({ mx: '24px' });
		expect(result.marginLeft).toBe('24px');
		expect(result.marginRight).toBe('24px');
		expect(result.marginTop).toBeUndefined();
	});

	it('sets marginTop and marginBottom via `my`', () => {
		const result = withMargin({ my: 8 });
		expect(result.marginTop).toBe('8px');
		expect(result.marginBottom).toBe('8px');
		expect(result.marginLeft).toBeUndefined();
	});

	it('sets individual sides via mt, mr, mb, ml', () => {
		const result = withMargin({ mt: 4, mr: 8, mb: 12, ml: 16 });
		expect(result.marginTop).toBe('4px');
		expect(result.marginRight).toBe('8px');
		expect(result.marginBottom).toBe('12px');
		expect(result.marginLeft).toBe('16px');
	});

	it('individual side overrides mx/my when both given (last wins)', () => {
		// mx sets both left and right, then ml overrides left
		const result = withMargin({ mx: '10px', ml: '0px' });
		expect(result.marginLeft).toBe('0px');
		expect(result.marginRight).toBe('10px');
	});

	it('m is overridden by mt/mr/mb/ml when both given', () => {
		const result = withMargin({ m: '20px', mt: '0px' });
		expect(result.marginTop).toBe('0px');
	});
});
